"""
Gap analysis service - identifies skill gaps and recommends training
"""

from typing import Optional
from database import get_occupation_skills, get_training_for_skill, get_occupation_by_code
from models import GapAnalysis, TrainingRecommendation


# Default training recommendations for common skill gaps
DEFAULT_TRAINING = {
    "project management": TrainingRecommendation(
        skill_gap="project management",
        certification="PMP or CAPM Certification",
        estimated_time="3-6 months",
        cost="Often covered by VA benefits",
        provider="Project Management Institute",
        va_eligible=True
    ),
    "data analysis": TrainingRecommendation(
        skill_gap="data analysis",
        certification="Google Data Analytics Certificate",
        estimated_time="6 months",
        cost="Free on Coursera",
        provider="Google/Coursera",
        va_eligible=True
    ),
    "programming": TrainingRecommendation(
        skill_gap="programming",
        certification="Google IT Automation with Python",
        estimated_time="6 months",
        cost="Free on Coursera",
        provider="Google/Coursera",
        va_eligible=True
    ),
    "software development": TrainingRecommendation(
        skill_gap="software development",
        certification="AWS Certified Developer or freeCodeCamp",
        estimated_time="6-12 months",
        cost="Free to $150",
        provider="AWS/freeCodeCamp",
        va_eligible=True
    ),
    "cybersecurity": TrainingRecommendation(
        skill_gap="cybersecurity",
        certification="CompTIA Security+",
        estimated_time="3-4 months",
        cost="$392 exam fee, often VA covered",
        provider="CompTIA",
        va_eligible=True
    ),
    "network administration": TrainingRecommendation(
        skill_gap="network administration",
        certification="CompTIA Network+",
        estimated_time="2-3 months",
        cost="$358 exam fee, often VA covered",
        provider="CompTIA",
        va_eligible=True
    ),
    "lean manufacturing": TrainingRecommendation(
        skill_gap="lean manufacturing",
        certification="Six Sigma Green Belt",
        estimated_time="2-3 months",
        cost="$438 exam fee, often employer paid",
        provider="ASQ or IASSC",
        va_eligible=True
    ),
    "quality control": TrainingRecommendation(
        skill_gap="quality control",
        certification="ASQ Certified Quality Inspector",
        estimated_time="2-3 months",
        cost="$394 exam fee",
        provider="American Society for Quality",
        va_eligible=True
    ),
    "cad software": TrainingRecommendation(
        skill_gap="CAD software",
        certification="Autodesk Certified User",
        estimated_time="2-3 months",
        cost="$125 exam fee",
        provider="Autodesk",
        va_eligible=True
    ),
    "supply chain": TrainingRecommendation(
        skill_gap="supply chain",
        certification="APICS CSCP",
        estimated_time="6-9 months",
        cost="$595 exam fee, often employer paid",
        provider="ASCM",
        va_eligible=True
    ),
    "healthcare administration": TrainingRecommendation(
        skill_gap="healthcare administration",
        certification="Certified Medical Manager",
        estimated_time="6 months",
        cost="$325 exam fee",
        provider="PAHCOM",
        va_eligible=True
    ),
    "electrical systems": TrainingRecommendation(
        skill_gap="electrical systems",
        certification="Journeyman Electrician License",
        estimated_time="Apprenticeship program",
        cost="Paid apprenticeship",
        provider="State Licensing Board",
        va_eligible=True
    ),
    "mechanical design": TrainingRecommendation(
        skill_gap="mechanical design",
        certification="SOLIDWORKS Certification",
        estimated_time="3-6 months",
        cost="$99-199 exam fee",
        provider="Dassault Systemes",
        va_eligible=True
    ),
    "budgeting": TrainingRecommendation(
        skill_gap="budgeting",
        certification="Financial Management Certificate",
        estimated_time="3-4 months",
        cost="Varies by program",
        provider="Various universities",
        va_eligible=True
    ),
    "process improvement": TrainingRecommendation(
        skill_gap="process improvement",
        certification="Lean Six Sigma Yellow Belt",
        estimated_time="1-2 months",
        cost="$100-300",
        provider="Multiple providers",
        va_eligible=True
    ),
}


