# SESSION-HANDSOFF.md

## 当前任务

Trading / Liquidity UI 微调——已完成。

## 已完成

- [x] **Trading / Liquidity UI 微调**：
  - Liquidity `defi-connectivity`：表头与表体各列（PROTOCOL / ASSET / TOTAL SUPPLY / APR / BALANCE）统一左对齐。
  - Trading `swap-widget`：PAY 输入框初始值改为空字符串；RECEIVE 无估算输出时同样为空（显示 placeholder）。
  - Trading `swap-amount-block`：输入框增加 `placeholder="0.00"`；移除只读资产 badge 上的 `ChevronDown` 下拉箭头。

- [x] **资产图标接入**：
  - 新增 `lib/figma/coin-icons.ts`（`resolveCoinIconPath`）与 `components/asset-icon.tsx`（PNG 图标 + 无图资产字母 fallback）。
  - Portfolio `asset-composition` 图例资产名称前显示图标。
  - Liquidity `defi-connectivity` ASSET 列、`position-amount-input` 下拉 trigger/选项显示图标。
  - Trading `swap-amount-block` 用 `AssetIcon` 替换原彩色字母圆点。
  - 已验证 `npm run build`。

- [x] **Trading Swap Widget 重构（SOURCE / DESTINATION + 多路由 PTB dry-run）**：
  - UI（Figma node 1:481）：`swap-segmented-control` / `swap-amount-block` / `swap-execution-info`；重构 `swap-widget.tsx`（SOURCE / DESTINATION 分段、PAY / RECEIVE 块、RATE/FEE 卡片）。
  - 数据层：`TradeFundLocation` / `TradeExecutionRoute`；`resolve-trade-execution.ts`（路由、余额解析、Suilend 拦截）。
  - `trading-workspace`：`fundSource` / `fundDestination` 状态；按 location 注入 PAY / RECEIVE 余额。
  - SDK：`buildTradeWalletSwapTx` / `simulateTradeWalletSwap`；`buildNaviTradeRoundTripTx` / `buildNaviTradeReturnTx` / `simulateTradeNavi*`；pipeline step builders。
  - `use-trade-simulation`：四路由真实 dry-run（wallet_wallet / wallet_navi / navi_navi / navi_wallet）；Suilend 返回明确错误；MVP 限制 `SUI_USDC` 卖 SUI。
  - 测试：`build-trade-wallet-swap-tx.unit.test.ts`、`build-navi-trade-tx.unit.test.ts`、`trade-wallet-navi.integration.test.ts`。
  - 更新 `PRODUCT.md`、`ARCHITECTURE.md`。
  - 已验证 `npm test`（76 passed, 20 skipped）与 `npm run build`。

- [x] **Portfolio 与 Liquidity UI 修复**：
  - Portfolio：`TOTAL_ASSETS` / `WORKING_CAPITAL` / `IDLE_CAPITAL` 货币格式保留两位小数；`UTILIZATION_RATE` 展示 `toFixed(2)%`；`map-to-portfolio-view` 保留原始浮点利用率（去掉 `Math.round`）。
  - Liquidity Position Management：滑块与输入框双向联动（`formatAmountFromPercentage` / `percentageFromAmount`）；输入框默认空值 + `placeholder="0.00"`；切换仓位 reset amount/slider。
  - 移除 TRANSACTION_OVERVIEW 中 Gas fee 行；删除 `simulation-gas-fee-label.ts`。
  - 已验证 `npm test`（73 passed, 17 skipped）与 `npm run build`。

- [x] **修复 NAVI suppliedBalance 单位换算与写后刷新**：
  - 根因：NAVI SDK `getLendingPositions` 返回人类可读小数（如 `"1"`），adapter 误作 base units，导致 1 SUI 显示 `0.00`，Portfolio `workingCapital` / `utilizationRate` 异常。
  - 新增 `lib/data/liquidity/protocols/navi/navi-supply-balance.ts`：`parseNaviSupplyAmountToBaseUnits` + `buildSupplyBalanceMap`（复用 `@deepflow/sdk/amount/parse-base-units`）。
  - 写后刷新：`invalidateLiquidityPositionCache` + `listPositions({ bustCache })`；NAVI SDK `disableCache`；Supply execute 后 `refetch({ bustCache: true })`。
  - Portfolio 联动：`liquidity-data-events.ts` + `usePortfolio` 订阅 `notifyLiquidityPositionsChanged`。
  - 测试：`navi-liquidity-adapter.test.ts`（supply / emode 换算）；已验证 `npm test`（90 passed, 17 skipped）与 `npm run build`。

