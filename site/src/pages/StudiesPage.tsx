import type { Study, StudyCatalog } from '../types'
import { useLocale } from '../i18n'
import { useState } from 'react'
import ReactECharts from 'echarts-for-react'

const href = (id: string) => `${import.meta.env.BASE_URL}studies/${id}`
const localizedStudy = (study: Study, locale: 'en-US' | 'zh-CN') => ({ ...study, ...(study.translations?.[locale] ?? {}) })
const variantNames: Record<string, [string, string]> = {
  rd_mv: ['R&D / market cap', '研发 / 市值'], rd_ev: ['R&D / EV', '研发 / 企业价值'],
  rd_capitalized: ['Capitalized R&D', '资本化研发'], rd_mv_resid: ['Neutralized residual', '中性化残差'],
  rd_sales: ['R&D / revenue', '研发 / 收入'], rd_assets: ['R&D / assets', '研发 / 资产'], rd_growth: ['R&D growth', '研发增长'],
}
const palette = ['#b64d33', '#477a76', '#a57b2c', '#6d6b9a', '#3982a0', '#9a5e80', '#687b43']

function AnnualEvidence({ study, english }: { study: Study; english: boolean }) {
  const [horizon, setHorizon] = useState<'fwd20' | 'fwd220'>('fwd20')
  const [range, setRange] = useState<'all' | '10y' | '2015'>('all')
  const annual = study.annual_evidence ?? []
  const selected = annual.filter((item) => item.horizon === horizon)
  const yearSet = selected[0]?.years.map((point) => point.year) ?? []
  const years = range === 'all' ? yearSet : range === '10y' ? yearSet.filter((year) => year >= 2017) : yearSet.filter((year) => year >= 2015)
  const baseOption = (metric: 'rank_ic' | 'top_minus_bottom') => ({
    animation: false,
    color: palette,
    textStyle: { color: '#514b43', fontFamily: 'Manrope, sans-serif' },
    grid: { left: 66, right: 24, top: 24, bottom: 54 },
    tooltip: { trigger: 'axis', backgroundColor: '#fffefa', borderColor: '#d8d0c3', textStyle: { color: '#252525' }, formatter: (items: Array<{ seriesName: string; dataIndex: number; value: number | null; color: string }>) => {
      const year = years[items[0]?.dataIndex ?? 0]
      const lines = items.filter((item) => item.value !== null).map((item) => {
        const series = selected.find((candidate) => (english ? variantNames[candidate.factor]?.[0] : variantNames[candidate.factor]?.[1]) === item.seriesName)
        const n = series?.years.find((point) => point.year === year)?.cross_sections ?? 0
        return `<span style="color:${item.color}">●</span> ${item.seriesName}: ${(item.value! * 100).toFixed(2)}% <small>(${n} ${english ? 'monthly cross-sections' : '个月度截面'})</small>`
      })
      return `${year}<br/>${lines.join('<br/>') || (english ? 'No factor evidence for this year' : '该年无因子证据')}`
    } },
    xAxis: { type: 'category', data: years, boundaryGap: false, axisLine: { lineStyle: { color: '#81796e' } }, axisLabel: { color: '#81796e' } },
    yAxis: { type: 'value', axisLabel: { color: '#81796e', formatter: (value: number) => `${(value * 100).toFixed(0)}%` }, splitLine: { lineStyle: { color: '#e8e1d6' } } },
    series: selected.map((item, index) => ({ name: english ? variantNames[item.factor]?.[0] : variantNames[item.factor]?.[1], type: 'line', connectNulls: false, showSymbol: true, symbolSize: 6, lineStyle: { width: item.factor === 'rd_mv' || item.factor === 'rd_capitalized' ? 2.8 : 1.6 }, data: years.map((year) => item.years.find((point) => point.year === year)?.[metric] ?? null), itemStyle: { color: palette[index] } })),
  })
  const coveredFrom = selected.map((item) => item.signal_start).sort()[0]
  const coveredDates = selected.map((item) => item.signal_end).sort()
  const coveredTo = coveredDates[coveredDates.length - 1]
  return <section className="panel annual-evidence-panel">
    <div className="section-heading"><p className="eyebrow">YEAR BY YEAR / AGGREGATE PIT</p><h2>{english ? 'How the signal changed over time' : '因子表现逐年变化'}</h2><p className="panel-note">{english ? `Annual means of monthly cross-sectional labels. Signal coverage for this horizon: ${coveredFrom} to ${coveredTo}.` : `按信号年份汇总月度横截面标签均值。本期限真实信号覆盖：${coveredFrom} 至 ${coveredTo}。`}</p></div>
    <div className="study-chart-controls"><label>{english ? 'Forward label' : '预测期限'}<select value={horizon} onChange={(event) => setHorizon(event.target.value as 'fwd20' | 'fwd220')}><option value="fwd20">{english ? '20 trading days' : '20 个交易日'}</option><option value="fwd220">{english ? '220 trading days' : '220 个交易日'}</option></select></label><label>{english ? 'Year range' : '年份范围'}<select value={range} onChange={(event) => setRange(event.target.value as 'all' | '10y' | '2015')}><option value="all">{english ? 'Requested calendar range (2015–2026)' : '研究请求年份范围（2015–2026）'}</option><option value="10y">{english ? 'Past 10 calendar years' : '过去十个自然年'}</option><option value="2015">{english ? '2015 to latest observed signal' : '2015 至最新实际信号'}</option></select></label></div>
    <div className="annual-chart-grid"><div><h3>{english ? 'Mean Rank IC' : '平均 Rank IC'}</h3><ReactECharts option={baseOption('rank_ic')} style={{ height: 340 }} notMerge lazyUpdate /></div><div><h3>{english ? 'Mean Top-minus-bottom spread' : '最高组减最低组收益差'}</h3><ReactECharts option={baseOption('top_minus_bottom')} style={{ height: 340 }} notMerge lazyUpdate /></div></div>
    <p className="panel-note">{english ? 'Blank years mean no valid monthly signal/label observations in this replay; they are not zero returns. The 220-day forward labels overlap. These are annual averages of monthly cross-sectional statistics, not compounded calendar-year portfolio returns. 2015–2019 and dates after the latest mature label remain blank.' : '空白年份表示该次回放没有有效月度信号/标签观测，不代表收益为零。220 日前瞻标签相互重叠。图中是月度横截面统计的年度均值，不是按自然年复利的组合收益。2015–2019 及最新成熟标签日之后均留空。'}</p>
  </section>
}

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

