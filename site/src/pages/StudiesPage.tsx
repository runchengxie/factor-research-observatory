import type { Study, StudyCatalog } from '../types'
import { useLocale } from '../i18n'

const href = (id: string) => `${import.meta.env.BASE_URL}studies/${id}`

export function StudiesPage({ catalog }: { catalog: StudyCatalog }) {
  const { locale } = useLocale()
  const english = locale === 'en-US'
  return <main className="page study-page">
    <section className="detail-head"><p className="eyebrow">FACTOR RESEARCH / STUDIES</p><h1>{english ? 'Research studies' : '因子研究专题'}</h1><p className="lede">{english ? 'Review research hypotheses and historical evidence with explicit data definitions, validation status, and open questions.' : '从研究假设到历史证据，逐项标明数据口径、检验状态和仍待解决的问题。'}</p><span className="badge">{english ? 'Updated' : '更新于'} {catalog.updated_at}</span></section>
    <section className="study-grid">{catalog.studies.map((study) => <a className="study-card" href={href(study.id)} key={study.id}>
      <span className={`study-status study-status-${study.status}`}>{study.status_label}</span>
      <small>{study.family}</small><h2>{study.title}</h2><p>{study.summary}</p><span className="study-link">{english ? 'Read study →' : '阅读研究 →'}</span>
    </a>)}</section>
  </main>
}

export function StudyDetailPage({ study }: { study: Study | undefined }) {
  const { locale } = useLocale()
  const english = locale === 'en-US'
  if (!study) return <main className="page"><a className="back" href={`${import.meta.env.BASE_URL}studies`}>← {english ? 'Back to research studies' : '返回研究专题'}</a><h1>{english ? 'Study not found' : '找不到这项研究'}</h1></main>
  return <main className="page study-page">
    <a className="back" href={`${import.meta.env.BASE_URL}studies`}>← {english ? 'All studies' : '全部研究专题'}</a>
    <section className="detail-head"><p className="eyebrow">{study.family}</p><h1>{study.title}</h1><p className="lede">{study.summary}</p><span className={`study-status study-status-${study.status}`}>{study.status_label}</span></section>
    <section className="study-context"><div><span>{english ? 'Observation period' : '观察区间'}</span><strong>{study.period}</strong></div><div><span>{english ? 'Evidence source' : '证据来源'}</span><strong>{study.source_note}</strong></div></section>
    {study.rows.length > 0 && <section className="panel"><div className="section-heading"><p className="eyebrow">AGGREGATE EVIDENCE</p><h2>{english ? 'Historical comparison' : '历史对照'}</h2></div><div className="table-scroll"><table className="factor-table"><thead><tr>{study.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{study.rows.map((row) => <tr key={row[0]}>{row.map((value, index) => <td key={study.columns[index]}>{value}</td>)}</tr>)}</tbody></table></div></section>}
    <div className="study-columns"><section className="panel"><p className="eyebrow">WHAT WE FOUND</p><h2>{english ? 'What we can say now' : '目前可以说什么'}</h2><ul>{study.findings.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="panel"><p className="eyebrow">EVIDENCE BOUNDARY</p><h2>{english ? 'What this evidence does not establish' : '还不能据此推断什么'}</h2><ul>{study.limits.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
    {study.source_url && <p className="study-source"><a href={study.source_url} target="_blank" rel="noopener noreferrer">{english ? 'View public method and evidence notes ↗' : '查看已公开的原始方法与数据核对 ↗'}</a></p>}
  </main>
}
