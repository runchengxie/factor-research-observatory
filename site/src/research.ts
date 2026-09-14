import type {
  ExplorerFilters,
  ExplorerSort,
  Factor,
  FactorRecord,
  FactorStatus,
  FundamentalCatalog,
  FundamentalFactor,
  FundamentalSnapshot,
  ResearchContext,
  Snapshot,
} from './types'

type Metadata = Pick<FactorRecord, 'definition' | 'intuition' | 'interpretationHigh' | 'interpretationLow' | 'unit' | 'transformHint' | 'failureModes' | 'subfamily'>

const statusLabel: Record<FactorStatus, string> = { descriptive: '描述性快照', experimental: '实验性', validated: '已验证' }

const minuteMetadata: Record<string, Metadata> = {
  volume_volatility: { definition: '描述日内成交活跃度的相对波动。', intuition: '成交活动越不稳定，日内状态切换越明显。', interpretationHigh: '成交活动波动更高', interpretationLow: '成交活动更稳定', unit: 'ratio', transformHint: '公开页面只展示聚合诊断', failureModes: ['低成交量股票可能产生不稳定比率'], subfamily: 'volume' },
  star_volatility: { definition: '描述交易活动异常时的价格风险。', intuition: '放量伴随的价格变化可能反映信息到达或流动性冲击。', interpretationHigh: '异常交易时价格波动更强', interpretationLow: '异常交易时价格反应更平稳', unit: 'return variance', transformHint: '适合与交易状态一起解释', failureModes: ['成交活动峰值和缺失观测会影响结果'], subfamily: 'volume / volatility' },
  illiquidity: { definition: '描述交易规模对应的价格冲击成本。', intuition: '相同交易规模造成更大价格变化，意味着市场更难吸收交易。', interpretationHigh: '价格冲击成本更高', interpretationLow: '市场流动性更好', unit: 'impact ratio', transformHint: '需结合分布和极端值诊断', failureModes: ['极低成交额会放大极端值'], subfamily: 'liquidity' },
  price_elasticity: { definition: '描述交易活动与价格区间变化之间的敏感度。', intuition: '相同交易规模下振幅更大，表示价格更敏感。', interpretationHigh: '价格对交易活动更敏感', interpretationLow: '价格对交易活动更不敏感', unit: 'factor-specific', transformHint: '应检查缺失和极端观测', failureModes: ['停牌或缺失观测会改变相对关系'], subfamily: 'liquidity' },
  realized_variance: { definition: '描述单日价格路径的聚合波动程度。', intuition: '把日内价格变化压缩成可比较的波动状态。', interpretationHigh: '实现波动更高', interpretationLow: '价格路径更平稳', unit: 'variance', transformHint: '公开页面不展示内部计算配方', failureModes: ['微观结构噪声和缺失观测会影响估计'], subfamily: 'realized moments' },
  realized_skewness: { definition: '描述日内收益分布的方向不对称性。', intuition: '正负尾部不对称可能反映买卖压力差异。', interpretationHigh: '正向尾部更强', interpretationLow: '负向尾部更强', unit: 'dimensionless', transformHint: '对极端观测敏感', failureModes: ['观测数量较少时高阶统计量不稳定'], subfamily: 'realized moments' },
  realized_kurtosis: { definition: '描述日内收益分布的尾部和尖峰程度。', intuition: '尾部更厚通常意味着极端分钟变化更集中。', interpretationHigh: '尾部风险更明显', interpretationLow: '日内收益更接近轻尾分布', unit: 'dimensionless', transformHint: '应结合分位数诊断', failureModes: ['高阶统计量对极端观测高度敏感'], subfamily: 'realized moments' },
  ivhat: { definition: '描述连续波动背景的稳健统计量。', intuition: '将连续波动背景与离散跳跃风险分开观察。', interpretationHigh: '连续波动背景更强', interpretationLow: '连续波动背景更弱', unit: 'variance', transformHint: '应与跳跃分解结果一起阅读', failureModes: ['样本量和价格异常会影响估计'], subfamily: 'jump decomposition' },
  rjv: { definition: '描述离散跳跃对实现波动的贡献。', intuition: '识别不能由连续价格路径解释的变化。', interpretationHigh: '跳跃风险贡献更高', interpretationLow: '跳跃风险贡献更低', unit: 'variance', transformHint: '应结合连续波动背景观察', failureModes: ['分解误差会传导到跳跃值'], subfamily: 'jump decomposition' },
  rljv: { definition: '描述较大离散跳跃风险的集中程度。', intuition: '将跳跃风险中更极端的部分单独观察。', interpretationHigh: '大跳跃风险更集中', interpretationLow: '大跳跃风险更弱', unit: 'variance', transformHint: '公开页面不展示阈值细节', failureModes: ['极端事件和阈值定义会改变结果'], subfamily: 'jump decomposition' },
  rsjv: { definition: '描述较小离散跳跃的补充贡献。', intuition: '补充较大跳跃之外的频繁小幅离散变化。', interpretationHigh: '小跳跃贡献更高', interpretationLow: '小跳跃贡献更低', unit: 'variance', transformHint: '应与整体跳跃贡献一起观察', failureModes: ['依赖跳跃分解稳定性'], subfamily: 'jump decomposition' },
}

