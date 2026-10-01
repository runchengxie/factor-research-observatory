export type Factor = { name: string; family: string; definition: string; meaning: string }
export type Series = { ticker: string; metric: string; dates: string[]; values: Array<number | null> }
export type JumpRow = { ticker: string; date: string; rv: number | null; ivhat: number | null; rjv: number | null; rljv: number | null; rsjv: number | null }
export type Snapshot = {
  schema_version: number; generated_at: string; source: 'demo' | 'parquet';
  datasets: Array<{ name: string; date_start: string; date_end: string; trading_days: number; tickers: number }>;
  factor_groups: Array<{ name: string; label: string; count: number }>;
  factors: Factor[]; series: Series[];
  cross_section: Array<{ metric: string; date: string; count: number; p01: number | null; p25: number | null; p50: number | null; p75: number | null; p99: number | null }>;
  jump_decomposition: JumpRow[];
}
export type ResearchEvidence = { status: 'not_published' | 'descriptive' | 'experimental' | 'validated'; summary?: string; metrics?: Array<{ label: string; value: string }>; attribution?: Array<{ label: string; value: string }>; caveats?: string[] }
export type FundamentalCopy = { name: string; family: string; definition: string; meaning: string; research_question: string }
export type FundamentalFactor = { id: string; name: string; family: string; priority: 'core' | 'supporting'; research_status: FactorStatus; definition: string; meaning: string; research_question?: string; evidence?: ResearchEvidence; translations?: Partial<Record<'en-US' | 'zh-CN', FundamentalCopy>> }
export type FundamentalCatalog = { schema_version: number; title: string; status: string; data_status: string; research_notes: string[]; factors: FundamentalFactor[] }
export type FundamentalSeries = { ticker: string; metric: string; dates: string[]; values: Array<number | null> }
export type FundamentalSnapshot = { schema_version: number; source: string; vintage: string; coverage: { date_start: string; date_end: string; tickers: string[]; tickers_count: number; representative_tickers: string[]; observations: number }; latest_cross_section: { metric: string; count: number; missing: number; p01: number | null; p25: number | null; p50: number | null; p75: number | null; p99: number | null }; validation: { all_market_computed: boolean; history_observations: number; complete_observations_required: number; availability_basis: string }; series: FundamentalSeries[]; notes: string[] }

export type FactorStatus = 'descriptive' | 'experimental' | 'validated'
export type FactorCoverage = { count: number; missing?: number; total?: number; ratio?: number }
export type FactorStatistics = { date?: string; count?: number; p01: number | null; p25: number | null; p50: number | null; p75: number | null; p99: number | null }
export type FactorSeriesPoint = { ticker: string; metric: string; dates: string[]; values: Array<number | null> }
export type FactorRecord = {
  id: string
  displayName: string
  displayNameCn?: string
  family: string
  subfamily?: string
  frequencyIn?: string
  frequencyOut?: string
  status: FactorStatus
  definition: string
  intuition?: string
  interpretationHigh?: string
  interpretationLow?: string
  unit?: string
  transformHint?: string
  failureModes?: string[]
  researchEvidence?: ResearchEvidence
  coverage?: FactorCoverage
  statistics?: FactorStatistics
  series?: FactorSeriesPoint[]
  fundamentalTranslation?: FundamentalCopy
}
export type ResearchContext = {
  source: string
  snapshotRange: string
  universe: string
  frequency: string
  pitStatus: string
  status: FactorStatus
  notes: string[]
}
export type ExplorerFilters = { query: string; family: string; frequency: string; status: '' | FactorStatus }
export type ExplorerSort = 'name' | 'coverage' | 'status'

export type StudyCopy = {
  title: string; family: string; status_label: string;
  summary: string; period: string; source_note: string;
  columns: string[]; rows: string[][]; findings: string[]; limits: string[];
}
export type StudyLogEntry = { date: string; stage: string; note: string; stage_en: string; note_en: string }
export type StudyAnnualPoint = { year: number; cross_sections: number; rank_ic: number | null; top_minus_bottom: number | null; coverage_mean: number | null; median_universe_n: number | null; max_universe_n: number; evidence_status: string }
export type StudyAnnualSeries = { factor: string; horizon: 'fwd20' | 'fwd220'; signal_start: string; signal_end: string; label_mature_through: string; years: StudyAnnualPoint[] }
export type StudyAnnualEvidence = { schema_version: number; source_vintage: string; source_type: string; revision_safe: boolean; market_data_as_of: string; requested_start: string; series: StudyAnnualSeries[] }
export type StudySupplementalEvidence = {
  top200_cost_probe: { cost_tiers_bps: number[]; factors: Array<{ factor: string; annualized_returns: number[]; sharpes: number[]; max_drawdowns: number[]; eligible_rebalances: number; result_periods: number }>; method: string }
  rank_ic_inference: Array<{ factor: string; horizon: 'fwd20' | 'fwd220'; n: number; mean: number; ci95_low: number; ci95_high: number; q_value: number }>
  components: Array<{ component: string; horizon: 'fwd20' | 'fwd220'; n: number; mean: number; ci95_low: number; ci95_high: number; q_value: number }>
  cpcv: { groups: number; test_groups: number; combinations_per_horizon: number; pbo_fwd20: number; pbo_fwd220: number; status: string }
}
export type Study = StudyCopy & {
  id: string;
  status: 'historical-reviewed' | 'preliminary' | 'hypothesis';
  source_url?: string;
  research_log?: StudyLogEntry[];
  annual_evidence?: StudyAnnualEvidence;
  supplemental_evidence?: StudySupplementalEvidence;
  translations?: Partial<Record<'en-US' | 'zh-CN', StudyCopy>>;
}
export type StudyCatalog = { schema_version: number; updated_at: string; studies: Study[] }

export type Alpha810Metric = { mean: number | null; ir: number | null; positive_rate: number | null }
export type Alpha810GroupReturn = { group: number; mean_return: number | null; periods: number }
export type Alpha810FactorEvidence = {
  name: string
  family: string
  coverage: { valid_observations: number; total_observations: number; ratio: number | null }
  ic: Alpha810Metric
  rank_ic: Alpha810Metric
  group_returns: Alpha810GroupReturn[]
}
export type Alpha810Quality = {
  schema_version: '1.0'
  status: 'pass' | 'warn' | 'fail'
  checks: Array<{ name: string; status: 'pass' | 'warn' | 'fail'; value: number; threshold: string }>
  summary: { factor_count: number; coverage_mean: number | null; coverage_min: number | null; rank_ic_mean: number | null; rank_ic_positive_rate_mean: number | null; low_coverage_factor_count: number; missing_rank_ic_factor_count: number }
  source: { data_version: string; date_start: string | null; date_end: string | null; generated_at: string }
  public_limits: string[]
}
export type Alpha810Snapshot = {
  kind: 'moneytree_factor_evidence_snapshot'
  schema_version: '1.0'
  generated_at: string
  data_version: string
  code_revision: string | null
  dataset: {
    date_start: string | null
    date_end: string | null
    trading_days: number
    ticker_count: number
    observation_count: number
    return_column: string
  }
  config: { group_count: number }
  factors: Alpha810FactorEvidence[]
  quality: Alpha810Quality
  public_limits: string[]
}