export function StudyDetailPage({ study }: { study: Study | undefined }) {
  const { locale } = useLocale()
  const english = locale === 'en-US'
  if (!study) return <main className="page"><a className="back" href={`${import.meta.env.BASE_URL}studies`}>← {english ? 'Back to research studies' : '返回研究专题'}</a><h1>{english ? 'Study not found' : '找不到这项研究'}</h1></main>
  const content = localizedStudy(study, locale)
  return <main className="page study-page">
    <a className="back" href={`${import.meta.env.BASE_URL}studies`}>← {english ? 'All studies' : '全部研究专题'}</a>
    <section className="detail-head"><p className="eyebrow">{content.family}</p><h1>{content.title}</h1><p className="lede">{content.summary}</p><span className={`study-status study-status-${study.status}`}>{content.status_label}</span></section>
    <section className="study-context"><div><span>{english ? 'Observation period' : '观察区间'}</span><strong>{content.period}</strong></div><div><span>{english ? 'Evidence source' : '证据来源'}</span><strong>{content.source_note}</strong></div></section>
    {content.rows.length > 0 && <section className="panel"><div className="section-heading"><p className="eyebrow">AGGREGATE EVIDENCE</p><h2>{english ? 'Historical comparison' : '历史对照'}</h2></div><div className="table-scroll"><table className="factor-table"><thead><tr>{content.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{content.rows.map((row) => <tr key={row[0]}>{row.map((value, index) => <td key={content.columns[index]}>{value}</td>)}</tr>)}</tbody></table></div></section>}
    {study.id === 'rd-investment' && study.annual_evidence && <AnnualEvidence study={study} english={english} />}
    {study.research_log?.length ? <section className="panel research-log"><div className="section-heading"><p className="eyebrow">EXPLORATION RECORD</p><h2>{english ? 'Research log' : '探索过程记录'}</h2></div><ol>{study.research_log.map((entry) => <li key={`${entry.date}-${entry.stage}`}><time>{entry.date}</time><div><strong>{english ? entry.stage_en : entry.stage}</strong><p>{english ? entry.note_en : entry.note}</p></div></li>)}</ol></section> : null}
    <div className="study-columns"><section className="panel"><p className="eyebrow">WHAT WE FOUND</p><h2>{english ? 'What we can say now' : '目前可以说什么'}</h2><ul>{content.findings.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="panel"><p className="eyebrow">EVIDENCE BOUNDARY</p><h2>{english ? 'What this evidence does not establish' : '还不能据此推断什么'}</h2><ul>{content.limits.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
    {study.source_url && <p className="study-source"><a href={study.source_url} target="_blank" rel="noopener noreferrer">{english ? 'View public method and evidence notes ↗' : '查看已公开的原始方法与数据核对 ↗'}</a></p>}
  </main>
}
