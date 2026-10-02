# Alpha 810 Public Contract

The site consumes a static aggregate Alpha 810 research snapshot produced by `money-trees`. It does not calculate factors, train models, or run a full backtest.

## Snapshot identity

A published snapshot must use `kind: moneytree_factor_evidence_snapshot` and a supported `schema_version`. Schema 1.0 contains full-window aggregate IC, RankIC, coverage, and group-return evidence. Schema 1.1 adds annual and market-regime slices, Newey–West uncertainty diagnostics, and family-wide multiple-testing results. Schema 1.2 adds Newey–West/Bartlett lag sensitivity at lags 0, 1, 5, 20, and 60, plus a circular 20-session moving-block bootstrap interval for each factor. Per-factor lag q-values and standard errors are arrays ordered by the snapshot’s `lags` list. The snapshot must include generation time, data version, code revision, dataset, configuration, factor records, quality status, and public limits.

## Allowed content

- Factor names and public family labels.
- Date range, coverage, valid-observation counts, and data version.
- Aggregate IC, RankIC, positive rate, group means, and yearly or market-regime summaries.
- Standard errors, confidence intervals, raw p-values, and family-adjusted q-values when present, including per-lag BY q-values and moving-block bootstrap intervals.
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
- The original uncertainty field retains the zero-lag, two-sided normal-reference Newey–West result for compatibility. Schema 1.2 separately reports Bartlett/Newey–West standard errors and family-adjusted q-values at lags 0, 1, 5, 20, and 60. Benjamini–Yekutieli adjustment is recomputed separately at each lag over all 810 factors; four factors without valid RankIC tests retain null values. A circular moving-block bootstrap resamples 20-session blocks for 2,000 replicates and reports percentile 95% intervals for mean daily RankIC. Lag settings are sensitivity checks, while bootstrap intervals are descriptive and do not correct data snooping.
- Benjamini–Yekutieli q-values adjust the tested factor family of 810; Benjamini–Hochberg is supplied as a sensitivity comparison. Four factors have no valid test and remain untested.
- Quality checks warn when a factor has below 80% coverage or lacks a RankIC mean. A warning is retained in the published snapshot; quality status is not a performance rating.

## Evidence limits

The 2016–2025 values are historical factor-store outputs. Their point-in-time availability has not been independently established for every input, and Alpha 101/191 generation metadata specifically calls for point-in-time industry inputs. The yearly, regime, HAC lag-sensitivity, moving-block bootstrap, and multiple-testing views are descriptive diagnostics on this historical panel. They do not establish a point-in-time backtest, out-of-sample performance, tradability, or investment value.

Alpha 810 is a public research browser, not investment advice. See the [money-trees public documentation](https://runchengxie.github.io/money-trees/) for the producer workflow.