- [x] **Liquidity Supply 写路径 execute 模式**：
  - 新增 `NEXT_PUBLIC_LIQUIDITY_WRITE_MODE`（默认 `simulate`；`execute` 时 Supply dry-run 通过后 `dAppKit.signAndExecuteTransaction` 上链）。
  - `lib/data/liquidity/resolve-liquidity-write-mode.ts`；扩展 `use-supply-withdraw-simulation`（状态 `executing` / `executed` + tx digest）。
  - Supply 成功展示 Suiscan 链接；execute 后 `refetch` 持仓；Withdraw / bootstrap 仍仅 simulate。
  - `lib/sui/explorer.ts`；更新 `ARCHITECTURE.md`、`PRODUCT.md`。
  - 已验证 `npm test`（65 passed, 17 skipped）与 `npm run build`。

- [x] **Portfolio / Trading UI 微调**：
  - Asset Composition 筛选改为 `ALL` / `NAVI` / `SUILEND` / `WALLET`（`types.ts`、`map-to-portfolio-view.ts`、`use-portfolio.ts`）。
  - Protocol Exposure Treemap 标签字体统一为黑色。
  - Portfolio 页移除 `priceWarning` 估值提示 UI（数据层保留）。
  - 侧栏移除 Security 导航项（`/security` 路由保留可手动访问）。
  - Trading 页移除 Real-time PTB 组件（删除 `ptb-pipeline.tsx`）；Execute 成功提示改为「模拟通过」。

- [x] **落地页重构**（Figma node 124:71）：
  - 根路由 [`app/page.tsx`](app/page.tsx) 由简易入口改为完整营销落地页（Header / Hero / Products / Roadmap / Partners / Footer）。
  - 页面专属组件置于 `app/_components/`（`landing-*.tsx`、`launch-app-link.tsx`）。
  - Figma 资产下载至 `public/figma/landing/`（hero 波形、Portfolio 截图、路线图、合作伙伴 logo、社交图标等）。
  - 所有 LAUNCH APP 入口统一跳转 `/portfolio`。
  - Products 区块支持 Portfolio / Liquidity / Trading 三 Tab 切换（Liquidity/Trading 为占位预览 + 产品文案）。
  - 已验证 `npm run build`。

- [x] 已将 `apps/dashboard/` 内容上提到仓库根（`app/`、`components/`、Next.js 配置文件）。
- [x] 已将 `packages/sdk/` 提升为根级 `sdk/`（包名保持 `@deepflow/sdk`）。
- [x] 已删除 `apps/` 与 `packages/` 嵌套目录。
- [x] 已合并根 `package.json`：Dashboard 脚本（`dev`/`build`/`start`/`lint`）+ `workspaces: ["sdk"]`。
- [x] 已更新 `next.config.ts`（`transpilePackages` 含 SDK，`outputFileTracingRoot` 指向仓库根）。
- [x] 已更新 `tsconfig.json`（排除 `sdk/` 避免 Next.js 类型检查冲突）。
- [x] 已合并 `.gitignore`（加入 Next.js 构建产物规则）。
- [x] 已重写 `ARCHITECTURE.md`：新增「仓库布局」专节、合并重复目录描述、更新全部路径引用。
- [x] 已同步更新 `AGENTS.md`、`README.md` 中的路径与仓库描述。
- [x] 已安装 shadcn/ui（Tailwind v4）、Recharts、Lucide React、Geist 字体。
- [x] 已映射 `asset/figma/tokens.json` 到 `app/globals.css`（终端风 CSS 变量 + shadcn 语义色）。
- [x] 已实现 AppShell：`components/app-shell/`（256px 侧栏 + 64px 顶栏面包屑 + dApp Kit ConnectButton 样式）。
- [x] 已建立 `app/(dashboard)/` route group，四页迁入并删除旧占位路由。
- [x] 已创建共享组件：`terminal-panel`、`terminal-label`、`status-badge`、`lib/mock-data.ts`。
- [x] 已按 Figma 还原四页静态 UI（mock 数据）。
- [x] Portfolio 页图表交互修复（timeframe 切换、协议筛选、Y/X 轴）。
- [x] Liquidity 页 DeFi 联动修复（`selectedKey` 状态提升、表格与表单双向同步）。
- [x] Trading 页 MarketPairs ↔ SwapWidget 联动与双向交换。
- [x] **目录结构与组件拆分重构**（`CODING-RULES.md`、`_components/` 共置等）。
- [x] **Liquidity 多协议读路径架构**（NAVI adapter、聚合层、环境变量等）。
- [x] **修复 Turbopack shim / NAVI 白名单 / 空状态 / 连接钱包报错**（见历史条目）。
- [x] **Mainnet 统一切换**：
  - 新增 [`lib/sui/network.ts`](lib/sui/network.ts)（`SUI_NETWORK = 'mainnet'`、JSON-RPC / gRPC 工厂）。
  - `app/dapp-kit.ts`、`navi-rpc-client.ts`、`navi-liquidity-adapter.ts`、`liquidity-aggregator-repository.ts` 固定 mainnet / `env: 'prod'`。
  - 移除 testnet 专用 `walletBalanceWarning` 与 `NEXT_PUBLIC_SUI_NETWORK` 依赖。
