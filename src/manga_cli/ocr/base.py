"""OCR engine interfaces and adapters."""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path
from typing import Any, Protocol

from manga_cli.errors import EngineUnavailableError
from manga_cli.types import BoundingBox, OcrBlock


class OcrEngine(Protocol):
    """Protocol implemented by OCR engines."""

    def recognize(self, image_path: Path) -> list[OcrBlock]:
        """Return detected text blocks for an image."""


class UnlimitedOcrEngine:
    """Adapter for an Unlimited-OCR command that emits JSON results.

    The command is expected to accept an image path plus ``--json`` and return a JSON
    array (or an object with a ``blocks``/``results``/``text_blocks`` array). Each item
    must contain text and a bounding box. This adapter intentionally fails loudly when
    the external engine is absent so users do not receive unchanged pages labelled as
    translated.
    """

    def __init__(self, command: str = "unlimited-ocr") -> None:
        self.command = command

    def recognize(self, image_path: Path) -> list[OcrBlock]:
        """Recognize text on a page using the configured Unlimited-OCR command."""
        if shutil.which(self.command) is None:
            raise EngineUnavailableError(
                f"OCR engine '{self.command}' was not found. Install Unlimited-OCR or set "
                "[ocr].command to the executable path."
            )
        completed = subprocess.run(
            [self.command, str(image_path), "--json"],
            check=True,
            capture_output=True,
            text=True,
        )
        return self._parse_blocks(json.loads(completed.stdout))

    def _parse_blocks(self, payload: Any) -> list[OcrBlock]:
        if isinstance(payload, dict):
            rows = (
                payload.get("blocks")
                or payload.get("results")
                or payload.get("text_blocks")
                or []
            )
        else:
            rows = payload
        blocks: list[OcrBlock] = []
        for row in rows:
            if not isinstance(row, dict):
                continue
            text = str(row.get("text", "")).strip()
            if not text:
                continue
            box = row.get("box") or row.get("bbox") or row.get("bounding_box")
            parsed_box = self._parse_box(box)
            if parsed_box is None:
                continue
            confidence = row.get("confidence")
            blocks.append(
                OcrBlock(
                    text=text,
                    box=parsed_box,
                    language=row.get("language"),
                    confidence=float(confidence) if confidence is not None else None,
                )
            )
        return blocks

    @staticmethod
    def _parse_box(value: Any) -> BoundingBox | None:
        if isinstance(value, dict):
            if {"x", "y", "width", "height"} <= value.keys():
                return BoundingBox(
                    int(value["x"]), int(value["y"]), int(value["width"]), int(value["height"])
                )
            if {"x1", "y1", "x2", "y2"} <= value.keys():
                return BoundingBox(
                    int(value["x1"]),
                    int(value["y1"]),
                    int(value["x2"] - value["x1"]),
                    int(value["y2"] - value["y1"]),
                )
        if isinstance(value, list | tuple) and len(value) >= 4:
            x, y, third, fourth = (int(v) for v in value[:4])
            return BoundingBox(x, y, max(0, third - x), max(0, fourth - y))
        return None
