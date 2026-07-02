"""Domain-specific exceptions for clear CLI failures."""

from __future__ import annotations


class EngineUnavailableError(RuntimeError):
    """Raised when a configured external engine is not installed or configured."""
