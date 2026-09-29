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
import { initialLocale, LocaleContext, useLocale, type Copy, type Locale } from './i18n'

function pathView(snapshot: Snapshot, catalog: FundamentalCatalog, fundamental: FundamentalSnapshot, studies: StudyCatalog, alpha810: Alpha810Snapshot, copy: Copy) {
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
  return <main className="empty"><h1>{copy.notFound}</h1><a href={import.meta.env.BASE_URL}>{copy.backHome}</a></main>
}

export default function App() {
  const [locale, setLocale] = useState<Locale>(initialLocale)
  return <LocaleContext.Provider value={{ locale, setLocale }}><AppContent /></LocaleContext.Provider>
}

function AppContent() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [fundamental, setFundamental] = useState<{ catalog: FundamentalCatalog; snapshot: FundamentalSnapshot } | null>(null)
  const [studies, setStudies] = useState<StudyCatalog | null>(null)
  const [alpha810, setAlpha810] = useState<Alpha810Snapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { copy, locale, setLocale } = useLocale()
  useEffect(() => { Promise.all([loadSnapshot(), loadFundamentalData(), loadStudies(), loadAlpha810Snapshot()]).then(([main, fundamentals, studyCatalog, alphaEvidence]) => { setSnapshot(main); setFundamental(fundamentals); setStudies(studyCatalog); setAlpha810(alphaEvidence) }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : copy.loadError)) }, [copy.loadError])
  if (error) return <main className="empty"><h1>{copy.loadError}</h1><p>{error}</p><button onClick={() => window.location.reload()}>{copy.retry}</button></main>
  if (!snapshot || !fundamental || !studies || !alpha810) return <main className="empty"><p>{copy.loading}</p></main>
  const pathname = window.location.pathname
  const active = (segment: string) => pathname.includes(segment) ? 'active' : undefined
  const switchLocale = () => {
    const next = locale === 'en-US' ? 'zh-CN' : 'en-US'
    try { window.localStorage.setItem('quant-factor-locale', next) } catch { /* storage is optional */ }
    setLocale(next)
  }
  return <><header className="site-header"><div className="site-masthead"><a className="brand" href={import.meta.env.BASE_URL}><span className="brand-kicker">QUANT FACTOR</span><strong>OBSERVATORY</strong></a><div className="site-meta"><strong>{copy.brandMeta}</strong><span>{copy.brandMetaSub}</span></div></div><nav className="site-nav"><a className={pathname.endsWith('/') || pathname.endsWith('index.html') ? 'active' : undefined} href={import.meta.env.BASE_URL}>{copy.nav.overview}</a><a className={active('alpha810')} href={`${import.meta.env.BASE_URL}alpha810`}>{copy.nav.alpha810}</a><a className={active('factors')} href={`${import.meta.env.BASE_URL}factors`}>{copy.nav.factors}</a><a className={active('studies')} href={`${import.meta.env.BASE_URL}studies`}>{copy.nav.studies}</a><a className={active('fundamentals')} href={`${import.meta.env.BASE_URL}fundamentals`}>{copy.nav.fundamentals}</a><a className={active('jumps')} href={`${import.meta.env.BASE_URL}jumps`}>{copy.nav.jumps}</a><a className={active('hermite')} href={`${import.meta.env.BASE_URL}hermite`}>{copy.nav.hermite}</a><button type="button" className="locale-toggle" onClick={switchLocale} aria-label={`Switch to ${copy.switchTo}`}>{copy.switchTo}</button></nav></header>{pathView(snapshot, fundamental.catalog, fundamental.snapshot, studies, alpha810, copy)}<footer className="site-footer"><span>quant-factor-observatory · {pathname.startsWith('/studies') ? copy.nav.studies : snapshot.source === 'demo' ? 'Demo snapshot' : 'Public research snapshot'}</span><span>{copy.footerNote}</span></footer></>
}
