# ARCHITECTURE.md

## 项目性质

Deepflow 是一个 Sui DeFi 原子化资金执行中间件。

它不是单纯前端项目，也不是普通后端服务。核心架构应围绕 Sui PTB、Move 合约、TypeScript SDK 和策略校验模块展开。

当前仓库仍处于文档阶段，尚未创建实际代码结构。

## 主要技术栈

计划使用：

- Sui Move
- Sui Programmable Transaction Block
- TypeScript
- Sui TypeScript SDK
- DeepBook SDK 或 DeepBook 合约接口
- 单元测试框架，例如 Vitest
- 可选前端：Next.js、React、Tailwind CSS、shadcn/ui

可选集成：

- NAVI Protocol
- DeepBook 

## 总体架构

Deepflow 的目标执行链路如下：

```text
User / Bot / AI Agent
  -> Deepflow SDK
  -> Intent Normalization
  -> Policy Validation
  -> Quote / Route Planning
  -> PTB Builder
  -> Simulation / Dry Run
  -> Session Authorization
  -> Sui On-chain Execution
  -> Result / Telemetry
```

目标链上资金流如下：

```text
DeFi Credit Source
  -> withdraw / borrow
  -> DeepBook trade 或 Predict action
  -> settle
  -> repay / redeposit / return to whitelist destination
```

整个资金流必须原子化执行。

## 核心模块

### 1. TypeScript SDK

SDK 是开发者和 Bot 接入 Deepflow 的主要入口。

建议 API：

- `safeExecute(intent, policyRef)`
- `validateIntent(intent, policy)`
- `quoteExecution(intent, creditSources)`
- `buildPtb(routePlan)`
- `simulateExecution(ptb)`

SDK 负责：

- 接收用户或 Agent 的交易意图。
- 规范化参数。
- 调用策略校验模块。
- 生成 route plan。
- 构建 PTB。
- 执行 dry run 或 simulation。
- 返回成功、失败或拒绝原因。

### 2. Policy Engine

Policy Engine 负责在执行前判断请求是否安全。

必须支持的校验：

- 资产是否允许。
- 交易市场是否允许。
- 单次金额是否超限。
- 周期额度是否超限。
- 目的地是否在白名单中。
- 滑点是否超限。
- Session Key 是否有效。
- 执行频率是否异常。
- 连续失败次数是否超限。
- Kill Switch 是否开启。

拒绝结果应使用稳定 reason code，例如：

- `DESTINATION_NOT_ALLOWED`
- `SLIPPAGE_TOO_HIGH`
- `BUDGET_EXCEEDED`
- `SESSION_SCOPE_DENIED`
- `KILL_SWITCH_ACTIVE`
- `STALE_QUOTE`
- `REPEATED_FAILURE_LIMIT`

### 3. PTB Builder

PTB Builder 负责把已经通过校验的 route plan 转换为 Sui PTB。

PTB Builder 不负责决定请求是否安全。它只能接收已验证的 `RoutePlan`。

建议拆分为 Adapter：

- DeepBook Adapter
- DeepBook Predict Adapter
- Credit Source Adapter
- Settlement Adapter
- Fee Adapter

### 4. Move Contracts

Move 合约用于承载最终资金安全约束。

建议模块：

- `automation_vault`
  - 管理执行额度。
  - 管理 Session Authority。
  - 记录 Vault / Credit Source 配置。

- `policy_guard`
  - 校验目的地。
  - 校验预算。
  - 管理 Kill Switch。
  - 管理异常计数。

- `credit_router`
  - 对接 DeFi liquidity source。
  - 处理 withdraw / borrow。
  - 处理 repay / redeposit。

架构原则：

- SDK 校验用于提升开发体验和减少无效交易。
- Move 合约校验用于保护真实资产。
- 凡是会影响资金去向、额度和权限的规则，最终都应能在链上强制执行。

### 5. Dashboard

Dashboard 不是 MVP 的第一优先级，但后续可以提供：

- Execution Budget 展示。
- Active Sessions 展示。
- Credit Sources 展示。
- Approved / Rejected Tx 记录。
- Runtime Alerts。
- Kill Switch 状态。
- Policy Presets。

建议技术栈：

- Next.js
- React
- TypeScript
- shadcn/ui
- Recharts 或 ECharts

## 核心数据模型

### ExecutionIntent

表示用户或 Agent 的执行意图。

字段示例：

- market
- side
- inputAsset
- outputAsset
- amount
- minOutput
- destination
- deadline
- strategyId

### ExecutionPolicy

表示用户配置的安全策略。

字段示例：

- allowedAssets
- allowedMarkets
- allowedDestinations
- maxAmountPerExecution
- maxAmountPerPeriod
- maxSlippageBps
- maxExecutionsPerPeriod
- sessionScope
- killSwitchEnabled

### CreditSource

表示可被 Deepflow 调度的资金来源。

字段示例：

- protocol
- asset
- availableLiquidity
- withdrawRule
- repayRule
- redepositRule

### RoutePlan

表示准备构建为 PTB 的执行路线。

字段示例：

- sourceOperations
- tradeOperation
- settlementOperations
- feeOperation
- expectedFinalState

### ExecutionResult

表示执行结果。

字段示例：

- status
- txDigest
- reasonCode
- inputAmount
- outputAmount
- feeAmount
- finalDestination

## 信任边界

- User Wallet：用户资产控制来源。
- Session Key：Bot 的有限执行权限。
- AI Agent / Bot：不可信调用方。
- Deepflow SDK：构建和校验执行请求，但不能作为唯一安全边界。
- Move Contracts：资金安全的最终强约束。
- DeepBook：交易执行场所。
- DeFi Protocols：提供生息资金来源和重新存入目标。

## 安全不变量

- 资金最终不能进入非白名单地址。
- 执行金额不能超过配置预算。
- 交易不能缺少滑点或最小输出约束。
- 失败执行不能产生服务费。
- 失败执行不能留下未追踪中间资产。
- Kill Switch 开启后不能继续执行新请求。
- Session Key 不能越权访问用户完整钱包。
- Agent 不能绕过 Policy Engine 直接构造高权限资金流。

## 建议目录结构

未来可以采用以下结构：

```text
packages/
  sdk/
    src/
      intent/
      policy/
      routing/
      adapters/
      simulation/
    tests/

move/
  deepflow/
    sources/
    tests/

apps/
  dashboard/

docs/
  prd.md
```

## 推荐实现顺序

第一阶段：

- 创建 TypeScript SDK 原型。
- 实现核心类型。
- 实现 Policy Engine。
- 使用 mock route plan 模拟 PTB。
- 添加单元测试。

第二阶段：

- 接入 Sui SDK。
- 增加 PTB Builder。
- 增加 DeepBook mock adapter。
- 增加 Credit Source mock adapter。

第三阶段：

- 创建 Move 合约。
- 实现 Vault、Policy Guard、Kill Switch。
- 添加 Move 测试。

第四阶段：

- 接入真实 DeepBook 和一个 DeFi 协议。
- 增加 simulation / dry run。
- 再考虑 Dashboard。

## 当前未决架构问题

- 首个 MVP 路由是 DeepBook Predict 还是 DeepBook spot。
- 第一版是否需要真实 Move 合约，还是先做 SDK simulation。
- 首个 DeFi credit source 是 NAVI、Cetus 还是 mock。
- Session Key 的具体实现方式。
- 费用收取逻辑在 SDK、PTB 还是 Move 合约中实现。
