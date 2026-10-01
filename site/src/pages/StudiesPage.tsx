import type { Study, StudyCatalog, StudySeries } from '../types'
import { useLocale } from '../i18n'
const href = (id: string) => `${import.meta.env.BASE_URL}studies/${id}`
const localizedStudy = (study: Study, locale: 'en-US' | 'zh-CN') => ({ ...study, ...(study.translations?.[locale] ?? {}) })
const localizedSeries = (series: StudySeries, locale: 'en-US' | 'zh-CN') => ({ ...series, ...(series.translations[locale] ?? {}) })
const taxonomyLabels = (study: Study, labels: Record<string, string>) => [
  ...(study.market ? [study.market] : []),
  ...(study.method ?? []),
  ...(study.frequency ?? []),
  ...(study.evidence_stage ? [study.evidence_stage] : []),
].map((key) => labels[key] ?? key)

export function StudiesPage({ catalog }: { catalog: StudyCatalog }) {
  const { locale, copy } = useLocale()
  const english = locale === 'en-US'
  const groupedIds = new Set((catalog.series ?? []).flatMap((series) => series.study_ids))
  const ungroupedStudies = catalog.studies.filter((study) => !groupedIds.has(study.id))
  return <main className="page study-page">
    <section className="detail-head"><p className="eyebrow">FACTOR RESEARCH / STUDIES</p><h1>{english ? 'Research studies' : '因子研究专题'}</h1><p className="lede">{english ? 'Review research hypotheses and historical evidence with explicit data definitions, validation status, and open questions.' : '从研究假设到历史证据，逐项标明数据口径、检验状态和仍待解决的问题。'}</p><span className="badge">{english ? 'Updated' : '更新于'} {catalog.updated_at}</span></section>
    {(catalog.series ?? []).map((rawSeries) => {
      const series = localizedSeries(rawSeries, locale)
      const studies = catalog.studies.filter((study) => rawSeries.study_ids.includes(study.id))
      return <section className="study-series" key={series.id} aria-labelledby={`series-${series.id}`}>
        <div className="panel study-series-intro">
          <p className="eyebrow">{copy.studies.seriesEyebrow}</p><h2 id={`series-${series.id}`}>{series.title}</h2>
          <p>{series.summary}</p><p>{series.scope}</p><p className="study-series-boundary">{series.evidence_boundary}</p>
          {series.id === 'fundamental' && <p className="study-series-boundary">{english ? `${series.candidate_coverage.candidate_ids.length} catalog definitions are tracked as hypotheses; ${series.candidate_coverage.candidate_level_predictive_validation_ids.length} have published candidate-level predictive validation.` : `当前跟踪 ${series.candidate_coverage.candidate_ids.length} 个因子目录定义，均作为研究假设；已发布逐因子预测性验证结果 ${series.candidate_coverage.candidate_level_predictive_validation_ids.length} 个。`}</p>}
          <a className="section-link" href={`${import.meta.env.BASE_URL}${series.candidate_href}`}>{copy.studies.candidateLink} ({series.candidate_count})</a>
        </div>
        <section className="study-grid" aria-label={series.title}>{studies.map((rawStudy) => {
          const study = localizedStudy(rawStudy, locale)
          return <a className="study-card" href={href(study.id)} key={study.id}>
            <span className={`study-status study-status-${study.status}`}>{study.status_label}</span>
            <small>{study.family}</small><h2>{study.title}</h2><p>{study.summary}</p>
            <div className="study-taxonomy" aria-label={copy.studies.studyClassifications}>{taxonomyLabels(study, copy.studyTaxonomy).map((label) => <span className="tag" key={label}>{label}</span>)}</div>
            <span className="study-link">{english ? 'Read study →' : '阅读研究 →'}</span>
          </a>
        })}</section>
      </section>
    })}
    {ungroupedStudies.length > 0 && <section className="study-series study-ungrouped">
      {catalog.series?.length ? <div className="section-heading"><h2>{copy.studies.otherStudies}</h2></div> : null}
      <div className="study-grid">{ungroupedStudies.map((rawStudy) => { const study = localizedStudy(rawStudy, locale); return <a className="study-card" href={href(study.id)} key={study.id}>
        <span className={`study-status study-status-${study.status}`}>{study.status_label}</span>
        <small>{study.family}</small><h2>{study.title}</h2><p>{study.summary}</p>
        {study.method || study.market || study.evidence_stage ? <div className="study-taxonomy" aria-label={copy.studies.studyClassifications}>{taxonomyLabels(study, copy.studyTaxonomy).map((label) => <span className="tag" key={label}>{label}</span>)}</div> : null}
        <span className="study-link">{english ? 'Read study →' : '阅读研究 →'}</span>
      </a> })}</div>
    </section>}
  </main>
}