def analyze_gaps(
    veteran_skills: list[str],
    target_occupation_code: str
) -> GapAnalysis:
    """
    Analyze the gap between veteran skills and target occupation requirements.

    Args:
        veteran_skills: List of veteran's current skills
        target_occupation_code: O*NET code for target occupation

    Returns:
        GapAnalysis object with gaps and recommendations
    """
    # Get required skills for target occupation
    required_skills = get_occupation_skills(target_occupation_code)

    if not required_skills:
        # If occupation not found, return empty analysis
        return GapAnalysis(
            gaps=[],
            recommendations=[],
            estimated_time_to_ready="Unable to determine",
            match_percentage=0.0
        )

    # Normalize skills for comparison (lowercase)
    veteran_set = {s.lower().strip() for s in veteran_skills}
    required_set = {s.lower().strip() for s in required_skills}

    # Find matching and missing skills
    matching_skills = veteran_set.intersection(required_set)
    missing_skills = required_set - veteran_set

    # Calculate match percentage
    match_pct = (len(matching_skills) / len(required_set) * 100) if required_set else 0

    # Get training recommendations for each gap
    recommendations = []
    for skill in missing_skills:
        rec = _get_training_recommendation(skill)
        if rec:
            recommendations.append(rec)

    # Sort recommendations by importance (based on skill order in required_skills)
    skill_importance = {s.lower(): i for i, s in enumerate(required_skills)}
    recommendations.sort(key=lambda r: skill_importance.get(r.skill_gap.lower(), 999))

    # Calculate estimated time to ready
    time_to_ready = _calculate_time_to_ready(recommendations, match_pct)

    return GapAnalysis(
        gaps=list(missing_skills),
        recommendations=recommendations,
        estimated_time_to_ready=time_to_ready,
        match_percentage=round(match_pct, 1)
    )


def _get_training_recommendation(skill: str) -> Optional[TrainingRecommendation]:
    """
    Get a training recommendation for a specific skill gap.

    Args:
        skill: The skill to get training for

    Returns:
        TrainingRecommendation or None
    """
    skill_lower = skill.lower().strip()

    # First, check database
    db_training = get_training_for_skill(skill_lower)
    if db_training:
        return TrainingRecommendation(
            skill_gap=skill,
            certification=db_training.get("certification_name", "Industry certification"),
            estimated_time=db_training.get("estimated_time", "Varies"),
            cost=db_training.get("cost", "Varies"),
            provider=db_training.get("provider"),
            va_eligible=bool(db_training.get("va_eligible", True))
        )

    # Check default training recommendations
    if skill_lower in DEFAULT_TRAINING:
        rec = DEFAULT_TRAINING[skill_lower]
        return TrainingRecommendation(
            skill_gap=skill,
            certification=rec.certification,
            estimated_time=rec.estimated_time,
            cost=rec.cost,
            provider=rec.provider,
            va_eligible=rec.va_eligible
        )

    # Generic recommendation for unknown skills
    return TrainingRecommendation(
        skill_gap=skill,
        certification=f"{skill.title()} certification or training",
        estimated_time="1-6 months",
        cost="Varies - check VA benefits eligibility",
        provider="Various training providers",
        va_eligible=True
    )


