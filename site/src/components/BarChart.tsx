import ChartSvg from './ChartSvg'
export default function BarChart({ labels, values, colors, percent = false }: { labels: string[]; values: Array<number | null>; colors: string[]; percent?: boolean }) {
  if (!labels.length || !values.some((value) => value !== null)) return <div className="chart-empty">暂无可绘制的数据</div>
  return <ChartSvg kind="bar" labels={labels} values={values} colors={colors} percent={percent} height={280} description={labels.map((label, i) => `${label}: ${values[i] ?? '—'}`).join('; ')} />
}