export function StudyDetailPage({ study, updatedAt }: { study: Study | undefined; updatedAt: string }) {
  const { locale, copy } = useLocale()
  const english = locale === 'en-US'
  if (!study) return <main className="page"><a className="back" href={`${import.meta.env.BASE_URL}studies`}>← {english ? 'Back to research studies' : '返回研究专题'}</a><h1>{english ? 'Study not found' : '找不到这项研究'}</h1></main>
  const content = localizedStudy(study, locale)
  return <main className="page study-page">
    <a className="back" href={`${import.meta.env.BASE_URL}studies`}>← {english ? 'All studies' : '全部研究专题'}</a>
    <section className="detail-head"><p className="eyebrow">{content.family}</p><h1>{content.title}</h1><p className="lede">{content.summary}</p><div className="detail-tags"><span className={`study-status study-status-${study.status}`}>{content.status_label}</span><span className="tag">{copy.studies.updated} {updatedAt}</span>{taxonomyLabels(study, copy.studyTaxonomy).map((label) => <span className="tag" key={label}>{label}</span>)}</div></section>
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
      'The corrected PIT replay has 77 valid monthly cross-sections for 20-day labels and 66 for 220-day labels, with median universe sizes of about 4,454 and 4,230.',
      'This is exploratory Rank IC evidence, not a return estimate. The 220-day labels overlap, historical statement revisions are incomplete, and the frozen final holdout has no readable performance metrics.',
    ] : [
      '财报累计值按 TTM = 本年年初至今 + 上一完整年度 − 上年同期累计值还原；年报直接使用全年值。',
      '公告次日才视为可用；最近一期财报仅在财报年龄不超过 540 天时沿用。月末形成信号，前瞻收益标签从下一交易日收盘价开始。',
      '20 / 220 日标签是随后交易日价格收益，不含交易成本，也不能证明假设的进出场价格实际可成交。',
      '修正后的 PIT 回放中，20 日标签有 77 个有效月度截面，220 日标签有 66 个；股票数中位数约为 4,454 和 4,230。',
      '这是探索性 Rank IC 证据，不是收益估计。220 日标签相互重叠，历史财报修订链不完整，冻结最终留出期也没有可读取的绩效指标。',
    ]).map((note) => <li key={note}>{note}</li>)}</ul><p className="panel-note">{english ? 'Universe eligibility and historical index membership have known timing limitations; the revision chain is incomplete. See the public methodology note for the full protocol and exclusions.' : '股票池资格与历史指数成分时点存在已知限制，财报历史修订链也不完整。完整协议与排除项见公开方法说明。'} <a href={`${import.meta.env.BASE_URL}research/rd-investment-method.html`}>{english ? 'Public methodology note ↗' : '公开方法说明 ↗'}</a></p></section>}
    {study.research_log?.length ? <section className="panel research-log"><div className="section-heading"><p className="eyebrow">EXPLORATION RECORD</p><h2>{english ? 'Research log' : '探索过程记录'}</h2></div><ol>{study.research_log.map((entry) => <li key={`${entry.date}-${entry.stage}`}><time>{entry.date}</time><div><strong>{english ? entry.stage_en : entry.stage}</strong><p>{english ? entry.note_en : entry.note}</p></div></li>)}</ol></section> : null}
    <div className="study-columns"><section className="panel"><p className="eyebrow">WHAT WE FOUND</p><h2>{english ? 'What we can say now' : '目前可以说什么'}</h2><ul>{content.findings.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="panel"><p className="eyebrow">EVIDENCE BOUNDARY</p><h2>{english ? 'What this evidence does not establish' : '还不能据此推断什么'}</h2><ul>{content.limits.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
    {study.source_url && study.id !== 'rd-investment' && <p className="study-source"><a href={study.source_url} target="_blank" rel="noopener noreferrer">{english ? 'View public method and evidence notes ↗' : '查看已公开的原始方法与数据核对 ↗'}</a></p>}
  </main>
}
