import { createContext, useContext } from 'react'

export type Locale = 'en-US' | 'zh-CN'

export type Copy = {
  brandMeta: string
  brandMetaSub: string
  nav: Record<string, string>
  footerNote: string
  switchTo: string
  themeToggle: string
  loading: string
  loadError: string
  retry: string
  notFound: string
  backHome: string
  overview: Record<string, string>
  studies: Record<string, string>
  studyQuestions: Record<string, string>
  factor: Record<string, string>
  alpha810: Record<string, string>
}

const COPY: Record<Locale, Copy> = {
  'en-US': {
    brandMeta: 'Public Research Layer', brandMetaSub: 'Sanitized evidence archive',
    nav: { overview: 'Overview', alpha810: 'Alpha 810', factors: 'Factor catalog', studies: 'Research studies', fundamentals: 'Fundamentals', jumps: 'Jump decomposition', hermite: 'Hermite regime' },
    footerNote: 'Research display only; not investment advice', switchTo: '中文', themeToggle: 'Dark mode', loading: 'Loading research snapshot…', loadError: 'Research snapshot failed to load', retry: 'Retry', notFound: 'Page not found', backHome: 'Back to overview',
    overview: { eyebrow: 'RESEARCH NOTEBOOK / 01', title: 'Turn market data into readable structure.', lede: 'Explore how intraday volatility, jumps, Hermite states, and changes in reported fundamentals form a factor research map.', data: 'Data', range: 'Range', universe: 'Universe', frequency: 'Frequency', pit: 'PIT', tradingDays: 'Trading days', coveredStocks: 'Covered stocks', factorCount: 'Total factors', experimental: 'Experimental', crossSection: 'A-share cross-section', notValidated: 'Predictive validation is incomplete', factorAtlas: 'FACTOR ATLAS', factorMap: 'Factor map', browse: 'Browse all factors →', fundamentals: 'Fundamental operating states', pipeline: 'THE PIPELINE', pipelineTitle: 'From raw data to regime signals', recentResearch: 'RECENT RESEARCH', publishedEvidence: 'What the published evidence says', evidenceBoundary: 'Evidence boundary', snapshotGenerated: 'Snapshot generated', studiesUpdated: 'Studies updated', recentResearchNote: 'Highlights retain their published caveats.' },
    factor: { evidenceCard: 'EVIDENCE CARD', question: 'Research question', interpretation: 'Research interpretation', sample: 'Sample / vintage', coverage: 'Current coverage', status: 'Evidence status', currentEvidence: 'Current published evidence', noEvidence: 'No predictive evidence has been published for this factor. Treat the definition as a research hypothesis or descriptive measure.', sourceDate: 'Market snapshot generated', pitVintage: 'PIT vintage' },
    alpha810: { stability: 'TEMPORAL CONSISTENCY SUMMARY', stabilityTitle: 'How often is RankIC positive?', stabilityNote: 'Each factor is grouped by its positive RankIC rate across the full observation window. This summarizes sign consistency over valid dates; it does not show year-by-year or market-regime stability.', meanPositive: 'Mean positive RankIC rate', noStability: 'No positive-rate observations are available.', directionConsistency: 'Direction consistency', groupSpread: 'Highest minus lowest group', snapshotInterval: 'Snapshot interval', fullWindow: 'Full-window aggregate. Subperiod and regime splits are not published.', spreadNote: 'Difference between aggregate group means per return observation; no compounding or costs.', annualEvidence: 'TEMPORAL STABILITY', annualTitle: 'How did the factor behave over time?', annualNote: 'Annual and regime slices are descriptive; they are not independent tests and do not establish out-of-sample performance.', year: 'Year', slice: 'Slice', marketRegime: 'Regime', validDates: 'Valid dates', meanRankIc: 'Mean RankIC', positiveRate: 'Positive RankIC', topBottomSpread: 'Top minus bottom', regimeUnavailable: 'Market-regime slices are unavailable because the snapshot has no aligned benchmark return series.', hacEstimate: 'HAC RankIC estimate', holdingDays: 'Holding days', inferenceUnavailable: 'Inference is unavailable for this factor.', confidenceInterval: '95% confidence interval', hacCaveat: 'Newey–West standard error with overlap adjustment; normal reference distribution.', byQValue: 'BY adjusted q-value', rawPValue: 'Raw p-value', rawPValueNote: 'Unadjusted two-sided test; read with the family-adjusted BY q-value.', fdrNote: 'Benjamini–Yekutieli controls false discovery under general dependence. This does not remove selection bias.', overviewTesting: 'CORRECTED EVIDENCE', overviewTestingTitle: 'How many factors have BY q ≤ 0.05?', byBelowThreshold: 'Factors at BY q ≤ 0.05', testsAvailable: 'Available tests / family size', regimeAvailability: 'Market-regime data', available: 'Available', unavailable: 'Unavailable', overviewTestingNote: 'Adjusted q-values are research diagnostics; they do not establish predictive performance, tradability, or freedom from selection bias.', overviewTestingUnavailable: 'Corrected p-value diagnostics are not provided in this snapshot.' },
    studies: { eyebrow: 'FACTOR RESEARCH / STUDIES', title: 'Research studies', lede: 'Review research hypotheses and historical evidence with explicit data definitions, validation status, and open questions.', updated: 'Updated', read: 'Read study →', all: 'All studies', notFound: 'Study not found', back: '← Back to research studies', interval: 'Observation period', evidence: 'Evidence source', aggregate: 'AGGREGATE EVIDENCE', comparison: 'Historical comparison', found: 'WHAT WE FOUND', limitsLabel: 'EVIDENCE BOUNDARY', whatCan: 'What we can say now', whatCannot: 'What this evidence does not establish', source: 'View public method and evidence notes ↗', question: 'Research question', design: 'Evidence design', openGap: 'Open evidence gap', highlights: 'Key findings' },
    studyQuestions: { 'pb-roe': 'Does adding ROE information improve a PB-based ranking under the same candidate-pool constraints?', 'rd-investment': 'Does R&D intensity contain a signal beyond the size and valuation effects in its denominator?', 'employee-compensation': 'Can public compensation fields measure labor cost or human-capital investment at a point in time?', 'cashflow-indices': 'How closely do available constituent snapshots reproduce the public index rules and returns?' },
  },
  'zh-CN': {
    brandMeta: '公开研究层', brandMetaSub: '脱敏证据档案', nav: { overview: '总览', alpha810: 'Alpha 810', factors: '因子目录', studies: '研究专题', fundamentals: '基本面研究', jumps: '跳跃分解', hermite: 'Hermite 体制' }, footerNote: '研究展示，不构成交易建议', switchTo: 'English', themeToggle: '深色模式', loading: '正在加载研究快照…', loadError: '研究快照加载失败', retry: '重试', notFound: '找不到这个页面', backHome: '返回总览',
    overview: { eyebrow: '研究笔记 / 01', title: '把市场数据，变成可读的结构。', lede: '探索分钟波动、跳跃、Hermite 状态，以及财报中的盈利变化如何共同构成因子研究地图。', data: '数据', range: '范围', universe: '股票池', frequency: '频率', pit: 'PIT', tradingDays: '交易日', coveredStocks: '覆盖股票', factorCount: '因子总数', experimental: '实验性', crossSection: 'A 股横截面', notValidated: '尚未完成预测性验证', factorAtlas: '因子地图', factorMap: '因子地图', browse: '浏览全部因子 →', fundamentals: '基本面经营状态', pipeline: '研究流程', pipelineTitle: '从原始数据到体制信号', recentResearch: '近期研究发现', publishedEvidence: '当前公开证据显示什么', evidenceBoundary: '证据边界', snapshotGenerated: '快照生成', studiesUpdated: '研究专题更新于', recentResearchNote: '以下摘要保留专题原有的证据限制。' },
    factor: { evidenceCard: '证据卡', question: '研究问题', interpretation: '研究解释', sample: '样本 / 版本', coverage: '当前覆盖', status: '证据状态', currentEvidence: '当前公开证据', noEvidence: '该因子尚无已发布的预测性证据。请将其视为研究假设或描述性指标。', sourceDate: '行情快照生成于', pitVintage: 'PIT 版本' },
    alpha810: { stability: '时间一致性摘要', stabilityTitle: 'RankIC 有多少比例为正？', stabilityNote: '按整个观察区间内 RankIC 为正的日期比例对因子分组。该指标概括有效日期上的方向一致性，不展示逐年或不同市场状态下的稳定性。', meanPositive: '平均 RankIC 正值比例', noStability: '暂无 RankIC 正值比例观测。', directionConsistency: '方向一致性', groupSpread: '最高组减最低组', snapshotInterval: '快照区间', fullWindow: '全区间聚合，尚未发布分阶段或市场状态拆分。', spreadNote: '聚合分组均值之差，单位为每次收益观测；未复利、未计成本。', annualEvidence: '时间稳定性', annualTitle: '因子随时间的表现如何？', annualNote: '年度和市场状态切片仅作描述；不同切片不是相互独立的检验，也不能证明样本外表现。', year: '年份', slice: '切片', marketRegime: '市场状态', validDates: '有效日期数', meanRankIc: 'RankIC 均值', positiveRate: 'RankIC 正值比例', topBottomSpread: '最高组减最低组', regimeUnavailable: '快照未提供对齐的基准收益序列，因此无法计算市场状态切片。', hacEstimate: 'HAC RankIC 估计值', holdingDays: '持有天数', inferenceUnavailable: '该因子的推断结果不可用。', confidenceInterval: '95% 置信区间', hacCaveat: '使用 Newey–West 重叠调整标准误和正态参考分布。', byQValue: 'BY 校正 q 值', rawPValue: '原始 p 值', rawPValueNote: '未经校正的双侧检验，应结合针对整个检验家族校正的 BY q 值解读。', fdrNote: 'Benjamini–Yekutieli 在一般依赖条件下控制假发现率，但不能消除选择偏差。', overviewTesting: '多重检验校正', overviewTestingTitle: '有多少因子的 BY q 值不超过 0.05？', byBelowThreshold: 'BY q ≤ 0.05 的因子数', testsAvailable: '可用检验数 / 检验家族数', regimeAvailability: '市场状态数据', available: '可用', unavailable: '不可用', overviewTestingNote: '校正后的 q 值仅是研究诊断，不能证明预测能力或可交易性，也不能消除选样偏差。', overviewTestingUnavailable: '当前快照未提供多重检验校正结果。' },
    studies: { eyebrow: '因子研究专题', title: '因子研究专题', lede: '从研究假设到历史证据，逐项标明数据口径、检验状态和仍待解决的问题。', updated: '更新于', read: '阅读研究 →', all: '全部研究专题', notFound: '找不到这项研究', back: '← 返回研究专题', interval: '观察区间', evidence: '证据来源', aggregate: '聚合证据', comparison: '历史对照', found: '目前可以说什么', limitsLabel: '证据边界', whatCan: '目前可以说什么', whatCannot: '还不能据此推断什么', source: '查看已公开的原始方法与数据核对 ↗', question: '研究问题', design: '证据设计', openGap: '待补证据', highlights: '主要发现' },
    studyQuestions: { 'pb-roe': '在相同候选池约束下，加入 ROE 信息是否改善 PB 排序？', 'rd-investment': '研发强度是否包含超出分母规模与估值效应的信号？', 'employee-compensation': '公开薪酬字段能否按时点衡量劳动成本或人力资本投入？', 'cashflow-indices': '现有成分快照在多大程度上复现了公开指数规则与收益？' },
  },
}

export const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void }>({ locale: 'en-US', setLocale: () => undefined })

export function useLocale() {
  const { locale, setLocale } = useContext(LocaleContext)
  return { locale, copy: COPY[locale], setLocale }
}

export function initialLocale(): Locale {
  try {
    return window.localStorage.getItem('quant-factor-locale') === 'zh-CN' ? 'zh-CN' : 'en-US'
  } catch {
    return 'en-US'
  }
}

export function localized(locale: Locale, zh: string, en: string) {
  return locale === 'en-US' ? en : zh
}
