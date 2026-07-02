"""Translation provider interfaces and adapters."""

from __future__ import annotations

import json
import os
import urllib.request
from typing import Protocol

from manga_cli.errors import EngineUnavailableError


class Translator(Protocol):
    """Protocol implemented by translation providers."""

    def translate(self, texts: list[str], target_language: str) -> list[str]:
        """Translate a batch of strings."""


class OpenAITranslator:
    """OpenAI Responses API translator implemented with the standard library."""

    def __init__(self, model: str, api_key_env: str = "OPENAI_API_KEY") -> None:
        self.model = model
        self.api_key_env = api_key_env

    def translate(self, texts: list[str], target_language: str) -> list[str]:
        """Translate text blocks while preserving list length and order."""
        if not texts:
            return []
        api_key = os.environ.get(self.api_key_env)
        if not api_key:
            raise EngineUnavailableError(
                f"Translator provider 'openai' requires ${self.api_key_env}. Set the "
                "environment variable or configure another translator provider."
            )
        body = {
            "model": self.model,
            "input": [
                {
                    "role": "system",
                    "content": (
                        "Translate manga text to the requested target language. Return only "
                        "JSON with a 'translations' array of strings in the same order."
                    ),
                },
                {
                    "role": "user",
                    "content": json.dumps(
                        {"target_language": target_language, "texts": texts}, ensure_ascii=False
                    ),
                },
            ],
            "text": {"format": {"type": "json_object"}},
        }
        request = urllib.request.Request(
            "https://api.openai.com/v1/responses",
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=120) as response:  # noqa: S310
            payload = json.loads(response.read().decode("utf-8"))
        raw_text = self._extract_text(payload)
        translated = json.loads(raw_text)["translations"]
        if len(translated) != len(texts):
            raise ValueError("Translator returned a different number of translations than inputs.")
        return [str(item) for item in translated]

    @staticmethod
    def _extract_text(payload: dict[str, object]) -> str:
        if isinstance(payload.get("output_text"), str):
            return str(payload["output_text"])
        output = payload.get("output")
        if isinstance(output, list):
            for item in output:
                if not isinstance(item, dict):
                    continue
                content = item.get("content")
                if isinstance(content, list):
                    for part in content:
                        if isinstance(part, dict) and isinstance(part.get("text"), str):
                            return str(part["text"])
        raise ValueError("OpenAI response did not contain output text.")


class NoopTranslator:
    """Explicit dry-run translator; never use as the production default."""

    def translate(self, texts: list[str], target_language: str) -> list[str]:
        """Return input texts unchanged for tests and dry-runs."""
        _ = target_language
        return texts
