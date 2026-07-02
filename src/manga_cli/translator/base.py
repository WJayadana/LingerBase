"""Translation provider interfaces."""

from __future__ import annotations

from typing import Protocol


class Translator(Protocol):
    """Protocol implemented by translation providers."""

    def translate(self, texts: list[str], target_language: str) -> list[str]:
        """Translate a batch of strings."""


class NoopTranslator:
    """Translator used for dry-runs and tests; it preserves source text."""

    def translate(self, texts: list[str], target_language: str) -> list[str]:
        """Return input texts unchanged."""
        _ = target_language
        return texts
