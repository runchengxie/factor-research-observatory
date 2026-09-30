import ReactECharts from 'echarts-for-react/esm/core'
import echarts from '../echarts'
import type { Alpha810FactorEvidence } from '../types'

type Props = {
  kind: 'family' | 'coverage' | 'rankic' | 'scatter'
  counts?: Array<{ name: string; value: number }>
  factors?: Alpha810FactorEvidence[]
  english: boolean
}

const ink = '#514b43'
const muted = '#81796e'
const grid = '#e8e1d6'
const accent = '#b64d33'
const bar = '#d8a58b'
const common = { animation: false, textStyle: { color: ink, fontFamily: 'Manrope, sans-serif' }, tooltip: { trigger: 'axis', backgroundColor: '#fffefa', borderColor: '#d8d0c3', textStyle: { color: '#252525' } }, grid: { left: 60, right: 30, top: 22, bottom: 45 }, xAxis: { axisLine: { lineStyle: { color: muted } }, axisLabel: { color: muted } }, yAxis: { axisLabel: { color: muted }, splitLine: { lineStyle: { color: grid } } } }

function histogram(values: number[], edges: number[]) {
  return edges.slice(0, -1).map((edge, index) => values.filter((value) => value >= edge && (index === edges.length - 2 ? value <= edges[index + 1] : value < edges[index + 1])).length)
}

export default function ResearchCharts({ kind, counts = [], factors = [], english }: Props) {
  let option
  let description
  if (kind === 'family') {
    option = { ...common, grid: { left: 165, right: 45, top: 16, bottom: 30 }, tooltip: { ...common.tooltip, trigger: 'item' }, xAxis: { type: 'value', min: 0, axisLabel: { color: muted }, splitLine: { lineStyle: { color: grid } } }, yAxis: { type: 'category', data: counts.map((item) => item.name), axisLabel: { color: ink }, axisLine: { show: false }, axisTick: { show: false } }, series: [{ type: 'bar', barMaxWidth: 26, data: counts.map((item, index) => ({ value: item.value, itemStyle: { color: index === counts.length - 1 ? accent : bar } })), label: { show: true, position: 'right', color: ink } }] }
    description = counts.map((item) => `${item.name}: ${item.value}`).join('; ')
  } else if (kind === 'coverage') {
    const edges = [0, .2, .4, .6, .8, 1.000001]
    const values = histogram(factors.map((factor) => factor.coverage.ratio).filter((value): value is number => value !== null), edges)
    option = { ...common, xAxis: { type: 'category', data: ['0–20%', '20–40%', '40–60%', '60–80%', '80–100%'], axisLabel: { color: muted } }, yAxis: { type: 'value', minInterval: 1, axisLabel: { color: muted }, splitLine: { lineStyle: { color: grid } } }, series: [{ type: 'bar', barMaxWidth: 48, data: values.map((value, index) => ({ value, itemStyle: { color: index < 4 ? accent : bar } })) }] }
    description = values.map((value, index) => `${['0–20%', '20–40%', '40–60%', '60–80%', '80–100%'][index]}: ${value}`).join('; ')
  } else if (kind === 'rankic') {
    const validRankIc = factors.map((factor) => factor.rank_ic.mean).filter((value): value is number => value !== null && Number.isFinite(value))
    const lower = validRankIc.length ? Math.floor(Math.min(...validRankIc) / .02) * .02 : -.02
    const upper = validRankIc.length ? Math.ceil(Math.max(...validRankIc) / .02) * .02 : .02
    const edges = Array.from({ length: Math.max(2, Math.round((upper - lower) / .02) + 1) }, (_, index) => lower + index * .02)
    const values = histogram(validRankIc, edges)
    const labels = edges.slice(0, -1).map((edge) => `${edge.toFixed(2)}…${(edge + .02).toFixed(2)}`)
    option = { ...common, grid: { left: 50, right: 22, top: 22, bottom: 68 }, xAxis: { type: 'category', data: labels, axisLabel: { color: muted, rotate: 40 } }, yAxis: { type: 'value', minInterval: 1, axisLabel: { color: muted }, splitLine: { lineStyle: { color: grid } } }, series: [{ type: 'bar', barMaxWidth: 40, data: values, itemStyle: { color: bar } }] }
    description = values.map((value, index) => `${labels[index]}: ${value}`).join('; ')
  } else {
    const points = factors.filter((factor) => factor.coverage.ratio !== null && factor.rank_ic.mean !== null).map((factor) => ({ name: factor.name, value: [factor.coverage.ratio, factor.rank_ic.mean] }))
    option = { ...common, tooltip: { ...common.tooltip, trigger: 'item', formatter: (item: { data: { name: string; value: number[] } }) => `${item.data.name}<br/>${english ? 'Coverage' : '覆盖率'}: ${(item.data.value[0] * 100).toFixed(1)}%<br/>RankIC: ${item.data.value[1].toFixed(3)}` }, xAxis: { type: 'value', min: 0, max: 1, name: english ? 'Coverage' : '覆盖率', nameLocation: 'middle', nameGap: 30, axisLabel: { color: muted, formatter: (value: number) => `${Math.round(value * 100)}%` }, splitLine: { lineStyle: { color: grid } } }, yAxis: { type: 'value', name: 'RankIC', axisLabel: { color: muted }, splitLine: { lineStyle: { color: grid } } }, series: [{ type: 'scatter', data: points, symbolSize: 5, itemStyle: { color: accent, opacity: .5 } }] }
    description = `${points.length} ${english ? 'factors with coverage and RankIC' : '个同时具有覆盖率与 RankIC 的因子'}`
  }
  return <div className="research-chart" role="img" aria-label={description}><ReactECharts echarts={echarts} option={option} style={{ height: kind === 'family' ? 230 : 300, width: '100%' }} /></div>
}
