"""Filesystem cache that enables resumable jobs."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


class CacheStore:
    """Small JSON-and-file based cache for pipeline artifacts."""

    def __init__(self, root: Path, job_id: str) -> None:
        self.root = root / job_id
        self.root.mkdir(parents=True, exist_ok=True)

    def path(self, *parts: str) -> Path:
        """Return a cache path and create its parent directory."""
        target = self.root.joinpath(*parts)
        target.parent.mkdir(parents=True, exist_ok=True)
        return target

    def read_json(self, name: str) -> dict[str, Any] | None:
        """Read a cached JSON document when present."""
        target = self.path(name)
        if not target.exists():
            return None
        return json.loads(target.read_text(encoding="utf-8"))

    def write_json(self, name: str, data: dict[str, Any]) -> None:
        """Write a cached JSON document."""
        self.path(name).write_text(json.dumps(data, indent=2), encoding="utf-8")
