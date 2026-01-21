#!/usr/bin/env python3
"""
VetPath Data Downloader (NO API KEYS, NO DEPENDENCIES)

Creates real job/skill data locally so the app can run without hardcoding jobs.

Downloads:
  1) O*NET Database ZIP (from onetcenter.org) -> extracts into backend/data/onet/
     Required files for seeding:
       - Occupation Data.txt
       - Skills.txt
       - Job Zones.txt (or Job Zone.txt)

  2) (Optional) BLS OEWS national wages ZIP (from bls.gov) -> builds backend/data/bls/oees.csv
     The seeder expects:
       - OCC_CODE (SOC code)
       - A_MEDIAN (annual median wage)

Run:
  cd backend
  python scripts/download_data.py
  python seed_database.py
"""

from __future__ import annotations

import csv
import io
import os
import re
import shutil
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

import urllib.request


ROOT = Path(__file__).resolve().parents[1]  # backend/
DATA_DIR = ROOT / "data"
ONET_DIR = DATA_DIR / "onet"
BLS_DIR = DATA_DIR / "bls"

ONET_DATABASE_PAGE = "https://www.onetcenter.org/database.html"
BLS_OEWS_PAGE = "https://www.bls.gov/oes/tables.htm"


@dataclass(frozen=True)
class DownloadTarget:
    name: str
    url: str
    out_path: Path


def _ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def _http_get_bytes(url: str, timeout: int = 60) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "VetPathDataDownloader/1.0",
            "Accept": "*/*",
        },
        method="GET",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def _http_get_text(url: str, timeout: int = 60) -> str:
    return _http_get_bytes(url, timeout=timeout).decode("utf-8", errors="replace")


def _download_file(target: DownloadTarget) -> None:
    _ensure_dir(target.out_path.parent)
    print(f"⬇️  Downloading {target.name}...")
    data = _http_get_bytes(target.url, timeout=180)
    target.out_path.write_bytes(data)
    print(f"✅ Saved: {target.out_path}")


def _extract_zip(zip_path: Path, dest_dir: Path) -> None:
    _ensure_dir(dest_dir)
    print(f"📦 Extracting {zip_path.name} -> {dest_dir} ...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(dest_dir)
    print("✅ Extracted")


def _find_onet_db_zip_url() -> str:
    """
    Find the current O*NET database zip URL.
    First tries scraping the official database page, then falls back to common direct URLs.
    """
    # Try scrape first
    html = _http_get_text(ONET_DATABASE_PAGE, timeout=60)

    # O*NET publishes multiple DB zips (text/excel/mysql/etc). We want the tab-delimited TEXT one.
    candidates = re.findall(r'href=\"([^\"]*?/dl_files/database/[^\"]+?\.zip)\"', html, flags=re.IGNORECASE)
    abs_urls: list[str] = []
    for href in candidates:
        if href.startswith("http"):
            abs_urls.append(href)
        else:
            abs_urls.append("https://www.onetcenter.org" + href)
    abs_urls = list(dict.fromkeys(abs_urls))

    text_zips = [u for u in abs_urls if "_text.zip" in u.lower()]
    if text_zips:
        return text_zips[0]

    # Fallback: try common versioned TEXT zips
    for major in range(35, 24, -1):
        for minor in range(0, 5):
            candidate = f"https://www.onetcenter.org/dl_files/database/db_{major}_{minor}_text.zip"
            try:
                _http_get_bytes(candidate, timeout=30)
                return candidate
            except Exception:
                continue

    raise RuntimeError(
        "Could not locate an O*NET TEXT database ZIP. "
        "The O*NET database page format may have changed."
    )


def _find_bls_oews_zip_url() -> str:
    """
    Find a BLS OEWS 'all_data' ZIP on the tables page.
    If this fails, wages will be skipped (salary will show as N/A).
    """
    html = _http_get_text(BLS_OEWS_PAGE, timeout=60)
    hrefs = re.findall(r'href="([^"]+?\\.zip)"', html, flags=re.IGNORECASE)
    abs_urls: list[str] = []
    for href in hrefs:
        if href.startswith("http"):
            abs_urls.append(href)
        else:
            abs_urls.append("https://www.bls.gov" + href)

    preferred = [u for u in abs_urls if "all_data" in u.lower()]
    if preferred:
        return preferred[-1]

    fallback = [u for u in abs_urls if "/oes/" in u.lower() or "oes" in u.lower()]
    if fallback:
        return fallback[-1]

    raise RuntimeError("Could not find a BLS OEWS ZIP link on the BLS OEWS tables page.")


def _walk_files(root: Path) -> Iterable[Path]:
    for dirpath, _, filenames in os.walk(root):
        for name in filenames:
            yield Path(dirpath) / name


def _find_first_matching(root: Path, patterns: list[str]) -> Path | None:
    regexes = [re.compile(p, flags=re.IGNORECASE) for p in patterns]
    for path in _walk_files(root):
        filename = path.name
        if any(r.search(filename) for r in regexes):
            return path
    return None


def _read_delimited_text(text: str) -> csv.DictReader:
    sample = text[:4096]
    delimiter = "\t" if "\t" in sample else ","
    return csv.DictReader(io.StringIO(text), delimiter=delimiter)


def _build_oees_csv_from_bls_text(input_path: Path, output_path: Path) -> None:
    _ensure_dir(output_path.parent)
    print(f"🧾 Building wages CSV: {output_path} ...")

    raw = input_path.read_text(encoding="utf-8-sig", errors="replace")
    reader = _read_delimited_text(raw)
    if not reader.fieldnames:
        raise RuntimeError("BLS file has no headers; cannot parse.")

    fieldnames = {h.strip(): h for h in reader.fieldnames if h}
    occ_col = fieldnames.get("OCC_CODE") or fieldnames.get("occ_code") or fieldnames.get("Occupation Code")
    med_col = fieldnames.get("A_MEDIAN") or fieldnames.get("a_median") or fieldnames.get("Median")
    if not occ_col or not med_col:
        raise RuntimeError(f"Could not find OCC_CODE/A_MEDIAN in BLS file headers: {reader.fieldnames}")

    rows_out: list[dict] = []
    for row in reader:
        occ = (row.get(occ_col) or "").strip()
        med = (row.get(med_col) or "").strip()
        if not occ or occ == "00-0000":
            continue
        if not med or med in {"*", "#"}:
            continue
        try:
            med_int = int(float(med))
        except ValueError:
            continue
        rows_out.append({"OCC_CODE": occ, "A_MEDIAN": str(med_int)})

    with output_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["OCC_CODE", "A_MEDIAN"])
        writer.writeheader()
        writer.writerows(rows_out)
    print(f"✅ Wrote {len(rows_out)} wage rows")


