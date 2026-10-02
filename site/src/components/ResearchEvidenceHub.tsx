import { useState } from 'react'
import type { Study, StudyCatalog } from '../types'
import { useLocale } from '../i18n'
const href = (id: string) => `${import.meta.env.BASE_URL}studies/${id}`
export function ResearchEvidenceHub({ catalog }: { catalog: StudyCatalog }) {
  const { locale, copy } = useLocale(), c = copy.researchHub
  const [query, setQuery] = useState(''), [market, setMarket] = useState(''), [stage, setStage] = useState('')
  const studies = catalog.studies.filter(s => (!market || s.market === market) && (!stage || s.evidence_stage === stage) && JSON.stringify(s.translations?.[locale] ?? s).toLowerCase().includes(query.toLowerCase()))
  if (!catalog.studies.some(s => s.evidence_summary)) return null
  return <section className="panel research-evidence-hub"><h2>{c.title}</h2>
    <div className="hub-filters"><label>{c.search}<input value={query} onChange={e => setQuery(e.target.value)} /></label><label>{c.all}<select value={market} onChange={e => setMarket(e.target.value)}><option value="">{c.all}</option>{['a_share', 'hong_kong'].map(m => <option key={m} value={m}>{copy.studyTaxonomy[m]}</option>)}</select></label><label>{c.stage}<select value={stage} onChange={e => setStage(e.target.value)}><option value="">{c.stage}</option>{Array.from(new Set(catalog.studies.map(s => s.evidence_stage).filter(Boolean))).map(s => <option key={s} value={s}>{copy.studyTaxonomy[s ?? ""]}</option>)}</select></label><a href={href('compare')}>{c.compare} →</a></div>
    <div className="table-scroll"><table className="factor-table"><thead><tr>{[c.study,c.sample,c.baseline,c.gap,c.review].map(t => <th key={t}>{t}</th>)}</tr></thead><tbody>{studies.map(s => { const t = { ...s, ...s.translations?.[locale] }; return <tr key={s.id}><td><a href={href(s.id)}>{t.title}</a><p>{t.summary}</p><span className="tag">{copy.studyTaxonomy[s.evidence_stage ?? ''] ?? t.status_label}</span></td><td><p>{s.evidence_summary?.sample[locale]}</p><p>{s.evidence_summary?.input_basis[locale]}</p><p>{s.evidence_summary?.scope[locale]}</p></td><td>{s.evidence_summary?.baseline[locale]}</td><td>{t.limits[0]}</td><td>{s.source_review_status ? <>{c[s.source_review_status.status] ?? s.source_review_status.status}<small>{s.source_review_status.checked_at}</small></> : '—'}</td></tr> })}</tbody></table></div>{!studies.length && <p>{c.empty}</p>}
    {!!catalog.research_hub?.change_entries.length && <details><summary>{c.changes} ({catalog.research_hub.change_entries.length})</summary>{catalog.research_hub.change_entries.map(entry => <article className="hub-change" key={`${entry.study_id}-${entry.id}`}><a href={href(entry.study_id)}>{(catalog.studies.find(s => s.id === entry.study_id)?.translations?.[locale] ?? catalog.studies.find(s => s.id === entry.study_id))?.title}</a><p>{entry.period[locale]}</p><dl><dt>{c.before}</dt><dd>{entry.before[locale]}</dd><dt>{c.trigger}</dt><dd>{entry.trigger[locale]}</dd><dt>{c.after}</dt><dd>{entry.after[locale]}</dd></dl><small>{entry.source_ref}</small></article>)}</details>}
  </section>
}
export function StudyConnections({ study, catalog }: { study: Study; catalog: StudyCatalog }) {
 const { locale, copy } = useLocale()
 return study.related_studies?.length ? <section className="panel"><h2>{copy.researchHub.related}</h2>{study.related_studies.map(link => { const target = catalog.studies.find(s => s.id === link.study_id); return target ? <article key={link.study_id}><a href={href(target.id)}>{target.translations?.[locale]?.title ?? target.title}</a><p>{link.rationale[locale]}</p></article> : null })}</section> : null
}
