"""Orchestration for the manga translation pipeline."""

from __future__ import annotations

import hashlib
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from rich.console import Console
from rich.progress import track

from manga_cli.cache.store import CacheStore
from manga_cli.config import AppConfig, ExportFormat
from manga_cli.exporter.writers import Exporter
from manga_cli.extractor.images import ImageExtractor
from manga_cli.inpaint.base import Inpainter, LamaInpainter
from manga_cli.mask.generator import MaskGenerator
from manga_cli.ocr.base import OcrEngine
from manga_cli.ocr.factory import build_ocr_engine
from manga_cli.renderer.text import TextRenderer
from manga_cli.translator.base import Translator
from manga_cli.translator.factory import build_translator
from manga_cli.types import OcrBlock, Page, ProcessedPage


class MangaPipeline:
    """Dependency-injected pipeline coordinating independent processing modules."""

    def __init__(
        self,
        config: AppConfig,
        console: Console,
        extractor: ImageExtractor | None = None,
        ocr: OcrEngine | None = None,
        translator: Translator | None = None,
        inpainter: Inpainter | None = None,
        exporter: Exporter | None = None,
    ) -> None:
        self.config = config
        self.console = console
        self.extractor = extractor or ImageExtractor()
        self.ocr = ocr or build_ocr_engine(config.ocr)
        self.translator = translator or build_translator(config.translator)
        self.masker = MaskGenerator(config.inpaint.padding)
        self.inpainter = inpainter or LamaInpainter()
        self.renderer = TextRenderer(config.render)
        self.exporter = exporter or Exporter()

    def run(self, source: Path, resume: bool, overwrite: bool, export_format: ExportFormat) -> Path:
        """Run the complete translate workflow and return the output path."""
        job_id = hashlib.sha1(str(source.resolve()).encode()).hexdigest()[:12]
        cache = CacheStore(self.config.cache_dir, job_id)
        self.console.print("Extracting...")
        pages = self.extractor.extract(source, cache.path("extracted"))
        processed: list[ProcessedPage] = []
        failures: list[dict[str, str | int]] = []
        self.console.print("OCR / Translate / Inpainting / Rendering...")
        with ThreadPoolExecutor(max_workers=self.config.threads) as pool:
            futures = {
                pool.submit(self._process_page, page, cache, resume): page
                for page in pages
            }
            for future in track(as_completed(futures), total=len(futures), console=self.console):
                page = futures[future]
                try:
                    processed.append(future.result())
                except Exception as exc:  # noqa: BLE001 - per-page isolation is intentional.
                    failures.append(
                        {"page": page.index, "file": page.original_name, "error": str(exc)}
                    )
        processed.sort(key=lambda item: item.page.index)
        if failures:
            cache.path("errors.log").write_text(
                "\n".join(str(f) for f in failures), encoding="utf-8"
            )
            cache.path("failed_pages.json").write_text(
                json.dumps(failures, indent=2), encoding="utf-8"
            )
        if pages and not processed:
            raise RuntimeError(
                "No pages were translated. Check errors.log/failed_pages.json in the cache "
                "directory for OCR/translation/inpainting failures."
            )
        self.console.print("Export...")
        suffix = "" if export_format is ExportFormat.FOLDER else f".{export_format.value}"
        destination = self.config.output_dir / f"{source.stem}-translated{suffix}"
        if destination.exists() and not overwrite:
            raise FileExistsError(f"Output exists: {destination}. Use --overwrite to replace it.")
        result = self.exporter.export(processed, destination, export_format)
        self.console.print("Done")
        return result

    def _process_page(self, page: Page, cache: CacheStore, resume: bool) -> ProcessedPage:
        rendered = cache.path("rendered", page.original_name)
        if resume and rendered.exists():
            return ProcessedPage(page=page, rendered_path=rendered)
        blocks = self._ocr(page, cache, resume)
        translations = self.translator.translate(
            [block.text for block in blocks], self.config.translator.target_language
        )
        mask = self.masker.generate(
            page.image_path, blocks, cache.path("masks", f"{page.index}.png")
        )
        clean = self.inpainter.inpaint(
            page.image_path, mask, cache.path("inpainted", page.original_name)
        )
        self.renderer.render(clean, blocks, translations, rendered)
        return ProcessedPage(page=page, rendered_path=rendered)

    def _ocr(self, page: Page, cache: CacheStore, resume: bool) -> list[OcrBlock]:
        # OCR result serialization hook; currently recomputes when no cached adapter result exists.
        _ = cache, resume
        return self.ocr.recognize(page.image_path)
