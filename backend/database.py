"""
Database connection and utilities for VetPath
"""

import re
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

        normalized = [s.strip().lower() for s in skills if s and s.strip()]
        if not normalized:
            return []

        # Create placeholders for the IN clause
        placeholders = ",".join("?" * len(normalized))

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
        params = normalized + [limit]
        cursor.execute(query, params)

        results = []
        for row in cursor.fetchall():
            result = dict(row)
            match_score = result.pop("match_score", 0) or 0
            result["skill_match_score"] = round(match_score * 100, 1)
            results.append(result)

        if results:
            return results

        # Fallback: token-based partial matching against skill names, titles, and descriptions
        tokens: list[str] = []
        for skill in normalized:
            tokens.extend([t for t in re.split(r"[^a-z0-9]+", skill) if len(t) >= 3])
        # De-duplicate and cap to avoid huge queries
        dedup_tokens = []
        seen = set()
        for token in tokens:
            if token not in seen:
                seen.add(token)
                dedup_tokens.append(token)
            if len(dedup_tokens) >= 20:
                break

        if not dedup_tokens:
            return []

        like_clauses = []
        like_params = []
        for token in dedup_tokens:
            like_clauses.append("LOWER(os.skill_name) LIKE ?")
            like_params.append(f"%{token}%")
        for token in dedup_tokens:
            like_clauses.append("LOWER(o.occupation_title) LIKE ?")
            like_params.append(f"%{token}%")
        for token in dedup_tokens:
            like_clauses.append("LOWER(o.description) LIKE ?")
            like_params.append(f"%{token}%")

        fallback_query = f"""
            SELECT
                o.*,
                COUNT(DISTINCT os.skill_name) as matching_skills,
                (COUNT(DISTINCT os.skill_name) * 1.0 /
                    (SELECT COUNT(*) FROM occupation_skills os2
                     WHERE os2.occupation_code = o.occupation_code)) as match_score
            FROM occupations o
            LEFT JOIN occupation_skills os ON o.occupation_code = os.occupation_code
            WHERE {" OR ".join(like_clauses)}
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
        cursor.execute(fallback_query, like_params + [limit])

        fallback_results = []
        for row in cursor.fetchall():
            result = dict(row)
            match_score = result.pop("match_score", 0) or 0

            occ_title = (result.get("occupation_title") or "").lower()
            occ_desc = (result.get("description") or "").lower()
            user_tokens = set(dedup_tokens)
            text_hits = sum(1 for t in user_tokens if t in occ_title or t in occ_desc)
            text_score = min(0.25, (text_hits / max(1, len(user_tokens))) * 0.25)

            combined_score = max(match_score, text_score)
            result["skill_match_score"] = round(combined_score * 100, 1)
            fallback_results.append(result)

        return fallback_results


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