- [x] **SDK NAVI supply/withdraw 写路径与模拟**：
  - `sdk/src/simulation/simulate-transaction.ts`：`dryRunTransaction` / `devInspectTransaction`。
  - `sdk/src/credit-source/navi/`：`buildNaviSupplyTx`、`buildNaviWithdrawTx`、`NaviCreditSourceAdapter`。
  - `sdk/src/supply-withdraw.ts`：`simulateSupplyWithdraw` / `inspectSupplyWithdraw`。
  - `sdk/vitest.config.ts` + `@mysten/sui/client` shim（Vitest 跑 NAVI SDK）。
  - `sdk/tests/navi-supply-withdraw.integration.test.ts`（`RUN_MAINNET_INTEGRATION` 门禁）。
  - 已验证 `npm test`（13 passed, 4 skipped）与 `npm run build`。
- [x] **修复 Liquidity 页空列表（mainnet 白名单不匹配）**：
  - 根因：`.env.local` 仍配置 `USDC_TEST,...` 而 adapter 已切 mainnet `env: 'prod'`，白名单过滤后 0 条。
  - 修复：更新 `.env.local` 为 mainnet 标的；`resolveNaviAssetAllowlist` 自动映射 `*_TEST`→mainnet symbol（`BTC_TEST`→`XBTC`）；池子有数据但过滤为空时返回 `configurationWarning` 并在空状态展示。
  - 已验证 `npm run build`。
- [x] **Liquidity Withdraw 子页面与 position-management 拆分**（Figma node 71:2106）：
  - 新增共享子组件：`position-protocol-banner`、`position-amount-input`、`position-percentage-slider`、`transaction-overview-panel`。
  - 新增 `supply-position-form.tsx`、`withdraw-position-form.tsx`；`position-management.tsx` 瘦身为 Tabs shell + 分 tab state。
  - Withdraw：Pool Balance / Max Withdraw / Pool Size / Gas Fee 布局与 Figma 对齐；Supply/Withdraw Tab 激活色统一为 accent-cyan。
  - 已验证 `npm run build`。
- [x] **Liquidity simulateSupplyWithdraw 接线与测试**：
  - SDK：`parseAmountToBaseUnits` + 子路径导出（`@deepflow/sdk/supply-withdraw`、`@deepflow/sdk/amount/parse-base-units`）；`supply-withdraw.unit.test.ts` / `parse-base-units.test.ts`。
  - Dashboard：`use-supply-withdraw-simulation` hook；Supply/Withdraw 按钮 dry run + 状态/Gas fee 提示。
  - `tsconfig` 升至 ES2020 + `allowImportingTsExtensions`；修复 `simulate-transaction` 类型以通过 Next 构建。
  - 已验证 `npm test`（25 passed, 4 skipped）与 `npm run build`。
