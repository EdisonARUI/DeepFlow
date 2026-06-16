# ARCHITECTURE.md

## 项目性质

Deepflow 是一个 Sui DeFi 原子化资金执行中间件。

它不是单纯前端项目，也不是普通后端服务。核心架构应围绕 Sui PTB、Move 合约、TypeScript SDK 和策略校验模块展开。

当前仓库已有：

- `sdk/` TypeScript SDK 原型（策略校验、mock route、mock PTB、Vitest 测试）
- 仓库根 Next.js Dashboard 占位（四页路由 + dApp Kit 接入）
- `asset/figma/` 设计资产

尚未创建 Move 合约和真实链上 Adapter。

## 主要技术栈

计划使用：

- Sui Move
- Sui Programmable Transaction Block
- TypeScript
- Sui TypeScript SDK
- DeepBook SDK 或 DeepBook 合约接口
- 单元测试框架，例如 Vitest
- 前端：Next.js 15（App Router）、React、TypeScript、Tailwind CSS、shadcn/ui、Recharts、Lucide React
- 钱包接入：@mysten/dapp-kit-react、@mysten/sui

可选集成：

- NAVI Protocol
- DeepBook

## 仓库布局

Deepflow 采用**扁平单仓库**结构：**仓库根即产品 Dashboard**，不是空壳 monorepo。各顶层目录职责如下：

| 目录 | 职责 | 状态 |
|------|------|------|
| `app/`、`components/`、`lib/` | 产品 Dashboard（Next.js App Router） | 四页 UI 已还原；Liquidity 读路径已接 NAVI + Suilend 协议适配层 |
| `sdk/` | 执行中间件 TypeScript SDK（`@deepflow/sdk`） | 原型已完成 |
| `move/` | Move 链上约束合约 | 待建 |
| `asset/figma/` | Figma 设计资产（截图、参考代码、token） | 已有 |
| `docs/` | 产品与设计文档 | 已有 |

模块依赖关系：

```text
Dashboard (仓库根)
  └─ workspace 依赖 ─> sdk/ (@deepflow/sdk)
                          └─ 未来对接 ─> move/

asset/figma/            设计参考，供 Dashboard 实现对照
```

根 `package.json` 同时承担 Dashboard 运行时与 npm workspace 宿主，`workspaces: ["sdk"]` 仅用于 `@deepflow/sdk` 独立测试与发布。

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

### 1. TypeScript SDK（`sdk/`）

SDK 是开发者和 Bot 接入 Deepflow 的主要入口，包名 `@deepflow/sdk`。

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

第一版原型已实现：

- `src/types.ts` 定义核心执行数据模型。
- `src/policy/validate.ts` 实现策略校验。
- `src/routing/mock-route.ts` 使用 mock credit source 与 mock DeepBook route graph 生成 `RoutePlan`。
- `src/simulation/mock-ptb.ts` 输出本地 mock PTB。
- `src/client.ts` 提供 `safeExecute`，执行顺序为策略预检、路由规划、带 quote 复检、构建 mock PTB。
- `src/simulation/simulate-transaction.ts`：`dryRunTransaction` / `devInspectTransaction`（基于 `@mysten/sui` v2 `client.core.simulateTransaction`）。
- `src/credit-source/navi/`：`NaviCreditSourceAdapter`、`buildNaviSupplyTx` / `buildNaviWithdrawTx`（`@naviprotocol/lending` PTB）。
- `src/credit-source/suilend/`：`SuilendCreditSourceAdapter`、`buildSuilendSupplyTx` / `buildSuilendWithdrawTx`（`@suilend/sdk` PTB）。
- `src/supply-withdraw.ts`：`simulateSupplyWithdraw` / `inspectSupplyWithdraw` / `simulateSupplyThenWithdraw` / `inspectSupplyThenWithdraw` 公开 API。
- `src/trade/build-trade-bootstrap-tx.ts`：单 PTB 内 NAVI supply SUI → withdraw SUI → DeepBook `swapExactQuantity`（无 BalanceManager，直接传入 withdraw coin）→ NAVI supply USDC。
- `src/trade/simulate-trade-bootstrap.ts`：`simulateTradeBootstrap` / `inspectTradeBootstrap`。
- SDK 写路径依赖 `@mysten/deepbook-v3`（Dashboard 读路径仍用 `lib/sui/deepbook-client.ts`）。

