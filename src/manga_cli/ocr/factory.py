"""OCR engine factory."""

from __future__ import annotations

from manga_cli.config import OcrConfig
from manga_cli.ocr.base import OcrEngine, UnlimitedOcrEngine


def build_ocr_engine(config: OcrConfig) -> OcrEngine:
    """Create the configured OCR engine."""
    if config.engine.lower() == "unlimited":
        return UnlimitedOcrEngine(command=config.command)
    raise ValueError(f"Unsupported OCR engine: {config.engine}")
