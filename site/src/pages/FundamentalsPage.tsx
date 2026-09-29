import { useState } from 'react'
import LineChart from '../components/LineChart'
import ContextStrip from '../components/ContextStrip'
import type { FundamentalCatalog, FundamentalSnapshot } from '../types'
import { useLocale } from '../i18n'

const colors = ['#b64d33', '#7a9e92', '#c88b60', '#927eaa', '#8fa4c7', '#bb6c81']

export default function FundamentalsPage({ catalog, snapshot }: { catalog: FundamentalCatalog; snapshot: FundamentalSnapshot }) {
  const { locale } = useLocale()
  const english = locale === 'en-US'
  const tickers = snapshot.coverage.tickers
  const [ticker, setTicker] = useState(tickers[0] ?? '')
  const core = catalog.factors.filter((factor) => factor.priority === 'core')
  const groups = [...new Set(catalog.factors.map((factor) => factor.family))]
  const opSeries = snapshot.series.find((item) => item.ticker === ticker && item.metric === 'standardized_operating_profit')
  const valid = snapshot.latest_cross_section.count
  const missing = snapshot.latest_cross_section.missing
  const total = valid + missing
  const validRate = total ? valid / total * 100 : 0
  const researchNotes = english ? snapshot.notes : [
    '本快照来自本地 PIT 数据版本，公开页面只展示代表性股票序列。',
    '六期 TTM 标准化营业利润在满足四个完整季度和六期历史 TTM 观测前为空值。',
    '营业利润 TTM 推导将披露值视为财年累计值；用于回测前仍需核对这一口径。',
  ]

  return <main className="page">
    <a className="back" href={import.meta.env.BASE_URL}>← {english ? 'Factor overview' : '因子总览'}</a>
    <section className="detail-head"><p className="eyebrow">FUNDAMENTAL STATES / 04</p><h1>{english ? <>Operating states, <em>slowly becoming signals.</em></> : <>经营状态，<em>慢慢变成信号。</em></>}</h1><p className="lede">{english ? 'Reported fundamentals are organized into a research catalog with a distinct point-in-time vintage.' : '将财报数据整理成研究目录，并单独标明 PIT 数据版本。'}</p><span className="badge">PIT VINTAGE · {snapshot.vintage}</span></section>
    <ContextStrip items={[{ label: english ? 'PIT observation range' : 'PIT 观察区间', value: `${snapshot.coverage.date_start} → ${snapshot.coverage.date_end}` }, { label: english ? 'Processed universe' : '处理股票池', value: `${snapshot.coverage.tickers_count.toLocaleString()} ${english ? 'tickers' : '只股票'}` }, { label: english ? 'Chart examples' : '图表示例', value: snapshot.coverage.representative_tickers.join(' · ') }, { label: english ? 'Availability basis' : '可用日期口径', value: snapshot.validation.availability_basis }]} />
    <p className="context-note">{english ? 'The chart below uses representative tickers. Universe counts and quantiles describe the latest available cross-section, not those three examples.' : '下方时间序列仅展示代表性股票。股票池数量与分位数对应最新可用截面，并非这三只示例股票。'}</p>
    <div className="metrics"><div className="metric-card"><span>{english ? 'Processed tickers' : '处理股票数'}</span><strong>{snapshot.coverage.tickers_count.toLocaleString()}</strong><small>{english ? 'Full PIT universe' : 'PIT 全量股票池'}</small></div><div className="metric-card"><span>{english ? 'Valid OP values' : '营业利润有效值'}</span><strong>{valid.toLocaleString()}</strong><small>{english ? `Missing ${missing.toLocaleString()}` : `缺失 ${missing.toLocaleString()}`}</small></div><div className="metric-card"><span>{english ? 'Valid share' : '有效值比例'}</span><strong>{validRate.toFixed(1)}%</strong><small>{english ? 'Latest available cross-section' : '最新可用截面'}</small></div><div className="metric-card"><span>{english ? 'Latest median' : '最新中位数'}</span><strong>{snapshot.latest_cross_section.p50?.toFixed(3) ?? '—'}</strong><small>{english ? 'Standardized OP proxy' : '标准化营业利润试算'}</small></div></div>
    <section className="panel availability-panel"><p className="eyebrow">DATA AVAILABILITY</p><h2>{english ? 'Latest cross-section coverage' : '最新截面有效值比例'}</h2><div className="availability-bar" role="img" aria-label={english ? `${valid} valid, ${missing} missing out of ${total}` : `共 ${total} 只股票，${valid} 个有效值，${missing} 个缺失值`}><span style={{ width: `${validRate}%` }} /></div><div className="availability-legend"><span>{english ? 'Valid' : '有效'} {valid.toLocaleString()} · {validRate.toFixed(1)}%</span><span>{english ? 'Missing' : '缺失'} {missing.toLocaleString()} · {(100 - validRate).toFixed(1)}%</span></div></section>
    <section className="section"><div className="section-heading"><p className="eyebrow">CORE RESEARCH SET</p><h2>{english ? 'Start with these six' : '先看这六个'}</h2></div><div className="core-grid">{core.map((factor, index) => <div className="factor-tile" key={factor.id}><span className="tile-dot" style={{ background: colors[index] }} /><p>{factor.family}</p><h3>{factor.name}</h3><strong>{factor.definition}</strong><small>{factor.meaning}</small></div>)}</div></section>
    <section className="section"><div className="section-heading"><p className="eyebrow">FACTOR CATALOG</p><h2>{catalog.factors.length} {english ? 'research entries' : '个研究入口'}</h2></div><div className="catalog-grid">{groups.map((group) => <div className="catalog-group" key={group}><h3>{group}</h3>{catalog.factors.filter((factor) => factor.family === group).map((factor) => <div className="catalog-row" key={factor.id}><span>{factor.name}</span><small>{factor.definition}</small></div>)}</div>)}</div></section>
    <section className="panel chart-panel"><div className="panel-head"><div><p className="eyebrow">REPRESENTATIVE PIT SERIES</p><h2>{english ? 'Standardized operating-profit proxy' : '标准化营业利润试算'}</h2></div><label className="series-select"><span>{english ? 'Example ticker' : '示例股票'}</span><select value={ticker} onChange={(event) => setTicker(event.target.value)}>{tickers.map((item) => <option key={item}>{item}</option>)}</select></label></div>{opSeries ? <LineChart dates={opSeries.dates} series={[{ name: english ? 'Operating-profit state' : '经营利润状态', values: opSeries.values, color: '#b64d33' }]} /> : <div className="chart-empty">{english ? 'Insufficient history for a standardized value.' : '历史观察不足，暂无可计算的标准化值'}</div>}<p className="annotation">{english ? 'Representative PIT observation series; exact operators, windows and per-security trading signals are not published.' : '代表性 PIT 观察序列；精确算子、窗口和逐股票交易信号未公开。'}</p></section>
    <section className="panel warning-panel"><p className="eyebrow">RESEARCH GUARDRAILS</p><h2>{english ? 'Method limits' : '方法边界'}</h2><ul>{researchNotes.map((note) => <li key={note}>{note}</li>)}</ul><p>{english ? 'Catalog entries without published predictive evidence remain hypotheses or descriptive research.' : '尚无公开预测性证据的目录条目仍属于假设或描述性研究。'}</p></section>
  </main>
}
