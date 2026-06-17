# PRODUCT.md

## 产品名称

Deepflow

## 产品简介

Deepflow 是一个面向 Sui 生态的 DeFi 资金流转中间件。

它帮助用户在资金保持 DeFi 生息的同时，通过 Sui PTB 将提款、DeepBook 交易、结算和重新存入封装为一个原子化执行流程。

Deepflow 也可以作为 AI Agent / Bot 的受控执行网关。Agent 可以提交交易意图，但资金是否能被调度、最多能调度多少、最终能流向哪里，都必须由 Deepflow 的策略和合约约束决定。

## 产品定位

Deepflow 不是普通交易 Bot，也不是中心化托管平台。

它位于用户资金、生息协议、DeepBook 和 AI Agent / Bot 之间，提供安全、可组合、可回滚的资金执行层。

核心价值：

- 提高资金利用率。
- 减少手动提款、交易、存款的多步操作。
- 降低 AI Agent / Bot 误操作资金的风险。
- 为 Sui DeFi 自动化策略提供标准化执行路由。

## 目标用户

Deepflow 面向 Sui 生态中关注资金效率和自动化执行的用户。

典型用户包括：

- 使用 Sui DeFi 协议生息的交易者。
- 希望做自动 DCA 的用户。
- 使用 DeepBook 或 DeepBook Predict Bot 的开发者。
- 希望用 AI Agent 辅助交易但不愿交出完整资金控制权的用户。
- 想把 DeFi 存款直接作为自动化 Execution Credit 的个人开发者。

## 核心问题

当前用户在 DeFi 自动化交易中面临以下问题：

- 资金闲置：为了交易或 Bot 自动化，用户常常需要提前把资金放入 Bot 钱包或无收益账户。
- 操作割裂：提款、交易、结算、重新存入通常是多个独立步骤，容易出错且成本高。
- AI Agent 风险高：Agent 可能生成错误交易、无限循环或异常资金操作。
- Bot 钱包管理复杂：用户需要额外维护独立钱包，导致资金分散。
- 失败状态不可控：链上执行失败时，传统流程可能留下中间状态或难以诊断的错误。

## MVP 核心功能

### 1. 一键资金调度

用户或 Bot 只需要提交一次高级执行请求。

Deepflow 根据请求自动完成：

- 从用户授权的 DeFi 生息位置提取所需资金。
- 路由到 DeepBook 执行交易。
- 将交易后的资产重新存入目标 DeFi 协议或返还到用户白名单地址。

### 2. 原子化执行

Deepflow 需要通过 Sui PTB 将完整资金流转封装为一个原子流程。

流程包括：

1. withdraw / borrow liquidity
2. execute DeepBook trade 或 Predict action
3. settle result
4. repay / redeposit / return
5. update accounting

只要中间任一步失败，整条执行链路都应该回滚。

### 3. 安全风控

Deepflow 必须提供以下基础安全能力：

- 滑点熔断：交易必须设置最小输出或最大可接受损失。
- 终点锁死：最终资金只能流向用户配置的白名单地址或授权协议位置。
- 周期预算：限制单次金额、每日或周期执行额度。
- 频率限制：防止 Bot 或 Agent 高频 spam 交易。
- Kill Switch：异常情况下停止新的执行。
- Session Key：允许 Bot 在有限权限内执行，而不是获得完整钱包控制权。
- 失败计数：连续失败或异常重试时触发保护。

### 4. AI Agent 受控执行网关

AI Agent / Bot 可以提交交易意图，但 Deepflow 必须在执行前检查：

- 资产类型是否允许。
- 交易方向是否允许。
- 金额是否超过预算。
- 目的地是否在白名单中。
- 滑点是否超限。
- Session 是否有效。
- Kill Switch 是否开启。

如果不满足要求，Deepflow 应返回明确拒绝原因，而不是尝试执行。

### 5. DeFi-backed Execution Credit

Deepflow 应支持用户把已有 DeFi 资产作为自动化执行信用来源。

MVP 可以先支持一个 credit source，例如：

- NAVI 存款
- Cetus LP
- Mock credit source

不要求第一版同时支持多个协议。

## 核心场景

### 场景一：自动化 DCA

用户资金平时留在 DeFi 生息协议中。

当 DCA 周期触发时，Deepflow 通过 PTB 提取当期所需本金，路由到 DeepBook 完成交易，再把新资产存回生息协议。

用户不需要提前把未来几期的 DCA 资金放在闲置钱包中。

### 场景二：跨协议单步流转

用户希望使用 DeFi 协议中的资产进行 DeepBook 交易。

