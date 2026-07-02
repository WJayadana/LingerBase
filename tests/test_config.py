from pathlib import Path

from manga_cli.config import AppConfig, ExportFormat


def test_config_loads_toml(tmp_path: Path) -> None:
    config = tmp_path / "config.toml"
    config.write_text('[translator]\nprovider="noop"\n\n[export]\nformat="pdf"\n', encoding="utf-8")

    loaded = AppConfig.from_toml(config)

    assert loaded.translator.provider == "noop"
    assert loaded.export.format is ExportFormat.PDF
