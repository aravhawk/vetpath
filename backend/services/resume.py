"""
Resume generation service - creates civilian-ready resumes from military profiles
"""

import os
from typing import Optional

try:
    import anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

from models import MilitaryProfile, ParsedSkills


SYSTEM_PROMPT = """You are a professional resume writer specializing in military-to-civilian transitions.
Your job is to create clear, professional resumes that translate military accomplishments into
business impact that civilian employers understand and value.

RULES:
1. Use civilian terminology, NEVER military jargon
2. Quantify achievements wherever possible (numbers, percentages, dollar values)
3. Focus on transferable skills and leadership experience
4. Highlight responsibility and accountability
5. Keep everything truthful and accurate - never exaggerate
6. Use strong action verbs (Led, Managed, Developed, Implemented, Coordinated)
7. Format for ATS (Applicant Tracking Systems) compatibility

MILITARY TO CIVILIAN TRANSLATIONS:
- "Commanded" → "Led" or "Managed"
- "Platoon" → "team of 30-40 personnel"
- "Company" → "organization of 100-200 personnel"
- "Deployment" → "overseas assignment" or "international operations"
- "Battle drills" → "emergency procedures" or "rapid response protocols"
- "NCOER/OER" → "performance evaluation"
- "Enlisted" → "entry-level to mid-level"
- "Officer" → "management/leadership role"
- "MOS" → "specialty" or "role"

RESUME FORMAT:
Use clean, professional formatting with clear sections. Output in Markdown format.

Include these sections:
1. PROFESSIONAL SUMMARY (3-4 sentences)
2. CORE COMPETENCIES (skills in bullet points)
3. PROFESSIONAL EXPERIENCE (with quantified achievements)
4. EDUCATION & TRAINING
5. CERTIFICATIONS (if applicable)
6. CLEARANCE (if applicable and relevant to target job)"""


def generate_resume(
    profile: MilitaryProfile,
    parsed_skills: ParsedSkills,
    target_job: str,
    target_company: Optional[str] = None,
    api_key: Optional[str] = None
) -> str:
    """
    Generate a civilian-ready resume from military profile.

    Args:
        profile: MilitaryProfile with service details
        parsed_skills: ParsedSkills from the parser
        target_job: Target civilian job title
        target_company: Optional target company name
        api_key: Optional Anthropic API key

    Returns:
        Resume text in Markdown format
    """
    if not ANTHROPIC_AVAILABLE:
        return _fallback_resume(profile, parsed_skills, target_job)

    key = api_key or os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        return _fallback_resume(profile, parsed_skills, target_job)

    try:
        client = anthropic.Anthropic(api_key=key)

        # Build the profile summary for the prompt
        profile_summary = f"""
MILITARY PROFILE:
- Branch: {profile.branch}
- Years of Service: {profile.years_of_service}
- MOS/Rate: {profile.mos_code or 'Not specified'}
- Rank: {profile.rank or 'Not specified'}

EXPERIENCE DESCRIPTION:
{profile.experience_description}

EXTRACTED SKILLS:
- Leadership: {parsed_skills.leadership.model_dump() if parsed_skills.leadership else 'Not specified'}
- Technical Skills: {', '.join(parsed_skills.technical_skills) or 'None listed'}
- Soft Skills: {', '.join(parsed_skills.soft_skills) or 'None listed'}
- Transferable Skills: {', '.join(parsed_skills.transferable_skills) or 'None listed'}
- Years Experience: {parsed_skills.years_experience or profile.years_of_service}
- Asset Responsibility: {parsed_skills.asset_responsibility or 'Not specified'}
- Certifications: {', '.join(parsed_skills.certifications) or 'None listed'}
- Security Clearance: {parsed_skills.security_clearance or 'Not specified'}

TARGET POSITION: {target_job}
{f'TARGET COMPANY: {target_company}' if target_company else ''}
"""

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"Create a professional resume for this veteran:\n\n{profile_summary}"
                }
            ]
        )

        return response.content[0].text

    except Exception as e:
        print(f"Error generating resume with API: {e}")
        return _fallback_resume(profile, parsed_skills, target_job)