- [x] **修复 Supply「Invalid struct tag: USDC」**：
  - 根因：NAVI `getPool` 不接受 symbol，需完整 `suiCoinType`；写路径将 `USDC` 当作 struct tag 解析失败。
  - SDK：新增 `resolveNaviPoolKey`；`build-navi-supply/withdraw-tx` 统一用 `pool.suiCoinType`。
  - 读路径：`LiquidityPosition*` 增加 `coinType`；NAVI adapter / mock fixture 写入；simulate hook 优先传 `coinType`。
  - 测试：`resolve-navi-pool-key.test.ts`、`build-navi-supply-tx.unit.test.ts`。
  - 已验证 `npm test`（30 passed, 4 skipped）与 `npm run build`。
- [x] **修复 Supply「No USDC coins found」余额语义与预校验**：
  - 根因：Supply 表单误用 NAVI supply 余额作 Wallet balance；钱包实际无 USDC 时 PTB 构建才报错。
  - 读路径：拆分 `suppliedBalance`（协议内 supply）与 `walletCoinBalance`（`getBalance`）；NAVI adapter 连接钱包时并行查询。
  - UI：Supply 显示钱包持币；Withdraw / DeFi 表格显示 supply 余额。
  - 写路径：hook 预校验余额；`build-navi-supply-tx` 错误文案使用资产符号。
  - 已验证 `npm test`（32 passed, 4 skipped）与 `npm run build`。
- [x] **Portfolio 页 Figma 改版**（Figma node 107:343）：
  - 移除 `net-worth-chart.tsx`（NET_WORTH 曲线图）。
  - 新增 `portfolio-summary-stats.tsx`（TOTAL_ASSETS / WORKING_CAPITAL / IDLE_CAPITAL / UTILIZATION_RATE）。
  - 新增 `protocol-exposure.tsx`（Recharts Treemap + 2×2 图例）。
  - `asset-distribution` → `asset-composition`（ASSET_COMPOSITION 标题、2×2 图例含美元值）。
  - `protocol-actions-history` → `transaction-history`（TRANSACTION_HISTORY、7/30 天筛选、移除 PROTOCOL 列）。
  - `lib/mock-data.ts`：新增 `PORTFOLIO_SUMMARY`、`PROTOCOL_EXPOSURE`、`TRANSACTIONS`；删除 NET_WORTH 相关。
  - 已验证 `npm run build`。
- [x] **Portfolio 数据层接线**：
  - 新增 `lib/data/portfolio/`（types、mapper、mock/live repository、SuiTransactionAdapter、`use-portfolio`）。
  - 新增 `lib/fixtures/portfolio.ts`（USD 价表、DeepBook mock 持仓、mock 交易）。
  - 新增 `portfolio-workspace.tsx`；四组件改为 props 驱动，移除对 `lib/mock-data.ts` Portfolio 数据的直接依赖。
  - `PRODUCT.md` 沉淀 Portfolio 页功能定义；`ARCHITECTURE.md` 补充读路径数据流。
  - 已验证 `npm run build`。
- [x] **Trading 页数据层与 DeepBook SDK 接线**：
  - 安装 `@mysten/deepbook-v3`；新增 `lib/sui/deepbook-client.ts`。
  - 新增 `lib/data/trading/`（Repository、DeepbookTradingAdapter、Indexer 客户端、fixtures、`use-trading-markets` / `use-deepbook-orders` / `use-trade-simulation`）。
  - SDK 新增 `@deepflow/sdk/trade`：`quoteTrade`、`planTradeRoute`、`simulateTrade` + `trade.unit.test.ts`。
  - Trading 四组件 + `trading-workspace` 改为 props/hook 驱动；`lib/mock-data.ts` 移除 Trading 静态数据。
  - `PRODUCT.md` 沉淀 Trading 页功能；`ARCHITECTURE.md` 补充 Trading 读路径。
  - 已验证 `npm test`（35 passed, 4 skipped）与 `npm run build`。
