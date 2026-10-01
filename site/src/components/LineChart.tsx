import ChartSvg from './ChartSvg'
type Series = { name: string; values: Array<number | null>; color: string }
export default function LineChart({ dates, series, showLegend = true }: { dates: string[]; series: Series[]; showLegend?: boolean }) {
  if (!dates.length || !series.some((item) => item.values.some((value) => value !== null))) return <div className="chart-empty">暂无可绘制的数据</div>
  const displaySeries = series
  return <div className="line-chart"><ChartSvg kind="line" labels={dates} points={displaySeries} height={300} description={series.map((item) => item.name).join(', ')} />{showLegend && <div className="chart-legend">{series.map((item) => <span key={item.name}><i style={{ backgroundColor: item.color }} />{item.name}</span>)}</div>}</div>
}
