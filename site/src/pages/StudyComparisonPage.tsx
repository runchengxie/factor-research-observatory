import { useEffect, useState } from 'react'
import type { StudyCatalog } from '../types'
import { useLocale } from '../i18n'
import { isStudyExploration, type StudyExplorationData, type ExplorationChart } from '../studyExploration'
import StudyComparisonChart, { formatStudyValue } from '../components/StudyComparisonChart'

export default function StudyComparisonPage({ catalog }: { catalog: StudyCatalog }) {
 const { locale, copy } = useLocale(), c = copy.researchHub
 const groups = catalog.research_hub?.comparison_groups ?? []
 const [groupId, setGroupId] = useState(groups[0]?.id ?? ''), [slice, setSlice] = useState(0), [metric, setMetric] = useState('')
 const [data, setData] = useState<StudyExplorationData | null>(null), [failed, setFailed] = useState(false), [attempt, setAttempt] = useState(0)
 const group = groups.find(g => g.id === groupId), study = catalog.studies.find(s => s.id === group?.study_id)
 useEffect(() => {
  const controller = new AbortController(); setData(null); setFailed(false)
  if (!study?.exploration_asset || !/^data\/study-exploration\/[a-z0-9-]+\.json$/.test(study.exploration_asset)) { setFailed(true); return }
  fetch(`${import.meta.env.BASE_URL}${study.exploration_asset}`, { signal: controller.signal }).then(r => { if (!r.ok) throw Error(); return r.json() }).then(value => { if (!isStudyExploration(value, study.id, study.source_ref)) throw Error(); if (!controller.signal.aborted) setData(value) }).catch(() => { if (!controller.signal.aborted) setFailed(true) })
  return () => controller.abort()
 }, [study?.id, study?.exploration_asset, study?.source_ref, attempt])
 const original = data?.charts.find(chart => chart.id === group?.chart_id)
 const series = original?.series.filter(s => !group?.series_ids || group.series_ids.includes(s.id)) ?? []
 const selected = series.find(s => s.id === metric) ?? series[0]
 const categoryIndex = original && slice < original.categories.length ? slice : 0
 let chart: ExplorationChart | undefined, baseline: number | null | undefined
 if (original && group && series.length) {
  if (group.mode === 'models') {
   baseline = series.find(s => s.id === group.baseline_id)?.values[categoryIndex]
   chart = { ...original, categories: series.map(s => s.label), series: [{ id: 'comparison', label: original.categories[categoryIndex], values: series.map(s => s.values[categoryIndex]) }] }
  } else if (selected) {
   baseline = selected.values[Number(group.baseline_id)]
   chart = { ...original, series: [selected] }
  }
 }
 return <main className="page study-page"><a className="back" href={`${import.meta.env.BASE_URL}studies`}>← {copy.studies.all}</a><section className="panel"><h1>{c.compare}</h1><p>{c.note}</p><label>{c.compare}<select aria-label={c.compare} value={groupId} onChange={e => { setGroupId(e.target.value); setSlice(0); setMetric('') }}>{groups.map(g => <option key={g.id} value={g.id}>{g.label[locale]}</option>)}</select></label>{group && <><h2>{c.scope}</h2><p>{group.scope[locale]}</p><p className="panel-note">{copy.studies.updated}: {group.reviewed_at}</p></>}
 {failed ? <div role="status"><p>{c.error}</p><button onClick={() => setAttempt(v => v + 1)}>{c.retry}</button></div> : !data ? <p role="status">{c.loading}</p> : chart && original && group ? <>
 <a href={`${import.meta.env.BASE_URL}studies/${study?.id}`}>{study?.translations?.[locale]?.title ?? study?.title} →</a>
 {group.mode === 'models' ? <label>{c.category}<select aria-label={c.category} value={categoryIndex} onChange={e => setSlice(Number(e.target.value))}>{original.categories.map((category,i) => <option key={i} value={i}>{category[locale]}</option>)}</select></label> : series.length > 1 && <label>{c.metric}<select aria-label={c.metric} value={selected.id} onChange={e => setMetric(e.target.value)}>{series.map(s => <option key={s.id} value={s.id}>{s.label[locale]}</option>)}</select></label>}
 <h2>{chart.title[locale]}</h2><p>{chart.metric[locale]}</p><p>{chart.context[locale]}</p><StudyComparisonChart chart={chart} locale={locale} /><p>{chart.interpretation[locale]}</p>
 <div className="table-scroll"><table className="factor-table"><caption>{c.difference} ({group.direction === 'higher' ? '↑' : '↓'})</caption><thead><tr><th>{c.category}</th><th>{c.metric}</th><th>{c.difference}</th></tr></thead><tbody>{chart.categories.map((category,i) => { const value = chart.series[0].values[i]; return <tr key={i}><th>{category[locale]}</th><td>{formatStudyValue(value,chart,locale)}</td><td>{formatStudyValue(value == null || baseline == null ? null : value-baseline,chart,locale)}</td></tr> })}</tbody></table></div>
 <p>{c.baseline}: {group.mode === 'models' ? series.find(s => s.id === group.baseline_id)?.label[locale] : original.categories[Number(group.baseline_id)]?.[locale]} · {baseline == null ? '—' : formatStudyValue(baseline,chart,locale)}</p>
 </> : <p>{c.error}</p>}
 </section></main>
}
