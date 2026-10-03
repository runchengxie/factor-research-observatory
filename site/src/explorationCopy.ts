import type { Locale } from './i18n'

type HermiteCopy = {
  back: string; eyebrow: string; title: string; lede: string; conclusion: string; conclusionLabel: string; metric: string; ticker: string
  coverage: string; observations: string; series: string; noSeries: string; demo: string
  metrics: Record<string, { label: string; title: string; description: string }>
  boundary: string
}
type JumpCopy = {
  back: string; eyebrow: string; title: string; lede: string; conclusion: string; conclusionLabel: string; observation: string; rvShare: string
  jumpComposition: string; component: string; value: string; share: string; jumpShare: string; snapshotDate: string; illustrativeUniverse: string
  checkPassed: string; checkFailed: string; checkUnavailable: string; noData: string; demo: string; identity: string; observedValues: string
  boundary: string
}
type FundamentalsCopy = {
  back: string; eyebrow: string; title: string; lede: string; conclusion: string; conclusionLabel: string; metric: string; ticker: string
  latestDistribution: string; distributionNote: string; timeSeries: string; range: string
  observations: string; exampleCoverage: string; demo: string; noSeries: string
  availabilityBasis: string; researchNotes: string[]
  publicSnapshot: string
  availabilityEyebrow: string; coreEyebrow: string; coreTitle: string; catalogEyebrow: string
  guardrailsEyebrow: string; guardrailsTitle: string
  pitRange: string; processedUniverse: string; timeSeriesExamples: string; availabilityLabel: string; latestCoverageTitle: string
  processedTickers: string; pitCoverage: string; validOperatingProfit: string; validShare: string
  latestAvailable: string; median: string; standardizedProxy: string; valid: string; missing: string; entries: string
  metricLabels: Record<string, string>; factorDescriptions: Record<string, string>
  loadingChart: string
}
export type ExplorationCopy = { hermite: HermiteCopy; jumps: JumpCopy; fundamentals: FundamentalsCopy }

