"""Input extraction for folders, ZIP/CBZ archives, and PDFs."""

from __future__ import annotations

from pathlib import Path
from zipfile import ZipFile

import fitz
from PIL import Image

from manga_cli.types import Page

IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}


class ImageExtractor:
    """Extract ordered pages into a cache directory."""

    def extract(self, source: Path, output_dir: Path) -> list[Page]:
        """Extract all supported pages from a source path."""
        output_dir.mkdir(parents=True, exist_ok=True)
        if source.is_dir():
            return self._from_folder(source, output_dir)
        if source.suffix.lower() in {".zip", ".cbz"}:
            return self._from_zip(source, output_dir)
        if source.suffix.lower() == ".pdf":
            return self._from_pdf(source, output_dir)
        raise ValueError(f"Unsupported input: {source}")

    def _from_folder(self, source: Path, output_dir: Path) -> list[Page]:
        pages: list[Page] = []
        image_paths = sorted(
            p for p in source.iterdir() if p.suffix.lower() in IMAGE_SUFFIXES
        )
        for index, path in enumerate(image_paths):
            target = output_dir / path.name
            with Image.open(path) as image:
                image.save(target)
            pages.append(Page(index=index, original_name=path.name, image_path=target))
        return pages

    def _from_zip(self, source: Path, output_dir: Path) -> list[Page]:
        pages: list[Page] = []
        with ZipFile(source) as archive:
            names = sorted(
                n for n in archive.namelist() if Path(n).suffix.lower() in IMAGE_SUFFIXES
            )
            for index, name in enumerate(names):
                target = output_dir / Path(name).name
                target.write_bytes(archive.read(name))
                pages.append(Page(index=index, original_name=Path(name).name, image_path=target))
        return pages

    def _from_pdf(self, source: Path, output_dir: Path) -> list[Page]:
        pages: list[Page] = []
        document = fitz.open(source)
        for index, page in enumerate(document):
            target = output_dir / f"page-{index + 1:04d}.png"
            pixmap = page.get_pixmap(dpi=200)
            pixmap.save(target)
            pages.append(Page(index=index, original_name=target.name, image_path=target))
        return pages