def main() -> int:
    print("== VetPath Downloader ==")
    print(f"DATA_DIR: {DATA_DIR}")
    _ensure_dir(DATA_DIR)
    _ensure_dir(ONET_DIR)
    _ensure_dir(BLS_DIR)
    print(f"Ensured dirs: {ONET_DIR} , {BLS_DIR}")

    # O*NET (required)
    onet_zip_url = _find_onet_db_zip_url()
    onet_zip_path = DATA_DIR / "onet_database.zip"
    _download_file(DownloadTarget("O*NET Database", onet_zip_url, onet_zip_path))

    onet_tmp = DATA_DIR / "_tmp_onet"
    if onet_tmp.exists():
        shutil.rmtree(onet_tmp)
    _extract_zip(onet_zip_path, onet_tmp)

    occ_file = _find_first_matching(onet_tmp, [r"^Occupation Data\.txt$"])
    skills_file = _find_first_matching(onet_tmp, [r"^Skills\.txt$"])
    job_zones_file = _find_first_matching(onet_tmp, [r"^Job Zones\.txt$", r"^Job Zone\.txt$"])
    if not occ_file or not skills_file or not job_zones_file:
        raise RuntimeError(f"O*NET ZIP downloaded but required files were not found under: {onet_tmp}")

    shutil.copy2(occ_file, ONET_DIR / "Occupation Data.txt")
    shutil.copy2(skills_file, ONET_DIR / "Skills.txt")
    shutil.copy2(job_zones_file, ONET_DIR / "Job Zones.txt")
    print(f"✅ O*NET ready: {ONET_DIR}")

    # BLS wages (optional)
    try:
        bls_zip_url = _find_bls_oews_zip_url()
        bls_zip_path = DATA_DIR / "bls_oews.zip"
        _download_file(DownloadTarget("BLS OEWS (All Data)", bls_zip_url, bls_zip_path))

        bls_tmp = DATA_DIR / "_tmp_bls"
        if bls_tmp.exists():
            shutil.rmtree(bls_tmp)
        _extract_zip(bls_zip_path, bls_tmp)

        all_data = _find_first_matching(bls_tmp, [r"all_data.*\.(txt|csv)$", r"^oesm.*\.(txt|csv)$"])
        if not all_data:
            print("⚠️  BLS ZIP downloaded, but couldn't find an all_data file. Salary will show as N/A.")
        else:
            out_csv = BLS_DIR / "oees.csv"
            _build_oees_csv_from_bls_text(all_data, out_csv)
            print(f"✅ BLS wages ready: {out_csv}")
    except Exception as e:
        print(f"⚠️  Skipping BLS wages: {e}")

    print("\nNext:")
    print("  python seed_database.py")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

