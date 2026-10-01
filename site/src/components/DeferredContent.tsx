import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'

export default function DeferredContent({ children, minHeight, label = 'Loading…', rootMargin = '320px 0px' }: { children: ReactNode; minHeight: number; label?: string; rootMargin?: string }) {
  const container = useRef<HTMLDivElement>(null)
  const [nearViewport, setNearViewport] = useState(false)

  useEffect(() => {
    if (!container.current) return
    if (!('IntersectionObserver' in window)) {
      setNearViewport(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearViewport(true)
        observer.disconnect()
      }
    }, { rootMargin })
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [rootMargin])

  return <div ref={container} style={{ minHeight }}>
    {nearViewport ? <Suspense fallback={<div className="chart-empty" style={{ minHeight }}>{label}</div>}>{children}</Suspense> : null}
  </div>
}
