"""Output writers for folder, ZIP, CBZ, and PDF exports."""

from __future__ import annotations

from pathlib import Path
from shutil import copyfile
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image

from manga_cli.config import ExportFormat
from manga_cli.types import ProcessedPage


class Exporter:
    """Write translated pages to the requested format."""

    def export(
        self, pages: list[ProcessedPage], destination: Path, export_format: ExportFormat
    ) -> Path:
        """Export pages preserving original filenames where possible."""
        destination.parent.mkdir(parents=True, exist_ok=True)
        if export_format is ExportFormat.FOLDER:
            destination.mkdir(parents=True, exist_ok=True)
            for page in pages:
                copyfile(page.rendered_path, destination / page.page.original_name)
            return destination
        if export_format in {ExportFormat.ZIP, ExportFormat.CBZ}:
            with ZipFile(destination, "w", ZIP_DEFLATED) as archive:
                for page in pages:
                    archive.write(page.rendered_path, page.page.original_name)
            return destination
        if export_format is ExportFormat.PDF:
            images = [Image.open(page.rendered_path).convert("RGB") for page in pages]
            if not images:
                raise ValueError("Cannot export an empty PDF")
            images[0].save(destination, save_all=True, append_images=images[1:])
            for image in images:
                image.close()
            return destination
        raise ValueError(f"Unsupported export format: {export_format}")
