export default function MetricCard({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: 'warn' | 'fail' | 'pass' }) {
  return <div className={`metric-card${tone ? ` metric-${tone}` : ''}`}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>
}
