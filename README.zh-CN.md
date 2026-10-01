# quant-factor-observatory

[English README](README.md)

[打开线上 Observatory](https://runchengxie.github.io/quant-factor-observatory/)

面向公开研究展示的因子 Observatory：浏览因子定义、数据质量、研究状态和已脱敏的聚合证据。

本仓库不是因子计算引擎，也不包含原始行情、财报数据、逐股票信号、组合权重或私有研究代码。研究计算在私有环境完成后，只向本站导出公开契约允许的静态快照。

## 站点入口

- `/`：研究总览与数据上下文
- `/alpha810`：Alpha 810 聚合因子证据目录与详情
- `/factors`：统一因子目录
- `/jumps`：跳跃风险分解展示
- `/hermite`：分布形状与状态展示
- `/fundamentals`：基本面与人力资本研究目录
- `/studies`：PB/ROE、研发投入与职工薪酬的研究专题和证据边界

## 公开数据边界

公开快照可以包含因子名称、研究族、公开研究定义、经济直觉、研究状态、数据质量、脱敏横截面摘要、时间序列示例、聚合归因、point-in-time 状态、覆盖范围和缺失情况。

公开快照不包含精确计算算子、参数窗口、组合规则、原始数据供应商映射、本地路径、逐股票信号、组合权重、交易执行细节、私有回测代码、原始数据或凭证。

## 本地运行

站点直接消费 `site/public/data/` 中已提交的公开快照：

```bash
cd site
npm ci
npm run dev
npm run build
```

更新公开快照时，应在私有研究环境中生成脱敏结果。提交前运行：

```bash
python scripts/audit_public_release.py
python -m unittest discover -s tests -v
```

Alpha 810 快照由 [`money-trees`](https://github.com/runchengxie/money-trees) 生成。当前 schema 1.1 快照覆盖 2016–2025，在聚合 IC、RankIC、覆盖率和分组收益之外，增加年度与沪深 300 市场状态摘要、不确定性估计和全因子多重检验诊断。快照不包含逐证券值、组合权重或原始数据路径；历史输入的 point-in-time 可得性和真实成交价尚未证实。公开契约见 [英文契约](docs/alpha810-public-contract.md) 和[中文参考](docs/alpha810-public-contract.zh-CN.md)；研究专题发布边界见[英文契约](docs/research-publication-contract.md)和[中文说明](docs/research-publication-contract.zh-CN.md)。
