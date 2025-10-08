"""
Data validation utilities.
"""

import re
from typing import Optional


def validate_phone_number(phone: str) -> bool:
    """
    Validate phone number format.

    Args:
        phone: Phone number to validate

    Returns:
        True if valid
    """
    # Remove spaces and dashes
    phone = phone.replace(" ", "").replace("-", "")

    # Check if starts with + and contains only digits after
    pattern = r'^\+\d{10,15}$'
    return bool(re.match(pattern, phone))


def sanitize_text(text: str, max_length: int = 4000) -> str:
    """
    Sanitize text for sending to AI or messengers.

    Args:
        text: Text to sanitize
        max_length: Maximum length

    Returns:
        Sanitized text
    """
    # Remove null bytes
    text = text.replace('\x00', '')

    # Trim whitespace
    text = text.strip()

    # Limit length
    if len(text) > max_length:
        text = text[:max_length] + "..."

    return text


def extract_command(text: str) -> Optional[str]:
    """
    Extract command from message text.

    Args:
        text: Message text

    Returns:
        Command name without / or None
    """
    text = text.strip()
    if text.startswith('/'):
        # Extract first word after /
        parts = text[1:].split()
        if parts:
            return parts[0].lower()
    return None


__all__ = [
    "validate_phone_number",
    "sanitize_text",
    "extract_command"
]
