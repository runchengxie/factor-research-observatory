import type { StudyCatalog } from '../types'
import { useLocale } from '../i18n'
import { ResearchEvidenceHub } from '../components/ResearchEvidenceHub'

export default function ResearchEvidencePage({ catalog }: { catalog: StudyCatalog }) {
  const { copy } = useLocale()
  return <main className="page study-page">
    <a className="back" href={`${import.meta.env.BASE_URL}studies`}>{copy.researchHub.back}</a>
    <ResearchEvidenceHub catalog={catalog} />
  </main>
}
