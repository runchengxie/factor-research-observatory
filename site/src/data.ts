import type { Alpha810Snapshot, FundamentalCatalog, FundamentalSnapshot, Snapshot, StudyAnnualEvidence, StudyCatalog } from './types'

const required = ['schema_version', 'generated_at', 'source', 'datasets', 'factor_groups', 'factors', 'series', 'cross_section', 'jump_decomposition'] as const
const fundamentalRequired = ['schema_version', 'source', 'vintage', 'coverage', 'latest_cross_section', 'validation', 'series', 'notes'] as const
const alpha810Required = ['kind', 'schema_version', 'generated_at', 'data_version', 'code_revision', 'dataset', 'config', 'factors', 'quality', 'public_limits'] as const

export async function loadSnapshot(): Promise<Snapshot> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/factor-snapshot.json`)
  if (!response.ok) throw new Error(`无法加载研究快照（HTTP ${response.status}）`)
  const value: unknown = await response.json()
  if (!value || typeof value !== 'object') throw new Error('研究快照格式无效')
  for (const key of required) if (!(key in value)) throw new Error(`研究快照缺少字段：${key}`)
  return value as Snapshot
}

export function findSeries(snapshot: Snapshot, ticker: string, metric: string) {
  return snapshot.series.find((item) => item.ticker === ticker && item.metric === metric)
}

export async function loadFundamentalData(): Promise<{ catalog: FundamentalCatalog; snapshot: FundamentalSnapshot }> {
  const base = import.meta.env.BASE_URL
  const [catalogResponse, snapshotResponse] = await Promise.all([
    fetch(`${base}data/fundamental-factor-catalog.json`),
    fetch(`${base}data/fundamental-snapshot.json`),
  ])
  if (!catalogResponse.ok || !snapshotResponse.ok) throw new Error('基本面研究数据未能加载')
  const catalogValue: unknown = await catalogResponse.json()
  const snapshotValue: unknown = await snapshotResponse.json()
  if (!catalogValue || typeof catalogValue !== 'object' || !Array.isArray((catalogValue as { factors?: unknown }).factors)) throw new Error('基本面因子目录格式无效')
  if (!snapshotValue || typeof snapshotValue !== 'object') throw new Error('基本面研究快照格式无效')
  for (const key of fundamentalRequired) if (!(key in snapshotValue)) throw new Error(`基本面研究快照缺少字段：${key}`)
  return { catalog: catalogValue as FundamentalCatalog, snapshot: snapshotValue as FundamentalSnapshot }
}

export async function loadStudies(): Promise<StudyCatalog> {
  const base = import.meta.env.BASE_URL
  const response = await fetch(`${base}data/research-studies.json`)
  if (!response.ok) throw new Error(`无法加载研究专题（HTTP ${response.status}）`)
  const value: unknown = await response.json()
  if (!value || typeof value !== 'object' || !Array.isArray((value as { studies?: unknown }).studies)) {
    throw new Error('研究专题数据格式无效')
  }
  return value as StudyCatalog
}

export async function loadStudyAnnualEvidence(): Promise<StudyAnnualEvidence> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/rd-investment-annual.json`)
  if (!response.ok) throw new Error(`无法加载年度研究证据（HTTP ${response.status}）`)
  const value: unknown = await response.json()
  if (!value || typeof value !== 'object' || !Array.isArray((value as { series?: unknown }).series)) throw new Error('年度研究证据格式无效')
  const candidate = value as Partial<StudyAnnualEvidence>
  if (typeof candidate.market_data_as_of !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(candidate.market_data_as_of)) throw new Error('年度研究证据缺少有效的行情快照日期')
  return value as StudyAnnualEvidence
}

export async function loadAlpha810Snapshot(): Promise<Alpha810Snapshot> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/alpha810-snapshot.json`)
  if (!response.ok) throw new Error(`Alpha 810 研究快照未能加载（HTTP ${response.status}）`)
  const value: unknown = await response.json()
  if (!value || typeof value !== 'object') throw new Error('Alpha 810 研究快照格式无效')
  for (const key of alpha810Required) if (!(key in value)) throw new Error(`Alpha 810 快照缺少字段：${key}`)
  const candidate = value as { kind?: unknown; schema_version?: unknown; factors?: unknown }
  if (candidate.kind !== 'moneytree_factor_evidence_snapshot' || candidate.schema_version !== '1.0') {
    throw new Error('Alpha 810 快照版本不受支持')
  }
  if (!Array.isArray(candidate.factors)) throw new Error('Alpha 810 因子证据格式无效')
  return value as Alpha810Snapshot
}