SDK 已实现 Trading **bootstrap 写路径**（无 NAVI 持仓时 supply→swap→redeposit）与 mainnet 模拟验证；有持仓时的纯 withdraw→swap→redeposit 待后续迭代。

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

### 4. Move Contracts（`move/`）

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

### 5. Dashboard（仓库根 Next.js 应用）

产品 Dashboard 位于仓库根目录（`app/`、`components/`），设计稿落盘于 `asset/figma/`。

#### 技术栈

- **框架**：Next.js 15（App Router）+ TypeScript
- **钱包**：@mysten/dapp-kit-react + @mysten/sui（**固定 mainnet**，与 DeFi 数据层一致）
- **UI**：shadcn/ui（Radix 原语）+ Tailwind CSS
- **图表**：Recharts（Portfolio 饼图 / Treemap、资产分布）
- **图标**：Lucide React（实现阶段逐步替换 Figma 导出图标）
- **字体**：JetBrains Mono（标签/数据）、Geist（品牌标题）
- **SDK 依赖**：根 `package.json` workspace 引用 `@deepflow/sdk`

#### 页面与路由

| 路由 | Figma 节点 | 页面 | SDK 概念映射 |
|------|-----------|------|-------------|
| `/portfolio` | `107:343` | 资产摘要、协议敞口、交易历史 | `ExecutionResult` 遥测 |
| `/liquidity` | `1:542` | DeFi 协议表、Supply/Withdraw | `CreditSource` |
| `/trading` | `1:2` | 交易对、Swap、swap 成交历史、PTB 管线 | `ExecutionIntent` |
| `/security` | `11:2` | 终点白名单、熔断器、配额、Session | `ExecutionPolicy` |

四页共享 **AppShell**：左侧 256px 侧栏、顶栏面包屑（`DEEPFLOW_TERMINAL / {SECTION}`）、右上角 dApp Kit `ConnectButton`。

#### dApp Kit 集成约定

