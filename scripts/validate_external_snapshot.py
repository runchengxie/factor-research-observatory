#!/usr/bin/env python3
"""Validate a candidate public Alpha 810 snapshot without publishing it."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any
from urllib.request import urlopen


PRIVATE_KEYS = {"ticker", "weights", "portfolio_weights", "raw_path", "source_path"}


def _walk(value: Any) -> list[str]:
    found: list[str] = []
    if isinstance(value, dict):
        found.extend(key for key in value if key in PRIVATE_KEYS)
        for child in value.values():
            found.extend(_walk(child))
    elif isinstance(value, list):
        for child in value:
            found.extend(_walk(child))
    return found


def validate_snapshot(payload: dict[str, Any]) -> dict[str, Any]:
    if payload.get("kind") != "moneytree_factor_evidence_snapshot":
        raise ValueError("unexpected snapshot kind")
    if payload.get("schema_version") not in {"1.0", "1.1"}:
        raise ValueError("unsupported snapshot schema_version")
    if not isinstance(payload.get("factors"), list) or not payload["factors"]:
        raise ValueError("snapshot must contain factors")
    if payload.get("quality", {}).get("status") not in {"pass", "warn", "fail"}:
        raise ValueError("snapshot quality status is invalid")
    private_keys = sorted(set(_walk(payload)))
    if private_keys:
        raise ValueError(f"private fields are not publishable: {', '.join(private_keys)}")
    return {
        "schema_version": payload["schema_version"],
        "data_version": payload.get("data_version"),
        "factor_count": len(payload["factors"]),
        "quality_status": payload["quality"]["status"],
    }


def _load(source: str) -> dict[str, Any]:
    if source.startswith(("http://", "https://")):
        with urlopen(source, timeout=30) as response:  # noqa: S310 - explicit CLI input
            return json.load(response)
    return json.loads(Path(source).read_text())


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", help="local JSON path or HTTPS URL")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    result = validate_snapshot(_load(args.source))
    encoded = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.report:
        args.report.write_text(encoded)
    print(encoded, end="")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
