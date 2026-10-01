import { lazy } from 'react'
import DeferredContent from './DeferredContent'

const LineChart = lazy(() => import('./LineChart'))

type Props = { dates: string[]; series: Array<{ name: string; values: Array<number | null>; color: string }>; showLegend?: boolean; loadingLabel?: string }

export default function DeferredLineChart({ loadingLabel = 'Loading chart…', ...props }: Props) {
  return <DeferredContent minHeight={320} rootMargin="80px 0px" label={loadingLabel}><LineChart {...props} /></DeferredContent>
}
