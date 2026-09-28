import { useEffect, useState } from 'react'
import { loadAlpha810Snapshot, loadFundamentalData, loadSnapshot, loadStudies } from './data'
import { buildResearchContext, toResearchRecords } from './research'
import type { Alpha810Snapshot, FundamentalCatalog, FundamentalSnapshot, Snapshot, StudyCatalog } from './types'
import OverviewPage from './pages/OverviewPage'
import FactorPage from './pages/FactorPage'
import JumpPage from './pages/JumpPage'
import HermitePage from './pages/HermitePage'
import FundamentalsPage from './pages/FundamentalsPage'
import FactorExplorerPage from './pages/FactorExplorerPage'
import { StudiesPage, StudyDetailPage } from './pages/StudiesPage'
import Alpha810OverviewPage from './pages/Alpha810OverviewPage'
import Alpha810FactorPage from './pages/Alpha810FactorPage'

function pathView(snapshot: Snapshot, catalog: FundamentalCatalog, fundamental: FundamentalSnapshot, studies: StudyCatalog, alpha810: Alpha810Snapshot) {
  const records = toResearchRecords(snapshot, catalog, fundamental)
  const context = buildResearchContext(snapshot, fundamental)
  const path = window.location.pathname.replace(import.meta.env.BASE_URL, '').replace(/^\//, '')
  if (path === '' || path === 'index.html') return <OverviewPage snapshot={snapshot} records={records} context={context} />
  if (path === 'jumps') return <JumpPage snapshot={snapshot} />
  if (path === 'hermite') return <HermitePage snapshot={snapshot} />
  if (path === 'fundamentals') return <FundamentalsPage catalog={catalog} snapshot={fundamental} />
  if (path === 'studies') return <StudiesPage catalog={studies} />
  if (path.startsWith('studies/')) return <StudyDetailPage study={studies.studies.find((item) => item.id === path.slice(8))} />
  if (path === 'factors') return <FactorExplorerPage records={records} context={context} />
  if (path.startsWith('factors/')) {
    const factor = records.find((item) => item.id === decodeURIComponent(path.slice(8)))
    return <FactorPage factor={factor} context={context} />
  }
  if (path === 'alpha810') return <Alpha810OverviewPage snapshot={alpha810} />
  if (path.startsWith('alpha810/factors/')) return <Alpha810FactorPage factor={alpha810.factors.find((item) => item.name === decodeURIComponent(path.slice(17)))} snapshot={alpha810} />
  return <main className="empty"><h1>找不到这个页面</h1><a href={import.meta.env.BASE_URL}>返回总览</a></main>
}

export default function App() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [fundamental, setFundamental] = useState<{ catalog: FundamentalCatalog; snapshot: FundamentalSnapshot } | null>(null)
  const [studies, setStudies] = useState<StudyCatalog | null>(null)
  const [alpha810, setAlpha810] = useState<Alpha810Snapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { Promise.all([loadSnapshot(), loadFundamentalData(), loadStudies(), loadAlpha810Snapshot()]).then(([main, fundamentals, studyCatalog, alphaEvidence]) => { setSnapshot(main); setFundamental(fundamentals); setStudies(studyCatalog); setAlpha810(alphaEvidence) }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : '加载失败')) }, [])
  if (error) return <main className="empty"><h1>研究快照加载失败</h1><p>{error}</p><button onClick={() => window.location.reload()}>重试</button></main>
  if (!snapshot || !fundamental || !studies || !alpha810) return <main className="empty"><p>正在加载研究快照…</p></main>
  const pathname = window.location.pathname
  const active = (segment: string) => pathname.includes(segment) ? 'active' : undefined
  return <><header className="site-header"><div className="site-masthead"><a className="brand" href={import.meta.env.BASE_URL}><span className="brand-kicker">QUANT FACTOR</span><strong>OBSERVATORY</strong></a><div className="site-meta"><strong>Public Research Layer</strong><span>Sanitized evidence archive</span></div></div><nav className="site-nav"><a className={pathname.endsWith('/') || pathname.endsWith('index.html') ? 'active' : undefined} href={import.meta.env.BASE_URL}>总览</a><a className={active('alpha810')} href={`${import.meta.env.BASE_URL}alpha810`}>Alpha 810</a><a className={active('factors')} href={`${import.meta.env.BASE_URL}factors`}>因子目录</a><a className={active('studies')} href={`${import.meta.env.BASE_URL}studies`}>研究专题</a><a className={active('fundamentals')} href={`${import.meta.env.BASE_URL}fundamentals`}>基本面研究</a><a className={active('jumps')} href={`${import.meta.env.BASE_URL}jumps`}>跳跃分解</a><a className={active('hermite')} href={`${import.meta.env.BASE_URL}hermite`}>Hermite 体制</a></nav></header>{pathView(snapshot, fundamental.catalog, fundamental.snapshot, studies, alpha810)}<footer className="site-footer"><span>quant-factor-observatory · {pathname.startsWith('/studies') ? 'Research studies' : snapshot.source === 'demo' ? 'Demo snapshot' : 'Public research snapshot'}</span><span>研究展示，不构成交易建议</span></footer></>
}
