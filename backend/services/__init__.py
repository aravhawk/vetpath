"""
VetPath Services

AI-powered services for military-to-civilian career translation.
Uses OpenRouter API with Claude Haiku 4.5 and extended thinking.
"""

from .ai_client import is_ai_available, call_ai, call_ai_simple
from .parser import parse_military_experience
from .matcher import match_careers, get_career_details
from .resume import generate_resume
from .gaps import analyze_gaps

__all__ = [
    # AI Client
    "is_ai_available",
    "call_ai",
    "call_ai_simple",
    # Services
    "parse_military_experience",
    "match_careers",
    "get_career_details",
    "generate_resume",
    "analyze_gaps",
]
