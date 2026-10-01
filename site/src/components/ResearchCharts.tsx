import ChartSvg from './ChartSvg'
import type { Alpha810FactorEvidence } from '../types'
type Props = { kind: 'family' | 'coverage' | 'rankic' | 'rankic-positive-rate' | 'scatter'; counts?: Array<{ name: string; value: number }>; factors?: Alpha810FactorEvidence[]; english: boolean }
const accent = '#b64d33'
const bar = '#d8a58b'
function histogram(values: number[], edges: number[]) { return edges.slice(0, -1).map((edge, index) => values.filter((value) => value >= edge && (index === edges.length - 2 ? value <= edges[index + 1] : value < edges[index + 1])).length) }
export default function ResearchCharts({ kind, counts = [], factors = [], english }: Props) {
  if (kind === 'family') {
    const points = counts.map((item, index) => ({ x: item.value, y: 0, label: item.name, color: index === counts.length - 1 ? accent : bar }))
    return <div className="research-chart"><ChartSvg kind="horizontal-bar" points={points} height={230} description={counts.map((item) => `${item.name}: ${item.value}`).join('; ')} /></div>
  }
  if (kind === 'scatter') {
    const points = factors.filter((factor) => factor.coverage.ratio !== null && factor.rank_ic.mean !== null).map((factor) => ({ x: factor.coverage.ratio as number, y: factor.rank_ic.mean as number, label: factor.name }))
    return <div className="research-chart"><ChartSvg kind="scatter" points={points} height={300} description={`${points.length} ${english ? 'factors with coverage and RankIC' : '个同时具有覆盖率与 RankIC 的因子'}`} /></div>
  }
  const isCoverage = kind === 'coverage' || kind === 'rankic-positive-rate'
  const edges = isCoverage ? [0, .2, .4, .6, .8, 1.000001] : (() => { const vals = factors.map((item) => item.rank_ic.mean).filter((value): value is number => value !== null && Number.isFinite(value)); const lo = vals.length ? Math.floor(Math.min(...vals) / .02) * .02 : -.02; const hi = vals.length ? Math.ceil(Math.max(...vals) / .02) * .02 : .02; return Array.from({ length: Math.max(2, Math.round((hi - lo) / .02) + 1) }, (_, i) => lo + i * .02) })()
  const values = histogram(factors.map((factor) => kind === 'coverage' ? factor.coverage.ratio : kind === 'rankic-positive-rate' ? factor.rank_ic.positive_rate : factor.rank_ic.mean).filter((value): value is number => value !== null && Number.isFinite(value)), edges)
  const labels = edges.slice(0, -1).map((edge) => isCoverage ? `${Math.round(edge * 100)}–${Math.round((edge + .2) * 100)}%` : `${edge.toFixed(2)}…${(edge + .02).toFixed(2)}`)
  const colors = values.map((_, i) => kind === 'coverage' ? (i < 4 ? accent : bar) : kind === 'rankic-positive-rate' ? (i >= 3 ? accent : bar) : bar)
  return <div className="research-chart"><ChartSvg kind="bar" labels={labels} values={values} colors={colors} height={300} description={values.map((value, i) => `${labels[i]}: ${value}`).join('; ')} /></div>
}
