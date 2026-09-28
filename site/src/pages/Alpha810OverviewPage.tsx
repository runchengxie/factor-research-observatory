import { useMemo, useState } from 'react'
import MetricCard from '../components/MetricCard'
import type { Alpha810FactorEvidence, Alpha810Snapshot } from '../types'

function metric(value: number | null) {
  return value === null || !Number.isFinite(value) ? '暂无数据' : value.toFixed(3)
}

function factorScore(factor: Alpha810FactorEvidence) {
  return factor.rank_ic.mean ?? Number.NEGATIVE_INFINITY
}

export default function Alpha810OverviewPage({ snapshot }: { snapshot: Alpha810Snapshot }) {
  const [query, setQuery] = useState('')
  const [family, setFamily] = useState('all')
  const families = [...new Set(snapshot.factors.map((factor) => factor.family))].sort()
  const factors = useMemo(() => snapshot.factors
    .filter((factor) => family === 'all' || factor.family === family)
    .filter((factor) => `${factor.name} ${factor.family}`.toLowerCase().includes(query.toLowerCase().trim()))
    .sort((left, right) => factorScore(right) - factorScore(left)), [family, query, snapshot.factors])

  return <main className="page">
    <section className="hero"><p className="eyebrow">ALPHA 810 / PUBLIC EVIDENCE</p><h1>经典因子，<em>先看证据。</em></h1><p className="lede">浏览 Alpha101、Alpha191、Alpha158 和 Alpha360 的聚合研究证据。这里展示的是可审计的描述性统计，不是交易建议。</p><span className="badge">AGGREGATE SNAPSHOT</span></section>
    <section className="context-strip"><span><strong>数据版本</strong>{snapshot.data_version}</span><span><strong>范围</strong>{snapshot.dataset.date_start ?? '—'} → {snapshot.dataset.date_end ?? '—'}</span><span><strong>生成时间</strong>{snapshot.generated_at.slice(0, 10)}</span><span><strong>口径</strong>{snapshot.dataset.return_column}</span></section>
    <section className="metrics"><MetricCard label="因子" value={snapshot.factors.length.toLocaleString()} note="当前公开快照" /><MetricCard label="因子族" value={families.length.toLocaleString()} note={families.join(' · ')} /><MetricCard label="交易日" value={snapshot.dataset.trading_days.toLocaleString()} note={`${snapshot.dataset.ticker_count.toLocaleString()} 个覆盖标的`} /><MetricCard label="分组数" value={snapshot.config.group_count.toLocaleString()} note="横截面排序" /></section>
    <section className="section"><div className="section-heading"><p className="eyebrow">FACTOR CATALOG</p><div className="section-heading-row"><h2>Alpha 因子目录</h2><span className="muted">按 RankIC 均值排序</span></div></div><div className="explorer-toolbar"><label className="search-field">搜索<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="alpha101_001" /></label><label>因子族<select value={family} onChange={(event) => setFamily(event.target.value)}><option value="all">全部</option>{families.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div><div className="explorer-summary"><strong>{factors.length}</strong><span>个匹配因子</span></div><div className="table-scroll"><table className="factor-table"><thead><tr><th>因子</th><th>覆盖率</th><th>IC</th><th>RankIC</th><th>分组收益</th></tr></thead><tbody>{factors.map((factor) => <tr key={factor.name}><td><a href={`${import.meta.env.BASE_URL}alpha810/factors/${encodeURIComponent(factor.name)}`}><strong>{factor.name}</strong><small>{factor.family}</small></a></td><td>{factor.coverage.ratio === null ? '暂无数据' : `${(factor.coverage.ratio * 100).toFixed(1)}%`}</td><td>{metric(factor.ic.mean)}</td><td>{metric(factor.rank_ic.mean)}</td><td>{factor.group_returns.length ? `${factor.group_returns.length} 组` : '暂无数据'}</td></tr>)}</tbody></table>{!factors.length ? <div className="empty-filter"><h2>没有匹配结果</h2><p>请调整搜索词或因子族。</p></div> : null}</div></section>
    <section className="research-boundary"><p><strong>公开边界：</strong>{snapshot.public_limits.join(' ')}</p></section>
  </main>
}
