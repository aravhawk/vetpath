# VetPath Data Setup

VetPath uses real-world datasets (O*NET + optional BLS) instead of hardcoded job data.
Place the files below and re-run `python seed_database.py`.

## Fastest Setup (Recommended)

Run the downloader (no API keys) and then seed:

```bash
cd backend
python scripts/download_data.py
python seed_database.py
```

## Required: O*NET Database

Download the O*NET Database (tab-delimited files) and extract into:

```
backend/data/onet/
```

Required files inside that folder:
- `Occupation Data.txt`
- `Skills.txt`
- `Job Zones.txt` (or `Job Zone.txt`)

## Optional: BLS Wage Data

Download a BLS OEWS/Occupational Employment & Wage Statistics CSV and place it here:

```
backend/data/bls/oees.csv
```

The CSV must include these columns:
- `OCC_CODE` (SOC code)
- `A_MEDIAN` (annual median wage)

If you use a different file name or path, set:
```
BLS_WAGE_CSV=/absolute/path/to/your.csv
```

## Optional: Military Crosswalk

Provide a MOS/MOC crosswalk file (CSV/TSV/TXT) with columns such as:
- `MOS` or `MOC` (military code)
- `Branch` (Army, Navy, Air Force, etc.)
- `Military Title`
- `O*NET-SOC Code`

Place one of these in `backend/data/`:
- `military_crosswalk.tsv`
- `military_crosswalk.csv`
- `military_crosswalk.txt`

Or set:
```
MILITARY_CROSSWALK_PATH=/absolute/path/to/crosswalk.tsv
```

## Optional: Training Resources

Provide a CSV with training recommendations:
```
skill_name,certification_name,provider,estimated_time,cost,va_eligible,url
```

Place one of these in `backend/data/`:
- `training_resources.csv`
- `training_resources.tsv`
- `training_resources.txt`

Or set:
```
TRAINING_RESOURCES_PATH=/absolute/path/to/training_resources.csv
```

## Environment Variables Summary

```
ONET_DATA_DIR=/absolute/path/to/backend/data/onet
BLS_WAGE_CSV=/absolute/path/to/wages.csv
MILITARY_CROSSWALK_PATH=/absolute/path/to/crosswalk.tsv
TRAINING_RESOURCES_PATH=/absolute/path/to/training_resources.csv
```
