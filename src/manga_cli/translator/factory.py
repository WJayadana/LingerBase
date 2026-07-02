"""Translator factory."""

from __future__ import annotations

from manga_cli.config import TranslatorConfig
from manga_cli.translator.base import NoopTranslator, OpenAITranslator, Translator


def build_translator(config: TranslatorConfig) -> Translator:
    """Create the configured translator provider."""
    provider = config.provider.lower()
    if provider == "openai":
        return OpenAITranslator(model=config.model, api_key_env=config.api_key_env)
    if provider in {"noop", "dry-run"}:
        return NoopTranslator()
    raise ValueError(f"Unsupported translator provider: {config.provider}")
