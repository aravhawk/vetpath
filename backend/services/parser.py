"""
AI-powered military experience parser using OpenRouter/Claude API
"""

import json
import re
from typing import Optional

from models import ParsedSkills, Leadership
from services.ai_client import is_ai_available, call_ai_simple


SYSTEM_PROMPT = """You are an expert in translating military experience to civilian terminology.
Your job is to extract skills from military service descriptions and translate them into
business-friendly language that civilian employers understand.

Be factual and accurate. Focus on identifying:
1. Leadership experience (level, scope, context)
2. Technical skills that transfer to civilian jobs
3. Soft skills demonstrated through service
4. Quantifiable achievements (people managed, budgets, equipment values)
5. Certifications and clearances

IMPORTANT: Always translate military jargon to civilian terms:
- "NCO" → "team lead" or "supervisor"
- "platoon" → "team of 30-40 personnel"
- "company" → "organization of 100-200 personnel"
- "battalion" → "organization of 500-800 personnel"
- "MOS" → "occupational specialty"
- "PT" → "physical fitness training"
- "deployment" → "overseas assignment" or "field operations"
- "tactical operations" → "high-pressure operational environment"

Return a JSON object with this exact structure:
{
    "leadership": {
        "level": "individual contributor|team lead|supervisor|manager|senior manager",
        "scope": "description of who/what they led",
        "context": "description of the environment"
    },
    "technical_skills": ["list", "of", "technical", "skills"],
    "soft_skills": ["list", "of", "soft", "skills"],
    "transferable_skills": ["civilian-ready", "skill", "descriptions"],
    "years_experience": number or null,
    "asset_responsibility": "description of assets managed" or null,
    "certifications": ["any", "certifications", "mentioned"],
    "security_clearance": "clearance level" or null
}

Only return the JSON object, no additional text."""


def extract_json_from_text(text: str) -> dict:
    """Extract JSON object from text that might contain other content"""
    # Try to find JSON object in the text
    json_match = re.search(r'\{[\s\S]*\}', text)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    # If no valid JSON found, return empty structure
    return {
        "leadership": None,
        "technical_skills": [],
        "soft_skills": [],
        "transferable_skills": [],
        "years_experience": None,
        "asset_responsibility": None,
        "certifications": [],
        "security_clearance": None
    }


def parse_military_experience(description: str) -> ParsedSkills:
    """
    Parse military experience description into structured skills using Claude API via OpenRouter.

    Args:
        description: Free-text description of military experience

    Returns:
        ParsedSkills object with extracted and translated skills
    """
    # If no API available, use fallback parser
    if not is_ai_available():
        print("AI not available (OPENROUTER_API_KEY not set), using fallback parser")
        return _fallback_parser(description)

    try:
        response_text = call_ai_simple(
            user_message=f"Parse this military experience and extract skills:\n\n{description}",
            system_prompt=SYSTEM_PROMPT,
            max_tokens=2048,
        )

        if not response_text:
            return _fallback_parser(description)

        # Parse JSON from response
        data = extract_json_from_text(response_text)

        # Convert to ParsedSkills model
        leadership = None
        if data.get("leadership") and isinstance(data["leadership"], dict):
            leadership = Leadership(
                level=data["leadership"].get("level") or "unknown",
                scope=data["leadership"].get("scope") or "",
                context=data["leadership"].get("context") or ""
            )

        return ParsedSkills(
            leadership=leadership,
            technical_skills=data.get("technical_skills", []),
            soft_skills=data.get("soft_skills", []),
            transferable_skills=data.get("transferable_skills", []),
            years_experience=data.get("years_experience"),
            asset_responsibility=data.get("asset_responsibility"),
            certifications=data.get("certifications", []),
            security_clearance=data.get("security_clearance")
        )

    except Exception as e:
        print(f"Error calling AI: {e}")
        return _fallback_parser(description)


