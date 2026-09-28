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
