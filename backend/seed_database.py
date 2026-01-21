"""
Seed the VetPath database with real-world data from O*NET and optional BLS data.

Required:
  - O*NET Database (tab-delimited files)

Optional:
  - BLS OEWS wage data (CSV) for median wages
  - Military crosswalk file
  - Training resources CSV
"""

import csv
import os
import re
from collections import defaultdict
from pathlib import Path

from database import init_database, get_db

DATA_DIR = Path(__file__).parent / "data"
ONET_DATA_DIR = Path(os.getenv("ONET_DATA_DIR", DATA_DIR / "onet"))
BLS_WAGE_CSV = Path(os.getenv("BLS_WAGE_CSV", DATA_DIR / "bls" / "oees.csv"))
MILITARY_CROSSWALK_PATH = os.getenv("MILITARY_CROSSWALK_PATH")
TRAINING_RESOURCES_PATH = os.getenv("TRAINING_RESOURCES_PATH")

SOC_MAJOR_INDUSTRIES = {
    "11": "management",
    "13": "business",
    "15": "technology",
    "17": "engineering",
    "19": "science",
    "29": "healthcare",
    "31": "healthcare_support",
    "33": "protective_services",
    "35": "food_service",
    "37": "building_maintenance",
    "41": "sales",
    "43": "office_support",
    "45": "agriculture",
    "47": "construction",
    "49": "installation_maintenance",
    "51": "manufacturing",
    "53": "transportation_logistics",
}

JOB_ZONE_LABELS = {
    "1": "Little or no preparation",
    "2": "Some preparation",
    "3": "Medium preparation",
    "4": "Considerable preparation",
    "5": "Extensive preparation",
}


def _read_delimited(path: Path) -> list[dict]:
    delimiter = "\t" if path.suffix.lower() in [".txt", ".tsv"] else ","
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file, delimiter=delimiter)
        rows = []
        for row in reader:
            if not row:
                continue
            cleaned = {}
            for key, value in row.items():
                if key is None:
                    continue
                cleaned_key = key.strip()
                cleaned_value = value.strip() if isinstance(value, str) else value
                cleaned[cleaned_key] = cleaned_value
            rows.append(cleaned)
        return rows


def _pick(row: dict, keys: list[str], default: str | None = None) -> str | None:
    for key in keys:
        value = row.get(key)
        if value:
            return value
    return default


def _normalize_onet_code(code: str | None) -> str | None:
    if not code:
        return None
    code = code.strip()
    if re.match(r"^\d{2}-\d{4}$", code):
        return f"{code}.00"
    return code


def _derive_industry(code: str) -> str:
    major = code.split("-")[0]
    return SOC_MAJOR_INDUSTRIES.get(major, "other")


def _find_existing(paths: list[Path]) -> Path | None:
    for path in paths:
        if path and path.exists():
            return path
    return None


def _load_occupations(onet_dir: Path) -> dict[str, dict]:
    occupation_path = onet_dir / "Occupation Data.txt"
    if not occupation_path.exists():
        raise FileNotFoundError(f"Missing O*NET file: {occupation_path}")

    occupations = {}
    rows = _read_delimited(occupation_path)
    for row in rows:
        code = _normalize_onet_code(_pick(row, ["O*NET-SOC Code", "ONET-SOC Code", "SOC Code"]))
        title = _pick(row, ["Title", "Occupation Title"])
        description = _pick(row, ["Description", "Occupation Description"], "")
        if not code or not title:
            continue
        occupations[code] = {
            "occupation_code": code,
            "occupation_title": title,
            "description": description,
        }
    return occupations


def _load_job_zones(onet_dir: Path) -> dict[str, str]:
    job_zone_path = _find_existing([
        onet_dir / "Job Zones.txt",
        onet_dir / "Job Zone.txt",
    ])
    if not job_zone_path:
        return {}

    job_zones = {}
    rows = _read_delimited(job_zone_path)
    for row in rows:
        code = _normalize_onet_code(_pick(row, ["O*NET-SOC Code", "ONET-SOC Code", "SOC Code"]))
        if not code:
            continue
        education = _pick(
            row,
            ["Education, Training, and Experience", "Education, Training, and Experience Category"],
        )
        if not education:
            job_zone = _pick(row, ["Job Zone"])
            education = JOB_ZONE_LABELS.get(job_zone, "Not specified")
        job_zones[code] = education
    return job_zones


