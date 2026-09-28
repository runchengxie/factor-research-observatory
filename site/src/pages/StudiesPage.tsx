import type { Study, StudyCatalog } from '../types'

const href = (id: string) => `${import.meta.env.BASE_URL}studies/${id}`

export function StudiesPage({ catalog }: { catalog: StudyCatalog }) {
  return <main className="page study-page">
    <section className="detail-head"><p className="eyebrow">FACTOR RESEARCH / STUDIES</p><h1>因子研究专题</h1><p className="lede">从研究假设到历史证据，逐项标明数据口径、检验状态和仍待解决的问题。</p><span className="badge">更新于 {catalog.updated_at}</span></section>
    <section className="study-grid">{catalog.studies.map((study) => <a className="study-card" href={href(study.id)} key={study.id}>
      <span className={`study-status study-status-${study.status}`}>{study.status_label}</span>
      <small>{study.family}</small><h2>{study.title}</h2><p>{study.summary}</p><span className="study-link">阅读研究 →</span>
    </a>)}</section>
  </main>
}

export function StudyDetailPage({ study }: { study: Study | undefined }) {
  if (!study) return <main className="page"><a className="back" href={`${import.meta.env.BASE_URL}studies`}>← 返回研究专题</a><h1>找不到这项研究</h1></main>
  return <main className="page study-page">
    <a className="back" href={`${import.meta.env.BASE_URL}studies`}>← 全部研究专题</a>
    <section className="detail-head"><p className="eyebrow">{study.family}</p><h1>{study.title}</h1><p className="lede">{study.summary}</p><span className={`study-status study-status-${study.status}`}>{study.status_label}</span></section>
    <section className="study-context"><div><span>观察区间</span><strong>{study.period}</strong></div><div><span>证据来源</span><strong>{study.source_note}</strong></div></section>
    {study.rows.length > 0 && <section className="panel"><div className="section-heading"><p className="eyebrow">AGGREGATE EVIDENCE</p><h2>历史对照</h2></div><div className="table-scroll"><table className="factor-table"><thead><tr>{study.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{study.rows.map((row) => <tr key={row[0]}>{row.map((value, index) => <td key={study.columns[index]}>{value}</td>)}</tr>)}</tbody></table></div></section>}
    <div className="study-columns"><section className="panel"><p className="eyebrow">WHAT WE FOUND</p><h2>目前可以说什么</h2><ul>{study.findings.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="panel"><p className="eyebrow">EVIDENCE BOUNDARY</p><h2>还不能据此推断什么</h2><ul>{study.limits.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
    {study.source_url && <p className="study-source"><a href={study.source_url} target="_blank" rel="noopener noreferrer">查看已公开的原始方法与数据核对 ↗</a></p>}
  </main>
}
