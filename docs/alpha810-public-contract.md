# Alpha 810 Public Contract

本站消费 `money-trees` 生成的静态 Alpha 810 研究快照，不执行因子计算、模型训练或完整回测。

## 快照身份

公开快照必须满足：

- `kind` 为 `moneytree_factor_evidence_snapshot`；
- `schema_version` 为 `"1.0"`；
- 带有 `generated_at`、`data_version`、`dataset`、`config` 和 `public_limits`；
- 每个因子带有因子族、覆盖率、IC、RankIC 和可选的分组收益。

## 允许展示的内容

- 因子名称和因子族；
- 样本区间、覆盖率、有效观测数和数据版本；
- 聚合 IC、RankIC、正值比例和分组平均收益；
- 快照生成时间、研究口径和公开限制。

## 禁止展示的内容

- 逐股票因子值或逐股票收益；
- 组合权重、持仓、交易明细或执行结果；
- 原始数据路径、凭证、私有参数和未审计的内部实现细节。

Alpha 810 页面是公开研究证据浏览器，不构成投资建议。需要了解生成方式、数据版本和发布审计时，请查看 [money-trees MkDocs 文档](https://runchengxie.github.io/money-trees/)。

## 页面指标口径

- IC 与 RankIC 分别为逐日横截面 Pearson 和 Spearman 相关系数；页面显示其跨有效日期的均值。
- IR 为有效日期相关系数的均值除以总体标准差；正值比例为有效日期中相关系数大于零的比例。
- 分组按每个日期的有效因子值从低到高排序，G1 最低、G5 最高。先计算每个日期、每个组的横截面平均收益，再对该组的有效日期求简单平均；`periods` 是有效日期数。
- 分组收益是一次收益观测的百分比，未复利，也未扣除交易成本。
- 公开快照只给出收益字段 `next_period_return`。精确持有期和执行时点未写入当前契约，因此页面不据此推断可交易收益。
- 质量门禁检查覆盖率低于 80% 的因子和缺失 RankIC 均值的因子。`quality.source.generated_at` 记录质量报告引用的源快照时间，可能与最终组装快照的 `generated_at` 不同；契约没有单独的质量检查执行时间字段。

这些定义与 provider 的公开快照计算代码核对过。若 provider 更改方法，需同步更新契约与页面说明。
