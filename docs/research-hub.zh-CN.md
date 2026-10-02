# 研究证据总览（中文参考）

英文规范以 [research-hub.md](research-hub.md) 为准。

专题列表提供证据矩阵、市场、证据阶段与文本筛选，以及人工整理的结论变化记录。详情页先保留当前结论与限制，再展示早期解释、复核依据、当前解释和关联研究。早期正向结果、无效基线都保留为历史记录，不代表当前验证结论。

## 同口径对照

`studies/compare` 只读取登记的对照组。每组限定到一个已复核图表、基线、指标方向，可进一步限定系列。模型对照一次选择一个样本切片或期限；因子变体对照一次选择一个指标。研发 20 日与 220 日组分别展示，因为月度样本不同。营收和净利润变换误差的单位不同，也分别展示。差值仅为显示指标的算术差，不代表显著性或收益归因；缺失值不补零。

关联研究使用对称链接并说明关联理由，不能据此推断绩效可以跨研究迁移。研究假设和协议阶段不提供虚构的绩效图。

## 来源复核

`research-source-review.json` 将公开投影、目录和来源文档内容摘要固定到原先发布的 owner 版本。基线只包含公开文档标识和哈希，不包含私有文档路径。目录哈希排除来源检查状态，整个总览登记表另外计算哈希。

离线检查公开投影完整性：

```sh
python scripts/audit_research_updates.py --check
```

检查 owner 当前内容，并在仓库外保存报告：

```sh
python scripts/audit_research_updates.py --owner-root "$RESEARCH_OWNER_ROOT" --report-dir "$RESEARCH_REVIEW_ROOT"
```

审计读取当前来源字节，包括未提交编辑。无关提交不会触发复核；内容变化标为 `needs_review`，来源缺失标为 `unavailable`。按 front matter 的稳定标识解析，因此移动未改内容的文档不会误报；重复标识会使审计失败。

报告保留时间戳文件和原子更新的 `latest.json`。`--catalog-status-out` 只生成仓库外的状态候选，人工检查后走正常 PR 发布。审计不会改写结论、提升证据等级、读取冻结绩效或自动发布。页面状态是注明时间的快照，不是实时保证。

人工核查来源变更与结论后，按需更新探索资产的来源版本，再用 `--capture-baseline --owner-root "$RESEARCH_OWNER_ROOT"` 显式记录新基线。不能为消除告警而直接重置基线。整篇文档的变化提示较保守，并不证明该专题结论发生变化。

## 每日运行

`scripts/systemd/` 提供用户服务和定时器模板，每天只读审计；安装时按现有个人配置分组调整 EnvironmentFile 路径。`OBSERVATORY_ROOT` 指向稳定生产 `current`，`RESEARCH_OWNER_ROOT` 指向权威 owner checkout，`RESEARCH_REVIEW_ROOT` 指向仓库外报告目录。个人路径写入项目配置目录的环境文件，不进入版本化模板。定时器明确使用 Asia/Shanghai 时区，不需要网络、凭证或自动发布。

生产审计跟随合并后的正式版本。失败应通过用户服务状态与日志查看，不能将失败展示为成功检查。
