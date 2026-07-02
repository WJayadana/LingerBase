"""Mask generation from OCR bounding boxes."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

from manga_cli.types import OcrBlock


class MaskGenerator:
    """Create binary text masks from OCR boxes."""

    def __init__(self, padding: int) -> None:
        self.padding = padding

    def generate(self, image_path: Path, blocks: list[OcrBlock], output_path: Path) -> Path:
        """Generate and save a mask image."""
        with Image.open(image_path) as image:
            mask = Image.new("L", image.size, 0)
        draw = ImageDraw.Draw(mask)
        for block in blocks:
            box = block.box
            draw.rectangle(
                [
                    max(0, box.x - self.padding),
                    max(0, box.y - self.padding),
                    box.x + box.width + self.padding,
                    box.y + box.height + self.padding,
                ],
                fill=255,
            )
        output_path.parent.mkdir(parents=True, exist_ok=True)
        mask.save(output_path)
        return output_path
