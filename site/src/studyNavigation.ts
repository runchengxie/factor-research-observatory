import type { BilingualText } from './studyExploration'
export type NavigationTask = { id: string; priority: string; status: string; action: BilingualText; acceptance: BilingualText }
export type DiagnosticInterval = { horizon?: string; arm?: string; year?: number; target?: string; model?: string; baseline: string; n: number; mean_difference: number; lower: number; upper: number; block: number }
export type StudyNavigationData = {
 schema_version: string; study_id: string; source_ref: string; source_revision: string; reviewed_at: string; authority_ref: string
 trust: { dimension: string; status: string; detail: BilingualText; source_refs: string[] }[]
 reproduction: { run_id: string; status: string; code_revision: string | null; runner_sha256: string | null; data_version: BilingualText; missing: BilingualText; source_refs: string[]; artifact_sha256?: Record<string,string> | null }
 scale_slices?: { year:number; target:string; model:string; current_revenue_quartile:number; n:number; mae_difference:number }[]
 calibration?: { year:number; target:string; model:string; forecast_decile:number; n:number; mean_forecast_transformed:number|null; mean_actual_transformed:number|null }[]
 decision: string; resume_when: BilingualText; next_tasks: NavigationTask[]; diagnostic_intervals: DiagnosticInterval[]; diagnostic_note: BilingualText | null
}
export function isStudyNavigation(value: unknown, studyId: string, sourceRef?: string): value is StudyNavigationData {
 if (!value || typeof value !== 'object') return false
 const d = value as StudyNavigationData
 const text = (v: BilingualText) => !!v && typeof v['en-US'] === 'string' && typeof v['zh-CN'] === 'string'
 const refs = (v: string[]) => Array.isArray(v) && v.length > 0 && v.every(s => typeof s === 'string' && s.startsWith('doc:quant-research.'))
 if (d.schema_version !== 'observatory.study_navigation.v1' || d.study_id !== studyId || d.source_ref !== sourceRef || !/^[a-f0-9]{40}$/.test(d.source_revision) || !/^\d{4}-\d{2}-\d{2}$/.test(d.reviewed_at) || !refs([d.authority_ref])) return false
 const dimensions = ['announcement_clock','financial_versions','historical_universe','delisting_and_terminal','execution_timing','transaction_costs']
 if (!Array.isArray(d.trust) || d.trust.length !== 6 || new Set(d.trust.map(c => c?.dimension)).size !== 6 || !d.trust.every(c => c && dimensions.includes(c.dimension) && ['qualified','partial','unverified','failed','protocol_only','not_applicable'].includes(c.status) && text(c.detail) && refs(c.source_refs))) return false
 const r = d.reproduction
 if (!r || typeof r.run_id !== 'string' || !['external_partial','partial','protocol_only','archive_partial','not_run','artifact_verified'].includes(r.status) || !text(r.data_version) || !text(r.missing) || !refs(r.source_refs)) return false
 if ((r.code_revision !== null && !/^[a-f0-9]{40}$/.test(r.code_revision)) || (r.runner_sha256 !== null && !/^[a-f0-9]{64}$/.test(r.runner_sha256))) return false
 if (r.artifact_sha256 != null && (typeof r.artifact_sha256 !== 'object' || Array.isArray(r.artifact_sha256) || !Object.entries(r.artifact_sha256).every(([name,hash])=>/^[a-zA-Z0-9_.-]+$/.test(name) && typeof hash==='string' && /^[a-f0-9]{64}$/.test(hash)))) return false
 if (!text(d.resume_when) || typeof d.decision !== 'string' || !Array.isArray(d.next_tasks) || !d.next_tasks.every(t => t && typeof t.id === 'string' && ['P0','P1','P2'].includes(t.priority) && ['ready','blocked','completed','waiting_labels'].includes(t.status) && text(t.action) && text(t.acceptance))) return false
 if (d.scale_slices && (!Array.isArray(d.scale_slices) || !d.scale_slices.every(r=>r && Number.isInteger(r.year) && ['revenue','net_profit'].includes(r.target) && ['ridge','xgboost'].includes(r.model) && Number.isInteger(r.current_revenue_quartile) && r.current_revenue_quartile>=0 && r.current_revenue_quartile<=4 && Number.isInteger(r.n) && r.n>0 && Number.isFinite(r.mae_difference)))) return false
 if (d.calibration && (!Array.isArray(d.calibration) || !d.calibration.every(r=>r && Number.isInteger(r.year) && ['revenue','net_profit'].includes(r.target) && ['persistence','ridge','xgboost'].includes(r.model) && Number.isInteger(r.forecast_decile) && r.forecast_decile>=1 && r.forecast_decile<=10 && Number.isInteger(r.n) && r.n>=0 && [r.mean_forecast_transformed,r.mean_actual_transformed].every(v=>r.n===0?v===null:typeof v==='number' && Number.isFinite(v))))) return false
 return Array.isArray(d.diagnostic_intervals) && (!d.diagnostic_note || text(d.diagnostic_note)) && d.diagnostic_intervals.every(i => i && ['n','mean_difference','lower','upper','block'].every(k => Number.isFinite(i[k as keyof DiagnosticInterval])) && typeof i.baseline === 'string' && i.lower <= i.upper && Number.isInteger(i.n) && i.n > 0 && Number.isInteger(i.block) && i.block > 0 && (typeof i.horizon === 'string' && typeof i.arm === 'string' || Number.isInteger(i.year) && ['revenue','net_profit'].includes(i.target ?? '') && ['ridge','xgboost'].includes(i.model ?? '')))
}
