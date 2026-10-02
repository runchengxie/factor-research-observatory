import { useState } from 'react'
import BarChart from '../components/BarChart'
import ContextStrip from '../components/ContextStrip'
import type { JumpRow, Snapshot } from '../types'
import { useLocale } from '../i18n'
import { explorationCopy } from '../explorationCopy'

const colors = ['#477a76', '#b64d33']
const closeEnough = (a: number | null, b: number | null) => a !== null && b !== null && Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= Math.max(Math.abs(b) * 1e-6, 1e-12)
const share = (part: number | null, whole: number | null) => part !== null && whole !== null && whole > 0 ? part / whole : null
const fixed = (value: number | null) => value === null || !Number.isFinite(value) ? '—' : value.toFixed(6)

function JumpBreakdown({ row, labels }: { row: JumpRow; labels: { component: string; value: string; share: string; jumpComposition: string; jumpShare: string; observedValues: string } }) {
  const rvParts = [
    { label: 'IVhat', value: row.ivhat, fraction: share(row.ivhat, row.rv) },
    { label: 'RJV', value: row.rjv, fraction: share(row.rjv, row.rv) },
  ]
  const jumpParts = [
    { label: 'RLJV', value: row.rljv, fraction: share(row.rljv, row.rjv) },
    { label: 'RSJV', value: row.rsjv, fraction: share(row.rsjv, row.rjv) },
  ]
  const tableRows = [
    { label: 'IVhat', value: row.ivhat, rv: share(row.ivhat, row.rv), rjv: null },
    { label: 'RJV', value: row.rjv, rv: share(row.rjv, row.rv), rjv: null },
    { label: 'RLJV', value: row.rljv, rv: share(row.rljv, row.rv), rjv: share(row.rljv, row.rjv) },
    { label: 'RSJV', value: row.rsjv, rv: share(row.rsjv, row.rv), rjv: share(row.rsjv, row.rjv) },
  ]
  return <>
    <div className="jump-chart-grid">
      <div><h3>{labels.share}</h3><BarChart labels={rvParts.map((item) => item.label)} values={rvParts.map((item) => item.fraction)} colors={colors} percent /></div>
      <div><h3>{labels.jumpComposition}</h3><BarChart labels={jumpParts.map((item) => item.label)} values={jumpParts.map((item) => item.fraction)} colors={['#c88b60', '#6d6b9a']} percent /></div>
    </div>
    <div className="table-scroll"><table className="factor-table jump-table"><thead><tr><th>{labels.component}</th><th>{labels.value}</th><th>{labels.share}</th><th>{labels.jumpShare}</th></tr></thead><tbody>{tableRows.map((item) => <tr key={item.label}><td>{item.label}</td><td>{fixed(item.value)}</td><td>{item.rv === null ? '—' : `${(item.rv * 100).toFixed(2)}%`}</td><td>{item.rjv === null ? '—' : `${(item.rjv * 100).toFixed(2)}%`}</td></tr>)}</tbody></table></div>
    <p className="annotation">{labels.observedValues}: RV = {fixed(row.rv)} · IVhat = {fixed(row.ivhat)} · RJV = {fixed(row.rjv)} · RLJV = {fixed(row.rljv)} · RSJV = {fixed(row.rsjv)}</p>
  </>
}

export default function JumpPage({ snapshot }: { snapshot: Snapshot }) {
  const { locale } = useLocale()
  const english = locale === 'en-US'
  const copy = explorationCopy[locale].jumps
  const rows = snapshot.jump_decomposition
  const optionKey = (row: JumpRow) => `${row.ticker}|${row.date}`
  const [observation, setObservation] = useState(rows[0] ? optionKey(rows[0]) : '')
  const row = rows.find((item) => optionKey(item) === observation) ?? rows[0]
  const hasIdentityValues = row !== undefined && [row.rv, row.ivhat, row.rjv, row.rljv, row.rsjv].every((value) => value !== null && Number.isFinite(value))
  const identitiesPass = hasIdentityValues && row ? closeEnough(row.ivhat! + row.rjv!, row.rv) && closeEnough(row.rljv! + row.rsjv!, row.rjv) : null
  const dataset = snapshot.datasets[0]

  return <main className="page">
    <a className="back" href={import.meta.env.BASE_URL}>{copy.back}</a>
    <section className="detail-head"><p className="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p className="lede">{copy.lede}</p><span className="badge">{snapshot.source === 'demo' ? copy.demo : `${snapshot.source} · ${dataset?.name ?? ''}`}</span></section>
    <section className="panel research-verdict"><h2>{copy.conclusionLabel}</h2><p className="lede">{copy.conclusion}</p><p className="panel-note">{copy.boundary}</p></section>
    <ContextStrip items={[
      { label: copy.observation, value: `${rows.length} ${english ? 'rows' : '条观测'}` },
      { label: copy.snapshotDate, value: dataset?.date_end ?? row?.date ?? '—' },
      { label: copy.illustrativeUniverse, value: `${dataset?.tickers ?? new Set(rows.map((item) => item.ticker)).size}` },
    ]} />
    <div className="jump-flow"><div><b>RV</b><span>{english ? 'Realized variance' : '实现方差'}</span></div><i>−</i><div><b>IVhat</b><span>{english ? 'Continuous variance estimate' : '连续方差估计'}</span></div><i>=</i><div className="accent"><b>RJV</b><span>{english ? 'Jump variance' : '跳跃方差'}</span></div><i>→</i><div><b>RLJV + RSJV</b><span>{english ? 'Large + small jumps' : '大跳跃 + 小跳跃'}</span></div></div>
    <section className="panel chart-panel exploration-panel">
      <div className="panel-head"><div><p className="eyebrow">{copy.observation}</p><h2>{row?.date ?? '—'} · {row?.ticker ?? '—'}</h2></div><label className="series-select">{copy.observation}<select aria-label={copy.observation} value={row ? optionKey(row) : ''} onChange={(event) => setObservation(event.target.value)}>{rows.map((item) => <option key={optionKey(item)} value={optionKey(item)}>{item.ticker} · {item.date}</option>)}</select></label></div>
      {row ? <>
        <p className={`decomposition-status ${identitiesPass === null ? 'is-unavailable' : identitiesPass ? 'is-valid' : 'is-invalid'}`} role="status">{identitiesPass === null ? copy.checkUnavailable : identitiesPass ? copy.checkPassed : copy.checkFailed}</p>
        <div className="section-heading"><h2>{copy.rvShare}</h2></div>
        <JumpBreakdown row={row} labels={{ component: copy.component, value: copy.value, share: copy.share, jumpComposition: copy.jumpComposition, jumpShare: copy.jumpShare, observedValues: copy.observedValues }} />
        <p className="panel-note">{copy.identity}</p>
      </> : <div className="chart-empty">{copy.noData}</div>}
    </section>
    <section className="research-boundary"><strong>{copy.demo}</strong> {copy.boundary}</section>
  </main>
}