def _load_skills(onet_dir: Path) -> dict[str, list[tuple[str, float]]]:
    skills_path = onet_dir / "Skills.txt"
    if not skills_path.exists():
        raise FileNotFoundError(f"Missing O*NET file: {skills_path}")

    skills_map = defaultdict(list)
    rows = _read_delimited(skills_path)
    for row in rows:
        # O*NET Skills.txt uses Scale ID (e.g., IM=Importance, LV=Level)
        scale_id = (_pick(row, ["Scale ID"], "") or "").upper()
        if scale_id != "IM":
            continue
        code = _normalize_onet_code(_pick(row, ["O*NET-SOC Code", "ONET-SOC Code", "SOC Code"]))
        skill_name = _pick(row, ["Element Name", "Skill Name"])
        value_str = _pick(row, ["Data Value", "Scale Value"], "0")
        if not code or not skill_name:
            continue
        try:
            value = float(value_str)
        except ValueError:
            value = 0.0
        skills_map[code].append((skill_name.strip().lower(), value))
    return skills_map


def _load_bls_wages(path: Path) -> dict[str, int]:
    if not path.exists():
        return {}

    wages = {}
    rows = _read_delimited(path)
    for row in rows:
        occ_code = _pick(row, ["OCC_CODE", "occ_code", "Occupation Code", "SOC Code"])
        if not occ_code or occ_code == "00-0000":
            continue
        onet_code = _normalize_onet_code(occ_code)
        median_str = _pick(row, ["A_MEDIAN", "a_median", "Median", "MEDIAN"], "")
        if not median_str or median_str in ["*", "#"]:
            continue
        try:
            median = int(float(median_str))
        except ValueError:
            continue
        wages[onet_code] = median
    return wages


def _load_crosswalk(path: Path | None) -> list[dict]:
    if not path or not path.exists():
        return []

    rows = _read_delimited(path)
    entries = []
    for row in rows:
        mos_code = _pick(row, ["MOS", "MOC", "Military Occupation Code", "Military Code"])
        branch = _pick(row, ["Branch", "Service"], "Unknown")
        military_title = _pick(row, ["Military Title", "MOC Title", "Title"], "")
        civilian_code = _normalize_onet_code(_pick(row, ["O*NET-SOC Code", "ONET-SOC Code", "SOC Code"]))
        strength = _pick(row, ["Match Strength", "Match", "Similarity"], "3")
        if not mos_code or not civilian_code:
            continue
        try:
            match_strength = int(float(strength))
        except ValueError:
            match_strength = 3
        entries.append({
            "mos_code": mos_code.strip(),
            "branch": branch.strip(),
            "military_title": military_title.strip(),
            "civilian_occupation_code": civilian_code,
            "match_strength": max(1, min(match_strength, 5)),
        })
    return entries


def _load_training_resources(path: Path | None) -> list[dict]:
    if not path or not path.exists():
        return []

    rows = _read_delimited(path)
    resources = []
    for row in rows:
        skill_name = _pick(row, ["skill_name", "Skill", "Skill Name"])
        if not skill_name:
            continue
        resources.append({
            "skill_name": skill_name.strip().lower(),
            "certification_name": _pick(row, ["certification_name", "Certification", "Certification Name"], "Industry certification"),
            "provider": _pick(row, ["provider", "Provider"]),
            "estimated_time": _pick(row, ["estimated_time", "Estimated Time"], "Varies"),
            "cost": _pick(row, ["cost", "Cost"], "Varies"),
            "va_eligible": _pick(row, ["va_eligible", "VA Eligible", "VA"], "1") in ["1", "true", "True", "yes", "Yes"],
            "url": _pick(row, ["url", "URL"], None),
        })
    return resources