- [x] **修复 SUI Supply「No coins to merge」并验证 NAVI SUI pool deposit 模拟**：
  - 根因：`buildNaviSupplyTx` 对 SUI 传空 `coins[]` 给 `mergeCoinsPTB`；NAVI SDK 需至少一枚 coin 识别类型后才走 `useGasCoin` + `splitCoins(gas)`。
  - 修复：SUI 与非 SUI 统一先 `getCoins`，再 `mergeCoinsPTB(tx, coins, { balance, useGasCoin: true })`。
  - 测试地址 `0x7d87…ac7fc`（~13.30 SUI）；supply **10 SUI**（`10000000000` base units，预留 ~3.29 SUI gas）。
  - mainnet 集成：`dryRun` + `devInspect` supply 均 `ok: true`（`coinType` 与 symbol 两条路径）。
  - Liquidity 页 live 模式：NAVI 池列表含 SUI；Supply 表单可选 SUI、输入 10；dryRun 管线与 UI hook 同路径（浏览器自动化无法代连 Slush，需本地 Connect Wallet 后点 Supply 见 `Simulation passed`）。
  - 已验证 `npm test`（36 passed, 4 skipped）与 `npm run build`。
- [x] **Portfolio live 模式接入 DeepBook 实时 USDC 定价**：
  - 新增 `lib/data/pricing/deepbook-mid-price-service.ts`（共享 midPrice 拉取 + 30s TTL 缓存）与 `deepbook-usd-price-oracle.ts`（资产→池映射、交叉汇率、静态回退、warning）。
  - `LivePortfolioRepository` live 路径改为调用 `fetchDeepbookUsdPrices`，不再硬编码 `MOCK_TOKEN_USD_PRICES`。
  - `DeepbookTradingAdapter.listMarkets` 复用共享 midPrice 服务，与 Portfolio 共用缓存。
  - 新增 `lib/data/pricing/deepbook-usd-price-oracle.test.ts`；根目录 `vitest.config.ts` + `npm run test:dashboard`。
  - 已验证 `npm run test:dashboard`（8 passed）、`npm run build`。
- [x] **NAVI SUI withdraw bootstrap（单 PTB supply→withdraw）与 Liquidity 页集成**：
  - 新增 `buildNaviSupplyThenWithdrawTx`、`simulateSupplyThenWithdraw` / `inspectSupplyThenWithdraw`。
  - Withdraw hook：无 NAVI supply 余额时自动 bootstrap（同量 supply+withdraw）；预检 `walletCoinBalance`。
  - 修复 `withdrawCoinPTB` 返回 coin 未 `transferObjects` 导致 dryRun `UnusedValueWithoutDrop`；同步修复 `buildNaviWithdrawTx`。
  - mainnet 集成：SUI **10+10** `dryRun` + `devInspect` 均 `ok: true`（无需预先存入 NAVI）。
  - 已验证 `npm test`（40 passed, 6 skipped）与 `npm run build`。
- [x] **Trading DeepBook 原子 PTB bootstrap（单 PTB supply→withdraw→swap→supply USDC）**：
  - SDK 新增 `@mysten/deepbook-v3` 依赖；`buildTradeBootstrapTx`（NAVI supply SUI → withdraw SUI → DeepBook `swapExactQuantity` 无 BM → NAVI supply USDC）。
  - 新增 `simulateTradeBootstrap` / `inspectTradeBootstrap`；`sdk/src/sui/deepbook-client.ts`（集成测试报价用）。
  - swap 找零 coin（`baseChange` / `deepChange`）`transferObjects` 至 sender，避免 `UnusedValueWithoutDrop`。
  - Trading hook：无 NAVI SUI 持仓且卖 SUI 时自动 bootstrap；预检 `walletCoinBalance`（含 gas 预留）。
  - 单元测试：`build-trade-bootstrap-tx.unit.test.ts`、`simulate-trade-bootstrap.unit.test.ts`。
  - mainnet 集成：10 SUI `dryRun` + `devInspect` 均 `ok: true`（`tests/trade-bootstrap.integration.test.ts`）。
  - 已验证 `npm test`（44 passed, 8 skipped）与 `npm run build`。
