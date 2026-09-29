import { createContext, useContext } from 'react'

export type Locale = 'en-US' | 'zh-CN'

type Copy = {
  brandMeta: string
  brandMetaSub: string
  nav: Record<string, string>
  footerNote: string
  switchTo: string
  overview: Record<string, string>
  studies: Record<string, string>
}

const COPY: Record<Locale, Copy> = {
  'en-US': {
    brandMeta: 'Public Research Layer', brandMetaSub: 'Sanitized evidence archive',
    nav: { overview: 'Overview', alpha810: 'Alpha 810', factors: 'Factor catalog', studies: 'Research studies', fundamentals: 'Fundamentals', jumps: 'Jump decomposition', hermite: 'Hermite regime' },
    footerNote: 'Research display only; not investment advice', switchTo: '中文',
    overview: { eyebrow: 'RESEARCH NOTEBOOK / 01', title: 'Turn market data into readable structure.', lede: 'Explore how intraday volatility, jumps, Hermite states, and changes in reported fundamentals form a factor research map.', data: 'Data', range: 'Range', universe: 'Universe', frequency: 'Frequency', pit: 'PIT', tradingDays: 'Trading days', coveredStocks: 'Covered stocks', factorCount: 'Total factors', experimental: 'Experimental', crossSection: 'A-share cross-section', notValidated: 'Predictive validation is incomplete', factorAtlas: 'FACTOR ATLAS', factorMap: 'Factor map', browse: 'Browse all factors →', fundamentals: 'Fundamental operating states', pipeline: 'THE PIPELINE', pipelineTitle: 'From raw data to regime signals' },
    studies: { eyebrow: 'FACTOR RESEARCH / STUDIES', title: 'Research studies', lede: 'Review research hypotheses and historical evidence with explicit data definitions, validation status, and open questions.', updated: 'Updated', read: 'Read study →', all: 'All studies', notFound: 'Study not found', back: '← Back to research studies', interval: 'Observation period', evidence: 'Evidence source', aggregate: 'AGGREGATE EVIDENCE', comparison: 'Historical comparison', found: 'WHAT WE FOUND', limitsLabel: 'EVIDENCE BOUNDARY', whatCan: 'What we can say now', whatCannot: 'What this evidence does not establish', source: 'View public method and evidence notes ↗' },
  },
  'zh-CN': {
    brandMeta: '公开研究层', brandMetaSub: '脱敏证据档案', nav: { overview: '总览', alpha810: 'Alpha 810', factors: '因子目录', studies: '研究专题', fundamentals: '基本面研究', jumps: '跳跃分解', hermite: 'Hermite 体制' }, footerNote: '研究展示，不构成交易建议', switchTo: 'English',
    overview: { eyebrow: '研究笔记 / 01', title: '把市场数据，变成可读的结构。', lede: '探索分钟波动、跳跃、Hermite 状态，以及财报中的盈利变化如何共同构成因子研究地图。', data: '数据', range: '范围', universe: '股票池', frequency: '频率', pit: 'PIT', tradingDays: '交易日', coveredStocks: '覆盖股票', factorCount: '因子总数', experimental: '实验性', crossSection: 'A 股横截面', notValidated: '尚未完成预测性验证', factorAtlas: '因子地图', factorMap: '因子地图', browse: '浏览全部因子 →', fundamentals: '基本面经营状态', pipeline: '研究流程', pipelineTitle: '从原始数据到体制信号' },
    studies: { eyebrow: '因子研究专题', title: '因子研究专题', lede: '从研究假设到历史证据，逐项标明数据口径、检验状态和仍待解决的问题。', updated: '更新于', read: '阅读研究 →', all: '全部研究专题', notFound: '找不到这项研究', back: '← 返回研究专题', interval: '观察区间', evidence: '证据来源', aggregate: '聚合证据', comparison: '历史对照', found: '目前可以说什么', limitsLabel: '证据边界', whatCan: '目前可以说什么', whatCannot: '还不能据此推断什么', source: '查看已公开的原始方法与数据核对 ↗' },
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
