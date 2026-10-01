# Alpha 810 Public Contract

The site consumes a static aggregate Alpha 810 research snapshot produced by `money-trees`. It does not calculate factors, train models, or run a full backtest.

## Snapshot identity

A published snapshot must use `kind: moneytree_factor_evidence_snapshot` and a supported `schema_version`. Schema 1.0 contains full-window aggregate IC, RankIC, coverage, and group-return evidence. Schema 1.1 adds annual and market-regime slices, Newey–West uncertainty diagnostics, and family-wide multiple-testing results. The snapshot must include generation time, data version, code revision, dataset, configuration, factor records, quality status, and public limits.

## Allowed content

- Factor names and public family labels.
- Date range, coverage, valid-observation counts, and data version.
- Aggregate IC, RankIC, positive rate, group means, and yearly or market-regime summaries.
- Standard errors, confidence intervals, raw p-values, and family-adjusted q-values when present.
- Generation time, research methods, quality warnings, and evidence limitations.

## Excluded content

- Per-security factor values or returns.
- Portfolio weights, holdings, trades, or execution results.
- Raw input paths, credentials, provider mappings, or private implementation details.

## Metric definitions

- IC and RankIC are daily cross-sectional Pearson and Spearman correlations. The full-window means average across dates with valid statistics.
- IR is the mean divided by the population standard deviation of daily correlations. Positive rate is the fraction of valid daily correlations above zero.
- Each date’s valid factor values are sorted into five groups from low (G1) to high (G5). The snapshot averages each group’s daily mean return across valid dates. These are simple one-period returns, not compounded and not net of costs.
- The return field is `next_period_return`, and this release declares a one-trading-day holding period. A next-session close-based outcome is a research label; it does not establish an executable fill.
- Annual slices group the same daily diagnostics by calendar year. Regime labels use the preceding 252 CSI 300 daily returns, compounded; positive cumulative return is `bull`, otherwise `bear`. The current date’s benchmark return is excluded from its label.
- Uncertainty uses a two-sided normal-reference Newey–West test. With a one-day holding period the configured lag count is zero; the interval does not remove selection bias or establish robustness to serial dependence beyond that setting.
- Benjamini–Yekutieli q-values adjust the tested factor family of 810; Benjamini–Hochberg is supplied as a sensitivity comparison. Four factors have no valid test and remain untested.
- Quality checks warn when a factor has below 80% coverage or lacks a RankIC mean. A warning is retained in the published snapshot; quality status is not a performance rating.

## Evidence limits

The 2016–2025 values are historical factor-store outputs. Their point-in-time availability has not been independently established for every input, and Alpha 101/191 generation metadata specifically calls for point-in-time industry inputs. The yearly, regime, HAC, and multiple-testing views are descriptive diagnostics on this historical panel. They do not establish a point-in-time backtest, out-of-sample performance, tradability, or investment value.

Alpha 810 is a public research browser, not investment advice. See the [money-trees public documentation](https://runchengxie.github.io/money-trees/) for the producer workflow.
