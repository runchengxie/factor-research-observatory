import { useEffect, useState } from 'react'
import ForecastCalibration from './ForecastCalibration'
import { useLocale } from '../i18n'
import type { Study } from '../types'
import { isStudyNavigation, type StudyNavigationData } from '../studyNavigation'
import StudyComparisonChart from './StudyComparisonChart'
import type { ExplorationChart } from '../studyExploration'

function Content({ data }: { data: StudyNavigationData }) {
 const { locale, copy } = useLocale(), c = copy.studyNavigation
 const format = (n: number, percent: boolean) => new Intl.NumberFormat(locale, percent ? {style:'percent',maximumFractionDigits:2} : {maximumFractionDigits:3}).format(n)
 const [slice, setSlice] = useState('')
 const groups = [...new Set(data.diagnostic_intervals.map(row => row.horizon ?? row.target ?? ''))]
 const chosen = groups.includes(slice) ? slice : groups[0]
 const rows = data.diagnostic_intervals.filter(row => (row.horizon ?? row.target) === chosen)
 const percent = !!rows[0]?.horizon
 const chart: ExplorationChart | null = rows.length ? { id:'paired', title:{'en-US':c.intervals,'zh-CN':c.intervals}, metric:{'en-US':percent?c.icDifference:c.maeDifference,'zh-CN':percent?c.icDifference:c.maeDifference}, context:{'en-US':data.diagnostic_note?.[locale] ?? '', 'zh-CN':data.diagnostic_note?.[locale] ?? ''}, interpretation:{'en-US':'','zh-CN':''}, unit:percent?'percent':'number', categories:rows.map(row => ({'en-US':`${row.year ?? ''} ${c[row.arm ?? row.model ?? ''] ?? row.arm ?? row.model} − ${c[row.baseline] ?? row.baseline}`, 'zh-CN':`${row.year ?? ''} ${c[row.arm ?? row.model ?? ''] ?? row.arm ?? row.model} − ${c[row.baseline] ?? row.baseline}`})), series:[{id:'difference',label:{'en-US':c.difference,'zh-CN':c.difference},values:rows.map(row=>row.mean_difference)}],source_ids:[] } : null
 return <section className="study-navigation">
 <section className="panel study-trust-card"><h2>{c.trust}</h2><p>{c.trustNote}</p><div className="table-scroll"><table className="factor-table"><thead><tr><th>{c.dimension}</th><th>{c.status}</th><th>{c.evidence}</th></tr></thead><tbody>{data.trust.map(claim => <tr key={claim.dimension}><th>{c[claim.dimension]}</th><td><span className="tag">{c[claim.status]}</span></td><td>{claim.detail[locale]}</td></tr>)}</tbody></table></div></section>
 <section className="panel study-reproduction"><h2>{c.reproduction}</h2><dl><dt>{c.run}</dt><dd><code>{data.reproduction.run_id}</code></dd><dt>{c.status}</dt><dd>{c[data.reproduction.status]}</dd><dt>{c.dataVersion}</dt><dd>{data.reproduction.data_version[locale]}</dd><dt>{c.codeRevision}</dt><dd>{data.reproduction.code_revision ?? c.notRecorded}</dd><dt>{c.runnerHash}</dt><dd><code>{data.reproduction.runner_sha256 ?? c.notRecorded}</code></dd></dl><p>{data.reproduction.missing[locale]}</p><details><summary>{c.provenance}</summary><p>{c.reviewed}: {data.reviewed_at}</p><code>{data.authority_ref}</code><p><code>{data.source_revision}</code></p>{data.reproduction.artifact_sha256 && Object.entries(data.reproduction.artifact_sha256).map(([name,hash]) => <p key={name}>{name}<br/><code>{hash}</code></p>)}</details></section>
 {chart && <section className="panel study-paired-diagnostics"><h2>{c.intervals}</h2><p>{data.diagnostic_note?.[locale]}</p><label>{c.slice}<select aria-label={c.slice} value={chosen} onChange={e=>setSlice(e.target.value)}>{groups.map(g=><option key={g} value={g}>{c[g] ?? g}</option>)}</select></label><p>{chart.metric[locale]}</p><StudyComparisonChart chart={chart} locale={locale}/><div className="table-scroll"><table className="factor-table"><thead><tr>{[c.comparison,c.sample,c.difference,c.interval,c.block].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}><th>{chart.categories[i][locale]}</th><td>{row.n}</td><td>{format(row.mean_difference,percent)}</td><td>[{format(row.lower,percent)}, {format(row.upper,percent)}]</td><td>{row.block}</td></tr>)}</tbody></table></div></section>}
 {!!data.calibration?.length && <ForecastCalibration data={data}/>}
 <section className="panel study-decision-queue"><h2>{c.queue}</h2><p><strong>{c[data.decision] ?? data.decision}</strong></p><p>{data.resume_when[locale]}</p>{data.next_tasks.map(task=><article className="hub-change" key={task.id}><span className="tag">{task.priority} · {c[task.status]}</span><p>{task.action[locale]}</p><p><strong>{c.acceptance}</strong> {task.acceptance[locale]}</p></article>)}</section>
 </section>
}
export default function StudyNavigation({ study }: { study: Study }) {
 const { copy } = useLocale(), [data,setData]=useState<StudyNavigationData|null>(null),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0)
 useEffect(()=>{const controller=new AbortController();setData(null);setFailed(false);const asset=study.navigation_asset
 if (!asset || !/^data\/study-navigation\/[a-z0-9-]+\.json$/.test(asset)) {setFailed(true);return}
 fetch(`${import.meta.env.BASE_URL}${asset}`,{signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(value=>{if(!isStudyNavigation(value,study.id,study.source_ref))throw Error();if(!controller.signal.aborted)setData(value)}).catch(()=>{if(!controller.signal.aborted)setFailed(true)});return()=>controller.abort()
 },[study.id,study.source_ref,study.navigation_asset,attempt])
 if(failed)return <section className="panel" role="status"><p>{copy.studyNavigation.unavailable}</p><button onClick={()=>setAttempt(v=>v+1)}>{copy.retry}</button></section>
 return data?<Content key={study.id} data={data}/>:<p className="panel" role="status">{copy.loading}</p>
}