遵循 [Sui dApp Kit Next.js 指南](https://sdk.mystenlabs.com/dapp-kit/getting-started/next-js)：

- `app/dapp-kit.ts`：`createDAppKit({ networks: ['mainnet'], createClient })` + module augmentation（URL 来自 `lib/sui/network.ts`）
- `app/providers.tsx`：`'use client'` 包裹 `DAppKitProvider`
- `components/connect-button.tsx`：客户端挂载后再渲染 `ConnectButton`，避免 SSR `window` 报错
- `app/layout.tsx`：SSR 外壳，引入 Provider
- 顶栏 `CONNECT_WALLET` **必须**使用 dApp Kit `ConnectButton`，禁止自研 Wallet Standard 适配

#### 信任边界

- Dashboard 只负责展示、表单收集和提交执行意图，**不是**资金安全边界。
- 所有执行请求必须经过 `@deepflow/sdk` 的 `validateIntent` / `safeExecute` 策略校验。
- 钱包签名和链上读写通过 dApp Kit hooks 完成，前端不得绕过 SDK 直接构造高权限 PTB。
- Liquidity 页展示的 Scallop / Cetus 为设计稿示意；**MVP live 读路径已启用 NAVI + Suilend 适配器**，后续通过 `protocols/<name>/` 扩展其它协议。
- Liquidity **读路径**（positions / market 展示）走 `lib/data/liquidity/protocols/*`；**写路径**（supply/withdraw PTB）规划收敛到 `@deepflow/sdk` 的 `CreditSourceAdapter`，Dashboard 不得直接构造协议交易。

#### Liquidity 读路径数据流（client-only）

```text
LiquidityWorkspace
  -> useLiquidityPositions()
  -> createLiquidityRepository()   # mock | live
  -> LiquidityAggregatorRepository # 并行聚合 + TTL 缓存 + in-flight 去重
  -> NaviLiquidityAdapter | SuilendLiquidityAdapter   # 按 NEXT_PUBLIC_LIQUIDITY_PROTOCOLS
  -> mapToLiquidityViews()
```

**NAVI**（`@naviprotocol/lending`）：

```text
NaviLiquidityAdapter          # Main Market + 标的白名单
```

**Suilend**（`@suilend/sdk` + gRPC）：

```text
SuilendLiquidityAdapter
  -> SuilendClient.initialize + initializeSuilend
  -> reserves（depositAprPercent / depositedAmountUsd）
  -> getObligationOwnerCaps + parseObligation（suppliedBalance）
  -> JSON-RPC getBalance（walletCoinBalance）
```

**DeFi 层与钱包统一 mainnet**（`lib/sui/network.ts` 常量 `SUI_NETWORK = 'mainnet'`），不再支持 testnet。

`NaviLiquidityAdapter` 仅查询 **Main Market**（`markets: ['main']`，`env: 'prod'`）。池级 APY/TVL 来自 `getPools`（**不依赖钱包连接**）；用户 supply 余额仅在 `owner` 存在时通过 `getLendingPositions` 查询（传入 mainnet JSON-RPC client）。`getPools` 与 `getLendingPositions` 错误处理解耦：池子查询失败才阻断页面；持仓查询失败时降级为 `walletBalance=0` 并通过 `walletBalanceWarning` 非阻断提示。合并后余额为 0 的 pool 仍会展示。

默认标的白名单（NAVI / Suilend 各自独立 env，默认相同）：`USDC`、`SUIUSDE`、`SUI`、`WAL`、`DEEP`、`XBTC`（symbol 大小写归一化匹配）。

#### Portfolio 读路径数据流（client-only）

```text
PortfolioWorkspace
  -> usePortfolio()
  -> createPortfolioRepository()     # mock | live（复用 NEXT_PUBLIC_DATA_SOURCE）
  -> MockPortfolioRepository          # fixture 聚合
  -> LivePortfolioRepository          # LiquidityRepository + DeepbookUsdPriceOracle + SuiTransactionAdapter
  -> mapToPortfolioView()             # 摘要 / 饼图 / Treemap / 交易列表
```

- **mock**：`MOCK_LIQUIDITY_RAW` + `MOCK_DEEPBOOK_RAW` + `MOCK_PORTFOLIO_TRANSACTIONS` + 静态 USD 价表。
- **live**：复用 `createLiquidityRepository().listPositions()`；交易通过 JSON-RPC `suix_queryTransactionBlocks`（FromAddress + ToAddress 合并去重）。
- 钱包余额按 `coinType` 去重后计入 Idle Capital，避免多协议行重复统计。
- **USD 估值（live）**：`lib/data/pricing/deepbook-usd-price-oracle.ts` 通过 DeepBook `midPrice` 获取 USDC 单价（与 Trading 页共享 `deepbook-mid-price-service` 缓存）；稳定币锚定 $1；`DEEP` 经 `DEEP_SUI × SUI_USDC` 交叉汇率；无 DeepBook 池的资产回退 `lib/fixtures/portfolio.ts` 静态价表；仍无价格则计 $0 并返回 `priceWarning`。
- **USD 估值（mock）**：仍使用 `lib/fixtures/portfolio.ts` 静态价表。

#### Trading 读路径数据流（client-only）

```text
TradingWorkspace
  -> useTradingMarkets() / useDeepbookOrders() / useTradeSimulation()
  -> createTradingRepository()           # mock | live（复用 NEXT_PUBLIC_DATA_SOURCE）
  -> MockTradingRepository | LiveTradingRepository
  -> DeepbookTradingAdapter              # @mysten/deepbook-v3 client extension
  -> map-to-trading-view()
  -> useLiquidityPositions()             # DeFi credit source supplied 余额
```

- **行情 / 报价**：`lib/data/pricing/deepbook-mid-price-service.ts`（共享 30s 缓存）→ `client.deepbook.midPrice`；报价另用 `getQuoteQuantityOutInputFee` / `getBaseQuantityOutInputFee`。
- **Swap 成交历史**：`parse-deepbook-swap-txs.ts`（Sui RPC `FromAddress` + `swap_exact_*` MoveCall 解析）→ 可选 Indexer `/trades/:pool` 按 `digest` 富化；**不依赖** Balance Manager（`swapExactQuantity` 使用临时 BM 链上已删除）。
- **写路径模拟**（按 Swap Widget SOURCE × DESTINATION 路由，`resolve-trade-execution.ts`；统一模型：**source withdraw / merge → DeepBook swap → destination supply / transfer**）：
  - `wallet_wallet`：`simulateTradeWalletSwap` → `buildTradeWalletSwapTx`
  - `wallet_navi`：`simulateTradeWalletNavi` → `buildWalletSwapThenSupplyTx`
  - `wallet_suilend`：`simulateTradeWalletSuilend` → `buildWalletSwapThenSupplySuilendTx`
  - `navi_navi`：`simulateTradeNaviRoundTrip` → `buildNaviTradeRoundTripTx`
  - `navi_wallet`：`simulateTradeNaviReturn` → `buildNaviTradeReturnTx`
  - `navi_suilend`：`simulateTradeNaviSuilend` → `buildNaviSwapThenSupplySuilendTx`
  - `suilend_suilend`：`simulateTradeSuilendRoundTrip` → `buildSuilendTradeRoundTripTx`
  - `suilend_wallet`：`simulateTradeSuilendReturn` → `buildSuilendTradeReturnTx`
  - `suilend_navi`：`simulateTradeSuilendNavi` → `buildSuilendSwapThenSupplyNaviTx`
- **Suilend 串联**：`append-suilend-swap-leg.ts` 使用 `withdraw(..., addRefreshCalls=true)` 取出 input coin；destination deposit 使用 `deposit(outputCoin, ...)`（非 `depositIntoObligation`）。`wallet_suilend` / `navi_suilend` 允许 `createObligation` + `sendObligationToUser`；`suilend_suilend` redeposit 复用已有 cap。
- **报价 vs NAVI 链上 preamble**：
  - **DeepBook SDK**（`getQuoteQuantityOutInputFee` / `getBaseQuantityOutInputFee`）→ 唯一 swap 报价源、`minOutput`（50bps 滑点）、`deepRequired`；Dashboard 用 `baseUnits` 换算 human amount 再报价；输出精度由 `resolveOutputDecimals` 从 `mainnetCoins` 推导。
  - **NAVI oracle preamble**（`appendNaviOraclePreamble` → `updateOraclePriceBeforeUserOperationPTB`）→ 仅在 PTB 含 `depositCoinPTB`/`withdrawCoinPTB` 时于首笔 lending 操作前刷新**链上** oracle 状态（非报价）；`wallet_wallet` 无 NAVI 操作故跳过。
- **MVP 限制**：Execute 仅 dry-run 模拟，不 `signAndExecuteTransaction`；支持 7 个精选 DeepBook 池的双向 swap（`FEATURED_POOL_KEYS`）。

DeepBook 客户端工厂：`lib/sui/deepbook-client.ts`（Dashboard 读路径）；SDK 集成测试用 `sdk/src/sui/deepbook-client.ts`（同源工厂）。

#### Trading 写路径（SDK，mainnet dry-run）

```text
TradingWorkspace（Execute）
  -> useTradeSimulation
  -> resolveTradeExecutionRoute(fundSource, fundDestination)
  -> wallet_wallet:    simulateTradeWalletSwap()
  -> wallet_navi:      simulateTradeWalletNavi()
  -> wallet_suilend:   simulateTradeWalletSuilend()
  -> navi_navi:        simulateTradeNaviRoundTrip()
  -> navi_wallet:      simulateTradeNaviReturn()
  -> navi_suilend:     simulateTradeNaviSuilend()
  -> suilend_suilend:  simulateTradeSuilendRoundTrip()
  -> suilend_wallet:   simulateTradeSuilendReturn()
  -> suilend_navi:     simulateTradeSuilendNavi()
  -> dryRunTransaction
```

- **wallet 源预检**：`walletCoinBalance >= amount`；wallet 源另预留 **0.5 SUI** gas（`useGasCoin` merge）。
- **NAVI / Suilend 源预检**：`suppliedBalance >= amount`（不自动 bootstrap）；Suilend 源另要求已有 obligation。
- **手续费策略（input-fee）**：`deepRequired === 0`；`swapExactQuantity` 传 `deepAmount: 0`，taker fee 从 SUI 输入扣除。
- **Liquidity bootstrap**：`buildTradeBootstrapTx`（supply→withdraw→swap→supply USDC）仍保留供 Liquidity 页无持仓 withdraw 场景；Trading 页 **不再** 使用该路径。
- **集成测试**：`trade-wallet-navi.integration.test.ts`、`trade-suilend.integration.test.ts`（门禁 `RUN_MAINNET_INTEGRATION=1` + `INTEGRATION_SENDER` + 可选 `INTEGRATION_AMOUNT`）。

#### Liquidity 写路径（SDK，mainnet 模拟 / 可选上链）

```text
PositionManagement（Supply / Withdraw 按钮）
  -> useSupplyWithdrawSimulation（按 position.protocolId 路由）
  -> simulateSupplyWithdraw({ protocol: navi | suilend }) / simulateSupplyThenWithdraw()
  -> buildNavi*Tx | buildSuilend*Tx
  -> dryRunTransaction（预检，始终执行）
  -> [NEXT_PUBLIC_LIQUIDITY_WRITE_MODE=execute 且 operation=supply]
       dAppKit.signAndExecuteTransaction（钱包签名上链）
```

- **写路径模式**：`NEXT_PUBLIC_LIQUIDITY_WRITE_MODE` 默认 `simulate`（仅 dry-run）；`execute` 时在 Supply dry-run 通过后调用 `useDAppKit().signAndExecuteTransaction` 实际上链。Withdraw 与 supply→withdraw bootstrap 始终仅模拟。

- **协议路由**：`LiquidityPositionView.protocolId`（`navi` / `suilend`）传入 `@deepflow/sdk/supply-withdraw`；默认仍为 `navi` 以保持向后兼容。
- **Suilend 新建 obligation**：同 PTB 内 `createObligation` + `depositIntoObligation` 后须调用 `sendObligationToUser`（`finalizeNewSuilendObligationCap`）将 `ObligationOwnerCap` 转回 sender，否则 dryRun 报 `UnusedValueWithoutDrop`。
- **withdraw bootstrap**：当 `suppliedBalance < amount` 时，Dashboard hook 调用 `simulateSupplyThenWithdraw`（单 PTB 内先 deposit 再 withdraw），用于无协议持仓时的 withdraw 模拟验证；有持仓时仍走纯 `withdraw` PTB。Suilend bootstrap 使用 `withdraw(..., addRefreshCalls=false)` 避免同学 PTB 内链上 obligation 状态未刷新。
- **dry run**：`simulateTransaction({ checksEnabled: true })`（等价旧 `dryRunTransactionBlock`）
- **devInspect**：`simulateTransaction({ checksEnabled: false, include: { commandResults: true } })`
- 模拟不上链、不消耗资产；`execute` 模式下 Supply 成功签名后会消耗钱包资产。仍需真实 mainnet sender 地址与 coin objects（supply / bootstrap）或 NAVI supply 余额（纯 withdraw）。
- 集成测试：`sdk/tests/navi-supply-withdraw.integration.test.ts`、`sdk/tests/suilend-supply-withdraw.integration.test.ts`，门禁 `RUN_MAINNET_INTEGRATION=1` + `INTEGRATION_SENDER`。

环境变量：

| 变量 | 默认 | 说明 |
|------|------|------|
| `NEXT_PUBLIC_DATA_SOURCE` | `mock` | `mock` 使用 fixture；`live` 启用协议适配器 |
| `NEXT_PUBLIC_LIQUIDITY_PROTOCOLS` | `navi` | 逗号分隔协议列表（如 `navi,suilend`） |
| `NEXT_PUBLIC_LIQUIDITY_CACHE_TTL_MS` | `30000` | 聚合层内存缓存 TTL |
| `NEXT_PUBLIC_NAVI_ASSETS` | 见上白名单 | 可选，逗号分隔 NAVI Main Market 标的覆盖 |
| `NEXT_PUBLIC_SUILEND_ASSETS` | 见上白名单 | 可选，逗号分隔 Suilend reserve 标的覆盖 |
| `NEXT_PUBLIC_SUILEND_USE_BETA_MARKET` | `false` | 可选，`true` 时使用 Suilend beta lending market（`@suilend/sdk` 内置常量） |
| `NEXT_PUBLIC_LIQUIDITY_WRITE_MODE` | `simulate` | `simulate` 仅 dry-run；`execute` 时 Supply dry-run 通过后签名上链 |
| `RUN_MAINNET_INTEGRATION` | — | SDK 集成测试开关（仅 `sdk/tests`，非 Dashboard） |
| `INTEGRATION_SENDER` | — | mainnet 测试地址（集成测试） |
| `INTEGRATION_ASSET` / `INTEGRATION_AMOUNT` | `USDC` / `1000` | 可选，集成测试 supply 参数 |

## 目录结构

```text
deepflow/                          # 仓库根 = Next.js Dashboard
  app/                             # App Router [已有]
    dapp-kit.ts
    layout.tsx
    providers.tsx
    (dashboard)/                   # route group，共享 AppShell layout
      layout.tsx
      portfolio/
        page.tsx
        _components/               # 路由专属 UI（private folder）
      liquidity/
        page.tsx
        _components/
      trading/
        page.tsx
        _components/
      security/
        page.tsx
        _components/
  components/                      # 跨路由共享 UI [已有]
    app-shell/
    ui/
    terminal-panel.tsx
  lib/                             # 前端共享工具 [已有]
    sui/
      network.ts                   # mainnet 常量 + JSON-RPC / gRPC client 工厂
    mock-data.ts
    chart-formatters.ts
    fixtures/                      # 静态原始数据（mock 与链上同一映射管线）
      liquidity.ts
    data/                          # Dashboard 读路径数据层（Repository/Mapper/Hook）
      liquidity/
        types.ts
        map-to-liquidity-view.ts
        liquidity-formatters.ts
        liquidity-repository.ts
        mock-liquidity-repository.ts
        create-liquidity-repository.ts
        use-liquidity-positions.ts
        protocols/                 # DeFi 协议只读适配器（navi/、suilend/）
          types.ts
          liquidity-aggregator-repository.ts
          navi/navi-liquidity-adapter.ts
          navi/navi-rpc-client.ts
          suilend/suilend-liquidity-adapter.ts
          suilend/suilend-client-factory.ts
    shims/                         # 第三方 SDK 与 @mysten/sui v2 兼容 shim
      mysten-sui-client.ts
  CODING-RULES.md                  # 编码与目录规范
  sdk/                             # @deepflow/sdk [已有]
    src/
      policy/
      routing/
      simulation/
        mock-ptb.ts
        simulate-transaction.ts
      credit-source/navi/          # NAVI supply/withdraw PTB + adapter
      credit-source/suilend/       # Suilend supply/withdraw PTB + adapter
      supply-withdraw.ts           # simulate / inspect supply, withdraw, supply-then-withdraw
      sui/client.ts
      shims/mysten-sui-client.ts   # Vitest / NAVI SDK 兼容
    tests/
      navi-supply-withdraw.integration.test.ts
    vitest.config.ts
  move/                            # Move 合约 [待建]
    deepflow/
      sources/
      tests/
  asset/figma/                     # 设计资产 [已有]
  docs/
  package.json                     # Dashboard + workspace: ["sdk"]
  next.config.ts
  tsconfig.json
```

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

## 推荐实现顺序

第一阶段（已完成）：

- 创建 TypeScript SDK 原型（`sdk/`）。
- 实现核心类型与 Policy Engine。
- 使用 mock route plan 模拟 PTB。
- 添加单元测试。
- 导出 Figma 设计资产到 `asset/figma/`。
- 确认 Dashboard 技术栈并完成仓库根 Next.js 初始化。
- 扁平化仓库结构，移除 `apps/` 与 `packages/` 嵌套层。

第二阶段（进行中）：

- 安装 shadcn/ui、Recharts、Lucide，映射设计 token。
- 实现 AppShell + 四页静态 UI（mock 数据）。
- 接线 `@deepflow/sdk` workspace 依赖。

第三阶段：

- 接入 Sui SDK。
- 增加 PTB Builder。
- 增加 DeepBook mock adapter。
- 增加 Credit Source mock adapter。
- Dashboard 接线真实 SDK 调用。

第四阶段：

- 创建 Move 合约（`move/deepflow/`）。
- 实现 Vault、Policy Guard、Kill Switch。
- 添加 Move 测试。

第五阶段：

- 接入真实 DeepBook 和一个 DeFi 协议。
- 增加 simulation / dry run。
- Dashboard 展示真实链上数据。

## 当前未决架构问题

- 首个 MVP 路由是 DeepBook Predict 还是 DeepBook spot。
- 第一版是否需要真实 Move 合约，还是先做 SDK simulation。
- 首个 DeFi credit source 是 NAVI、Cetus 还是 mock。
- Session Key 的具体实现方式。
- 费用收取逻辑在 SDK、PTB 还是 Move 合约中实现。