def _fallback_parser(description: str) -> ParsedSkills:
    """
    Fallback parser using keyword extraction when API is unavailable.
    This provides basic functionality without AI.
    """
    description_lower = description.lower()

    # Extract years of experience
    years = None
    years_match = re.search(r'(\d+)\s*(?:years?|yrs?)', description_lower)
    if years_match:
        years = int(years_match.group(1))

    # Leadership detection
    leadership = None
    leadership_keywords = {
        "senior manager": ["battalion", "commander", "command sergeant", "first sergeant"],
        "manager": ["company", "captain", "platoon leader", "section chief"],
        "supervisor": ["sergeant", "staff sergeant", "petty officer", "nco"],
        "team lead": ["squad leader", "team leader", "fire team", "crew chief"],
    }

    for level, keywords in leadership_keywords.items():
        if any(kw in description_lower for kw in keywords):
            # Find scope
            scope_match = re.search(r'(\d+)[\s-]*(?:person|soldier|marine|sailor|airman|personnel|people|member)', description_lower)
            scope = f"{scope_match.group(1)} direct reports" if scope_match else "team members"

            leadership = Leadership(
                level=level,
                scope=scope,
                context="military operational environment"
            )
            break

    # Technical skills extraction
    technical_keywords = {
        "equipment maintenance": ["maintenance", "repair", "mechanic", "technician"],
        "inventory management": ["inventory", "supply", "logistics", "warehouse"],
        "communications systems": ["radio", "communications", "signal", "satellite"],
        "medical procedures": ["medic", "medical", "first aid", "corpsman"],
        "weapons systems": ["weapons", "armament", "gunnery", "ordnance"],
        "vehicle operations": ["driver", "vehicle", "convoy", "transport"],
        "network administration": ["network", "it", "systems", "cyber"],
        "security operations": ["security", "force protection", "guard"],
        "training and instruction": ["training", "instructor", "teach", "mentor"],
        "documentation": ["reports", "documentation", "records", "admin"],
    }

    technical_skills = []
    for skill, keywords in technical_keywords.items():
        if any(kw in description_lower for kw in keywords):
            technical_skills.append(skill)

    # Soft skills extraction
    soft_skills = []
    soft_keywords = {
        "leadership": ["led", "leader", "command", "supervised"],
        "teamwork": ["team", "unit", "crew", "squad"],
        "communication": ["briefed", "coordinated", "liaison"],
        "problem solving": ["troubleshoot", "resolved", "solved"],
        "adaptability": ["deployed", "various", "multiple", "diverse"],
        "stress management": ["combat", "high-pressure", "operational"],
        "attention to detail": ["inspection", "quality", "precision"],
        "time management": ["deadline", "schedule", "mission"],
    }

    for skill, keywords in soft_keywords.items():
        if any(kw in description_lower for kw in keywords):
            soft_skills.append(skill)

    # Transferable skills (civilian-ready translations)
    transferable_skills = []

    if leadership:
        transferable_skills.append("team leadership and personnel management")

    if "training" in description_lower or "instructor" in description_lower:
        transferable_skills.append("training development and delivery")

    if any(word in description_lower for word in ["logistics", "supply", "inventory"]):
        transferable_skills.append("supply chain and logistics management")

    if any(word in description_lower for word in ["maintenance", "repair", "mechanic"]):
        transferable_skills.append("equipment maintenance and troubleshooting")

    if any(word in description_lower for word in ["network", "it", "cyber", "systems"]):
        transferable_skills.append("information technology and systems administration")

    if any(word in description_lower for word in ["medic", "medical", "corpsman"]):
        transferable_skills.append("emergency medical response and patient care")

    if any(word in description_lower for word in ["security", "force protection"]):
        transferable_skills.append("security operations and risk management")

    # Add general transferable skills
    transferable_skills.extend([
        "high-stress decision making",
        "operational planning and execution",
        "cross-functional team collaboration"
    ])

    # Asset responsibility extraction
    asset_match = re.search(r'\$(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:m(?:illion)?|k|worth|value|equipment)', description_lower)
    asset_responsibility = None
    if asset_match:
        asset_responsibility = f"${asset_match.group(1)} in equipment/assets"

    # Security clearance detection
    clearance = None
    clearance_keywords = {
        "Top Secret/SCI": ["ts/sci", "top secret/sci"],
        "Top Secret": ["top secret", "ts clearance"],
        "Secret": ["secret clearance", "secret security"],
        "Confidential": ["confidential clearance"],
    }

    for level, keywords in clearance_keywords.items():
        if any(kw in description_lower for kw in keywords):
            clearance = level
            break

    return ParsedSkills(
        leadership=leadership,
        technical_skills=technical_skills[:10],  # Limit to top 10
        soft_skills=soft_skills[:8],
        transferable_skills=transferable_skills[:8],
        years_experience=years,
        asset_responsibility=asset_responsibility,
        certifications=[],
        security_clearance=clearance
    )