Deepflow 将提款、交易、重新存入合并为一次执行，减少多次签名和手动操作。

### 场景三：AI Agent / Bot 安全执行

Agent 只负责生成策略或提交意图。

Deepflow 负责检查策略是否符合资金安全规则。

如果 Agent 产生异常指令，Deepflow 应拒绝执行或通过链上回滚保护资金。

## 商业模式

MVP 可考虑以下收入方式：

- 成功执行手续费：只在执行成功时收取固定费用或小比例费用。
- 手续费封顶：大额交易设置单笔最高费用上限。
- DeepBook 返佣：通过标准路由捕获 DeepBook 生态返佣。

未来可选：

- Idle yield spread。
- 高级 Runtime Monitoring。
- Pro Runtime Plan。

## Dashboard — Portfolio 页

Portfolio 页是用户资产总览与链上活动查询入口，帮助用户理解资金在钱包与各 DeFi 协议之间的分布与利用率。

### Summary Stats（资产摘要）

四个核心指标：

- **Total Assets**：用户全部资产（钱包余额 + 所有 DeFi 协议内资产），以 USD 估值汇总。
- **Working Capital**：所有 DeFi 协议内资产（supply / 存款等生息头寸）的 USD 总和。
- **Idle Capital**：所有钱包内闲置资产（按 coinType 去重，避免多协议行重复统计）的 USD 总和。
- **Utilization Rate**：`Working Capital / Total Assets × 100%`，反映资金在 DeFi 中的利用率。

### Asset Composition（资产构成）

- 顶部协议筛选：`ALL` / `NAVI` / `SUILEND` / `WALLET`。
- 饼图展示当前筛选条件下的 **token 分布**（按标的聚合占比与美元值）。
- `ALL`：DeFi 持仓 + 钱包余额；`NAVI` / `SUILEND`：对应协议内 supplied 余额；`WALLET`：去重后的钱包余额。

### Protocol Exposure（协议敞口）

- Treemap 展示用户在 **NAVI / SUILEND / SCALLOP / CETUS / DEEPBOOK / WALLET** 资金桶的 USD 分布；Treemap 内标签字体统一为黑色。
- `WALLET` 桶为去重后的钱包余额总和；其余桶为各协议内 supplied 资产。

### Transaction History（交易历史）

- 展示钱包地址最近的链上交易记录，便于用户查询与核对。
- 支持 `7_DAYS` / `30_DAYS` 时间窗筛选。
- Live 模式通过 Sui JSON-RPC 查询发送方与接收方交易；类型 best-effort 识别（`SUPPLY` / `WITHDRAW` / `BRIDGE` / `GENERIC`）。

### 数据模式

| 模式 | 说明 |
|------|------|
| `mock`（默认） | 使用 `lib/fixtures/` 静态数据演示；不依赖钱包连接。 |
| `live` | 组合 Liquidity 读路径持仓 + RPC 链上交易；需连接 mainnet 钱包查看个人数据。 |

MVP 使用静态 USD 价表估值，**不作为会计系统**，不保证实时价格精度。

## Dashboard — Trading 页

Trading 页是 DeepBook 交易与 Deepflow 原子执行意图的入口，帮助用户在 DeFi credit source 与 DeepBook 现货市场之间完成报价、策略校验与 PTB 模拟。

### Market Pairs（交易对行情）

- 展示 DeepBook mainnet 支持的交易对及 **mid price**（通过 `@mysten/deepbook-v3`）。
- MVP 精选池：`SUI_USDC`、`DEEP_SUI`、`WAL_SUI`、`DEEP_USDC`、`SUI_SUIUSDE`、`SUIUSDE_USDC`、`XBTC_USDC`。
- 点击切换当前 Swap 目标池。

### DeepBook Swaps（swap 成交历史）

- 展示用户在 DeepBook 上的 **swap 成交记录**（均为 `FILLED`），非 order book 深度或限价单挂单。
- Live 模式：Sui RPC 解析用户交易中 `swap_exact_*` MoveCall（不依赖 Balance Manager）+ 可选 DeepBook Indexer `/trades/:pool` 按 `digest` 富化数量与方向。
- 未连接钱包时展示空状态说明；无 swap 记录时提示「暂无 DeepBook swap 记录」。

### Swap Widget（兑换与报价）

- **SOURCE / DESTINATION**：分段选择 `WALLET / NAVI / SUILEND`；PAY 余额按 SOURCE 展示（WALLET → 钱包持币，NAVI → supplied 余额）；RECEIVE 余额按 DESTINATION 展示。
- **Rate / Fee**：来自 DeepBook `getQuantityOutInputFee` 链上报价（mock 模式用 fixture 估算）。
- **Execute**：按 SOURCE × DESTINATION 路由至不同真实 dry-run PTB（支持上述 7 个精选池的双向 swap）；dry-run 通过后按写路径模式决定仅模拟或签名上链。

