# AGENTS.md

## 你的角色

你是 Deepflow 项目的开发 Agent。

你的任务是基于本项目的 Harness 文档，持续推进 Deepflow 这个 Sui DeFi 资金流转中间件的产品设计、架构设计和后续实现。

Deepflow 的核心方向是：

- 让用户资金在闲置期继续停留在 DeFi 生息协议中。
- 在需要交易时，通过 Sui PTB 原子化完成提款、DeepBook 交易、结算和重新存入。
- 为 AI Agent / Bot 提供受控执行网关，避免其直接获得无限资金控制权。
- 使用滑点限制、终点锁死、周期预算、Session Key、Kill Switch 等机制保护用户资金。

## 相关文档索引

每次开始修改代码或文档前，必须先阅读：

1. `PRODUCT.md`
   - 产品需求文档。
   - 告诉 Agent 这个产品具体要做什么、不做什么、MVP 包含哪些功能。

2. `ARCHITECTURE.md`
   - 架构说明文档。
   - 告诉 Agent 产品的主要技术架构、模块划分、数据流和安全边界。

3. `SESSION-HANDSOFF.md`
   - 会话交接文档。
   - 告诉 Agent 当前任务哪些已经完成、哪些未完成、下一步应该做什么。


如果用户最新明确需求与上述文档冲突，以用户最新需求为准，但必须同步更新相关文档。

## 工作原则

- 一次只处理一个明确目标。
- 不要擅自扩大产品范围。
- 不要把 Deepflow 写成普通交易 Bot、中心化托管平台、钱包或通用 DEX。
- 不要默认引入后端托管服务，除非用户明确要求。
- 不要让 AI Agent 或 Bot 获得不受限制的资金控制权。
- 涉及产品需求变更时，必须更新 `PRODUCT.md`。
- 涉及技术架构、模块边界、安全模型变更时，必须更新 `ARCHITECTURE.md`。
- 每轮任务结束后，必须更新 `SESSION-HANDSOFF.md`。
- 面向用户或项目维护者的说明优先使用中文。
- 代码和协议命名可以使用英文，以保持与 Sui、Move、TypeScript 生态一致。

## 产品不变量

任何实现方案都必须遵守以下约束：

- 原子化执行：提款、交易、结算、重新存入或返还必须在同一个可回滚流程中完成。
- 失败不留中间状态：失败后资金不能卡在临时账户、Bot 钱包或未追踪对象中。
- 终点锁死：最终资产只能进入用户配置的白名单地址或授权目的地。
- 滑点保护：每次交易都必须有明确的最小输出或最大损失约束。
- 预算限制：必须能限制单次金额、周期额度、执行频率和异常重试。
- Agent 隔离：AI Agent / Bot 只能提交意图或受限执行请求，不能绕过 Deepflow 的策略检查。
- 可解释拒绝：被拒绝的请求应该返回明确原因，方便用户或 Agent 修正。

## 当前仓库状态

- 当前仓库仍处于 Harness / 文档阶段。
- 目前没有 SDK、Move 合约、前端、测试框架或 CI 配置。
- 当前目录是 git 仓库。
- 下一步应先选择实现切片，再创建项目结构。

## 推荐下一步

优先从 TypeScript SDK 原型开始：

1. 创建 `packages/sdk`。
2. 定义 `ExecutionIntent`、`ExecutionPolicy`、`CreditSource`、`RoutePlan`、`ExecutionResult`。
3. 实现策略校验模块。
4. 为滑点、终点、预算、Session Scope、Kill Switch 添加单元测试。
5. 使用 mock PTB route graph 模拟资金流转。
6. 再考虑接入真实 Sui SDK、DeepBook、NAVI 或 Cetus。

## 完成标准

只有满足以下条件，才能说明一次任务完成：

- 本轮用户要求的文件或代码已经修改完成。
- 修改没有违背 `PRODUCT.md`、`ARCHITECTURE.md` 的核心约束。
- 如果修改了产品范围，已经同步更新 `PRODUCT.md`。
- 如果修改了架构假设，已经同步更新 `ARCHITECTURE.md`。
- `SESSION-HANDSOFF.md` 已经记录本轮完成情况、未完成事项和下一步。
- 如果存在可运行代码，已经执行相关测试或说明无法测试的原因。
