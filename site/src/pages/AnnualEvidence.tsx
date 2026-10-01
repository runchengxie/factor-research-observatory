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
    tooltip: { trigger: 'axis', backgroundColor: '#fffefa', borderColor: '#d8d0c3', textStyle: { color: '#252525' }, formatter: (items: Array<{ seriesName: string; dataIndex: number; value: number | number[] | null; color: string; data?: { year?: number; crossSections?: number } }>) => {
      const year = items[0]?.data?.year ?? years[items[0]?.dataIndex ?? 0]
      const lines = items.filter((item) => item.value !== null).map((item) => {
        const value = Array.isArray(item.value) ? item.value[1] : item.value
        const series = selected.find((candidate) => {
          const name = english ? variantNames[candidate.factor]?.[0] : variantNames[candidate.factor]?.[1]
          return item.seriesName === name || item.seriesName.startsWith(`${name} ·`)
        })
        const n = item.data?.crossSections ?? series?.years.find((point) => point.year === year)?.cross_sections ?? 0
        return `<span style="color:${item.color}">●</span> ${item.seriesName}: ${(Number(value) * 100).toFixed(2)}% <small>(${n} ${english ? 'monthly cross-sections' : '个月度截面'})</small>`
      })
      return `${year}<br/>${lines.join('<br/>') || (english ? 'No factor evidence for this year' : '该年无因子证据')}`
    } },
    xAxis: { type: 'category', data: years, boundaryGap: false, axisLine: { lineStyle: { color: '#81796e' } }, axisLabel: { color: '#81796e' } },
    yAxis: { type: 'value', axisLabel: { color: '#81796e', formatter: (value: number) => `${(value * 100).toFixed(0)}%` }, splitLine: { lineStyle: { color: '#e8e1d6' } } },
    series: selected.flatMap((item, index) => {
      const name = english ? variantNames[item.factor]?.[0] : variantNames[item.factor]?.[1]
      const regular = { name, type: 'line', connectNulls: false, showSymbol: true, symbolSize: 6, lineStyle: { width: item.factor === 'rd_mv' || item.factor === 'rd_capitalized' ? 2.8 : 1.6 }, data: years.map((year) => { const point = item.years.find((entry) => entry.year === year); return point?.evidence_status === 'reconstructed_backfill' ? null : point?.[metric] ?? null }), itemStyle: { color: palette[index] } }
      const backfill = item.years.filter((point) => years.includes(point.year) && point.evidence_status === 'reconstructed_backfill' && point[metric] !== null).map((point) => ({ value: [String(point.year), point[metric]], year: point.year, crossSections: point.cross_sections, n: point.median_universe_n }))
      return backfill.length ? [regular, { name: `${name} · ${english ? 'backfill sensitivity' : '回溯敏感性'}`, type: 'scatter', symbol: 'diamond', symbolSize: 12, data: backfill, itemStyle: { color: palette[index], borderColor: '#fffefa', borderWidth: 1.5 } }] : [regular]
    }),
  })
  const primaryForHorizon = selected.find((item) => item.factor === 'rd_mv')
  const supplemental = study.supplemental_evidence
  const costProbe = supplemental?.top200_cost_probe
  const costOption = {
    animation: false,
    color: palette,
    textStyle: { color: '#514b43', fontFamily: 'Manrope, sans-serif' },
    grid: { left: 66, right: 24, top: 24, bottom: 54 },
    tooltip: { trigger: 'axis', valueFormatter: (value: number) => `${(value * 100).toFixed(1)}%` },
    legend: { type: 'scroll', bottom: 0, textStyle: { color: '#514b43' } },
    xAxis: { type: 'category', data: costProbe?.cost_tiers_bps.map((bps) => `${bps} bp`) ?? [], axisLabel: { color: '#81796e' } },
    yAxis: { type: 'value', axisLabel: { color: '#81796e', formatter: (value: number) => `${(value * 100).toFixed(0)}%` }, splitLine: { lineStyle: { color: '#e8e1d6' } } },
    series: costProbe?.factors.map((item, index) => ({ name: english ? variantNames[item.factor]?.[0] : variantNames[item.factor]?.[1], type: 'line', showSymbol: true, symbolSize: 6, data: item.annualized_returns, lineStyle: { width: item.factor === 'rd_mv' || item.factor === 'rd_ev' ? 2.8 : 1.6 }, itemStyle: { color: palette[index] } })) ?? [],
  }
  const tableYears = years.map((year) => primarySeries?.years.find((point) => point.year === year)).filter((point) => point !== undefined)
  const labelDays = horizon === 'fwd20' ? 20 : 220
  const marketDataAsOf = study.annual_evidence?.market_data_as_of ?? '—'
  const statusForYear = (point: NonNullable<typeof tableYears[number]>) => {
    if (point.evidence_status === 'missing_lookback') return studyEvidenceMessage(locale, 'missingLookback')
    if (point.evidence_status === 'below_minimum_cross_section') return studyEvidenceMessage(locale, 'belowMinimum', { count: point.max_universe_n })
    if (point.evidence_status === 'reconstructed_backfill') return studyEvidenceMessage(locale, 'reconstructedBackfill')
    if (point.evidence_status === 'no_mature_labels') return studyEvidenceMessage(locale, 'noMatureLabels')
    if (point.cross_sections > 0 && point.cross_sections < 12) return studyEvidenceMessage(locale, 'partialYear')
    if (point.cross_sections > 0) return studyEvidenceMessage(locale, 'observed')
    return studyEvidenceMessage(locale, 'noPitSignal')
  }

  const locale = english ? 'en-US' : 'zh-CN'
  return <section className="panel annual-evidence-panel">
    <div className="section-heading"><p className="eyebrow">YEAR BY YEAR / AGGREGATE PIT</p><h2>{english ? 'How the signal changed over time' : '因子表现逐年变化'}</h2><p className="panel-note">{english ? `Annual means of monthly cross-sectional labels. Eligible signal window: ${primaryForHorizon?.signal_start} to ${primaryForHorizon?.signal_end}. Diamonds mark retrospective reconstruction sensitivity.` : `按信号年份汇总月度横截面标签均值。合格信号区间：${primaryForHorizon?.signal_start} 至 ${primaryForHorizon?.signal_end}。菱形点表示回溯重建敏感性样本。`}</p></div>
    <section className="annual-coverage" aria-label={studyEvidenceMessage(locale, 'coverageTitle')}>
      <h3>{studyEvidenceMessage(locale, 'coverageTitle')}</h3>
      <p>{studyEvidenceMessage(locale, 'calendarRange', { start: study.annual_evidence?.requested_start ?? '2015-01-05', marketDate: marketDataAsOf })}</p>
      <div className="annual-coverage-grid">
        <div><span>{english ? 'Market snapshot' : '行情快照'}</span><strong>{studyEvidenceMessage(locale, 'marketDataAsOf', { date: marketDataAsOf })}</strong></div>
        <div><span>{english ? 'First eligible cross-section' : '首个合格横截面'}</span><strong>{studyEvidenceMessage(locale, 'firstEligibleSignal', { date: primarySeries?.signal_start ?? '—' })}</strong></div>
        <div><span>{english ? 'Signal window' : '信号区间'}</span><strong>{studyEvidenceMessage(locale, 'signalWindow', { start: primaryForHorizon?.signal_start ?? '—', end: primaryForHorizon?.signal_end ?? '—' })}</strong></div>
        <div><span>{english ? 'Selected outcome maturity' : '当前期限收益标签成熟日'}</span><strong>{studyEvidenceMessage(locale, 'labelsMatureThrough', { days: labelDays, date: primaryForHorizon?.label_mature_through ?? '—' })}</strong></div>
      </div>
    </section>
    <div className="study-chart-controls"><label>{english ? 'Forward label' : '预测期限'}<select value={horizon} onChange={(event) => setHorizon(event.target.value as 'fwd20' | 'fwd220')}><option value="fwd20">{english ? '20 trading days' : '20 个交易日'}</option><option value="fwd220">{english ? '220 trading days' : '220 个交易日'}</option></select></label><label>{english ? 'Year range' : '年份范围'}<select value={range} onChange={(event) => setRange(event.target.value as 'all' | '10y' | '2015')}><option value="all">{english ? 'Requested calendar range (2015–2026)' : '研究请求年份范围（2015–2026）'}</option><option value="10y">{english ? 'Past 10 calendar years' : '过去十个自然年'}</option><option value="2015">{english ? '2015 to latest observed signal' : '2015 至最新实际信号'}</option></select></label></div>
    <div className="annual-chart-grid"><div><h3>{english ? 'Mean Rank IC' : '平均 Rank IC'}</h3><ReactECharts echarts={echarts} option={baseOption('rank_ic')} style={{ height: 340 }} notMerge lazyUpdate /></div><div><h3>{english ? 'Mean Top-minus-bottom spread' : '最高组减最低组收益差'}</h3><ReactECharts echarts={echarts} option={baseOption('top_minus_bottom')} style={{ height: 340 }} notMerge lazyUpdate /></div></div>
    {latestObservedYear && <div className="annual-latest-callout"><strong>{english ? `${latestObservedYear.year}: partial year (${latestObservedYear.cross_sections} monthly cross-sections)` : `${latestObservedYear.year} 年：部分年度（${latestObservedYear.cross_sections} 个有效月度截面）`}</strong><span>{english ? `For R&D / market cap, mean Rank IC is ${latestObservedYear.rank_ic === null ? 'unavailable' : `${(latestObservedYear.rank_ic * 100).toFixed(2)}%`} and mean top-minus-bottom spread is ${latestObservedYear.top_minus_bottom === null ? 'unavailable' : `${(latestObservedYear.top_minus_bottom * 100).toFixed(2)}%`}. Treat this as a short, incomplete observation, not evidence of a durable reversal or persistence.` : `研发 / 市值的平均 Rank IC 为 ${latestObservedYear.rank_ic === null ? '无数据' : `${(latestObservedYear.rank_ic * 100).toFixed(2)}%`}，最高组减最低组收益差为 ${latestObservedYear.top_minus_bottom === null ? '无数据' : `${(latestObservedYear.top_minus_bottom * 100).toFixed(2)}%`}。观测尚短且年度未完结，不能据此判断信号持续或反转。`}</span></div>}
    <div className="table-scroll annual-table-wrap"><table className="factor-table annual-table"><caption>{english ? 'Annual summary — R&D / market cap' : '年度汇总 — 研发 / 市值'}</caption><thead><tr><th>{english ? 'Year' : '年份'}</th><th>{english ? 'Monthly cross-sections' : '有效月度截面数'}</th><th>{english ? 'Median eligible names' : '每期股票数中位数'}</th><th>{english ? 'Coverage status' : '覆盖状态'}</th><th>{english ? 'Mean Rank IC' : '平均 Rank IC'}</th><th>{english ? 'Mean top-minus-bottom spread' : '平均最高组减最低组收益差'}</th></tr></thead><tbody>{tableYears.map((point) => <tr key={point.year}><td>{point.year}{point.evidence_status === 'reconstructed_backfill' && <small>{studyEvidenceMessage(locale, 'reconstructedBackfill')}</small>}{point.cross_sections > 0 && point.cross_sections < 12 && point.evidence_status !== 'reconstructed_backfill' && <small>{studyEvidenceMessage(locale, 'partialYear')}</small>}</td><td>{point.cross_sections}</td><td>{point.median_universe_n?.toLocaleString(locale) ?? (point.max_universe_n ? `≤${point.max_universe_n.toLocaleString(locale)}` : '—')}</td><td>{statusForYear(point)}</td><td>{point.rank_ic === null ? '—' : `${(point.rank_ic * 100).toFixed(2)}%`}</td><td>{point.top_minus_bottom === null ? '—' : `${(point.top_minus_bottom * 100).toFixed(2)}%`}</td></tr>)}</tbody></table></div>
    <aside className="annual-uncertainty"><h3>{studyEvidenceMessage(locale, 'uncertaintyTitle')}</h3><p>{studyEvidenceMessage(locale, 'uncertainty')}</p></aside>
    <p className="panel-note">{english ? 'Blank years mean no valid monthly signal/label observations in this replay; they are not zero returns. The table and charts show arithmetic annual means of monthly cross-sectional statistics, not compounded calendar-year portfolio returns. N counts valid monthly cross-sections, not independent securities or independent experiments. Forward labels overlap (especially 220-day); the supplemental HAC intervals partially address serial dependence but do not make observations independent. 2019 is shown as a separate retrospective reconstruction sensitivity; 2015 lacks the 2014 TTM lookback and 2016–2018 remain below the 200-name monthly minimum.' : '空白年份表示该次回放没有有效月度信号/标签观测，不代表收益为零。表格与图展示月度横截面统计算术均值，不是自然年复利组合收益。N 统计有效月度截面，并非独立股票数或独立实验数。前瞻标签彼此重叠（220 日尤其明显）；补充 HAC 区间仅部分处理序列相关，不会令观测彼此独立。2019 年单独标为回溯重建敏感性样本；2015 年缺少 2014 年 TTM 回看数据，2016–2018 年均未达到每月 200 只股票下限。'}</p>
    {supplemental && <>
      <section className="panel supplemental-evidence">
        <div className="section-heading"><p className="eyebrow">PORTFOLIO INTERFACE / COST STRESS</p><h2>{english ? 'Cost sensitivity of a fixed Top-200 probe' : '固定 Top-200 探针的成本敏感性'}</h2><p className="panel-note">{english ? 'A separate equal-weight monthly portfolio diagnostic, using next-eligible-session execution. It checks the portfolio interface and cost drag; it is not the registered decile validation.' : '单独的等权月度组合诊断，下一可交易日执行。该测试检查组合接口与成本影响，不替代预注册十分组验证。'}</p></div>
        {costProbe && <>
          <div className="cost-chart"><ReactECharts echarts={echarts} option={costOption} style={{ height: 360 }} notMerge lazyUpdate /></div>
          <div className="table-scroll"><table className="factor-table probe-table"><caption>{english ? '25 bp one-way cost scenario' : '单边成本 25 bp 情景'}</caption><thead><tr><th>{english ? 'Signal' : '因子变体'}</th><th>{english ? 'One-way cost' : '单边成本'}</th><th>{english ? 'Annualized return' : '年化收益'}</th><th>Sharpe</th><th>{english ? 'Max drawdown' : '最大回撤'}</th><th>{english ? 'Periods' : '持有区间数'}</th></tr></thead><tbody>{costProbe.factors.map((item) => { const i = costProbe.cost_tiers_bps.indexOf(25); return <tr key={item.factor}><td>{english ? variantNames[item.factor]?.[0] : variantNames[item.factor]?.[1]}</td><td>25 bp</td><td>{(item.annualized_returns[i] * 100).toFixed(2)}%</td><td>{item.sharpes[i].toFixed(2)}</td><td>{(item.max_drawdowns[i] * 100).toFixed(2)}%</td><td>{item.result_periods}</td></tr> })}</tbody></table></div>
        </>}
        <p className="panel-note">{english ? 'All-market PIT-eligible names; minimum 200 valid values and 10 distinct scores at formation; equal-weight Top-200; 89 holding periods (77 for R&D growth). Cost tiers are a linear scaling of the platform 25 bp period-cost vector. No slippage or market impact is modeled, execution_data_available=false, and these results are not a production portfolio.' : '使用全市场 PIT 合格股票；每期至少 200 个有效因子值且至少 10 个不同分值；等权 Top-200；共 89 个持有区间（研发增长为 77 个）。各成本档由平台 25 bp 区间成本向量线性缩放。未建模滑点或市场冲击，execution_data_available=false；结果不构成生产组合。'}</p>
      </section>
      <section className="panel supplemental-evidence">
        <div className="section-heading"><p className="eyebrow">SIGNAL ATTRIBUTION / HAC</p><h2>{english ? 'What drives R&D / market cap?' : '研发 / 市值信号由什么驱动？'}</h2><p className="panel-note">{english ? 'Univariate component Rank IC on the common 2020+ monthly sample, with Newey–West HAC 95% intervals and BH q-values across four components within each horizon.' : '在共同的 2020 年起月度样本上，分别计算各成分的单变量 Rank IC，并报告 Newey–West HAC 95% 区间及每个期限内四个成分的 BH q 值。'}</p></div>
        <div className="table-scroll"><table className="factor-table attribution-table"><thead><tr><th>{english ? 'Component' : '成分'}</th><th>{english ? 'Horizon' : '期限'}</th><th>N</th><th>{english ? 'Mean Rank IC' : '平均 Rank IC'}</th><th>{english ? 'HAC 95% interval' : 'HAC 95% 区间'}</th><th>{english ? 'BH q-value' : 'BH q 值'}</th></tr></thead><tbody>{supplemental.components.map((item) => { const labels: Record<string, [string, string]> = { rd_mv: ['R&D / market cap', '研发 / 市值'], log_rd_numerator: ['Log R&D numerator', '研发费用对数分子'], inverse_market_cap: ['Inverse market cap', '倒数市值'], neutralized_residual: ['Neutralized residual', '中性化残差'] }; return <tr key={`${item.component}-${item.horizon}`}><td>{english ? labels[item.component]?.[0] : labels[item.component]?.[1]}</td><td>{item.horizon === 'fwd20' ? '20d' : '220d'}</td><td>{item.n}</td><td>{(item.mean * 100).toFixed(2)}%</td><td>[{(item.ci95_low * 100).toFixed(2)}%, {(item.ci95_high * 100).toFixed(2)}%]</td><td>{item.q_value < 0.001 ? '<0.001' : item.q_value.toFixed(3)}</td></tr> })}</tbody></table></div>
        <div className="annual-latest-callout"><strong>{english ? `CPCV selection diagnostic: fwd20 PBO ${supplemental.cpcv.pbo_fwd20.toFixed(2)} · fwd220 PBO ${supplemental.cpcv.pbo_fwd220.toFixed(2)}` : `CPCV 选择偏差诊断：20 日 PBO ${supplemental.cpcv.pbo_fwd20.toFixed(2)} · 220 日 PBO ${supplemental.cpcv.pbo_fwd220.toFixed(2)}`}</strong><span>{english ? 'Five groups, two test groups, ten combinations per horizon, purged by 1 / 10 months. This is descriptive exploration-period validation, not final OOS. In the component check, inverse market cap is stronger than log R&D expense; the positive residual remains preliminary and is not causal attribution.' : '五组、每次两组测试，每个期限十种组合；分别清除 1 / 10 个月。该结果是探索期内的描述性验证，不是最终样本外测试。成分拆解中倒数市值强于研发费用对数；残差虽为正仍属初步证据，不能作因果归因。'}</span></div>
      </section>
      <section className="panel supplemental-evidence">
        <div className="section-heading"><p className="eyebrow">ROBUSTNESS / MULTIPLE TESTING</p><h2>{english ? 'HAC inference across the seven variants' : '七个因子变体的 HAC 推断'}</h2><p className="panel-note">{english ? 'Core 2020+ sample; 95% Newey–West intervals and Benjamini–Hochberg q-values across all 14 registered factor × horizon Rank IC tests.' : '2020 年起核心样本；报告 Newey–West 95% 区间，并对预先登记的 14 项“因子 × 期限”Rank IC 检验进行 Benjamini–Hochberg 校正。'}</p></div>
        <div className="table-scroll"><table className="factor-table hac-table"><thead><tr><th>{english ? 'Variant' : '因子变体'}</th><th>{english ? 'Horizon' : '期限'}</th><th>N</th><th>{english ? 'Mean Rank IC' : '平均 Rank IC'}</th><th>{english ? 'HAC 95% interval' : 'HAC 95% 区间'}</th><th>{english ? 'BH q-value across 14 tests' : '14 项检验 BH q 值'}</th></tr></thead><tbody>{supplemental.rank_ic_inference.map((item) => <tr key={`${item.factor}-${item.horizon}`}><td>{english ? variantNames[item.factor]?.[0] : variantNames[item.factor]?.[1]}</td><td>{item.horizon === 'fwd20' ? '20d' : '220d'}</td><td>{item.n}</td><td>{(item.mean * 100).toFixed(2)}%</td><td>[{(item.ci95_low * 100).toFixed(2)}%, {(item.ci95_high * 100).toFixed(2)}%]</td><td>{item.q_value < 0.001 ? '<0.001' : item.q_value.toFixed(3)}</td></tr>)}</tbody></table></div>
        <p className="panel-note">{english ? 'HAC uses lag 1 for 20-day monthly labels and lag 10 for 220-day labels. Normal-approximation intervals only partially address overlapping outcomes; adjusted q-values do not remedy revision_safe=false or selection during exploration.' : 'HAC 对 20 日月度标签使用 1 阶滞后，对 220 日标签使用 10 阶滞后。正态近似区间仅部分处理标签重叠；多重检验校正不能补足 revision_safe=false，也不能消除探索期的选择偏差。'}</p>
      </section>
    </>}
  </section>
}
