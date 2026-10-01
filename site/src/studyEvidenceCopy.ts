import type { Locale } from './i18n'

const messages = {
  'en-US': {
    coverageTitle: 'Coverage and label maturity',
    calendarRange: 'Requested span: the first 2015 trading session through the 2026-09-29 market snapshot. Annual summaries are not a daily backtest.',
    marketDataAsOf: 'Market data as of {date}',
    signalFrom: 'PIT factor signal available from {date}',
    labelsMatureThrough: '{days}-day labels mature through {date}',
    noPitSignal: 'No PIT signal',
    noMatureLabels: 'No mature labels',
    noValidLabels: 'No valid labels',
    partialYear: 'Partial year',
    observed: 'Observed',
    uncertaintyTitle: 'How to read the annual evidence',
    uncertainty: '2015–2019 have no eligible PIT signal in this release; blank values are missing evidence, not zero returns. Monthly forward labels overlap, especially at 220 days, so the monthly count is not an independent sample size. Confidence intervals are not reported. The current post-exploration holdout is not a frozen final out-of-sample test.',
    monthlyCrossSections: 'monthly cross-sections',
  },
  'zh-CN': {
    coverageTitle: '覆盖区间与标签成熟度',
    calendarRange: '请求覆盖区间：从 2015 年首个交易日至 2026-09-29 行情快照；年度汇总不等于逐日回测。',
    marketDataAsOf: '行情数据截至 {date}',
    signalFrom: 'PIT 因子信号始于 {date}',
    labelsMatureThrough: '{days} 日标签成熟至 {date}',
    noPitSignal: '无 PIT 信号',
    noMatureLabels: '标签尚未成熟',
    noValidLabels: '无有效标签',
    partialYear: '部分年度',
    observed: '有观测',
    uncertaintyTitle: '年度证据的解读边界',
    uncertainty: '本次公开数据在 2015–2019 年没有符合条件的 PIT 信号；空白表示缺少证据，不代表收益为零。月度前瞻标签彼此重叠，220 日尤其明显，因此月度截面数不等于独立样本数。当前未报告置信区间。现有探索后保留窗口也不是预先冻结的最终样本外检验。',
    monthlyCrossSections: '个月度截面',
  },
} satisfies Record<Locale, Record<string, string>>

export function studyEvidenceMessage(locale: Locale, key: keyof typeof messages['en-US'], values: Record<string, string | number> = {}) {
  return messages[locale][key].replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`))
}
