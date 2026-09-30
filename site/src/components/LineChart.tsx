import ReactECharts from 'echarts-for-react/esm/core'
import echarts from '../echarts'

export default function LineChart({ dates, series }: { dates: string[]; series: Array<{ name: string; values: Array<number | null>; color: string }> }) {
  if (!dates.length || !series.some((item) => item.values.some((value) => value !== null))) return <div className="chart-empty">暂无可绘制的数据</div>
  return <ReactECharts echarts={echarts} style={{ height: 300 }} option={{ animation: false, tooltip: { trigger: 'axis', backgroundColor: '#fffefa', borderColor: '#d8d0c3', textStyle: { color: '#252525' } }, legend: { textStyle: { color: '#514b43' } }, grid: { left: 50, right: 20, top: 35, bottom: 35 }, xAxis: { type: 'category', data: dates, axisLabel: { color: '#81796e', hideOverlap: true } }, yAxis: { type: 'value', axisLabel: { color: '#81796e' }, splitLine: { lineStyle: { color: '#e8e1d6' } } }, series: series.map((item) => ({ name: item.name, type: 'line', showSymbol: false, connectNulls: false, data: item.values, lineStyle: { color: item.color, width: 2 }, itemStyle: { color: item.color } })) }} />
}