- [x] **Trading bootstrap input-fee / deepAmount 对齐**：
  - 单元测试默认 `deepAmount: 0`（input-fee 生产路径），另增 DEEP-fee 分支用例。
  - 集成测试断言 `getQuoteQuantityOutInputFee` 返回 `deepRequired === 0`；新增 DEEP-fee 报价对照与无 DEEP 时 dryRun 失败用例。
  - `build-trade-bootstrap-tx.ts` + `ARCHITECTURE.md` 文档化 input-fee vs DEEP-fee 策略。
  - Trading adapter `feeLabel`：input-fee 时显示「手续费从 {输入资产} 扣除」。
  - 已验证 `npm test`（45 passed, 10 skipped）与 `npm run build`。
- [x] **Suilend Liquidity 页集成（读 + 写模拟）**：
  - 依赖：`@suilend/sdk@^3.0.4`、`@suilend/sui-fe`、`@pythnetwork/pyth-sui-js`；`@mysten/sui` 升级至 `^2.17.0`。
  - 读路径：`lib/data/liquidity/protocols/suilend/`（`SuilendLiquidityAdapter` + `initializeSuilend` + obligation 余额 + 钱包 `getBalance`）。
  - 写路径：`sdk/src/credit-source/suilend/`（supply / withdraw / bootstrap PTB + `SuilendCreditSourceAdapter`）。
  - `supply-withdraw.ts` 按 `protocol: navi | suilend` 路由；`LiquidityPositionView.protocolId` + hook 传参。
  - Mock fixture 新增 `[SUILEND]` 行；`.env.local` 示例 `NEXT_PUBLIC_LIQUIDITY_PROTOCOLS=navi,suilend`。
  - 测试：`suilend-apr-mapping.unit.test.ts`、`build-suilend-supply-tx.unit.test.ts`、`suilend-supply-withdraw.integration.test.ts`。
  - 已验证 `npm test`（56 passed, 17 skipped）与 `npm run build`。
- [x] **Liquidity 页面 APR 与表头修复**：
  - 表头 `TVL`→`TOTAL SUPPLY`、`APY`→`APR`（`defi-connectivity.tsx`）。
  - 根因：NAVI `supplyIncentiveApyInfo.apy` 已是百分比字符串（如 `"0.537"`=0.537%），旧 `parseApyToBps` 对 `n<=1` 误乘 10000 导致低 APR 放大 100 倍。
  - 新增 `lib/data/liquidity/protocols/navi/navi-apy.ts`（`parseNaviAprPercentToBps`）；`formatLiquidityApr` 低 APR 用 2 位小数。
  - `LiquidityPositionDisplay` 展示字段 `totalSupply` / `apr`。
  - 测试：`navi-apy.test.ts`；已验证 `npm run test:dashboard`（17 passed）。
- [x] **修复 Suilend Supply `UnusedValueWithoutDrop`**：
  - 根因：无既有 obligation 时 PTB 内 `createObligation` 后未 `sendObligationToUser`，`ObligationOwnerCap` 未转回 sender。
  - SDK：`finalizeNewSuilendObligationCap`（`resolve-obligation-cap.ts`）；`build-suilend-supply-tx` / `build-suilend-supply-then-withdraw-tx` deposit 后调用。
  - 测试：集成用例断言不出现 `UnusedValueWithoutDrop`；bootstrap dryRun 期望 `ok: true`。
  - 已验证 `npm test` 与 `npm run build`。

## 未完成 / 待处理

- [ ] Security 页映射 `ExecutionPolicy` 字段到 `lib/data/*`。
- [ ] Liquidity **Withdraw 写路径 execute**：Supply 已支持；Withdraw 与 bootstrap 仍仅 simulate。
- [ ] Trading **Suilend 路由**（SOURCE / DESTINATION 含 SUILEND 的真实 dry-run PTB）。
- [ ] Trading Execute 实际上链（`signAndExecuteTransaction`）。
- [ ] 扩展 Liquidity 协议适配器：Scallop / Cetus 等（Suilend 已完成）。
- [ ] 创建 Move 合约模块：`automation_vault`、`policy_guard`、`credit_router`。
- [ ] 浏览器内手动验证：连接 mainnet 钱包后 Liquidity 页 Supply **execute 模式**小额上链（`.env.local` 设 `NEXT_PUBLIC_LIQUIDITY_WRITE_MODE=execute`）；simulate 模式验证 **Simulation passed**（无签名）。

