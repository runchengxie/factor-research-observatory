import { useState } from 'react'
import { useLocale } from '../i18n'
import type { StudyNavigationData } from '../studyNavigation'
import StudyComparisonChart from './StudyComparisonChart'
import type { ExplorationChart } from '../studyExploration'

export default function ForecastCalibration({ data }: { data: StudyNavigationData }) {
 const { locale, copy } = useLocale(), c=copy.studyNavigation
 const [target,setTarget]=useState('revenue'),[year,setYear]=useState(2023),[model,setModel]=useState('ridge')
 const cells=(data.calibration ?? []).filter(r=>r.target===target && r.year===year && r.model===model)
 const slices=(data.scale_slices ?? []).filter(r=>r.target===target && r.year===year && r.model===model)
 if(!cells.length)return null
 const label=(value:string)=>({'en-US':value,'zh-CN':value})
 const chart:ExplorationChart={id:'calibration',title:label(c.calibration),metric:label(c.transformedUnits),context:label(c.calibrationNote),interpretation:label(''),unit:'number',categories:cells.map(r=>label(String(r.forecast_decile))),series:[{id:'forecast',label:label(c.forecast),values:cells.map(r=>r.mean_forecast_transformed)},{id:'actual',label:label(c.actual),values:cells.map(r=>r.mean_actual_transformed)}],source_ids:[]}
 const format=(value:number|null)=>value===null?'—':new Intl.NumberFormat(locale,{maximumFractionDigits:3}).format(value)
 return <section className="panel forecast-calibration"><h2>{c.calibration}</h2><p>{c.calibrationNote}</p><div className="hub-filters"><label>{c.target}<select aria-label={c.target} value={target} onChange={e=>setTarget(e.target.value)}>{['revenue','net_profit'].map(t=><option key={t} value={t}>{c['target_'+t]}</option>)}</select></label><label>{c.year}<select aria-label={c.year} value={year} onChange={e=>setYear(Number(e.target.value))}>{[2023,2024,2025].map(y=><option key={y} value={y}>{y}</option>)}</select></label><label>{c.model}<select aria-label={c.model} value={model} onChange={e=>setModel(e.target.value)}>{['persistence','ridge','xgboost'].map(m=><option key={m} value={m}>{c[m]}</option>)}</select></label></div><p>{c.transformedUnits}</p><StudyComparisonChart chart={chart} locale={locale}/><details><summary>{copy.studyExploration.values}</summary><div className="table-scroll"><table className="factor-table"><thead><tr>{[c.decile,c.sample,c.forecast,c.actual].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>{cells.map(r=><tr key={r.forecast_decile}><th>{r.forecast_decile}</th><td>{r.n}</td><td>{format(r.mean_forecast_transformed)}</td><td>{format(r.mean_actual_transformed)}</td></tr>)}</tbody></table></div></details><h3>{c.scale}</h3><p>{c.scaleNote}</p>{slices.length ? <div className="table-scroll"><table className="factor-table"><thead><tr>{[c.quartile,c.sample,c.maeDifference].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>{slices.map(r=><tr key={r.current_revenue_quartile}><th>{r.current_revenue_quartile===0?c.missingGroup:r.current_revenue_quartile}</th><td>{r.n}</td><td>{format(r.mae_difference)}</td></tr>)}</tbody></table></div>:<p>{c.baselineSlice}</p>}</section>
}
