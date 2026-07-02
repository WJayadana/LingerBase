# Manga Translator CLI

A professional, modular, CLI-first tool for translating manga, manhwa, and manhua from images.

> Status: production-ready architecture scaffold with local placeholder adapters for Unlimited-OCR and LaMa. The interfaces are stable so real engines can be dropped in without changing the pipeline.

## Features

- Input: CBZ, ZIP, PDF, or a folder of PNG/JPEG/WEBP images.
- Output: translated image folder, ZIP, CBZ, or PDF.
- Modular stages: extraction, OCR, translation, mask generation, inpainting, rendering, and export.
- Resume-friendly filesystem cache.
- Rich console progress and per-page failure isolation.
- Typer CLI, Pydantic TOML config, Pillow/OpenCV-ready image stack, PyMuPDF PDF support.

## Installation

```bash
uv sync
uv run manga --help
```

## Usage

```bash
uv run manga translate input.cbz
uv run manga translate input.zip
uv run manga translate input.pdf
uv run manga translate ./chapter
uv run manga translate input.cbz --to id --export cbz
uv run manga translate input.cbz --resume
uv run manga translate input.cbz --threads 8
uv run manga translate input.cbz --quality high
```

## CLI options

| Option | Description |
| --- | --- |
| `--to` | Target language such as `id`, `en`, `es`, or `fr`. |
| `--export` | `folder`, `zip`, `cbz`, or `pdf`. |
| `--threads` | Number of worker threads; defaults to CPU count. |
| `--resume` | Reuse finished cached pages after interruption. |
| `--overwrite` | Replace an existing output path. |
| `--quality` | `low`, `medium`, or `high`. |
| `--font` | Custom font path. |
| `--config` | Load a TOML configuration file. |

## Configuration

```toml
[ocr]
engine = "unlimited"

[translator]
provider = "openai"

[inpaint]
engine = "lama"
padding = 4

[render]
font = "fonts/AnimeAce.ttf"
stroke = 2
color = "#000000"
outline = "#FFFFFF"

[export]
format = "cbz"
```

## Architecture

```text
Input
  ↓
Extract Images
  ↓
Unlimited-OCR adapter
  ↓
Post-process / Translate via provider interface
  ↓
Generate Text Mask
  ↓
LaMa inpainting adapter
  ↓
Render Translated Text
  ↓
Export
```

Each module owns one responsibility and communicates through typed dataclasses/protocols. OCR does not know about translation, translation does not know about rendering, and rendering does not know about exporting.

## Developer documentation

- `manga_cli.extractor`: ordered extraction from folders, ZIP/CBZ, and PDFs.
- `manga_cli.ocr`: `OcrEngine` protocol plus `UnlimitedOcrEngine` adapter placeholder.
- `manga_cli.translator`: `Translator` protocol and a `NoopTranslator` for dry-runs/tests.
- `manga_cli.mask`: mask generation from OCR boxes with configurable padding.
- `manga_cli.inpaint`: `Inpainter` protocol plus LaMa-compatible adapter placeholder.
- `manga_cli.renderer`: automatic wrapping, centering, stroke, outline, and configurable font rendering.
- `manga_cli.exporter`: folder, ZIP, CBZ, and PDF writers.
- `manga_cli.cache`: filesystem cache used for resume and error artifacts.

## Quality checks

```bash
uv run ruff check .
uv run black --check .
uv run mypy src
uv run pytest
```