def seed_database():
    """Seed the database using real O*NET and BLS data files."""
    if not ONET_DATA_DIR.exists():
        raise FileNotFoundError(
            f"O*NET data directory not found: {ONET_DATA_DIR}. "
            "Download the O*NET Database and extract it to this path."
        )

    occupations = _load_occupations(ONET_DATA_DIR)
    job_zones = _load_job_zones(ONET_DATA_DIR)
    skills_map = _load_skills(ONET_DATA_DIR)
    wages = _load_bls_wages(BLS_WAGE_CSV)

    crosswalk_path = None
    if MILITARY_CROSSWALK_PATH:
        crosswalk_path = Path(MILITARY_CROSSWALK_PATH)
    else:
        crosswalk_path = _find_existing([
            DATA_DIR / "military_crosswalk.tsv",
            DATA_DIR / "military_crosswalk.csv",
            DATA_DIR / "military_crosswalk.txt",
        ])
    crosswalk_entries = _load_crosswalk(crosswalk_path)

    training_path = None
    if TRAINING_RESOURCES_PATH:
        training_path = Path(TRAINING_RESOURCES_PATH)
    else:
        training_path = _find_existing([
            DATA_DIR / "training_resources.csv",
            DATA_DIR / "training_resources.tsv",
            DATA_DIR / "training_resources.txt",
        ])
    training_resources = _load_training_resources(training_path)

    print("Initializing database...")
    init_database()

    with get_db() as conn:
        cursor = conn.cursor()

        # Clear existing data
        cursor.execute("DELETE FROM occupation_skills")
        cursor.execute("DELETE FROM military_crosswalk")
        cursor.execute("DELETE FROM training_resources")
        cursor.execute("DELETE FROM occupations")

        print("Seeding occupations and skills from O*NET...")
        for code, occ in occupations.items():
            median_wage = wages.get(code)
            education_required = job_zones.get(code, "Not specified")
            industry = _derive_industry(code)

            cursor.execute("""
                INSERT INTO occupations
                (occupation_code, occupation_title, description, median_wage,
                 job_outlook, growth_rate, industry, education_required)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                code,
                occ["occupation_title"],
                occ.get("description", ""),
                median_wage if median_wage is not None else 0,
                "Not available",
                None,
                industry,
                education_required
            ))

            # Add skills
            skills = skills_map.get(code, [])
            skills_sorted = sorted(skills, key=lambda x: x[1], reverse=True)
            for idx, (skill, value) in enumerate(skills_sorted):
                # Map importance value (0-100) to 1-5 scale
                importance = max(1, min(5, int(round(value / 20))))
                cursor.execute("""
                    INSERT INTO occupation_skills (occupation_code, skill_name, importance_level)
                    VALUES (?, ?, ?)
                """, (code, skill, importance))

        print("Seeding military crosswalk...")
        for entry in crosswalk_entries:
            cursor.execute("""
                INSERT INTO military_crosswalk
                (mos_code, branch, military_title, civilian_occupation_code, match_strength)
                VALUES (?, ?, ?, ?, ?)
            """, (
                entry["mos_code"],
                entry["branch"],
                entry["military_title"],
                entry["civilian_occupation_code"],
                entry["match_strength"]
            ))

        print("Seeding training resources...")
        for resource in training_resources:
            cursor.execute("""
                INSERT INTO training_resources
                (skill_name, certification_name, provider, estimated_time, cost, va_eligible, url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                resource["skill_name"],
                resource["certification_name"],
                resource.get("provider"),
                resource.get("estimated_time"),
                resource.get("cost"),
                1 if resource.get("va_eligible", True) else 0,
                resource.get("url")
            ))

        conn.commit()

    print("Database seeded successfully!")
    print(f"  - {len(occupations)} occupations")
    print(f"  - {len(crosswalk_entries)} MOS crosswalk entries")
    print(f"  - {len(training_resources)} training resources")


if __name__ == "__main__":
    seed_database()
