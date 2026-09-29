# Research publication contract

`quant-factor-observatory` is a public projection layer, not the source of
truth for private research. A research note remains authoritative in its owner
repository and may be published here only as a reviewed aggregate projection.

## Input and identity

The source note must have a stable `knowledge/v1` identity and an
`authority_ref`. The publication manifest records that reference, the source
status, the public identifier, and the reviewed publication status. A public
identifier must not be substituted for the source document identity.

## Allowed projection

Public studies may contain human-readable title, family, status, summary,
period, findings, limits, and aggregate result rows. Machine-readable artifact
keys remain English or language-neutral. Public presentation may provide both
`en-US` and `zh-CN` labels over the same aggregate evidence.

The projection must exclude private data paths, credentials, private code,
per-security signals, portfolio weights, execution details, and exact private
factor operators. Missing evidence must be represented as a hypothesis or
unpublished state, never filled with invented metrics.

## Review boundary

`site/public/data/research-publication-manifest.json` is the auditable bridge
between source notes and the static site. Its release test rejects local paths,
credentials, per-security fields, and private implementation references. A
future publisher should generate this manifest and the public study snapshot in
one reviewed operation.
