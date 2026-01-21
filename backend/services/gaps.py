"""
Gap analysis service - identifies skill gaps and recommends training
"""

import json
import re
from typing import Optional

from database import get_occupation_skills, get_training_for_skill, get_occupation_by_code
from models import GapAnalysis, TrainingRecommendation
from services.ai_client import is_ai_available, call_ai_simple


def _extract_json_from_text(text: str) -> dict:
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            return {}
    return {}


def _build_ai_development_plan(
    occupation_title: str,
    match_percentage: float,
    gaps: list[str],
    recommendations: list[TrainingRecommendation],
) -> tuple[Optional[str], list[str], list[str]]:
    if not is_ai_available():
        return None, [], []

    rec_names = [rec.certification for rec in recommendations[:6]]
    prompt = f"""
You are a career coach for veterans. Based on the target role and skill gaps, provide a short development plan.
Return ONLY JSON with keys:
- development_summary (string)
- development_steps (array of 3-6 short steps)
- resource_suggestions (array of 4-6 resource ideas; no URLs)

Target role: {occupation_title}
Match percentage: {match_percentage}%
Skill gaps: {gaps}
Existing training recommendations: {rec_names}

Constraints:
- Keep items short and actionable.
- Do NOT include URLs.
- Prefer reputable sources (community college, apprenticeship, CompTIA/PMI/AWS, employer training, government programs).
"""

    try:
        response = call_ai_simple(user_message=prompt, max_tokens=1200)
        if not response:
            return None, [], []
        data = _extract_json_from_text(response)
        summary = data.get("development_summary")
        steps = data.get("development_steps") or []
        resources = data.get("resource_suggestions") or []
        if not isinstance(steps, list):
            steps = []
        if not isinstance(resources, list):
            resources = []
        return summary, steps, resources
    except Exception:
        return None, [], []




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

    occupation = get_occupation_by_code(target_occupation_code)
    occupation_title = occupation.get("occupation_title", "Target Role") if occupation else "Target Role"

    development_summary, development_steps, resource_suggestions = _build_ai_development_plan(
        occupation_title=occupation_title,
        match_percentage=round(match_pct, 1),
        gaps=list(missing_skills),
        recommendations=recommendations,
    )

    return GapAnalysis(
        gaps=list(missing_skills),
        recommendations=recommendations,
        estimated_time_to_ready=time_to_ready,
        match_percentage=round(match_pct, 1),
        development_summary=development_summary,
        development_steps=development_steps,
        resource_suggestions=resource_suggestions,
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
