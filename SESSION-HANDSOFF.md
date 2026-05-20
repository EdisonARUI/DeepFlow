# SESSION-HANDSOFF.md

## 当前任务

基于 `prd.md` 修剪 `README.md`，在保持 README 原有章节框架、`⸻` 分隔、对比表、技术难度表、MVP 二分和商业模式三子节的前提下，确保 README 内容不超出 PRD 范围，并整理 Markdown 格式。

## 已完成

- [x] ~~已读取 `PRODUCT.md`、`ARCHITECTURE.md`、`SESSION-HANDSOFF.md`、`prd.md` 和 `README.md`。~~
- [x] ~~已将 README 主叙事从 DeepBook Predict Bot 执行层收敛为 PRD 定义的 Sui DeFi 资金流转中间件。~~
- [x] ~~已按 PRD 保留并重写核心能力：一键资金调度、PTB 原子化执行、安全风控、AI Agent 受控执行网关、DeFi-backed Execution Credit。~~
- [x] ~~已移除 README 中超出 PRD 的具体承诺：Predict 专属接口、Session Key、Kill Switch、NAVI/Cetus 固定集成、Dashboard 技术栈、Pro Runtime Plan 等。~~
- [x] ~~已将 PRD 未定义但原框架存在的段落改为明确的非当前承诺说明，避免 README 暗示已进入 MVP 范围。~~
- [x] ~~已将原始制表符表格调整为标准 Markdown 表格，并为流程补充 fenced code block。~~
- [x] ~~已保留原 README 框架中的主要分隔与后续章节：技术架构、Bot Wallet 对比、deepbook-sandbox 对比、技术难度评估、MVP 范围、商业模式。~~

## 未完成 / 待处理

- [ ] 确认 MVP 首个 DeFi 生息资金来源。
- [ ] 确认首个 DeepBook 交易路径是否只做 spot。
- [ ] 确认是否需要将 `PRODUCT.md` 和 `ARCHITECTURE.md` 进一步收敛到 `prd.md` 当前版本。
- [ ] 确认下一步是否创建 TypeScript SDK 原型。

## 已验证

- [x] ~~已用 `rg` 检查 README 中残留的 Predict、Session、Kill、NAVI、Cetus、Dashboard、Idle Yield、Pro Runtime 等关键词；仅保留非当前范围说明或原框架标题。~~
- [x] ~~已查看 `git diff -- README.md`，确认 README 内容与 PRD 范围一致，并已整理 Markdown 标题、表格与代码块。~~

## 下一步建议

建议下一轮先确认是否以 `prd.md` 作为唯一产品源，再选择实现切片：

1. 如以 `prd.md` 为准，先同步收敛 `PRODUCT.md` 与 `ARCHITECTURE.md`。
2. 创建 `packages/sdk`。
3. 添加核心类型定义：`ExecutionIntent`、`ExecutionPolicy`、`CreditSource`、`RoutePlan`、`ExecutionResult`。
4. 实现 Policy Engine：滑点、终点、配额与可解释拒绝。
5. 使用 mock route plan 验证提款、DeepBook 交易、结算和重新存入的核心语义。

## 注意事项

- 如果后续修改产品功能，需要同步更新 `PRODUCT.md`。
- 如果后续修改技术方案，需要同步更新 `ARCHITECTURE.md`。
- 每轮任务结束都应更新本文件。
