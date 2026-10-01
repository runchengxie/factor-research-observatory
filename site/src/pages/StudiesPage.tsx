import { lazy } from 'react'
import type { Study, StudyCatalog } from '../types'
import { useLocale } from '../i18n'
import DeferredContent from '../components/DeferredContent'

const AnnualEvidence = lazy(() => import('./AnnualEvidence'))
const href = (id: string) => `${import.meta.env.BASE_URL}studies/${id}`
const localizedStudy = (study: Study, locale: 'en-US' | 'zh-CN') => ({ ...study, ...(study.translations?.[locale] ?? {}) })

export function StudiesPage({ catalog }: { catalog: StudyCatalog }) {
  const { locale } = useLocale()
  const english = locale === 'en-US'
  return <main className="page study-page">
    <section className="detail-head"><p className="eyebrow">FACTOR RESEARCH / STUDIES</p><h1>{english ? 'Research studies' : '因子研究专题'}</h1><p className="lede">{english ? 'Review research hypotheses and historical evidence with explicit data definitions, validation status, and open questions.' : '从研究假设到历史证据，逐项标明数据口径、检验状态和仍待解决的问题。'}</p><span className="badge">{english ? 'Updated' : '更新于'} {catalog.updated_at}</span></section>
    <section className="study-grid">{catalog.studies.map((rawStudy) => { const study = localizedStudy(rawStudy, locale); return <a className="study-card" href={href(study.id)} key={study.id}>
      <span className={`study-status study-status-${study.status}`}>{study.status_label}</span>
      <small>{study.family}</small><h2>{study.title}</h2><p>{study.summary}</p><span className="study-link">{english ? 'Read study →' : '阅读研究 →'}</span>
    </a> })}</section>
  </main>
}

