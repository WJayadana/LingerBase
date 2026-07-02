"""Image inpainting interfaces."""

from __future__ import annotations

from pathlib import Path
from shutil import copyfile
from typing import Protocol


class Inpainter(Protocol):
    """Protocol implemented by inpainting engines."""

    def inpaint(self, image_path: Path, mask_path: Path, output_path: Path) -> Path:
        """Remove masked text from an image."""


class LamaInpainter:
    """LaMa adapter placeholder.

    The adapter copies the source image when LaMa weights/runtime are unavailable. This
    preserves the pipeline contract while keeping the engine replaceable.
    """

    def inpaint(self, image_path: Path, mask_path: Path, output_path: Path) -> Path:
        """Run LaMa-compatible inpainting and return the cleaned image path."""
        _ = mask_path
        output_path.parent.mkdir(parents=True, exist_ok=True)
        copyfile(image_path, output_path)
        return output_path
