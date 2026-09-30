import type { FactorRecord, FundamentalFactor } from './types'
import type { Locale } from './i18n'

const familyLabels: Record<string, string> = {
  '波动率 / 跳跃': 'Volatility / jumps',
  '微观结构': 'Microstructure',
  '流动性': 'Liquidity',
  '已实现矩': 'Realized moments',
  '跳跃分解': 'Jump decomposition',
  'Hermite 元因子': 'Hermite meta-factors',
  '日内风险状态': 'Intraday risk states',
  '分布形状状态': 'Distribution shape states',
  '盈利状态': 'Earnings state',
  '盈利增长': 'Earnings growth',
  '估值 / 盈利': 'Valuation / earnings',
  '财务质量': 'Financial quality',
  '风险 / 质量': 'Risk / quality',
  '税负 / 融资': 'Tax / financing',
  '盈利质量': 'Earnings quality',
  '非主营收益': 'Non-core income',
  '资产质量 / 估值': 'Asset quality / valuation',
  '人力资本 / 劳动': 'Human capital / labor',
}

const factorGroupLabels: Record<string, string> = {
  intraday_risk_states: 'Intraday risk states',
  distribution_states: 'Distribution shape states',
}

const minuteNames: Record<string, string> = {
  volume_volatility: 'Volume volatility', star_volatility: 'Star volatility', log_volume_volatility: 'Log-volume volatility',
  illiquidity: 'Illiquidity', illiquidity_std: 'Illiquidity dispersion', price_elasticity: 'Price elasticity',
  diff_abs_mean_volume: 'Mean absolute volume change', diff_abs_mean_amplitude: 'Mean absolute amplitude change',
  peak_count_1std: 'One-standard-deviation peak count', peak_count_2std: 'Two-standard-deviation peak count',
  vol_amplitude: 'Volume amplitude', realized_variance: 'Realized variance', realized_skewness: 'Realized skewness',
  realized_kurtosis: 'Realized kurtosis', rv_pos: 'Positive realized variation', rv_neg: 'Negative realized variation',
  ivhat: 'Continuous variance estimate', rjv: 'Jump variance', rjvp: 'Positive jump variation', rjvn: 'Negative jump variation',
  sj: 'Signed jump statistic', srjv: 'Signed realized jump variation', gamma_threshold: 'Gamma threshold', rljv: 'Large-jump variation',
  rljvp: 'Positive large-jump variation', rljvn: 'Negative large-jump variation', srljv: 'Signed large-jump variation',
  rsjv: 'Small-jump variation', rsjvp: 'Positive small-jump variation', rsjvn: 'Negative small-jump variation', srsjv: 'Signed small-jump variation',
  h_daily_close60_ts_h3_60: 'Daily close Hermite h3', h_daily_close60_ts_h4_60: 'Daily close Hermite h4',
  h_daily_close60_ts_closeness_60: 'Daily close Hermite closeness', h_daily_close60_energy_compression_20_60: 'Daily close Hermite energy compression',
  vol_rv_ts_h3_60: 'Volume RV Hermite h3', vol_rv_ts_h4_60: 'Volume RV Hermite h4',
  vol_rv_ts_closeness_60: 'Volume RV Hermite closeness', vol_rv_energy_compression_20_60: 'Volume RV energy compression',
  ideal_swing_factor: 'Ideal swing factor',
}

