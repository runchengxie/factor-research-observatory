# Research evidence hub

The studies index provides an evidence matrix, market, evidence-stage and text filters, and a curated conclusion-change registry. Detail pages retain current findings and limits first, then show historical interpretation changes and explicit related-study links. Earlier positive results and invalid baselines remain historical statements; they are not current validation claims.

## Comparable experiments

`studies/compare` reads the registered groups in `research-studies.json`. A group selects one reviewed chart, a baseline, direction, and optionally a series subset. Model comparisons select one sample slice or horizon at a time. Variant comparisons select one metric. R&D 20-session and 220-session groups remain separate because their monthly cohorts differ. Revenue and income transformed errors remain separate because their units differ. Differences are arithmetic differences in the displayed metric, not significance tests or return attribution. Missing values remain missing.

Related studies use explicit symmetric edges with a bilingual rationale. Shared questions or methods do not imply transferable performance. Hypothesis and protocol studies have no performance chart.

## Source review

`research-source-review.json` pins public aggregate and catalog digests plus source-document content hashes to each exploration asset's published owner revision. It contains public document identities and hashes, not private document paths. Review metadata is excluded from catalog digests to prevent a self-referential audit. The complete hub registry is hashed separately.

Run the public integrity gate without the private owner repository:

```sh
python scripts/audit_research_updates.py --check
```

Run a source-content audit using explicit external paths:

```sh
python scripts/audit_research_updates.py --owner-root "$RESEARCH_OWNER_ROOT" --report-dir "$RESEARCH_REVIEW_ROOT"
```

The audit compares current source bytes, including unsaved edits, with pinned content. An unrelated owner commit does not require review. Content changes report `needs_review`; missing sources report `unavailable`. The index resolves stable front matter identities, so moving an unchanged document is harmless. Duplicate identities fail the audit.

Reports are retained outside Git with timestamped filenames and an atomic `latest.json`. `--catalog-status-out` creates an external review candidate containing status metadata only. Operators review and publish this candidate through the normal PR workflow. The audit never edits findings, upgrades evidence stage, opens frozen results, or publishes automatically. The public status is a dated snapshot, not a live freshness guarantee.

After manually reviewing changed evidence and the projected conclusions, update the exploration source revision as appropriate, then explicitly capture a new baseline:

```sh
python scripts/audit_research_updates.py --capture-baseline --owner-root "$RESEARCH_OWNER_ROOT"
```

Do not recapture a baseline merely to silence a changed-source warning. A document-wide change flag is deliberately conservative; it does not establish that the study's interpretation changed.

## Daily local operation

The service and timer templates in `scripts/systemd/` perform a read-only daily audit. Install them as user units and adapt the EnvironmentFile location to the existing personal configuration grouping. Set `OBSERVATORY_ROOT` to the stable production `current` release, `RESEARCH_OWNER_ROOT` to the authoritative owner checkout, and `RESEARCH_REVIEW_ROOT` to external retained reports. Personal paths belong in the configured environment file under the user's project configuration grouping, never in versioned templates. The schedule explicitly uses Asia/Shanghai. No network, credentials, or automatic publication is required.

The installed audit follows merged production releases. A failed audit is visible through the user service status and journal; it must not be represented as a successful source check.
