#!/usr/bin/env python3
"""Fail when private implementation details enter the public Observatory tree."""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ROOTS = ("README.md", "docs", "site", ".github")
ALLOWED_ROOT_FILES = {".gitignore", "README.md"}
ALLOWED_PREFIXES = (".github/", "scripts/", "site/", "tests/")
FORBIDDEN_PATTERNS = {
    r"/(?:home|Users)/": "developer-local path",
    r"\b" + "tush" + "are" + r"\b": "provider or dataset name",
    r"\b" + "data_" + "requirements" + r"\b": "raw input metadata key",
    r"\b" + "operate_" + "profit" + r"\b": "raw financial field",
    r"\b" + "market_" + "value" + r"\b": "raw financial field",
    r"\b" + "ts_" + "zscore" + r"\b": "exact operator name",
    r"\bformula(?:Latex)?\b": "formula metadata key",
}


def tracked_files() -> list[str]:
    output = subprocess.check_output(["git", "ls-files"], cwd=ROOT, text=True)
    return [line for line in output.splitlines() if line]


def public_files(paths: list[str]) -> list[Path]:
    result: list[Path] = []
    for relative in paths:
        path = ROOT / relative
        if path.is_file():
            result.append(path)
        elif path.is_dir():
            result.extend(
                item for item in path.rglob("*")
                if item.is_file() and not {"node_modules", "dist", "__pycache__", ".git"}.intersection(item.parts)
            )
    return result


def audit() -> list[str]:
    errors: list[str] = []
    tracked = set(tracked_files())
    unexpected = sorted(path for path in tracked if path not in ALLOWED_ROOT_FILES and not path.startswith(ALLOWED_PREFIXES))
    errors.extend(f"file is outside the public allowlist: {path}" for path in unexpected)

    for path in public_files(list(PUBLIC_ROOTS)):
        text = path.read_text(errors="ignore")
        relative = path.relative_to(ROOT).as_posix()
        for pattern, description in FORBIDDEN_PATTERNS.items():
            if re.search(pattern, text, re.IGNORECASE):
                errors.append(f"{description} in {relative}: {pattern}")
    return errors


def main() -> int:
    errors = audit()
    if errors:
        print("Public release audit failed:", file=sys.stderr)
        print("\n".join(f"- {error}" for error in errors), file=sys.stderr)
        return 1
    print("Public release audit passed: no private implementation details found in the public tree.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
