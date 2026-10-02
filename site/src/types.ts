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
  researchQuestion?: string
}
export type ResearchContext = {
  source: string
  generatedAt: string
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
export type StudyMarket = 'a_share' | 'hong_kong'
export type StudyMethod = 'direct_factor_test' | 'fundamental_state_forecast' | 'cross_sectional_ranking' | 'composite_score' | 'portfolio_replay' | 'attribution' | 'robustness'
export type StudyFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'event_driven' | 'mixed' | 'not_applicable'
export type StudyEvidenceStage = 'hypothesis' | 'exploratory' | 'retrospective_diagnostic' | 'prospective_holdout_pending' | 'reviewed_research' | 'historical_archive'
export type StudySeriesCopy = { title: string; summary: string; scope: string; evidence_boundary: string }
export type StudyCandidateCoverage = { catalog_source: string; status: 'catalog_hypothesis_only'; candidate_ids: string[]; candidate_level_predictive_validation_ids: string[] }
export type StudySeries = {
  id: string
  source_ref: string
  publication_id: string
  publication_status: string
  candidate_count: number
  candidate_href: string
  candidate_coverage: StudyCandidateCoverage
  study_ids: string[]
  translations: Partial<Record<'en-US' | 'zh-CN', StudySeriesCopy>>
}
export type Study = StudyCopy & {
  id: string;
  status: 'historical-reviewed' | 'preliminary' | 'hypothesis';
  series?: string;
  market?: StudyMarket;
  method?: StudyMethod[];
  frequency?: StudyFrequency[];
  evidence_stage?: StudyEvidenceStage;
  publication_id?: string;
  source_ref?: string;
  source_url?: string;
  research_log?: StudyLogEntry[];
  translations?: Partial<Record<'en-US' | 'zh-CN', StudyCopy>>;
}
export type StudyCatalog = { schema_version: number; updated_at: string; series?: StudySeries[]; studies: Study[] }
export type RdAnnualPoint = {
  year: number
  cross_sections: number
  rank_ic: number | null
  top_minus_bottom: number | null
  coverage_mean: number | null
  median_universe_n: number | null
  max_universe_n: number
  evidence_status: string
}
export type RdAnnualSeries = {
  factor: string
  horizon: 'fwd20' | 'fwd220'
  signal_start: string | null
  signal_end: string | null
  label_mature_through: string | null
  years: RdAnnualPoint[]
}
export type RdAnnualEvidence = {
  schema_version: number
  source_vintage: string
  source_type: string
  revision_safe: boolean
  market_data_as_of: string
  requested_start: string
  series: RdAnnualSeries[]
  publication_status: string
  public_notice: string
}

export type Alpha810Metric = { mean: number | null; ir: number | null; positive_rate: number | null }
export type Alpha810GroupReturn = { group: number; mean_return: number | null; periods: number }
export type Alpha810Slice = { label: string; valid_dates: number; rank_ic_mean: number | null; rank_ic_positive_rate: number | null; group_returns: Alpha810GroupReturn[] }
export type Alpha810Uncertainty = { status: string; method?: string; holding_period_days?: number; estimate?: number | null; standard_error?: number | null; confidence_interval?: [number, number] | null; p_value?: number | null; multiple_testing?: { q_value_by?: number | null; q_value_bh?: number | null } }
export type Alpha810FactorEvidence = {
  name: string
  family: string
  coverage: { valid_observations: number; total_observations: number; ratio: number | null }
  ic: Alpha810Metric
  rank_ic: Alpha810Metric
  group_returns: Alpha810GroupReturn[]
  annual_slices?: Alpha810Slice[]
  regime_slices?: Alpha810Slice[]
  uncertainty?: Alpha810Uncertainty
}
export type Alpha810Quality = {
  schema_version: '1.0' | '1.1'
  status: 'pass' | 'warn' | 'fail'
  checks: Array<{ name: string; status: 'pass' | 'warn' | 'fail'; value: number; threshold: string }>
  summary: { factor_count: number; coverage_mean: number | null; coverage_min: number | null; rank_ic_mean: number | null; rank_ic_positive_rate_mean: number | null; low_coverage_factor_count: number; missing_rank_ic_factor_count: number }
  source: { data_version: string; date_start: string | null; date_end: string | null; generated_at: string }
  public_limits: string[]
}
export type Alpha810Snapshot = {
  kind: 'moneytree_factor_evidence_snapshot'
  schema_version: '1.0' | '1.1' | '1.2'
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
  uncertainty?: { status: string; method?: string; holding_period_days?: number; tested_factor_count?: number; factor_count?: number }
  temporal_validation?: { status: string; annual_status?: string; market_regime?: { status: string; reason?: string; benchmark?: string; window?: number } }
  multiple_testing?: { status: string; method?: string; sensitivity_method?: string; family_size?: number; tested_count?: number; factors?: Record<string, { q_value_by?: number | null; q_value_bh?: number | null }> }
  inference_sensitivity?: {
    status: string
    method: string
    lags: number[]
    family_size: number
    tested_count: number
    by_q_le_0_05_counts: Record<string, number>
    moving_block_bootstrap: { block_length_sessions: number; replicates: number; ci_excludes_zero_count: number; interval: string }
    source: { date_start: string; date_end: string; observation_dates: number; source_calendar_dates: number; source_rows: number; script_sha256: string; output_csv_sha256: string }
    limitations: string[]
    factors: Record<string, {
      by_lag_q: Array<number | null>
      by_lag_standard_error: Array<number | null>
      moving_block_bootstrap: { confidence_interval: [number, number] | null; sign_probability: number | null; ci_excludes_zero: boolean | null }
    }>
  }
}
