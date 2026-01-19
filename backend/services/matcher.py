"""
Career matching service - matches veteran skills to civilian careers
"""

from typing import Optional
from database import (
    search_occupations_by_skills,
    get_occupation_by_code,
    get_occupation_skills,
    get_crosswalk_for_mos
)
from models import CareerMatch, ParsedSkills


def match_careers(
    skills: list[str],
    preferences: Optional[dict] = None,
    limit: int = 10
) -> list[CareerMatch]:
    """
    Match a list of skills to civilian careers.

    Args:
        skills: List of skill strings to match
        preferences: Optional dict with filtering preferences:
            - min_salary: Minimum acceptable salary
            - industries: List of preferred industries
            - education_level: Maximum education level
        limit: Maximum number of results to return

    Returns:
        List of CareerMatch objects sorted by match score
    """
    if not skills:
        return []

    # Get matching occupations from database
    raw_matches = search_occupations_by_skills(skills, limit=limit * 2)

    matches = []
    for occ in raw_matches:
        # Apply preference filters
        if preferences:
            if preferences.get("min_salary") and occ.get("median_wage", 0) < preferences["min_salary"]:
                continue
            if preferences.get("industries") and occ.get("industry") not in preferences["industries"]:
                continue

        # Get required skills for this occupation
        required_skills = get_occupation_skills(occ["occupation_code"])

        match = CareerMatch(
            occupation_code=occ["occupation_code"],
            occupation_title=occ["occupation_title"],
            median_wage=occ.get("median_wage", 0),
            job_outlook=occ.get("job_outlook", "Unknown"),
            growth_rate=occ.get("growth_rate"),
            skill_match_score=occ.get("skill_match_score", 0),
            industry=occ.get("industry", "Unknown"),
            description=occ.get("description", ""),
            required_skills=required_skills,
            education_required=occ.get("education_required", "Varies")
        )
        matches.append(match)

    # Sort by match score (descending), then by wage
    matches.sort(key=lambda x: (-x.skill_match_score, -x.median_wage))

    return matches[:limit]


def match_from_parsed_skills(
    parsed_skills: ParsedSkills,
    preferences: Optional[dict] = None,
    limit: int = 10
) -> list[CareerMatch]:
    """
    Match careers based on a ParsedSkills object.

    Args:
        parsed_skills: ParsedSkills object from the parser
        preferences: Optional filtering preferences
        limit: Maximum results

    Returns:
        List of CareerMatch objects
    """
    # Combine all skills from the parsed profile
    all_skills = []
    all_skills.extend(parsed_skills.technical_skills)
    all_skills.extend(parsed_skills.soft_skills)
    all_skills.extend(parsed_skills.transferable_skills)

    # Add leadership as a skill if present
    if parsed_skills.leadership:
        all_skills.append("team leadership")
        if parsed_skills.leadership.level in ["manager", "senior manager"]:
            all_skills.append("operations management")
            all_skills.append("strategic planning")

    # Add security-related skills if clearance present
    if parsed_skills.security_clearance:
        all_skills.append("security clearance")
        if "top secret" in parsed_skills.security_clearance.lower():
            all_skills.append("cybersecurity")
            all_skills.append("risk assessment")

    # Remove duplicates while preserving order
    seen = set()
    unique_skills = []
    for skill in all_skills:
        skill_lower = skill.lower()
        if skill_lower not in seen:
            seen.add(skill_lower)
            unique_skills.append(skill)

    return match_careers(unique_skills, preferences, limit)


def match_from_mos(
    mos_code: str,
    branch: str,
    additional_skills: Optional[list[str]] = None,
    limit: int = 10
) -> list[CareerMatch]:
    """
    Match careers based on military MOS/rate code.

    Args:
        mos_code: Military occupation code (e.g., "11B", "IT", "3D0X2")
        branch: Military branch (Army, Navy, Air Force, Marine Corps)
        additional_skills: Additional skills to consider
        limit: Maximum results

    Returns:
        List of CareerMatch objects
    """
    # Get crosswalk matches
    crosswalk_results = get_crosswalk_for_mos(mos_code, branch)

    matches = []
    seen_codes = set()

    # First, add direct crosswalk matches
    for entry in crosswalk_results:
        code = entry["civilian_occupation_code"]
        if code in seen_codes:
            continue
        seen_codes.add(code)

        occ = get_occupation_by_code(code)
        if not occ:
            continue

        required_skills = get_occupation_skills(code)

        # Calculate match score based on crosswalk strength
        base_score = entry.get("match_strength", 3) * 20  # 20-100 range

        match = CareerMatch(
            occupation_code=code,
            occupation_title=occ["occupation_title"],
            median_wage=occ.get("median_wage", 0),
            job_outlook=occ.get("job_outlook", "Unknown"),
            growth_rate=occ.get("growth_rate"),
            skill_match_score=float(base_score),
            industry=occ.get("industry", "Unknown"),
            description=occ.get("description", ""),
            required_skills=required_skills,
            education_required=occ.get("education_required", "Varies")
        )
        matches.append(match)

    # If additional skills provided, add skill-based matches
    if additional_skills:
        skill_matches = match_careers(additional_skills, limit=limit)
        for match in skill_matches:
            if match.occupation_code not in seen_codes:
                seen_codes.add(match.occupation_code)
                matches.append(match)

    # Sort and limit
    matches.sort(key=lambda x: (-x.skill_match_score, -x.median_wage))
    return matches[:limit]


def get_career_details(occupation_code: str) -> Optional[CareerMatch]:
    """
    Get detailed information about a specific career.

    Args:
        occupation_code: O*NET occupation code

    Returns:
        CareerMatch object or None if not found
    """
    occ = get_occupation_by_code(occupation_code)
    if not occ:
        return None

    required_skills = get_occupation_skills(occupation_code)

    return CareerMatch(
        occupation_code=occ["occupation_code"],
        occupation_title=occ["occupation_title"],
        median_wage=occ.get("median_wage", 0),
        job_outlook=occ.get("job_outlook", "Unknown"),
        growth_rate=occ.get("growth_rate"),
        skill_match_score=100.0,  # Full match for direct lookup
        industry=occ.get("industry", "Unknown"),
        description=occ.get("description", ""),
        required_skills=required_skills,
        education_required=occ.get("education_required", "Varies")
    )


def calculate_skill_overlap(
    veteran_skills: list[str],
    occupation_code: str
) -> tuple[list[str], list[str], float]:
    """
    Calculate the overlap between veteran skills and occupation requirements.

    Args:
        veteran_skills: List of veteran's skills
        occupation_code: Target occupation code

    Returns:
        Tuple of (matching_skills, missing_skills, match_percentage)
    """
    required_skills = get_occupation_skills(occupation_code)

    # Normalize skills for comparison
    veteran_set = {s.lower() for s in veteran_skills}
    required_set = {s.lower() for s in required_skills}

    matching = veteran_set.intersection(required_set)
    missing = required_set - veteran_set

    match_pct = (len(matching) / len(required_set) * 100) if required_set else 0

    return (
        [s for s in veteran_skills if s.lower() in matching],
        list(missing),
        round(match_pct, 1)
    )