export function StudyDetailPage({ study, updatedAt }: { study: Study | undefined; updatedAt: string }) {
  const { locale, copy } = useLocale()
  const english = locale === 'en-US'
  if (!study) return <main className="page"><a className="back" href={`${import.meta.env.BASE_URL}studies`}>← {english ? 'Back to research studies' : '返回研究专题'}</a><h1>{english ? 'Study not found' : '找不到这项研究'}</h1></main>
  const content = localizedStudy(study, locale)
  return <main className="page study-page">
    <a className="back" href={`${import.meta.env.BASE_URL}studies`}>← {english ? 'All studies' : '全部研究专题'}</a>
    <section className="detail-head"><p className="eyebrow">{content.family}</p><h1>{content.title}</h1><p className="lede">{content.summary}</p><div className="detail-tags"><span className={`study-status study-status-${study.status}`}>{content.status_label}</span><span className="tag">{copy.studies.updated} {updatedAt}</span></div></section>
    <section className="study-brief"><article><p className="eyebrow">{copy.studies.question}</p><h2>{copy.studyQuestions[study.id] ?? content.title}</h2></article><article><p className="eyebrow">{copy.studies.design}</p><p>{content.source_note}</p><small>{copy.studies.interval}: {content.period}</small></article><article><p className="eyebrow">{copy.studies.openGap}</p><p>{content.limits[0] ?? (english ? 'No published evidence limits are available.' : '暂无已发布的证据边界。')}</p></article></section>
    {content.rows.length > 0 && <section className="panel"><div className="section-heading"><p className="eyebrow">AGGREGATE EVIDENCE</p><h2>{english ? 'Historical comparison' : '历史对照'}</h2></div><div className="table-scroll"><table className="factor-table"><thead><tr>{content.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{content.rows.map((row) => <tr key={row[0]}>{row.map((value, index) => <td key={content.columns[index]}>{value}</td>)}</tr>)}</tbody></table></div></section>}
    {study.id === 'rd-investment' && <section className="panel rd-method-panel"><div className="section-heading"><p className="eyebrow">RESEARCH DESIGN / PIT</p><h2>{english ? 'What was measured' : '研究口径与因子定义'}</h2><p className="panel-note">{english ? 'This is a monthly cross-sectional signal screen. It is not a portfolio backtest.' : '这是月度横截面信号筛查，不是完整组合回测。'}</p></div><div className="table-scroll"><table className="factor-table"><thead><tr><th>{english ? 'Variant' : '变体'}</th><th>{english ? 'Definition / interpretation' : '定义 / 含义'}</th></tr></thead><tbody>{(english ? [
      ['R&D / market cap', 'TTM R&D expense divided by equity market capitalization; mixes R&D intensity with the market-value denominator.'],
      ['R&D / EV', 'TTM R&D divided by a covered-fields enterprise-value proxy (market cap plus selected debt items less cash); not a complete EV reconstruction.'],
      ['Capitalized R&D', 'Five-year decayed stock of reconstructed R&D flows divided by market cap; annual decay rate 20%.'],
      ['Neutralized residual', 'Residual of the monthly cross-sectional percentile rank of R&D / market cap after size, value, leverage, 12–1 momentum, and industry controls.'],
      ['R&D / revenue; R&D / assets', 'TTM R&D scaled by TTM revenue or total assets, respectively.'],
      ['R&D growth', 'Change in TTM R&D versus the comparable TTM period one year earlier.'],
    ] : [
      ['研发 / 市值', 'TTM 研发费用除以股权市值；同时包含研发强度和市值分母效应。'],
      ['研发 / EV', 'TTM 研发费用除以基于可覆盖字段构造的企业价值代理（市值加部分债务项目减现金），并非完整 EV 重建。'],
      ['资本化研发', '按季度研发流量重建、以五年 20% 年衰减率累计的研发资本存量，再除以市值。'],
      ['中性化残差', '对研发 / 市值的月度横截面百分位秩，回归规模、价值、杠杆、12–1 动量及行业后取残差。'],
      ['研发 / 收入；研发 / 资产', 'TTM 研发费用分别除以 TTM 收入或总资产。'],
      ['研发增长', 'TTM 研发费用相对一年前可比 TTM 的变化。'],
    ]).map(([name, definition]) => <tr key={name}><td>{name}</td><td>{definition}</td></tr>)}</tbody></table></div><ul className="method-notes">{(english ? [
      'Financial statement YTD fields are converted to TTM using current YTD + prior full-year − prior-year same-period YTD; an annual filing contributes its full-year value.',
      'A filing becomes eligible on the next calendar day after disclosure; the latest available filing is carried forward only while its age is at most 540 days. Signals are formed at month-end and the forward return label starts from the next trading-day close.',
      'The forward 20/220 labels are price-return labels over subsequent trading sessions. They omit transaction costs and do not establish that the assumed entry/exit prices were executable.',
      'The extended replay has 90 valid monthly cross-sections for 20-day labels through 2026-08-31 and 80 for 220-day labels through 2025-10-31. The windows are horizon-specific; the ten 2019 observations are retrospective reconstruction sensitivity.',
    ] : [
      '财报累计值按 TTM = 本年年初至今 + 上一完整年度 − 上年同期累计值还原；年报直接使用全年值。',
      '公告次日才视为可用；最近一期财报仅在财报年龄不超过 540 天时沿用。月末形成信号，前瞻收益标签从下一交易日收盘价开始。',
      '20 / 220 日标签是随后交易日价格收益，不含交易成本，也不能证明假设的进出场价格实际可成交。',
      '扩展回放中，20 日标签截至 2026-08-31 有 90 个有效月度截面，220 日标签截至 2025-10-31 有 80 个。两个期限按各自标签成熟情况分别取样；其中 2019 年的十个截面属于回溯重建敏感性。',
    ]).map((note) => <li key={note}>{note}</li>)}</ul><p className="panel-note">{english ? 'Universe eligibility and historical index membership have known timing limitations; the revision chain is incomplete. See the public methodology note for the full protocol and exclusions.' : '股票池资格与历史指数成分时点存在已知限制，财报历史修订链也不完整。完整协议与排除项见公开方法说明。'} <a href={`${import.meta.env.BASE_URL}research/rd-investment-method.html`}>{english ? 'Public methodology note ↗' : '公开方法说明 ↗'}</a></p></section>}
    {study.id === 'rd-investment' && study.annual_evidence && <DeferredContent minHeight={740} label={english ? 'Loading annual evidence…' : '逐年证据加载中…'}><AnnualEvidence study={study} english={english} /></DeferredContent>}
    {study.research_log?.length ? <section className="panel research-log"><div className="section-heading"><p className="eyebrow">EXPLORATION RECORD</p><h2>{english ? 'Research log' : '探索过程记录'}</h2></div><ol>{study.research_log.map((entry) => <li key={`${entry.date}-${entry.stage}`}><time>{entry.date}</time><div><strong>{english ? entry.stage_en : entry.stage}</strong><p>{english ? entry.note_en : entry.note}</p></div></li>)}</ol></section> : null}
    <div className="study-columns"><section className="panel"><p className="eyebrow">WHAT WE FOUND</p><h2>{english ? 'What we can say now' : '目前可以说什么'}</h2><ul>{content.findings.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="panel"><p className="eyebrow">EVIDENCE BOUNDARY</p><h2>{english ? 'What this evidence does not establish' : '还不能据此推断什么'}</h2><ul>{content.limits.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
    {study.source_url && study.id !== 'rd-investment' && <p className="study-source"><a href={study.source_url} target="_blank" rel="noopener noreferrer">{english ? 'View public method and evidence notes ↗' : '查看已公开的原始方法与数据核对 ↗'}</a></p>}
  </main>
}