def _calculate_time_to_ready(
    recommendations: list[TrainingRecommendation],
    current_match_pct: float
) -> str:
    """
    Calculate estimated time to become job-ready.

    Args:
        recommendations: List of training recommendations
        current_match_pct: Current skill match percentage

    Returns:
        Human-readable time estimate string
    """
    if current_match_pct >= 90:
        return "Job ready now"

    if current_match_pct >= 75:
        return "1-2 months with focused training"

    if not recommendations:
        return "Unable to determine"

    # Parse time estimates and calculate
    total_months = 0
    for rec in recommendations[:3]:  # Consider top 3 gaps
        time_str = rec.estimated_time.lower()
        if "week" in time_str:
            # Extract weeks and convert to months
            import re
            weeks = re.search(r'(\d+)', time_str)
            if weeks:
                total_months += int(weeks.group(1)) / 4
        elif "month" in time_str:
            # Extract months
            import re
            months = re.search(r'(\d+)', time_str)
            if months:
                total_months += int(months.group(1))
        elif "year" in time_str:
            import re
            years = re.search(r'(\d+)', time_str)
            if years:
                total_months += int(years.group(1)) * 12
        else:
            total_months += 3  # Default estimate

    # Can pursue multiple certifications in parallel
    parallel_factor = 0.6
    adjusted_months = total_months * parallel_factor

    if adjusted_months <= 2:
        return "1-2 months"
    elif adjusted_months <= 4:
        return "2-4 months"
    elif adjusted_months <= 6:
        return "4-6 months"
    elif adjusted_months <= 12:
        return "6-12 months"
    else:
        return "12+ months"


def get_quick_wins(
    veteran_skills: list[str],
    target_occupation_code: str,
    max_results: int = 3
) -> list[TrainingRecommendation]:
    """
    Get the quickest certifications to close critical gaps.

    Args:
        veteran_skills: Veteran's current skills
        target_occupation_code: Target occupation O*NET code
        max_results: Maximum recommendations to return

    Returns:
        List of TrainingRecommendation for quick wins
    """
    analysis = analyze_gaps(veteran_skills, target_occupation_code)

    # Sort by shortest time
    def time_sort_key(rec: TrainingRecommendation) -> int:
        time_str = rec.estimated_time.lower()
        if "week" in time_str or "day" in time_str:
            return 1
        if "1-2 month" in time_str or "1 month" in time_str:
            return 2
        if "2-3 month" in time_str:
            return 3
        if "3-4 month" in time_str or "3-6 month" in time_str:
            return 4
        if "6 month" in time_str:
            return 5
        return 10

    sorted_recs = sorted(analysis.recommendations, key=time_sort_key)
    return sorted_recs[:max_results]


def get_career_readiness_score(
    veteran_skills: list[str],
    target_occupation_code: str
) -> dict:
    """
    Get a comprehensive career readiness assessment.

    Args:
        veteran_skills: Veteran's skills
        target_occupation_code: Target occupation code

    Returns:
        Dict with readiness score and breakdown
    """
    analysis = analyze_gaps(veteran_skills, target_occupation_code)
    occupation = get_occupation_by_code(target_occupation_code)

    # Calculate readiness score (0-100)
    base_score = analysis.match_percentage

    # Bonus for having more skills than minimum required
    required_skills = get_occupation_skills(target_occupation_code)
    veteran_set = {s.lower() for s in veteran_skills}
    required_set = {s.lower() for s in required_skills}
    matching = veteran_set.intersection(required_set)

    bonus = min(10, (len(matching) - len(required_set) // 2) * 2) if len(matching) > len(required_set) // 2 else 0
    readiness_score = min(100, base_score + bonus)

    # Determine readiness level
    if readiness_score >= 85:
        level = "Highly Qualified"
        message = "You're well-prepared for this role. Consider applying now."
    elif readiness_score >= 70:
        level = "Qualified"
        message = "You meet most requirements. Minor upskilling would strengthen your application."
    elif readiness_score >= 50:
        level = "Partially Qualified"
        message = "You have a foundation to build on. Focus on key skill gaps."
    else:
        level = "Development Needed"
        message = "This role requires significant skill development. Consider a stepping-stone position."

    return {
        "readiness_score": round(readiness_score, 1),
        "level": level,
        "message": message,
        "match_percentage": analysis.match_percentage,
        "skills_matched": len(matching),
        "skills_required": len(required_set),
        "gaps_count": len(analysis.gaps),
        "estimated_time": analysis.estimated_time_to_ready,
        "occupation_title": occupation.get("occupation_title", "Unknown") if occupation else "Unknown"
    }