def _fallback_resume(
    profile: MilitaryProfile,
    parsed_skills: ParsedSkills,
    target_job: str
) -> str:
    """
    Generate a basic resume template when API is unavailable.
    """
    # Translate branch for civilian understanding
    branch_display = profile.branch

    # Create leadership description
    leadership_desc = ""
    if parsed_skills.leadership:
        leadership_desc = f"Experienced {parsed_skills.leadership.level} with history of managing {parsed_skills.leadership.scope} in {parsed_skills.leadership.context}."

    # Format skills as bullet points
    all_skills = []
    all_skills.extend(parsed_skills.technical_skills[:5])
    all_skills.extend(parsed_skills.soft_skills[:3])
    all_skills.extend(parsed_skills.transferable_skills[:4])

    skills_bullets = "\n".join([f"- {skill.title()}" for skill in all_skills[:10]])

    # Create certifications section
    certs_section = ""
    if parsed_skills.certifications:
        certs_section = f"""
## CERTIFICATIONS

{chr(10).join([f'- {cert}' for cert in parsed_skills.certifications])}
"""

    # Create clearance section
    clearance_section = ""
    if parsed_skills.security_clearance:
        clearance_section = f"""
## SECURITY CLEARANCE

- {parsed_skills.security_clearance}
"""

    resume = f"""# [VETERAN NAME]

**Email:** [your.email@email.com] | **Phone:** [XXX-XXX-XXXX] | **Location:** [City, State]
**LinkedIn:** [linkedin.com/in/yourprofile]

---

## PROFESSIONAL SUMMARY

Dedicated professional with {parsed_skills.years_experience or profile.years_of_service} years of experience in the {branch_display}. {leadership_desc} Proven track record of excellence in high-pressure environments with strong focus on mission accomplishment and team development. Seeking to leverage military experience in a {target_job} role.

---

## CORE COMPETENCIES

{skills_bullets}

---

## PROFESSIONAL EXPERIENCE

### {branch_display} | [Dates of Service]
**[Most Recent Rank/Position]**

- Led and managed team operations, ensuring 100% mission completion rate
- Maintained and operated equipment valued at {parsed_skills.asset_responsibility or 'significant value'}
- Trained and mentored junior team members on procedures and best practices
- Coordinated logistics and resources for operational requirements
- Implemented process improvements resulting in increased efficiency
- Maintained compliance with safety and security protocols

---

## EDUCATION & TRAINING

**[Degree/Training Program]** | [Institution Name] | [Year]

- Relevant military training and professional development courses
- Leadership development programs
- Technical certifications and qualifications
{certs_section}
{clearance_section}
---

*References available upon request*
"""

    return resume


def generate_targeted_bullets(
    experience_description: str,
    target_job: str,
    num_bullets: int = 5,
    api_key: Optional[str] = None
) -> list[str]:
    """
    Generate targeted achievement bullets for a specific job application.

    Args:
        experience_description: Military experience description
        target_job: Target civilian job
        num_bullets: Number of bullets to generate
        api_key: Optional API key

    Returns:
        List of achievement bullet strings
    """
    if not ANTHROPIC_AVAILABLE:
        return _fallback_bullets(num_bullets)

    key = api_key or os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        return _fallback_bullets(num_bullets)

    try:
        client = anthropic.Anthropic(api_key=key)

        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": f"""Based on this military experience, generate {num_bullets} strong resume bullet points
targeting a {target_job} position. Use civilian language, quantify achievements, and start with action verbs.

Military Experience:
{experience_description}

Return only the bullet points, one per line, starting with a dash (-)."""
                }
            ]
        )

        # Parse bullets from response
        lines = response.content[0].text.strip().split('\n')
        bullets = [line.lstrip('- ').strip() for line in lines if line.strip().startswith('-')]

        return bullets[:num_bullets]

    except Exception as e:
        print(f"Error generating bullets: {e}")
        return _fallback_bullets(num_bullets)


def _fallback_bullets(num_bullets: int) -> list[str]:
    """Fallback bullet points when API unavailable"""
    default_bullets = [
        "Led cross-functional team operations, achieving 100% mission success rate",
        "Managed equipment and resources valued at over $1M with zero loss or damage",
        "Trained and developed 10+ team members on operational procedures and best practices",
        "Coordinated logistics operations ensuring timely delivery of critical resources",
        "Implemented process improvements that increased operational efficiency by 20%",
        "Maintained safety compliance with zero incidents during tenure",
        "Collaborated with multiple departments to achieve organizational objectives",
        "Documented and reported operational metrics to senior leadership",
    ]
    return default_bullets[:num_bullets]
