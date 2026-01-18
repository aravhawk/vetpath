"""
VetPath API - AI-Powered Skills Translation for Transitioning Veterans

FastAPI backend providing:
- Military experience parsing
- Career matching
- Resume generation
- Skills gap analysis
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import (
    ParseRequest, ParseResponse, ParsedSkills,
    MatchRequest, MatchResponse,
    ResumeRequest, ResumeResponse,
    GapRequest, GapResponse,
    MilitaryProfile, CareerMatch
)
from database import init_database, get_occupation_by_code, get_occupation_skills
from services import (
    parse_military_experience,
    match_careers,
    generate_resume,
    analyze_gaps
)
from services.matcher import match_from_parsed_skills, match_from_mos, get_career_details
from services.gaps import get_career_readiness_score, get_quick_wins

# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    # Initialize database if it doesn't exist
    db_path = Path(__file__).parent / "vetpath.db"
    if not db_path.exists():
        print("Initializing database...")
        init_database()
        # Run seeder
        from seed_database import seed_database
        seed_database()
    yield


app = FastAPI(
    title="VetPath API",
    description="AI-Powered Skills Translation for Transitioning Veterans",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Health Check
# ============================================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "VetPath API",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    api_key_configured = bool(os.environ.get("ANTHROPIC_API_KEY"))
    return {
        "status": "healthy",
        "ai_enabled": api_key_configured,
        "database": "connected"
    }


# ============================================================================
# Skills Parsing
# ============================================================================

@app.post("/api/parse", response_model=ParseResponse)
async def parse_experience(request: ParseRequest):
    """
    Parse military experience description into structured skills.

    Uses AI to extract and translate military experience into civilian terminology.
    Falls back to keyword-based extraction if AI is unavailable.
    """
    if not request.experience or len(request.experience.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Please provide a more detailed experience description"
        )

    try:
        skills = parse_military_experience(request.experience)
        return ParseResponse(
            skills=skills,
            raw_text=request.experience
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error parsing experience: {str(e)}"
        )


# ============================================================================
# Career Matching
# ============================================================================

@app.post("/api/match", response_model=MatchResponse)
async def match_skills_to_careers(request: MatchRequest):
    """
    Match skills to civilian career opportunities.

    Searches the O*NET-based occupation database to find careers
    that match the provided skills. Prioritizes American manufacturing,
    technology, and skilled trades.
    """
    if not request.skills:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least one skill to match"
        )

    try:
        matches = match_careers(
            skills=request.skills,
            preferences=request.preferences,
            limit=10
        )
        return MatchResponse(
            matches=matches,
            total_found=len(matches)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error matching careers: {str(e)}"
        )


@app.post("/api/match/profile")
async def match_from_profile(profile: MilitaryProfile):
    """
    Match careers based on a complete military profile.

    Parses the experience and matches to careers in one step.
    """
    try:
        # Parse the experience first
        skills = parse_military_experience(profile.experience_description)

        # Match careers
        matches = match_from_parsed_skills(skills, limit=10)

        return {
            "parsed_skills": skills,
            "matches": matches,
            "total_found": len(matches)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing profile: {str(e)}"
        )


@app.get("/api/match/mos/{mos_code}")
async def match_from_mos_code(mos_code: str, branch: str = None):
    """
    Get career matches for a specific military occupation code.

    Args:
        mos_code: Military occupation code (e.g., "11B", "IT", "3D0X2")
        branch: Optional military branch filter
    """
    try:
        matches = match_from_mos(mos_code, branch, limit=10)
        if not matches:
            return {
                "matches": [],
                "total_found": 0,
                "message": f"No direct matches found for MOS {mos_code}. Try providing a detailed experience description."
            }
        return {
            "matches": matches,
            "total_found": len(matches)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error matching MOS: {str(e)}"
        )


@app.get("/api/career/{occupation_code}")
async def get_career_info(occupation_code: str):
    """Get detailed information about a specific career"""
    career = get_career_details(occupation_code)
    if not career:
        raise HTTPException(
            status_code=404,
            detail=f"Occupation {occupation_code} not found"
        )
    return career


# ============================================================================
# Resume Generation
# ============================================================================

@app.post("/api/resume", response_model=ResumeResponse)
async def create_resume(request: ResumeRequest):
    """
    Generate a civilian-ready resume from military profile.

    Creates a professional resume that translates military experience
    into business terminology suitable for the target position.
    """
    if not request.target_job:
        raise HTTPException(
            status_code=400,
            detail="Please specify a target job"
        )

    try:
        resume_text = generate_resume(
            profile=request.profile,
            parsed_skills=request.parsed_skills,
            target_job=request.target_job,
            target_company=request.target_company
        )
        return ResumeResponse(
            resume_text=resume_text,
            format="markdown"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating resume: {str(e)}"
        )


# ============================================================================
# Gap Analysis
# ============================================================================

@app.post("/api/gaps", response_model=GapResponse)
async def analyze_skill_gaps(request: GapRequest):
    """
    Analyze skills gaps between veteran skills and target career.

    Identifies missing skills and recommends training/certifications
    to close the gaps, with VA benefits eligibility information.
    """
    if not request.veteran_skills:
        raise HTTPException(
            status_code=400,
            detail="Please provide veteran skills"
        )

    # Verify occupation exists
    if not get_occupation_by_code(request.target_occupation_code):
        raise HTTPException(
            status_code=404,
            detail=f"Occupation {request.target_occupation_code} not found"
        )

    try:
        analysis = analyze_gaps(
            veteran_skills=request.veteran_skills,
            target_occupation_code=request.target_occupation_code
        )
        return GapResponse(analysis=analysis)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing gaps: {str(e)}"
        )


@app.get("/api/gaps/readiness/{occupation_code}")
async def get_readiness(occupation_code: str, skills: str):
    """
    Get career readiness score for a target occupation.

    Args:
        occupation_code: O*NET occupation code
        skills: Comma-separated list of skills
    """
    skill_list = [s.strip() for s in skills.split(",") if s.strip()]

    if not skill_list:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least one skill"
        )

    try:
        readiness = get_career_readiness_score(skill_list, occupation_code)
        return readiness
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error calculating readiness: {str(e)}"
        )


@app.get("/api/gaps/quick-wins/{occupation_code}")
async def get_quick_win_training(occupation_code: str, skills: str):
    """
    Get quick-win training recommendations to close critical gaps.

    Args:
        occupation_code: O*NET occupation code
        skills: Comma-separated list of current skills
    """
    skill_list = [s.strip() for s in skills.split(",") if s.strip()]

    try:
        quick_wins = get_quick_wins(skill_list, occupation_code, max_results=3)
        return {
            "recommendations": quick_wins,
            "count": len(quick_wins)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error finding quick wins: {str(e)}"
        )


# ============================================================================
# Utility Endpoints
# ============================================================================

@app.get("/api/occupations")
async def list_occupations(industry: str = None, limit: int = 20):
    """List available occupations, optionally filtered by industry"""
    from database import get_db

    with get_db() as conn:
        cursor = conn.cursor()

        if industry:
            cursor.execute(
                """SELECT occupation_code, occupation_title, median_wage, industry
                   FROM occupations WHERE industry = ? LIMIT ?""",
                (industry, limit)
            )
        else:
            cursor.execute(
                """SELECT occupation_code, occupation_title, median_wage, industry
                   FROM occupations LIMIT ?""",
                (limit,)
            )

        return [dict(row) for row in cursor.fetchall()]


@app.get("/api/industries")
async def list_industries():
    """List available industry categories"""
    from database import get_db

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT DISTINCT industry FROM occupations ORDER BY industry"
        )
        return [row["industry"] for row in cursor.fetchall()]


@app.get("/api/mos-codes")
async def list_mos_codes(branch: str = None):
    """List available MOS codes in the crosswalk database"""
    from database import get_db

    with get_db() as conn:
        cursor = conn.cursor()

        if branch:
            cursor.execute(
                """SELECT DISTINCT mos_code, military_title, branch
                   FROM military_crosswalk WHERE branch = ?
                   ORDER BY mos_code""",
                (branch,)
            )
        else:
            cursor.execute(
                """SELECT DISTINCT mos_code, military_title, branch
                   FROM military_crosswalk ORDER BY branch, mos_code"""
            )

        return [dict(row) for row in cursor.fetchall()]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