const hermiteMetadata: Metadata = {
  definition: '描述滚动因子分布相对稳定参考形状的偏离程度。',
  intuition: '形状信息可以补充均值和方差，识别不对称、厚尾或状态变化。',
  interpretationHigh: '非标准分布形状更明显',
  interpretationLow: '分布形状更接近稳定参考状态',
  unit: 'dimensionless',
  transformHint: '这是一种研究诊断，不是正式正态性检验',
  failureModes: ['较短观察期和异常值会影响高阶统计量'],
  subfamily: 'distribution shape diagnostics',
}

function genericMinuteMetadata(factor: Factor): Metadata {
  return {
    definition: factor.definition,
    intuition: '用于描述日内价格、成交量或跳跃状态，不单独构成收益预测结论。',
    interpretationHigh: '该统计量相对更高',
    interpretationLow: '该统计量相对更低',
    unit: 'factor-specific',
    transformHint: '研究时应结合分布、缺失和极端值检查',
    failureModes: ['缺失观测、低成交量和极端值可能影响结果'],
    subfamily: 'microstructure',
  }
}

function minuteRecord(factor: Factor, snapshot: Snapshot): FactorRecord {
  const metadata = factor.name.startsWith('h_') || factor.name.startsWith('vol_') && factor.name.includes('_ts_') ? hermiteMetadata : minuteMetadata[factor.name] ?? genericMinuteMetadata(factor)
  const stats = snapshot.cross_section.filter((item) => item.metric === factor.name).sort((a, b) => b.date.localeCompare(a.date))[0]
  return {
    id: factor.name,
    displayName: factor.name,
    family: factor.family,
    subfamily: metadata.subfamily,
    frequencyIn: 'minute',
    frequencyOut: 'daily',
    status: 'descriptive',
    definition: metadata.definition,
    intuition: metadata.intuition,
    interpretationHigh: metadata.interpretationHigh,
    interpretationLow: metadata.interpretationLow,
    unit: metadata.unit,
    transformHint: metadata.transformHint,
    failureModes: metadata.failureModes,
    coverage: stats ? { count: stats.count } : undefined,
    statistics: stats ? { date: stats.date, count: stats.count, p01: stats.p01, p25: stats.p25, p50: stats.p50, p75: stats.p75, p99: stats.p99 } : undefined,
    series: snapshot.series.filter((item) => item.metric === factor.name),
  }
}

