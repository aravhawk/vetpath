"""
Pydantic models for VetPath API
"""

from pydantic import BaseModel
from typing import Optional


class Leadership(BaseModel):
    """Leadership experience structure"""
    level: str
    scope: str
    context: str


class ParsedSkills(BaseModel):
    """Structured skills extracted from military experience"""
    leadership: Optional[Leadership] = None
    technical_skills: list[str] = []
    soft_skills: list[str] = []
    transferable_skills: list[str] = []
    years_experience: Optional[int] = None
    asset_responsibility: Optional[str] = None
    certifications: list[str] = []
    security_clearance: Optional[str] = None


class MilitaryProfile(BaseModel):
    """Input model for military experience"""
    branch: str
    years_of_service: int
    mos_code: Optional[str] = None
    rank: Optional[str] = None
    experience_description: str


class ParseRequest(BaseModel):
    """Request to parse military experience"""
    experience: str


class ParseResponse(BaseModel):
    """Response from skills parser"""
    skills: ParsedSkills
    raw_text: str


class CareerMatch(BaseModel):
    """A matched civilian career"""
    occupation_code: str
    occupation_title: str
    median_wage: int
    job_outlook: str
    growth_rate: Optional[float] = None
    skill_match_score: float
    industry: str
    description: str
    required_skills: list[str] = []
    education_required: str


class MatchRequest(BaseModel):
    """Request to match skills to careers"""
    skills: list[str]
    preferences: Optional[dict] = None


class MatchResponse(BaseModel):
    """Response from career matcher"""
    matches: list[CareerMatch]
    total_found: int


class ResumeRequest(BaseModel):
    """Request to generate a resume"""
    profile: MilitaryProfile
    parsed_skills: ParsedSkills
    target_job: str
    target_company: Optional[str] = None


class ResumeResponse(BaseModel):
    """Response from resume generator"""
    resume_text: str
    format: str = "markdown"


class TrainingRecommendation(BaseModel):
    """A training recommendation for a skill gap"""
    skill_gap: str
    certification: str
    estimated_time: str
    cost: str
    provider: Optional[str] = None
    va_eligible: bool = True


class GapAnalysis(BaseModel):
    """Skills gap analysis result"""
    gaps: list[str]
    recommendations: list[TrainingRecommendation]
    estimated_time_to_ready: str
    match_percentage: float
    development_summary: Optional[str] = None
    development_steps: list[str] = []
    resource_suggestions: list[str] = []


class GapRequest(BaseModel):
    """Request to analyze skills gaps"""
    veteran_skills: list[str]
    target_occupation_code: str


class GapResponse(BaseModel):
    """Response from gap analyzer"""
    analysis: GapAnalysis
