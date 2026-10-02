import { useMemo, useState } from 'react'
import LineChart from '../components/LineChart'
import ContextStrip from '../components/ContextStrip'
import type { Snapshot } from '../types'
import { useLocale } from '../i18n'
import { explorationCopy } from '../explorationCopy'

const metricIds = ['vol_rv_ts_closeness_60', 'h_daily_close60_ts_h3_60', 'h_daily_close60_ts_h4_60']
const colors: Record<string, string> = {
  vol_rv_ts_closeness_60: '#b64d33',
  h_daily_close60_ts_h3_60: '#477a76',
  h_daily_close60_ts_h4_60: '#6d6b9a',
}

export default function HermitePage({ snapshot }: { snapshot: Snapshot }) {
  const { locale } = useLocale()
  const copy = explorationCopy[locale].hermite
  const [metric, setMetric] = useState(metricIds[0])
  const seriesForMetric = useMemo(() => snapshot.series.filter((item) => item.metric === metric), [snapshot.series, metric])
  const tickers = [...new Set(seriesForMetric.map((item) => item.ticker))]
  const [ticker, setTicker] = useState(tickers[0] ?? '')
  const activeTicker = tickers.includes(ticker) ? ticker : tickers[0] ?? ''
  const selected = seriesForMetric.find((item) => item.ticker === activeTicker)
  const values = selected?.values ?? []
  const validCount = values.filter((value) => value !== null).length
  const metricCopy = copy.metrics[metric]
  const dataset = snapshot.datasets[0]
  const dates = selected?.dates ?? []

  return <main className="page">
    <a className="back" href={import.meta.env.BASE_URL}>{copy.back}</a>
    <section className="detail-head">
      <p className="eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p className="lede">{copy.lede}</p>
      <span className="badge">{snapshot.source === 'demo' ? copy.demo : `${snapshot.source} · ${dataset?.name ?? ''}`}</span>
    </section>
    <section className="panel research-verdict"><h2>{copy.conclusionLabel}</h2><p className="lede">{copy.conclusion}</p><p className="panel-note">{copy.boundary}</p></section>
    <ContextStrip items={[
      { label: copy.coverage, value: `${dataset?.date_start ?? '—'} → ${dataset?.date_end ?? '—'}` },
      { label: copy.ticker, value: `${dataset?.tickers ?? tickers.length} · ${tickers.join(', ') || '—'}` },
      { label: copy.observations, value: `${dataset?.trading_days ?? dates.length}` },
    ]} />
    <section className="panel chart-panel exploration-panel">
      <div className="exploration-controls">
        <label>{copy.metric}<select aria-label={copy.metric} value={metric} onChange={(event) => setMetric(event.target.value)}>
          {metricIds.filter((id) => snapshot.series.some((item) => item.metric === id)).map((id) => <option key={id} value={id}>{copy.metrics[id].label}</option>)}
        </select></label>
        <label>{copy.ticker}<select aria-label={copy.ticker} value={activeTicker} onChange={(event) => setTicker(event.target.value)}>
          {tickers.map((item) => <option key={item} value={item}>{item}</option>)}
        </select></label>
      </div>
      {selected && metricCopy ? <>
        <div className="section-heading"><p className="eyebrow">{copy.series} · {metric}</p><h2>{metricCopy.title}</h2><p className="panel-note">{metricCopy.description}</p></div>
        <LineChart dates={dates} showLegend={false} series={[{ name: metricCopy.label, values, color: colors[metric] ?? '#b64d33' }]} />
        <p className="chart-caption">{dates[0] ?? '—'} → {dates[dates.length - 1] ?? '—'} · {validCount} {copy.observations}</p>
      </> : <div className="chart-empty">{copy.noSeries}</div>}
    </section>
    <section className="research-boundary"><strong>{copy.demo}</strong> {copy.boundary}</section>
  </main>
}
