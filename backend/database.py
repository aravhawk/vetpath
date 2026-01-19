"""
Database connection and utilities for VetPath
"""

import sqlite3
from pathlib import Path
from contextlib import contextmanager

DATABASE_PATH = Path(__file__).parent / "vetpath.db"


def get_connection() -> sqlite3.Connection:
    """Get a database connection with row factory enabled"""
    conn = sqlite3.connect(str(DATABASE_PATH))
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.close()


def init_database():
    """Initialize the database schema"""
    with get_db() as conn:
        cursor = conn.cursor()

        # Occupations table (O*NET style)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS occupations (
                occupation_code TEXT PRIMARY KEY,
                occupation_title TEXT NOT NULL,
                description TEXT,
                median_wage INTEGER,
                job_outlook TEXT,
                growth_rate REAL,
                industry TEXT,
                education_required TEXT
            )
        """)

        # Occupation skills mapping
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS occupation_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                occupation_code TEXT NOT NULL,
                skill_name TEXT NOT NULL,
                importance_level INTEGER DEFAULT 3,
                FOREIGN KEY (occupation_code) REFERENCES occupations(occupation_code)
            )
        """)

        # Military occupation crosswalk
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS military_crosswalk (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                mos_code TEXT NOT NULL,
                branch TEXT NOT NULL,
                military_title TEXT,
                civilian_occupation_code TEXT,
                match_strength INTEGER DEFAULT 3,
                FOREIGN KEY (civilian_occupation_code) REFERENCES occupations(occupation_code)
            )
        """)

        # Training resources
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS training_resources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                skill_name TEXT NOT NULL,
                certification_name TEXT,
                provider TEXT,
                estimated_time TEXT,
                cost TEXT,
                va_eligible INTEGER DEFAULT 1,
                url TEXT
            )
        """)

        # Create indexes for faster queries
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_occupation_skills_code
            ON occupation_skills(occupation_code)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_occupation_skills_name
            ON occupation_skills(skill_name)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_crosswalk_mos
            ON military_crosswalk(mos_code)
        """)

        conn.commit()


def get_occupation_by_code(code: str) -> dict | None:
    """Get occupation details by O*NET code"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM occupations WHERE occupation_code = ?",
            (code,)
        )
        row = cursor.fetchone()
        if row:
            return dict(row)
    return None


def get_occupation_skills(code: str) -> list[str]:
    """Get skills for an occupation"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """SELECT skill_name FROM occupation_skills
               WHERE occupation_code = ?
               ORDER BY importance_level DESC""",
            (code,)
        )
        return [row["skill_name"] for row in cursor.fetchall()]


def search_occupations_by_skills(skills: list[str], limit: int = 10) -> list[dict]:
    """Search occupations that match given skills"""
    with get_db() as conn:
        cursor = conn.cursor()

        # Create placeholders for the IN clause
        placeholders = ",".join("?" * len(skills))

        query = f"""
            SELECT
                o.*,
                COUNT(DISTINCT os.skill_name) as matching_skills,
                (COUNT(DISTINCT os.skill_name) * 1.0 /
                    (SELECT COUNT(*) FROM occupation_skills os2
                     WHERE os2.occupation_code = o.occupation_code)) as match_score
            FROM occupations o
            JOIN occupation_skills os ON o.occupation_code = os.occupation_code
            WHERE LOWER(os.skill_name) IN ({placeholders})
            GROUP BY o.occupation_code
            ORDER BY
                CASE
                    WHEN o.industry IN ('manufacturing', 'construction', 'technology', 'logistics', 'energy')
                    THEN 0 ELSE 1
                END,
                match_score DESC,
                o.median_wage DESC
            LIMIT ?
        """

        # Lowercase all skills for matching
        params = [s.lower() for s in skills] + [limit]
        cursor.execute(query, params)

        results = []
        for row in cursor.fetchall():
            result = dict(row)
            result["skill_match_score"] = round(result.pop("match_score", 0) * 100, 1)
            results.append(result)

        return results


def get_training_for_skill(skill: str) -> dict | None:
    """Get training recommendation for a skill"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM training_resources WHERE LOWER(skill_name) = LOWER(?)",
            (skill,)
        )
        row = cursor.fetchone()
        if row:
            return dict(row)
    return None


def get_crosswalk_for_mos(mos_code: str, branch: str = None) -> list[dict]:
    """Get civilian occupation matches for a military MOS code"""
    with get_db() as conn:
        cursor = conn.cursor()

        if branch:
            cursor.execute(
                """SELECT mc.*, o.occupation_title, o.median_wage
                   FROM military_crosswalk mc
                   JOIN occupations o ON mc.civilian_occupation_code = o.occupation_code
                   WHERE mc.mos_code = ? AND mc.branch = ?
                   ORDER BY mc.match_strength DESC""",
                (mos_code, branch)
            )
        else:
            cursor.execute(
                """SELECT mc.*, o.occupation_title, o.median_wage
                   FROM military_crosswalk mc
                   JOIN occupations o ON mc.civilian_occupation_code = o.occupation_code
                   WHERE mc.mos_code = ?
                   ORDER BY mc.match_strength DESC""",
                (mos_code,)
            )

        return [dict(row) for row in cursor.fetchall()]
