"""Shared data types for the translation pipeline."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class BoundingBox:
    """Rectangle in image coordinates."""

    x: int
    y: int
    width: int
    height: int


@dataclass(frozen=True)
class Page:
    """A single ordered source page."""

    index: int
    original_name: str
    image_path: Path


@dataclass(frozen=True)
class OcrBlock:
    """OCR result for a text region."""

    text: str
    box: BoundingBox
    language: str | None = None
    confidence: float | None = None


@dataclass(frozen=True)
class ProcessedPage:
    """A completed page ready for export."""

    page: Page
    rendered_path: Path
