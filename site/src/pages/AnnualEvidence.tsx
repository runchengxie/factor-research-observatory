import { useState } from 'react'
import ReactECharts from 'echarts-for-react/esm/core'
import echarts from '../echarts'
import type { Study } from '../types'
import { studyEvidenceMessage } from '../studyEvidenceCopy'

const variantNames: Record<string, [string, string]> = {
  rd_mv: ['R&D / market cap', '研发 / 市值'], rd_ev: ['R&D / EV', '研发 / 企业价值'],
  rd_capitalized: ['Capitalized R&D', '资本化研发'], rd_mv_resid: ['Neutralized residual', '中性化残差'],
  rd_sales: ['R&D / revenue', '研发 / 收入'], rd_assets: ['R&D / assets', '研发 / 资产'], rd_growth: ['R&D growth', '研发增长'],
}
const palette = ['#b64d33', '#477a76', '#a57b2c', '#6d6b9a', '#3982a0', '#9a5e80', '#687b43']

export default function AnnualEvidence({ study, english }: { study: Study; english: boolean }) {
  const [horizon, setHorizon] = useState<'fwd20' | 'fwd220'>('fwd20')
  const [range, setRange] = useState<'all' | '10y' | '2015'>('all')
  const annual = study.annual_evidence?.series ?? []
  const selected = annual.filter((item) => item.horizon === horizon)
  const yearSet = selected[0]?.years.map((point) => point.year) ?? []
  const primarySeries = selected.find((item) => item.factor === 'rd_mv')
  const observedYears = primarySeries?.years.filter((point) => point.cross_sections > 0) ?? []
  const latestObservedYear = observedYears[observedYears.length - 1]
  const years = range === 'all' ? yearSet : range === '10y' ? yearSet.filter((year) => year >= 2017) : yearSet.filter((year) => year >= 2015 && year <= (latestObservedYear?.year ?? Number.NEGATIVE_INFINITY))
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
  const tableYears = years.map((year) => primarySeries?.years.find((point) => point.year === year)).filter((point) => point !== undefined)
  const labelDays = horizon === 'fwd20' ? 20 : 220
  const marketDataAsOf = study.annual_evidence?.market_data_as_of ?? '—'
  const statusForYear = (year: number, count: number) => {
    if (count > 0) return count < 12 ? studyEvidenceMessage(english ? 'en-US' : 'zh-CN', 'partialYear') : studyEvidenceMessage(english ? 'en-US' : 'zh-CN', 'observed')
    const signalStartYear = Number(primarySeries?.signal_start.slice(0, 4) ?? Number.POSITIVE_INFINITY)
    const labelEndYear = Number(primarySeries?.signal_end.slice(0, 4) ?? Number.NEGATIVE_INFINITY)
    if (year < signalStartYear) return studyEvidenceMessage(english ? 'en-US' : 'zh-CN', 'noPitSignal')
    if (year > labelEndYear) return studyEvidenceMessage(english ? 'en-US' : 'zh-CN', 'noMatureLabels')
    return studyEvidenceMessage(english ? 'en-US' : 'zh-CN', 'noValidLabels')
  }
  const locale = english ? 'en-US' : 'zh-CN'
  return <section className="panel annual-evidence-panel">
    <div className="section-heading"><p className="eyebrow">YEAR BY YEAR / AGGREGATE PIT</p><h2>{english ? 'How the signal changed over time' : '因子表现逐年变化'}</h2><p className="panel-note">{english ? `Annual means of monthly cross-sectional labels. Signal coverage for this horizon: ${coveredFrom} to ${coveredTo}.` : `按信号年份汇总月度横截面标签均值。本期限真实信号覆盖：${coveredFrom} 至 ${coveredTo}。`}</p></div>
    <section className="annual-coverage" aria-label={studyEvidenceMessage(locale, 'coverageTitle')}>
      <h3>{studyEvidenceMessage(locale, 'coverageTitle')}</h3>
      <p>{studyEvidenceMessage(locale, 'calendarRange')}</p>
      <div className="annual-coverage-grid">
        <div><span>{english ? 'Market snapshot' : '行情快照'}</span><strong>{studyEvidenceMessage(locale, 'marketDataAsOf', { date: marketDataAsOf })}</strong></div>
        <div><span>{english ? 'Factor history' : '因子历史'}</span><strong>{studyEvidenceMessage(locale, 'signalFrom', { date: primarySeries?.signal_start ?? '—' })}</strong></div>
        <div><span>{english ? 'Selected label maturity' : '当前期限标签成熟日期'}</span><strong>{studyEvidenceMessage(locale, 'labelsMatureThrough', { days: labelDays, date: primarySeries?.signal_end ?? '—' })}</strong></div>
      </div>
    </section>
    <div className="study-chart-controls"><label>{english ? 'Forward label' : '预测期限'}<select value={horizon} onChange={(event) => setHorizon(event.target.value as 'fwd20' | 'fwd220')}><option value="fwd20">{english ? '20 trading days' : '20 个交易日'}</option><option value="fwd220">{english ? '220 trading days' : '220 个交易日'}</option></select></label><label>{english ? 'Year range' : '年份范围'}<select value={range} onChange={(event) => setRange(event.target.value as 'all' | '10y' | '2015')}><option value="all">{english ? 'Requested calendar range (2015–2026)' : '研究请求年份范围（2015–2026）'}</option><option value="10y">{english ? 'Past 10 calendar years' : '过去十个自然年'}</option><option value="2015">{english ? '2015 to latest observed signal' : '2015 至最新实际信号'}</option></select></label></div>
    <div className="annual-chart-grid"><div><h3>{english ? 'Mean Rank IC' : '平均 Rank IC'}</h3><ReactECharts echarts={echarts} option={baseOption('rank_ic')} style={{ height: 340 }} notMerge lazyUpdate /></div><div><h3>{english ? 'Mean Top-minus-bottom spread' : '最高组减最低组收益差'}</h3><ReactECharts echarts={echarts} option={baseOption('top_minus_bottom')} style={{ height: 340 }} notMerge lazyUpdate /></div></div>
    {latestObservedYear && <div className="annual-latest-callout"><strong>{english ? `${latestObservedYear.year}: partial year (${latestObservedYear.cross_sections} monthly cross-sections)` : `${latestObservedYear.year} 年：部分年度（${latestObservedYear.cross_sections} 个有效月度截面）`}</strong><span>{english ? `For R&D / market cap, mean Rank IC is ${latestObservedYear.rank_ic === null ? 'unavailable' : `${(latestObservedYear.rank_ic * 100).toFixed(2)}%`} and mean top-minus-bottom spread is ${latestObservedYear.top_minus_bottom === null ? 'unavailable' : `${(latestObservedYear.top_minus_bottom * 100).toFixed(2)}%`}. Treat this as a short, incomplete observation, not evidence of a durable reversal or persistence.` : `研发 / 市值的平均 Rank IC 为 ${latestObservedYear.rank_ic === null ? '无数据' : `${(latestObservedYear.rank_ic * 100).toFixed(2)}%`}，最高组减最低组收益差为 ${latestObservedYear.top_minus_bottom === null ? '无数据' : `${(latestObservedYear.top_minus_bottom * 100).toFixed(2)}%`}。观测尚短且年度未完结，不能据此判断信号持续或反转。`}</span></div>}
    <div className="table-scroll annual-table-wrap"><table className="factor-table annual-table"><caption>{english ? 'Annual summary — R&D / market cap' : '年度汇总 — 研发 / 市值'}</caption><thead><tr><th>{english ? 'Year' : '年份'}</th><th>{english ? 'Monthly cross-sections' : '有效月度截面数'}</th><th>{english ? 'Coverage status' : '覆盖状态'}</th><th>{english ? 'Mean Rank IC' : '平均 Rank IC'}</th><th>{english ? 'Mean top-minus-bottom spread' : '平均最高组减最低组收益差'}</th></tr></thead><tbody>{tableYears.map((point) => <tr key={point.year}><td>{point.year}{point.cross_sections > 0 && point.cross_sections < 12 && <small>{studyEvidenceMessage(locale, 'partialYear')}</small>}</td><td>{point.cross_sections}</td><td>{statusForYear(point.year, point.cross_sections)}</td><td>{point.rank_ic === null ? '—' : `${(point.rank_ic * 100).toFixed(2)}%`}</td><td>{point.top_minus_bottom === null ? '—' : `${(point.top_minus_bottom * 100).toFixed(2)}%`}</td></tr>)}</tbody></table></div>
    <aside className="annual-uncertainty"><h3>{studyEvidenceMessage(locale, 'uncertaintyTitle')}</h3><p>{studyEvidenceMessage(locale, 'uncertainty')}</p></aside>
    <p className="panel-note">{english ? 'Blank years mean no valid monthly signal/label observations in this replay; they are not zero returns. The table and charts show arithmetic annual means of monthly cross-sectional statistics, not compounded calendar-year portfolio returns. N counts valid monthly cross-sections, not independent securities or independent experiments. Forward labels overlap (especially 220-day); no confidence interval is reported. 2015–2019 have no PIT factor signal, and dates after the latest mature label remain blank.' : '空白年份表示该次回放没有有效月度信号/标签观测，不代表收益为零。表格与图展示月度横截面统计的年度算术均值，不是自然年复利组合收益。N 统计有效月度截面，并非独立股票数或独立实验数。前瞻标签彼此重叠（220 日尤其明显）；当前未报告置信区间。2015–2019 没有 PIT 因子信号，最新成熟标签日之后留空。'}</p>
  </section>
}
