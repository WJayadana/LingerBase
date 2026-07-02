"""Translated text rendering."""

from __future__ import annotations

from pathlib import Path
import textwrap

from PIL import Image, ImageDraw, ImageFont

from manga_cli.config import RenderConfig
from manga_cli.types import OcrBlock


class TextRenderer:
    """Render translated text into OCR regions."""

    def __init__(self, config: RenderConfig) -> None:
        self.config = config

    def render(
        self,
        image_path: Path,
        blocks: list[OcrBlock],
        translations: list[str],
        output_path: Path,
    ) -> Path:
        """Render translated strings centered inside their original boxes."""
        with Image.open(image_path).convert("RGB") as image:
            draw = ImageDraw.Draw(image)
            for block, text in zip(blocks, translations, strict=True):
                font = self._fit_font(draw, text, block)
                lines = self._wrap(text, max(1, block.box.width // max(font.size // 2, 1)))
                line_height = font.size + 2
                total_height = line_height * len(lines)
                y = block.box.y + max(0, (block.box.height - total_height) // 2)
                for line in lines:
                    bbox = draw.textbbox((0, 0), line, font=font, stroke_width=self.config.stroke)
                    x = block.box.x + max(0, (block.box.width - (bbox[2] - bbox[0])) // 2)
                    draw.text(
                        (x, y),
                        line,
                        font=font,
                        fill=self.config.color,
                        stroke_width=self.config.stroke,
                        stroke_fill=self.config.outline,
                    )
                    y += line_height
            output_path.parent.mkdir(parents=True, exist_ok=True)
            image.save(output_path)
        return output_path

    def _fit_font(
        self, draw: ImageDraw.ImageDraw, text: str, block: OcrBlock
    ) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
        font_path = self.config.font
        for size in range(min(64, block.box.height), 7, -1):
            font = (
                ImageFont.truetype(str(font_path), size)
                if font_path
                else ImageFont.load_default(size=size)
            )
            wrapped = self._wrap(text, max(1, block.box.width // max(size // 2, 1)))
            height = len(wrapped) * (size + 2)
            width = max((draw.textbbox((0, 0), line, font=font)[2] for line in wrapped), default=0)
            if width <= block.box.width and height <= block.box.height:
                return font
        return ImageFont.load_default()

    @staticmethod
    def _wrap(text: str, width: int) -> list[str]:
        return textwrap.wrap(" ".join(text.split()), width=width) or [""]
