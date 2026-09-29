export default function ContextStrip({ items }: { items: Array<{ label: string; value: string }> }) {
  return <dl className="context-strip">{items.map(({ label, value }) =>
    <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
  )}</dl>
}
