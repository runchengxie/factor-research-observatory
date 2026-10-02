from __future__ import annotations

import json
from pathlib import Path

from scripts.validate_external_snapshot import validate_snapshot


def test_validate_snapshot_accepts_current_public_alpha810_contract() -> None:
    path = Path(__file__).parents[1] / "site/public/data/alpha810-snapshot.json"

    result = validate_snapshot(json.loads(path.read_text()))

    assert result["schema_version"] == "1.2"
    assert result["factor_count"] >= 2


def test_validate_snapshot_rejects_private_row_level_fields() -> None:
    payload = {
        "kind": "moneytree_factor_evidence_snapshot",
        "schema_version": "1.0",
        "data_version": "2026-01-01",
        "dataset": "public",
        "quality": {"status": "pass"},
        "factors": [{"factor_id": "x", "coverage": 1, "rank_ic": 0, "ticker": "secret"}],
    }

    try:
        validate_snapshot(payload)
    except ValueError as error:
        assert "ticker" in str(error)
    else:
        raise AssertionError("private field was accepted")


def test_validate_snapshot_rejects_unknown_schema() -> None:
    import pytest

    payload = {"kind": "moneytree_factor_evidence_snapshot", "schema_version": "9.9"}
    with pytest.raises(ValueError, match="schema_version"):
        validate_snapshot(payload)
