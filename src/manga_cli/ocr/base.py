"""OCR engine interfaces and helpers."""

from __future__ import annotations

from pathlib import Path
from typing import Protocol

from manga_cli.types import OcrBlock


class OcrEngine(Protocol):
    """Protocol implemented by OCR engines."""

    def recognize(self, image_path: Path) -> list[OcrBlock]:
        """Return detected text blocks for an image."""


class UnlimitedOcrEngine:
    """Adapter placeholder for Unlimited-OCR.

    The class intentionally isolates Unlimited-OCR behind a tiny interface so a real
    dependency can be wired in without touching translation, rendering, or export code.
    """

    def recognize(self, image_path: Path) -> list[OcrBlock]:
        """Recognize text on a page.

        A production deployment should install and call Unlimited-OCR here. Returning an
        empty list keeps the pipeline runnable in environments without model weights.
        """
        _ = image_path
        return []