function fundamentalRecord(factor: FundamentalFactor, snapshot: FundamentalSnapshot): FactorRecord {
  const stats = snapshot.latest_cross_section.metric === factor.id ? snapshot.latest_cross_section : undefined
  const total = stats ? stats.count + snapshot.latest_cross_section.missing : undefined
  return {
    id: factor.id,
    displayName: factor.name,
    displayNameCn: factor.name,
    family: factor.family,
    subfamily: factor.priority === 'core' ? 'core research set' : 'supporting research set',
    frequencyIn: 'PIT quarterly reports',
    frequencyOut: 'disclosure-date snapshot',
    status: factor.research_status,
    definition: factor.definition,
    intuition: factor.meaning,
    interpretationHigh: '指标值相对更高，具体方向取决于研究定义',
    interpretationLow: '指标值相对更低，具体方向取决于研究定义',
    unit: 'factor-specific',
    transformHint: '公开页面只展示研究定义与聚合诊断',
    failureModes: ['披露时点、口径变化和一次性项目可能影响解释'],
    researchEvidence: factor.evidence,
    coverage: stats ? { count: stats.count, missing: snapshot.latest_cross_section.missing, total } : undefined,
    statistics: stats ? { count: stats.count, p01: stats.p01, p25: stats.p25, p50: stats.p50, p75: stats.p75, p99: stats.p99 } : undefined,
    series: snapshot.series.filter((item) => item.metric === factor.id),
  }
}

export function adaptMinuteAndHermite(snapshot: Snapshot): FactorRecord[] {
  return snapshot.factors.map((factor) => minuteRecord(factor, snapshot))
}

export function adaptFundamentals(catalog: FundamentalCatalog, snapshot: FundamentalSnapshot): FactorRecord[] {
  return catalog.factors.map((factor) => fundamentalRecord(factor, snapshot))
}

export function toResearchRecords(snapshot: Snapshot, catalog: FundamentalCatalog, fundamental: FundamentalSnapshot): FactorRecord[] {
  return [...adaptMinuteAndHermite(snapshot), ...adaptFundamentals(catalog, fundamental)]
}

export function filterResearchRecords(records: FactorRecord[], filters: ExplorerFilters): FactorRecord[] {
  const query = filters.query.trim().toLocaleLowerCase()
  return records.filter((record) => {
    const searchable = [record.id, record.displayName, record.displayNameCn, record.family, record.subfamily, record.definition, record.intuition].filter(Boolean).join(' ').toLocaleLowerCase()
    return (!query || searchable.includes(query)) && (!filters.family || record.family === filters.family) && (!filters.frequency || record.frequencyIn === filters.frequency) && (!filters.status || record.status === filters.status)
  })
}

export function sortResearchRecords(records: FactorRecord[], sort: ExplorerSort): FactorRecord[] {
  return [...records].sort((a, b) => {
    if (sort === 'coverage') return (b.coverage?.count ?? -1) - (a.coverage?.count ?? -1) || a.id.localeCompare(b.id)
    if (sort === 'status') return statusLabel[a.status].localeCompare(statusLabel[b.status]) || a.id.localeCompare(b.id)
    return a.displayName.localeCompare(b.displayName) || a.id.localeCompare(b.id)
  })
}

export function buildResearchContext(snapshot: Snapshot, fundamental: FundamentalSnapshot): ResearchContext {
  const dataset = snapshot.datasets[0]
  const pitReady = fundamental.validation.all_market_computed
  return {
    source: snapshot.source === 'demo' ? 'demo snapshot' : 'published snapshot',
    snapshotRange: dataset ? `${dataset.date_start} → ${dataset.date_end}` : `${fundamental.coverage.date_start} → ${fundamental.coverage.date_end}`,
    universe: dataset ? `${dataset.tickers} tickers` : `${fundamental.coverage.tickers_count} A-share tickers`,
    frequency: 'market observations → research snapshot',
    pitStatus: pitReady ? `point-in-time basis: ${fundamental.validation.availability_basis}` : 'point-in-time validation incomplete',
    status: pitReady ? 'experimental' : 'descriptive',
    notes: [
      `Published vintage: ${fundamental.vintage}`,
      `Historical observations used: ${fundamental.validation.history_observations}; complete observations required: ${fundamental.validation.complete_observations_required}`,
      'Snapshot is for research display and is not a validated backtest result.',
    ],
  }
}

export function statusText(status: FactorStatus): string {
  return statusLabel[status]
}
