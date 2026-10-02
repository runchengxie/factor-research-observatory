import type { BilingualText } from './studyExploration'
export type ConclusionChange = { id: string; kind: string; period: BilingualText; before: BilingualText; trigger: BilingualText; after: BilingualText; source_ids: string[] }
export type ComparisonGroup = { id: string; study_id: string; chart_id: string; mode: 'models' | 'variants'; baseline_id: string; series_ids: string[] | null; direction: 'higher' | 'lower'; reviewed_at: string; label: BilingualText; scope: BilingualText }
export type ResearchHub = { schema_version: string; reviewed_at: string; comparison_groups: ComparisonGroup[]; change_entries: (ConclusionChange & { study_id: string; source_ref: string })[] }
