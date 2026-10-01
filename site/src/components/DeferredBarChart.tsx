import { lazy } from 'react'
import DeferredContent from './DeferredContent'

const BarChart = lazy(() => import('./BarChart'))

type Props = { labels: string[]; values: Array<number | null>; colors: string[]; percent?: boolean; loadingLabel?: string }

export default function DeferredBarChart({ loadingLabel = 'Loading chart…', ...props }: Props) {
  return <DeferredContent minHeight={280} rootMargin="80px 0px" label={loadingLabel}><BarChart {...props} /></DeferredContent>
}
