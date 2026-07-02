from pathlib import Path

import pytest

from manga_cli.errors import EngineUnavailableError
from manga_cli.ocr.base import UnlimitedOcrEngine
from manga_cli.translator.base import OpenAITranslator


def test_unlimited_ocr_fails_when_command_missing(tmp_path: Path) -> None:
    image = tmp_path / "page.png"
    image.write_bytes(b"not-an-image")

    with pytest.raises(EngineUnavailableError):
        UnlimitedOcrEngine(command="definitely-missing-unlimited-ocr").recognize(image)


def test_openai_translator_requires_api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("MANGA_TEST_OPENAI_KEY", raising=False)

    with pytest.raises(EngineUnavailableError):
        OpenAITranslator(model="gpt-4.1-mini", api_key_env="MANGA_TEST_OPENAI_KEY").translate(
            ["hello"], "id"
        )