const fundamentalCopy: Record<string, { name: string; family?: string; definition: string; meaning: string; research_question?: string }> = {
  standardized_operating_profit: { name: 'Standardized operating profit', definition: 'Measures whether operating profit has materially improved or deteriorated relative to the company’s own history.', meaning: 'Operating-profit state breakout' },
  operating_profit_yoy_zscore: { name: 'Standardized operating-profit growth', definition: 'Measures whether year-over-year operating-profit improvement is unusually large relative to the company’s normal variation.', meaning: 'Abnormal intensity of earnings growth' },
  operating_profit_acceleration: { name: 'Operating-profit acceleration', definition: 'Measures whether the pace of earnings growth is accelerating or slowing further.', meaning: 'Second-order change in the earnings trend' },
  operating_earnings_yield_zscore: { name: 'Standardized operating earnings yield', definition: 'Measures whether operating earnings relative to market valuation are unusual in the company’s own history.', meaning: 'Relative change in operating earnings and valuation' },
  finance_expense_ratio_improvement: { name: 'Finance expense ratio improvement', definition: 'Measures whether financing burden relative to operating revenue is improving.', meaning: 'Change in financial leverage pressure' },
  asset_impairment_stability: { name: 'Asset impairment stability', definition: 'Measures the level and stability of asset impairments to identify possible deterioration in asset quality.', meaning: 'Impairment risk and earnings quality' },
  revenue_zscore: { name: 'Standardized revenue', definition: 'Measures whether revenue is unusually high or low relative to the company’s own history.', meaning: 'Revenue activity state' },
  comprehensive_income_yield_zscore: { name: 'Standardized comprehensive income yield', definition: 'Measures whether comprehensive income relative to market valuation departs from the company’s own history.', meaning: 'Valuation position of comprehensive earnings' },
  income_tax_zscore_250: { name: 'Long-term income-tax expense abnormality', definition: 'Measures whether the income-tax burden is unusual relative to the company’s own history.', meaning: 'Change in tax burden state' },
  income_tax_zscore_120: { name: 'Short-term income-tax expense abnormality', definition: 'Measures whether recent tax expense changes depart from the company’s usual level.', meaning: 'Short-term tax expense abnormality' },
  negative_roa_exp_mean_120: { name: 'Smoothed asset profitability state', definition: 'Measures the recent level and direction of smoothed asset profitability.', meaning: 'Short-term asset-return quality' },
  negative_earnings_yield_cv_120: { name: 'Earnings-yield stability', definition: 'Measures the variation and stability of earnings relative to valuation.', meaning: 'Earnings-yield noise' },
  income_tax_yield_zscore_120: { name: 'Tax burden abnormality', definition: 'Measures the historical abnormality of tax burden relative to market valuation.', meaning: 'Relative change in tax expense and valuation' },
  invest_income_yield_zscore: { name: 'Investment-income abnormality', definition: 'Measures whether investment income relative to valuation is unusual.', meaning: 'Non-core income state' },
  other_gain_yield_zscore: { name: 'Other-gain abnormality', definition: 'Measures whether subsidies or other non-core income are unusually large relative to valuation.', meaning: 'Dependence on other income' },
  negative_roa_cv_250: { name: 'Asset profitability volatility', definition: 'Measures whether asset profitability is stable over a longer observation period.', meaning: 'Instability of asset returns' },
  negative_roe_exp_mean_750: { name: 'Long-term shareholder return state', definition: 'Measures the long-term smoothed state of return on shareholder capital.', meaning: 'Long-term capital-return quality' },
  cash_to_market_value_zscore: { name: 'Cash relative to valuation abnormality', definition: 'Measures whether cash assets relative to market valuation are at an unusual level.', meaning: 'Cash cushion and valuation change' },
  labor_cost_intensity: { name: 'Labor cost intensity', definition: 'Measures the relative share of labor input cost in company revenue.', meaning: 'Labor dependence and operating leverage' },
  labor_efficiency: { name: 'Human-capital efficiency', definition: 'Measures how efficiently the company turns labor input into operating revenue.', meaning: 'Relationship between revenue creation and labor input' },
  labor_cost_growth: { name: 'Labor cost change', definition: 'Measures the growth state of labor input cost without equating it directly with employee wage growth.', meaning: 'Labor expansion or cost pressure' },
  revenue_minus_labor_cost_growth: { name: 'Revenue minus labor-cost growth spread', definition: 'Measures improvement in revenue growth relative to labor-cost growth.', meaning: 'Change in labor efficiency and operating leverage' },
  labor_intensity_investment_state: { name: 'Labor intensity and investment state', definition: 'Measures operating risk and growth state when labor-dependent companies expand investment.', meaning: 'Interaction between labor rigidity and investment behavior' },
}

const genericMinuteDefinition = 'Public research description of minute-level price, volume, or jump states; exact operators are not included in the public snapshot.'

export function localizedFamily(value: string, locale: Locale) {
  return locale === 'en-US' ? familyLabels[value] ?? value : value
}

export function localizedFactorGroup(name: string, label: string, locale: Locale) {
  if (locale === 'zh-CN') return label
  return factorGroupLabels[name] ?? familyLabels[label] ?? label
}

export function localizeFactorRecord(record: FactorRecord, locale: Locale): FactorRecord {
  if (locale === 'zh-CN') return record
  const copy = record.fundamentalTranslation ?? fundamentalCopy[record.id]
  if (copy) return { ...record, displayName: copy.name, family: localizedFamily(record.family, locale), definition: copy.definition, intuition: copy.meaning, interpretationHigh: 'Higher values indicate a stronger reading of this research definition.', interpretationLow: 'Lower values indicate a weaker reading of this research definition.', transformHint: 'The public page shows the research definition and aggregate diagnostics only.', failureModes: ['Disclosure timing, definition changes, and one-off items can affect interpretation.'] }
  if (record.frequencyIn === 'PIT quarterly reports') return { ...record, displayName: record.id.split('_').join(' '), family: localizedFamily(record.family, locale), definition: 'Public research definition is not yet available for this factor.', intuition: 'Research interpretation is not yet published.', interpretationHigh: 'Higher values indicate a stronger reading of the research definition.', interpretationLow: 'Lower values indicate a weaker reading of the research definition.', transformHint: 'The public page shows the research definition and aggregate diagnostics only.', failureModes: ['Disclosure timing, definition changes, and one-off items can affect interpretation.'] }
  return { ...record, displayName: minuteNames[record.id] ?? record.displayName, family: localizedFamily(record.family, locale), definition: genericMinuteDefinition, intuition: 'Use this descriptive statistic to inspect market state; it does not establish a return prediction by itself.', interpretationHigh: 'The statistic is relatively higher.', interpretationLow: 'The statistic is relatively lower.', failureModes: ['Missing observations, low liquidity, and extreme values can affect interpretation.'] }
}

export function localizeFundamentalFactor(factor: FundamentalFactor, locale: Locale): FundamentalFactor {
  if (locale === 'zh-CN') return factor
  const copy = factor.translations?.['en-US'] ?? fundamentalCopy[factor.id]
  return copy ? { ...factor, name: copy.name, family: localizedFamily(copy.family ?? factor.family, locale), definition: copy.definition, meaning: copy.meaning, research_question: copy.research_question ?? 'Can this public research definition provide incremental information in a properly point-in-time evaluation?' } : { ...factor, name: factor.id.split('_').join(' '), family: localizedFamily(factor.family, locale), definition: 'Public research definition is not yet available for this factor.', meaning: 'Research interpretation is not yet published.', research_question: 'What incremental information could this research definition provide in a properly point-in-time evaluation?' }
}

export function localizedStatus(status: FactorRecord['status'], locale: Locale) {
  if (locale === 'en-US') return { descriptive: 'Descriptive snapshot', experimental: 'Experimental', validated: 'Validated' }[status]
  return { descriptive: '描述性快照', experimental: '实验性', validated: '已验证' }[status]
}
