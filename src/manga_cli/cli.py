"""Typer command line interface for Manga Translator CLI."""

from __future__ import annotations

from pathlib import Path

import typer
from rich.console import Console

from manga_cli.config import AppConfig, ExportFormat, Quality
from manga_cli.pipeline import MangaPipeline

app = typer.Typer(help="Translate manga/manhwa/manhua from CBZ, ZIP, PDF, or image folders.")
console = Console()


@app.command()
def translate(
    input_path: Path = typer.Argument(
        ..., exists=True, readable=True, help="CBZ, ZIP, PDF, or folder."
    ),
    to: str = typer.Option("en", "--to", help="Target language, for example id, en, es, fr."),
    export: ExportFormat = typer.Option(ExportFormat.CBZ, "--export", help="Output format."),
    threads: int | None = typer.Option(None, "--threads", min=1, help="Worker thread count."),
    resume: bool = typer.Option(False, "--resume", help="Continue unfinished jobs from cache."),
    overwrite: bool = typer.Option(False, "--overwrite", help="Overwrite existing outputs."),
    quality: Quality = typer.Option(Quality.MEDIUM, "--quality", help="Processing quality preset."),
    font: Path | None = typer.Option(None, "--font", help="Custom font path."),
    config: Path | None = typer.Option(None, "--config", help="Custom TOML configuration."),
) -> None:
    """Translate a chapter and export translated pages."""
    settings = AppConfig.from_toml(config)
    settings.translator.target_language = to
    settings.export.format = export
    settings.quality = quality
    if threads is not None:
        settings.threads = threads
    if font is not None:
        settings.render.font = font
    result = MangaPipeline(settings, console).run(input_path, resume, overwrite, export)
    console.print(f"[bold green]Wrote[/] {result}")


if __name__ == "__main__":
    app()
