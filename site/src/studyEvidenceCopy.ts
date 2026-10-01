import type { Locale } from './i18n'

const messages = {
  'en-US': {
    coverageTitle: 'Coverage and label maturity',
    calendarRange: 'Requested span: from {start} (the first 2015 trading session) through {marketDate}. The 2015–2018 reconstruction has no eligible monthly cross-section; 2019 contributes ten retrospective months. Annual summaries are not a daily backtest.',
    marketDataAsOf: 'Market data as of {date}',
    firstEligibleSignal: 'First eligible cross-section: {date}',
    signalWindow: 'Signal window: {start} to {end}',
    labelsMatureThrough: '{days}-day outcomes mature through {date}',
    missingLookback: 'No 2014 TTM lookback in this snapshot',
    belowMinimum: 'Below 200-name monthly minimum (max {count})',
    reconstructedBackfill: 'Retrospective reconstruction sensitivity',
    noPitSignal: 'No eligible PIT cross-section',
    noMatureLabels: 'No mature labels',
    noValidLabels: 'No valid labels',
    partialYear: 'Partial year',
    observed: 'Observed',
    uncertaintyTitle: 'How to read the annual evidence',
    uncertainty: 'revision_safe=false: historical financial revisions are incomplete. The 2019 extension is a retrospective reconstruction sensitivity, not a revision-safe PIT backtest. The sealed PIT input lacks 2014 TTM lookback; a separate legacy raw vintage has positive 2014 R&D for only one issuer, far below the 200-name monthly minimum, and is not mixed into the primary replay. 2016–2018 also remain below the minimum. Blank values are missing evidence, not zero returns. Monthly forward labels overlap, especially at 220 days, so the count is not an independent sample size. Confidence intervals are not reported; the post-exploration window is not a frozen final out-of-sample test.',
    monthlyCrossSections: 'monthly cross-sections',
  },
  'zh-CN': {
    coverageTitle: '覆盖区间与标签成熟度',
    calendarRange: '请求覆盖区间：从 {start}（2015 年首个交易日）至 {marketDate}。2015–2018 回溯重建没有符合条件的月度截面；2019 年有十个月回溯样本。年度汇总不等于逐日回测。',
    marketDataAsOf: '行情数据截至 {date}',
    firstEligibleSignal: '首个合格横截面：{date}',
    signalWindow: '信号区间：{start} 至 {end}',
    labelsMatureThrough: '{days} 日收益标签成熟至 {date}',
    missingLookback: '快照缺少 2014 年 TTM 回看数据',
    belowMinimum: '未达到每月 200 只股票下限（最多 {count} 只）',
    reconstructedBackfill: '回溯重建敏感性样本',
    noPitSignal: '无合格 PIT 横截面',
    noMatureLabels: '标签尚未成熟',
    noValidLabels: '无有效标签',
    partialYear: '部分年度',
    observed: '有观测',
    uncertaintyTitle: '年度证据的解读边界',
    uncertainty: 'revision_safe=false：历史财务修订链不完整。2019 年扩展是回溯重建敏感性分析，不是修订安全的 PIT 回测。sealed PIT 输入缺少 2014 年 TTM 回看数据；另一份本地旧版原始数据中，2014 年有正研发费用记录的公司仅 1 家，远低于每月 200 只股票下限，因此未混入主回放。2016–2018 年也均未达到下限。空白表示缺少证据，不代表收益为零。月度前瞻标签彼此重叠，220 日尤其明显，因此月度截面数不等于独立样本数。当前未报告置信区间；探索后窗口也不是预先冻结的最终样本外检验。',
    monthlyCrossSections: '个月度截面',
  },
} satisfies Record<Locale, Record<string, string>>

export function studyEvidenceMessage(locale: Locale, key: keyof typeof messages['en-US'], values: Record<string, string | number> = {}) {
  return messages[locale][key].replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`))
}