| 模式 | 环境变量 | 行为 |
|------|----------|------|
| `simulate`（默认） | `NEXT_PUBLIC_TRADING_WRITE_MODE` 未设置或 `simulate` | dry-run 通过后显示「模拟通过」，不弹钱包签名 |
| `execute` | `NEXT_PUBLIC_TRADING_WRITE_MODE=execute` | dry-run 通过后弹出钱包签名并上链；需 `NEXT_PUBLIC_DATA_SOURCE=live` |

| Source | Destination | 行为 |
|--------|-------------|------|
| WALLET | WALLET | 钱包 input → DeepBook swap → 钱包 output |
| WALLET | NAVI | 钱包 input → DeepBook swap → NAVI deposit output |
| WALLET | SUILEND | 钱包 input → DeepBook swap → Suilend deposit output |
| NAVI | NAVI | NAVI withdraw input → swap → NAVI supply output |
| NAVI | WALLET | NAVI withdraw input → swap → 钱包 output |
| NAVI | SUILEND | NAVI withdraw input → swap → Suilend deposit output |
| SUILEND | SUILEND | Suilend withdraw input → swap → Suilend supply output |
| SUILEND | WALLET | Suilend withdraw input → swap → 钱包 output |
| SUILEND | NAVI | Suilend withdraw input → swap → NAVI deposit output |

Suilend **源**（SOURCE=SUILEND）要求已有 obligation 与足够 supplied 余额。DESTINATION=SUILEND 且 SOURCE 为 WALLET/NAVI 时，首笔可在同 PTB 内创建 obligation 并存入 swap 产出。

### 数据模式

| 模式 | 说明 |
|------|------|
| `mock`（默认） | 使用 `lib/fixtures/trading.ts` 静态行情与 swap 成交历史；DeFi 余额仍来自 Liquidity mock fixture。 |
| `live` | DeepBook SDK 拉取 mid price / 报价 / 费率；Sui RPC + Indexer 拉取 swap 成交历史；Liquidity live 路径提供 NAVI supplied 余额。 |

环境变量复用 `NEXT_PUBLIC_DATA_SOURCE`（与 Portfolio / Liquidity 一致）。Trading 写路径由 `NEXT_PUBLIC_TRADING_WRITE_MODE` 独立控制。

## Dashboard — Liquidity 页

Liquidity 页是 DeFi 协议 supply / withdraw 头寸管理入口，展示 NAVI / Suilend 等协议的池 APY、用户 supplied 余额与钱包持币。

### Position Management（Supply / Withdraw）

- **Supply**：从钱包 coin 存入协议；表单展示 **Wallet balance**。
- **Withdraw**：从协议取出至钱包；表单展示 **Pool Balance**（supplied 余额）。
- **写路径**：PTB 构建与 dry-run 预检在 `@deepflow/sdk/supply-withdraw`；Dashboard 通过 `useSupplyWithdrawSimulation` 调用，不得直接构造协议交易。

### 写路径模式

| 模式 | 环境变量 | 行为 |
|------|----------|------|
| `simulate`（默认） | `NEXT_PUBLIC_LIQUIDITY_WRITE_MODE` 未设置或 `simulate` | Supply / Withdraw 仅 mainnet dry-run，成功显示「Simulation passed」，不弹钱包签名 |
| `execute` | `NEXT_PUBLIC_LIQUIDITY_WRITE_MODE=execute` | **Supply** dry-run 通过后弹出钱包签名并上链；Withdraw 与 bootstrap 仍仅模拟 |

读路径（池/APY/余额）仍由 `NEXT_PUBLIC_DATA_SOURCE`（`mock` / `live`）独立控制，与写路径模式无关。

## 非目标

MVP 不做以下内容：

- 不做中心化托管。
- 不做完整交易所。
- 不做通用钱包。
- 不做跨链资金管理。
- 不做高频量化平台。
- 不默认要求用户把全部资金转入 Bot 钱包。
- 不同时集成大量 DeFi 协议。

## 待确认问题

- MVP 首个交易路径选择 DeepBook Predict 还是 DeepBook spot。
- MVP 首个 credit source 选择 NAVI、Cetus 还是 mock adapter。
- 哪些策略必须在 Move 合约层强制执行，哪些可先放在 SDK 原型中。
- 第一版是否需要 Dashboard。
- 费用资产、费率和封顶规则如何设计。
