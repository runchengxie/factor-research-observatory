import { useMemo, useState } from 'react'
import MetricCard from '../components/MetricCard'
import type { Alpha810FactorEvidence, Alpha810Snapshot } from '../types'
import { useLocale } from '../i18n'

function metric(value: number | null, english = false) {
  return value === null || !Number.isFinite(value) ? english ? 'No data' : '暂无数据' : value.toFixed(3)
}

function factorScore(factor: Alpha810FactorEvidence) {
  return factor.rank_ic.mean ?? Number.NEGATIVE_INFINITY
}

export default function Alpha810OverviewPage({ snapshot }: { snapshot: Alpha810Snapshot }) {
  const { locale } = useLocale()
  const english = locale === 'en-US'
  const [query, setQuery] = useState('')
  const [family, setFamily] = useState('all')
  const families = [...new Set(snapshot.factors.map((factor) => factor.family))].sort()
  const factors = useMemo(() => snapshot.factors
    .filter((factor) => family === 'all' || factor.family === family)
    .filter((factor) => `${factor.name} ${factor.family}`.toLowerCase().includes(query.toLowerCase().trim()))
    .sort((left, right) => factorScore(right) - factorScore(left)), [family, query, snapshot.factors])

  return <main className="page">
    <section className="hero"><p className="eyebrow">ALPHA 810 / PUBLIC EVIDENCE</p><h1>{english ? <>Classic factors, <em>evidence first.</em></> : <>经典因子，<em>先看证据。</em></>}</h1><p className="lede">{english ? 'Browse aggregate research evidence for Alpha101, Alpha191, Alpha158, and Alpha360. These are auditable descriptive statistics, not investment advice.' : '浏览 Alpha101、Alpha191、Alpha158 和 Alpha360 的聚合研究证据。这里展示的是可审计的描述性统计，不是交易建议。'}</p><span className="badge">AGGREGATE SNAPSHOT</span></section>
    <section className="context-strip"><span><strong>{english ? 'Version' : '数据版本'}</strong>{snapshot.data_version}</span><span><strong>{english ? 'Range' : '范围'}</strong>{snapshot.dataset.date_start ?? '—'} → {snapshot.dataset.date_end ?? '—'}</span><span><strong>{english ? 'Generated' : '生成时间'}</strong>{snapshot.generated_at.slice(0, 10)}</span><span><strong>{english ? 'Basis' : '口径'}</strong>{snapshot.dataset.return_column}</span></section>
    <section className="metrics"><MetricCard label={english ? 'Factors' : '因子'} value={snapshot.factors.length.toLocaleString()} note={english ? 'Current public snapshot' : '当前公开快照'} /><MetricCard label={english ? 'Families' : '因子族'} value={families.length.toLocaleString()} note={families.join(' · ')} /><MetricCard label={english ? 'Trading days' : '交易日'} value={snapshot.dataset.trading_days.toLocaleString()} note={`${snapshot.dataset.ticker_count.toLocaleString()} ${english ? 'covered names' : '个覆盖标的'}`} /><MetricCard label={english ? 'Quality gate' : '质量门禁'} value={snapshot.quality.status.toUpperCase()} note={`${snapshot.quality.summary.low_coverage_factor_count} ${english ? 'low-coverage factors' : '个低覆盖因子'}`} /></section>
    <section className="panel"><div className="panel-head"><p className="eyebrow">SIGNAL QUALITY</p><h2>{english ? 'Signal checks' : '信号检查'}</h2></div><p>{english ? 'A reproducible data-quality check over public aggregate evidence; it is not a return guarantee.' : '这是对公开聚合证据的可复现数据质量检查，不代表收益保证。'}</p><div className="evidence-metrics"><div><span>{english ? 'Mean coverage' : '平均覆盖率'}</span><strong>{snapshot.quality.summary.coverage_mean === null ? '—' : `${(snapshot.quality.summary.coverage_mean * 100).toFixed(1)}%`}</strong></div><div><span>{english ? 'Minimum coverage' : '最低覆盖率'}</span><strong>{snapshot.quality.summary.coverage_min === null ? '—' : `${(snapshot.quality.summary.coverage_min * 100).toFixed(1)}%`}</strong></div><div><span>{english ? 'Mean RankIC' : '平均 RankIC'}</span><strong>{metric(snapshot.quality.summary.rank_ic_mean, english)}</strong></div><div><span>{english ? 'Positive RankIC rate' : 'RankIC 正值率'}</span><strong>{snapshot.quality.summary.rank_ic_positive_rate_mean === null ? '—' : `${(snapshot.quality.summary.rank_ic_positive_rate_mean * 100).toFixed(1)}%`}</strong></div></div></section>
    <section className="section"><div className="section-heading"><p className="eyebrow">FACTOR CATALOG</p><div className="section-heading-row"><h2>{english ? 'Alpha factor catalog' : 'Alpha 因子目录'}</h2><span className="muted">{english ? 'Sorted by mean RankIC' : '按 RankIC 均值排序'}</span></div></div><div className="explorer-toolbar"><label className="search-field">{english ? 'Search' : '搜索'}<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="alpha101_001" /></label><label>{english ? 'Family' : '因子族'}<select value={family} onChange={(event) => setFamily(event.target.value)}><option value="all">{english ? 'All' : '全部'}</option>{families.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div><div className="explorer-summary"><strong>{factors.length}</strong><span>{english ? 'matching factors' : '个匹配因子'}</span></div><div className="table-scroll"><table className="factor-table"><thead><tr><th>{english ? 'Factor' : '因子'}</th><th>{english ? 'Coverage' : '覆盖率'}</th><th>IC</th><th>RankIC</th><th>{english ? 'Grouped returns' : '分组收益'}</th></tr></thead><tbody>{factors.map((factor) => <tr key={factor.name}><td><a href={`${import.meta.env.BASE_URL}alpha810/factors/${encodeURIComponent(factor.name)}`}><strong>{factor.name}</strong><small>{factor.family}</small></a></td><td>{factor.coverage.ratio === null ? english ? 'No data' : '暂无数据' : `${(factor.coverage.ratio * 100).toFixed(1)}%`}</td><td>{metric(factor.ic.mean, english)}</td><td>{metric(factor.rank_ic.mean, english)}</td><td>{factor.group_returns.length ? `${factor.group_returns.length} ${english ? 'groups' : '组'}` : english ? 'No data' : '暂无数据'}</td></tr>)}</tbody></table>{!factors.length ? <div className="empty-filter"><h2>{english ? 'No matching factors' : '没有匹配结果'}</h2><p>{english ? 'Adjust the search term or factor family.' : '请调整搜索词或因子族。'}</p></div> : null}</div></section>
    <section className="research-boundary"><p><strong>{english ? 'Public boundary: ' : '公开边界：'}</strong>{snapshot.public_limits.join(' ')}</p></section>
  </main>
}
