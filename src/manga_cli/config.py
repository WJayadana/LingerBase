"""Application configuration loaded from TOML and CLI overrides."""

from __future__ import annotations

import os
import tomllib
from enum import StrEnum
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field


class ExportFormat(StrEnum):
    """Supported export formats."""

    FOLDER = "folder"
    ZIP = "zip"
    CBZ = "cbz"
    PDF = "pdf"


class Quality(StrEnum):
    """Processing quality presets."""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class OcrConfig(BaseModel):
    """OCR engine settings."""

    engine: str = "unlimited"
    command: str = "unlimited-ocr"


class TranslatorConfig(BaseModel):
    """Translation provider settings."""

    provider: str = "openai"
    target_language: str = "en"
    model: str = "gpt-4.1-mini"
    api_key_env: str = "OPENAI_API_KEY"


class InpaintConfig(BaseModel):
    """Inpainting settings."""

    engine: str = "lama"
    padding: int = Field(default=4, ge=0)


class RenderConfig(BaseModel):
    """Translated text rendering settings."""

    font: Path | None = None
    stroke: int = Field(default=2, ge=0)
    color: str = "#000000"
    outline: str = "#FFFFFF"


class ExportConfig(BaseModel):
    """Export settings."""

    format: ExportFormat = ExportFormat.CBZ


class AppConfig(BaseModel):
    """Root application configuration."""

    ocr: OcrConfig = Field(default_factory=OcrConfig)
    translator: TranslatorConfig = Field(default_factory=TranslatorConfig)
    inpaint: InpaintConfig = Field(default_factory=InpaintConfig)
    render: RenderConfig = Field(default_factory=RenderConfig)
    export: ExportConfig = Field(default_factory=ExportConfig)
    cache_dir: Path = Path("cache")
    output_dir: Path = Path("output")
    threads: int = Field(default_factory=lambda: os.cpu_count() or 1, ge=1)
    quality: Quality = Quality.MEDIUM

    @classmethod
    def from_toml(cls, path: Path | None) -> "AppConfig":
        """Load configuration from a TOML file, or return defaults when omitted."""
        if path is None:
            return cls()
        with path.open("rb") as handle:
            data: dict[str, Any] = tomllib.load(handle)
        return cls.model_validate(data)
