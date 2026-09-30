import ReactECharts from 'echarts-for-react/lib/core'
import echarts from '../echarts'

export default function BarChart({ labels, values, colors, percent = false }: { labels: string[]; values: Array<number | null>; colors: string[]; percent?: boolean }) {
  if (!labels.length || !values.some((value) => value !== null)) return <div className="chart-empty">暂无可绘制的数据</div>
  return <ReactECharts echarts={echarts} style={{ height: 280 }} option={{ animation: false, tooltip: { trigger: 'axis', valueFormatter: (value: number) => value === null ? '—' : percent ? `${value.toFixed(3)}%` : `${value}` }, grid: { left: 65, right: 20, top: 20, bottom: 35 }, xAxis: { type: 'category', data: labels, axisLabel: { color: '#81796e' } }, yAxis: { type: 'value', scale: false, axisLabel: { color: '#81796e', formatter: (value: number) => percent ? `${value.toFixed(2)}%` : `${value}` }, splitLine: { lineStyle: { color: '#e8e1d6' } } }, series: [{ type: 'bar', barMaxWidth: 58, data: values.map((value, index) => ({ value: value === null ? null : percent ? value * 100 : value, itemStyle: { color: colors[index] } })), markLine: { silent: true, symbol: 'none', lineStyle: { color: '#81796e', width: 1 }, label: { show: false }, data: [{ yAxis: 0 }] } }] }} />
}