## 下一步建议

1. 浏览器内手动验证 Trading Swap：WALLET→WALLET / WALLET→NAVI / NAVI→NAVI / NAVI→WALLET dry-run；Suilend 选项应提示不支持。
2. Security 页映射 `ExecutionPolicy` 字段。

## 注意事项

- **DeFi 层与 dApp Kit 固定 mainnet**；不再使用 testnet 或 `NEXT_PUBLIC_SUI_NETWORK` 切换。
- 切 mainnet 后 **`NEXT_PUBLIC_NAVI_ASSETS` 不得使用 `*_TEST` 后缀**（如 `USDC_TEST`）；应使用 `USDC,SUIUSDE,SUI,WAL,DEEP,XBTC` 或删除该变量使用默认白名单。代码会对遗留 `*_TEST` 配置自动映射并 `console.warn`。
- Liquidity live 模式依赖 `@naviprotocol/lending` 与 `@suilend/sdk`；NAVI 构建时可能对 `getFullnodeUrl` 有 webpack 警告，运行时通过 `lib/shims/mysten-sui-client.ts` 兼容。Suilend 使用 gRPC client，无需 mysten v1 shim。
- **`NEXT_PUBLIC_LIQUIDITY_WRITE_MODE`**：默认 `simulate`（仅 dry-run）；`execute` 时 **Supply** dry-run 通过后签名上链。Withdraw / bootstrap 始终 simulate。修改后需重启 `npm run dev`。
- **`NEXT_PUBLIC_SUILEND_ASSETS`** 默认与 NAVI 白名单相同；可选 **`NEXT_PUBLIC_SUILEND_USE_BETA_MARKET=true`** 切换 beta market（由 `@suilend/sdk` 读取）。
- Suilend 首次 supply（无 obligation）须在 PTB 末尾 `sendObligationToUser`（`finalizeNewSuilendObligationCap`）；已有 obligation 则复用链上 cap id。
- `next.config.ts` 中 `turbopack.resolveAlias` 必须使用项目相对路径；Webpack `resolve.alias` 用绝对路径。
- 环境变量见 `ARCHITECTURE.md` Liquidity 专节；修改 `NEXT_PUBLIC_*` 后需重启 `npm run dev`。
- supply/withdraw PTB 与模拟仅在 `@deepflow/sdk`；Dashboard 读适配器（`lib/data/liquidity/protocols/*`）禁止包含写路径。
- SUI supply 须先 `getCoins` 再 `mergeCoinsPTB(..., useGasCoin: true)`；勿传空 coins 数组。
- SDK 集成测试 SUI supply 示例：`RUN_MAINNET_INTEGRATION=1 INTEGRATION_SENDER=0x... INTEGRATION_ASSET=SUI INTEGRATION_AMOUNT=10000000000 npm test --workspace @deepflow/sdk -- tests/navi-supply-withdraw.integration.test.ts -t "builds supply"`。
- Withdraw 无 NAVI 持仓时 UI/SDK 走 **supply→withdraw 单 PTB bootstrap**；集成测试：`-t "supply-then-withdraw"` + `INTEGRATION_WITHDRAW_AMOUNT=10000000000`。
- Trading 无 NAVI SUI 持仓卖 SUI 时 UI/SDK 走 **supply→withdraw→swap→supply USDC 单 PTB bootstrap**；集成测试：`RUN_MAINNET_INTEGRATION=1 INTEGRATION_SENDER=0x... INTEGRATION_AMOUNT=10000000000 npm test --workspace @deepflow/sdk -- tests/trade-bootstrap.integration.test.ts`。
- 页面专属 UI 放在 `app/(dashboard)/{feature}/_components/` 或根路由 `app/_components/`（landing）；跨页共享 UI 放在 `components/`。
- Dashboard 不是资金安全边界；supply/withdraw 必须走 SDK 策略校验，不得绕过 Policy Engine。
- 当前测试：`npm test`（SDK Vitest + Dashboard `test:dashboard`）、`npm run build`（Dashboard）。