export const explorationCopy: Record<Locale, ExplorationCopy> = {
  'en-US': {
    hermite: {
      conclusionLabel: 'Current conclusion', conclusion: 'These distribution-shape indicators are descriptive examples. Predictive power and portfolio performance have not been validated.',
      back: '← Factor overview', eyebrow: 'HERMITE REGIME / 03',
      title: 'Find the cracks in the distribution.',
      lede: 'Inspect higher-order distribution shape and a stability diagnostic one at a time. These are exploratory descriptors, not validated forecasts.',
      metric: 'Hermite indicator', ticker: 'Ticker', coverage: 'Observed window', observations: 'daily observations',
      series: 'Selected series', noSeries: 'No series is available for this selection.', demo: 'Illustrative demo snapshot',
      metrics: {
        vol_rv_ts_closeness_60: { label: 'Distribution stability (closeness)', title: 'Stability / closeness diagnostic', description: 'A distance-like monitor for changes in the rolling distribution shape. Values closer to zero are described as closer to the reference shape in this demo; the precise operator and scale are not published.' },
        h_daily_close60_ts_h3_60: { label: 'Third-order shape component (h3)', title: 'Third-order shape component (h3)', description: 'A third-order component that can help describe distribution asymmetry. Do not interpret its sign as a standardized skewness value: the implementation-specific normalization is not published.' },
        h_daily_close60_ts_h4_60: { label: 'Fourth-order shape component (h4)', title: 'Fourth-order shape component (h4)', description: 'A fourth-order component related to distribution tails and peakedness. Its scale is implementation-specific and is not a formal kurtosis test.' },
      },
      boundary: 'The public snapshot is a three-ticker, 42-session illustration. Short windows and extreme observations can make higher-order statistics unstable. No return prediction or trading result is established here.',
    },
    jumps: {
      conclusionLabel: 'Current conclusion', conclusion: 'The example illustrates how continuous and jump variation partition realized variance. It does not establish jump frequency or return predictability.',
      back: '← Factor overview', eyebrow: 'JUMP DECOMPOSITION / 02',
      title: 'Volatility is not one number.',
      lede: 'Separate a continuous-variation estimate from jump variation, then inspect the large- and small-jump components without double-counting them.',
      observation: 'Example observation', rvShare: 'Share of realized variance', jumpComposition: 'Composition of jump variance',
      component: 'Component', value: 'Variance value', share: 'Share of RV', jumpShare: 'Share of RJV',
      snapshotDate: 'Snapshot date', illustrativeUniverse: 'Illustrative universe',
      checkPassed: 'Decomposition check passed', checkFailed: 'Decomposition identity does not reconcile within tolerance', checkUnavailable: 'Decomposition identity cannot be checked because values are missing',
      noData: 'No decomposition data', demo: 'Illustrative demo snapshot',
      identity: 'RV = IVhat + RJV; RJV = RLJV + RSJV. Large and small jumps partition RJV, so their shares are shown separately to avoid adding them twice to RV.',
      observedValues: 'Observed values',
      boundary: 'The displayed observations are a three-ticker example for one date. They explain the decomposition only; they do not establish how often jumps occur or predict future returns.',
    },
    fundamentals: {
      conclusionLabel: 'Current conclusion', conclusion: 'This page shows which financial observations were available and how complete the sample is. It does not show that these measures predict stock returns.',
      back: '← Factor overview', eyebrow: 'FUNDAMENTAL STATES / 04',
      title: 'Operating states, slowly becoming signals.',
      lede: 'Explore financial measures using only information available at the time (point-in-time data). Charts show sample coverage; the catalog ideas have not yet been shown to predict returns.',
      metric: 'Series metric', ticker: 'Example ticker', latestDistribution: 'Latest operating-profit cross-section',
      distributionNote: 'Percentiles across the latest available cross-section for the standardized operating-profit proxy; values are standardized units, not currency.',
      timeSeries: 'Representative point-in-time series', range: 'Observed dates', observations: 'valid observations',
      exampleCoverage: 'The processed universe contains 6,736 tickers, while public time-series examples are available for only three representative tickers. The coverage and examples have different grains.',
      demo: 'Illustrative snapshot', publicSnapshot: 'Published PIT snapshot', noSeries: 'No series is available for this selection.',
      availabilityEyebrow: 'DATA AVAILABILITY', coreEyebrow: 'CORE RESEARCH SET', coreTitle: 'Start with these six', catalogEyebrow: 'FACTOR CATALOG', guardrailsEyebrow: 'RESEARCH GUARDRAILS', guardrailsTitle: 'Method limits',
      pitRange: 'PIT observation range', processedUniverse: 'Processed universe', timeSeriesExamples: 'Public time-series examples', availabilityLabel: 'Availability basis', latestCoverageTitle: 'Latest operating-profit cross-section coverage',
      processedTickers: 'Processed tickers', pitCoverage: 'PIT universe coverage', validOperatingProfit: 'Valid operating-profit values', validShare: 'Valid share', latestAvailable: 'Latest available cross-section', median: 'Latest median', standardizedProxy: 'Standardized operating-profit proxy', valid: 'Valid', missing: 'Missing', entries: 'research entries',
      availabilityBasis: 'point-in-time observation date', researchNotes: [
        'Published observations are point-in-time snapshots; exact availability mappings are kept private.',
        'Complete observations are required before a rolling research value is published; missing history remains null.',
        'Public artifacts expose research definitions and aggregate diagnostics, not exact implementation recipes.',
        'Human-capital entries are hypotheses until historical labor-cost coverage and predictive evaluation are published.',
        'The standardized operating-profit value remains null until four complete quarters and six historical TTM observations are available.',
        'TTM derivation treats reported values as cumulative fiscal-year values; validate this data contract before any backtest.',
      ],
      loadingChart: 'Loading chart…',
      metricLabels: {
        standardized_operating_profit: 'Standardized operating profit', roe: 'Return on equity (ROE)', roa: 'Return on assets (ROA)',
        net_profit_yoy: 'Net profit year-over-year', revenue_yoy: 'Revenue year-over-year',
      },
      factorDescriptions: {
        standardized_operating_profit: 'Operating-profit state relative to the company’s own history; the published cross-section is a research proxy.',
        roe: 'Reported return on equity series in the representative PIT snapshot.',
        roa: 'Reported return on assets series in the representative PIT snapshot.',
        net_profit_yoy: 'Reported net-profit year-over-year series in the representative PIT snapshot.',
        revenue_yoy: 'Reported revenue year-over-year series in the representative PIT snapshot.',
      },
    },
  },
  'zh-CN': {
    hermite: {
      conclusionLabel: '当前结论', conclusion: '这些分布形态指标是描述性示例，预测能力与组合表现尚未验证。',
      back: '← 因子总览', eyebrow: 'HERMITE 体制 / 03',
      title: '寻找分布形状的变化。',
      lede: '逐项查看高阶分布形状与稳定性诊断。这些是探索性描述指标，不是经过验证的预测信号。',
      metric: 'Hermite 指标', ticker: '股票', coverage: '观测区间', observations: '个日度观测',
      series: '当前序列', noSeries: '当前选择没有可用序列。', demo: '说明性演示快照',
      metrics: {
        vol_rv_ts_closeness_60: { label: '分布稳定性（closeness）', title: '稳定性 / closeness 诊断', description: '用于监测滚动分布形状变化的距离类指标。本演示中将更接近 0 描述为更接近参考形状；精确算子与尺度未公开。' },
        h_daily_close60_ts_h3_60: { label: '三阶形状分量（h3）', title: '三阶形状分量（h3）', description: '三阶分量可辅助描述分布的不对称性。不要将其正负号直接解释为标准化偏度；具体归一化方式未公开。' },
        h_daily_close60_ts_h4_60: { label: '四阶形状分量（h4）', title: '四阶形状分量（h4）', description: '四阶分量与分布尾部和尖峰形态相关；其尺度取决于具体实现，也不是正式的峰度检验。' },
      },
      boundary: '公开快照仅为 3 只股票、42 个交易日的示例。较短窗口和极端观测可能使高阶统计量不稳定；这里没有验证收益预测或交易效果。',
    },
    jumps: {
      conclusionLabel: '当前结论', conclusion: '示例说明连续变差与跳跃变差如何分解已实现方差，尚不能据此判断跳跃频率或收益预测能力。',
      back: '← 因子总览', eyebrow: '跳跃分解 / 02',
      title: '波动并不只有一个数字。',
      lede: '将连续变化估计与跳跃变化分开，再分别观察大、小跳跃，避免重复计算。',
      observation: '示例观测', rvShare: '实现方差中的占比', jumpComposition: '跳跃方差构成',
      component: '分量', value: '方差值', share: '占 RV', jumpShare: '占 RJV',
      snapshotDate: '快照日期', illustrativeUniverse: '示例股票数',
      checkPassed: '分解恒等式核对通过', checkFailed: '分解恒等式在容差范围内无法核对', checkUnavailable: '数值缺失，无法核对分解恒等式',
      noData: '暂无分解数据', demo: '说明性演示快照',
      identity: 'RV = IVhat + RJV；RJV = RLJV + RSJV。大跳跃与小跳跃是 RJV 的组成部分，因此单独展示其占比，避免在 RV 中重复相加。',
      observedValues: '观测值',
      boundary: '当前显示的是同一日期下 3 只股票的示例，只用于说明分解方式；不能据此判断跳跃发生频率或预测未来收益。',
    },
    fundamentals: {
      conclusionLabel: '当前结论', conclusion: '这里展示财务数据在当时是否可用、样本覆盖是否完整；这些指标目前还没有证据证明能预测股票收益。',
      back: '← 因子总览', eyebrow: '基本面状态 / 04',
      title: '经营状态，逐步成为研究信号。',
      lede: '查看只使用当时已公开信息（点时数据）的财务指标和样本覆盖。图表说明数据范围；目录中的指标还没有证明能预测股票收益。',
      metric: '序列指标', ticker: '示例股票', latestDistribution: '最新营业利润横截面',
      distributionNote: '标准化营业利润试算在最新可用截面中的分位数；数值为标准化单位，不是货币金额。',
      timeSeries: '代表性 PIT 时间序列', range: '观测日期', observations: '个有效观测',
      exampleCoverage: '处理股票池包含 6,736 只股票，公开时间序列仅提供 3 只代表性股票。全量覆盖统计与示例序列的统计粒度不同。',
      demo: '说明性快照', publicSnapshot: '公开 PIT 快照', noSeries: '当前选择没有可用序列。',
      availabilityEyebrow: '数据覆盖', coreEyebrow: '核心研究集合', coreTitle: '先看这六个', catalogEyebrow: '因子目录', guardrailsEyebrow: '研究边界', guardrailsTitle: '方法限制',
      pitRange: 'PIT 观察区间', processedUniverse: '处理股票池', timeSeriesExamples: '公开时间序列示例', availabilityLabel: '可用日期口径', latestCoverageTitle: '最新营业利润截面覆盖',
      processedTickers: '处理股票数', pitCoverage: 'PIT 股票池覆盖', validOperatingProfit: '营业利润有效值', validShare: '有效值比例', latestAvailable: '最新可用截面', median: '最新中位数', standardizedProxy: '标准化营业利润试算', valid: '有效', missing: '缺失', entries: '个研究入口',
      availabilityBasis: '点时观察日期', researchNotes: [
        '公开观测为点时快照；精确的数据可用日映射未公开。',
        '只有完整观测满足要求后才发布滚动研究值；历史不足时保留缺失值。',
        '公开资料提供研究定义和聚合诊断，不披露精确实现配方。',
        '在人力成本历史覆盖和预测性评估公开前，人力资本条目仍是研究假设。',
        '标准化营业利润值需具备四个完整季度和六个历史 TTM 观测后才会生成，否则为空。',
        'TTM 推导将报表字段视为财年累计值；用于回测前应先验证这一数据契约。',
      ],
      loadingChart: '正在加载图表…',
      metricLabels: {
        standardized_operating_profit: '标准化营业利润', roe: '净资产收益率（ROE）', roa: '总资产收益率（ROA）',
        net_profit_yoy: '净利润同比', revenue_yoy: '营业收入同比',
      },
      factorDescriptions: {
        standardized_operating_profit: '营业利润相对企业自身历史状态的变化；公开截面为研究试算指标。',
        roe: '代表性 PIT 快照中的净资产收益率序列。', roa: '代表性 PIT 快照中的总资产收益率序列。',
        net_profit_yoy: '代表性 PIT 快照中的净利润同比序列。', revenue_yoy: '代表性 PIT 快照中的营业收入同比序列。',
      },
    },
  },
}
