"""
OpenRouter AI Client - Connects to Claude via OpenRouter API

Uses:
- $OPENROUTER_API_KEY environment variable
- Model: anthropic/claude-haiku-4.5
- Extended thinking enabled with 4096 max reasoning tokens

Per OpenRouter docs:
- max_tokens controls visible output tokens
- reasoning.max_tokens caps reasoning/thinking budget
- max_tokens must be > reasoning.max_tokens
"""

import os
import json
import requests
from typing import Optional

# OpenRouter configuration
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "anthropic/claude-haiku-4.5"
MAX_REASONING_TOKENS = 4096
# Set high to effectively not limit output (must be > reasoning tokens per docs)
DEFAULT_MAX_TOKENS = 16000


def get_api_key() -> Optional[str]:
    """Get OpenRouter API key from environment"""
    return os.environ.get("OPENROUTER_API_KEY")


def is_ai_available() -> bool:
    """Check if AI is available (API key is set)"""
    return bool(get_api_key())


def call_ai(
    messages: list[dict],
    system_prompt: str = None,
    max_tokens: int = DEFAULT_MAX_TOKENS,
    reasoning_tokens: int = MAX_REASONING_TOKENS,
    model: str = DEFAULT_MODEL,
) -> Optional[str]:
    """
    Call OpenRouter API with Claude model and extended thinking.

    Per OpenRouter docs (https://openrouter.ai/docs/use-cases/reasoning-tokens):
    - max_tokens: controls visible output tokens
    - reasoning.max_tokens: caps reasoning/thinking budget
    - max_tokens must be strictly greater than reasoning.max_tokens

    Args:
        messages: List of message dicts with 'role' and 'content'
        system_prompt: Optional system prompt
        max_tokens: Maximum tokens for visible output (default: 16000, high to not limit)
        reasoning_tokens: Max tokens for reasoning/thinking (default: 4096)
        model: Model to use (default: anthropic/claude-haiku-4.5)

    Returns:
        Response text or None if error

    Raises:
        Exception: If API call fails
    """
    api_key = get_api_key()
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable not set")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://vetpath.app",
        "X-Title": "VetPath - Veterans Career Translator",
    }

    # Build messages with system prompt if provided
    final_messages = messages
    if system_prompt:
        final_messages = [
            {"role": "system", "content": system_prompt},
            *messages
        ]

    # Build payload per OpenRouter docs
    # max_tokens must be > reasoning.max_tokens
    payload = {
        "model": model,
        "messages": final_messages,
        "max_tokens": max(max_tokens, reasoning_tokens + 1000),  # Ensure room for output
        "reasoning": {
            "max_tokens": reasoning_tokens
        }
    }

    try:
        response = requests.post(
            OPENROUTER_API_URL,
            headers=headers,
            json=payload,
            timeout=120  # Extended timeout for reasoning
        )

        response.raise_for_status()
        result = response.json()

        # Extract the response text
        if "choices" in result and len(result["choices"]) > 0:
            choice = result["choices"][0]
            if "message" in choice and "content" in choice["message"]:
                return choice["message"]["content"]

        # Fallback: return raw result if structure is different
        return json.dumps(result)

    except requests.exceptions.Timeout:
        raise Exception("AI request timed out. Please try again.")
    except requests.exceptions.HTTPError as e:
        error_detail = ""
        try:
            error_detail = e.response.json()
        except:
            error_detail = e.response.text
        raise Exception(f"AI API error: {e.response.status_code} - {error_detail}")
    except requests.exceptions.RequestException as e:
        raise Exception(f"AI request failed: {str(e)}")


def call_ai_simple(
    user_message: str,
    system_prompt: str = None,
    max_tokens: int = DEFAULT_MAX_TOKENS,
) -> Optional[str]:
    """
    Simplified AI call with just a user message.

    Args:
        user_message: The user's message/prompt
        system_prompt: Optional system prompt
        max_tokens: Maximum output tokens (default: 16000, high to not limit)

    Returns:
        Response text
    """
    messages = [{"role": "user", "content": user_message}]
    return call_ai(
        messages=messages,
        system_prompt=system_prompt,
        max_tokens=max_tokens,
        reasoning_tokens=MAX_REASONING_TOKENS,
    )
