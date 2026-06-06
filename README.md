# Deepflow

Deepflow 是一个面向 Sui 生态的 DeFi 资金流转中间件。

它的核心价值是提升终端用户的资金使用效率：在用户资金保持 DeFi 生息的同时，通过 Sui PTB 将资产提取、DeepBook 交易、结算和重新存入封装为一次原子化执行流程，从而降低链上交互摩擦，并提供标准化的业务执行路由。

Deepflow 也可以作为 AI Agent / Bot 的受控执行网关。AI Agent 可以提交交易意图，但资金调度、交易滑点、最终去向和周期额度必须由 Deepflow 的底层规则约束。

## 解决什么问题

当前 Sui 用户在 DeFi 自动化交易中普遍面临：

* 资金闲置：用户资金长期存放在 DeFi 生息池中，但交易时需要频繁手动提取与重新存入，导致操作繁琐且资金利用率低。
* AI Agent 无法安全操作资金：AI 可以生成交易策略，但缺乏可靠资金风控，运行过程中存在不可预测的幻觉风险。
* DeFi 操作割裂：完整交易往往需要资产提取、DeepBook 交易、结算和生息池存入等多步链上操作，流程复杂、成本高且容易出错。
* Bot 专用钱包隔离：用户为了降低 AI Bot 误操作风险，通常需要额外创建独立交易钱包，导致资金分散与管理成本上升。

个人开发者通常只能：

* 给 Bot Wallet 少量放钱。
* 预置无收益定投池或交易资金池。
* 手动管理多步签名与授权。
* 自行实现简单风控。

这会导致：

* 资金利用率低，定投资金与交易预备金长期站岗。
* 多钱包管理复杂。
* Bot / Agent 风险不可控。
* 大量资金闲置在 DeFi 中，无法安全参与自动化执行。

Deepflow 允许用户：

* 一键提交高级执行意图。
* 在一个 PTB 中完成生息仓位提款、DeepBook 交易、结算和重新存入。
* 执行失败时整条链路回滚，不留下中间状态或卡死资金。
* 用滑点熔断、终点锁死和周期性业务配额约束 AI / Bot 的资金调度行为。

⸻

## 核心功能

* 一键资金调度：将多步链上操作折叠为单次高级请求。
* PTB 原子化执行：提取、交易、结算、重新存入或返还必须一次性完整成功。
* 安全风控：包含滑点熔断、终点锁死和周期性业务配额。
* AI Agent 受控执行网关：AI / Bot 只提交意图，Deepflow 在执行前校验硬性约束。
* DeFi-backed Execution Credit：允许用户使用 DeFi 生息资产作为自动化执行信用来源。

⸻

## Runtime Guardrails

防止：

* 滑点超限：强制约束最小输出资金量或最大可接受损失。
* 资金流出白名单终点：最终资产只能落入用户配置的白名单地址或授权目的地。
* 周期业务配额超限：限制 AI / Bot 因异常循环持续消耗本金。
* 中间状态残留：任何异常都应触发原子回滚，避免资金卡死。
* 高权限托管风险：避免用户把完整本金资产托管给第三方黑盒或 Bot 钱包。

⸻

## DeFi-backed Execution Credit（核心）

允许用户直接使用 DeFi 生息资产作为自动化执行的 Credit Source。

当用户或 Bot 提交执行意图时，Deepflow 通过 Sui PTB 将完整流程封装为：

```text
withdraw liquidity
-> execute DeepBook trade
-> settle
-> redeposit / return to whitelist
```

无需：

* 手动划转资金到 Bot Wallet。
* 为每笔交易长期维护独立 Bot Wallet 余额。
* 为 DCA 或交易预先预留大量 idle capital。

⸻

## Idle Capital Routing（可选）

`prd.md` 未将 Idle Capital Routing 定义为独立可选功能。当前 README 仅保留其产品含义：用户资金在交易触发前仍停留在 DeFi 生息位置，交易触发时再通过 PTB 临时提取、交易并重新存入。

⸻

## 使用的 DeepBook / Sui 能力

| 能力 | 用途 |
| --- | --- |
| Sui PTB | 将提款、DeepBook 交易、结算和重新存入封装为原子化流程，并在失败时硬性回滚。 |
| DeepBook | 作为交易执行场所，承接交易路由。 |
| DeFi 生息协议 | 提供可被临时提取、交易后重新存入的资金来源。 |
| 白名单地址 / 授权目的地 | 约束交易后的最终资金落点。 |
| 业务配额规则 | 约束单次调度金额与周期内自动化执行额度。 |

⸻

## 实现方案

### 智能合约 (Move)

`prd.md` 当前只定义产品能力与业务边界，尚未指定最终合约模块拆分。后续实现应围绕以下约束设计：

* 资金流转必须通过 Sui PTB 原子化执行。
* 失败时必须回滚，不留下中间状态。
* 最终资产只能进入用户白名单地址或授权目的地。
* 每次交易必须具备滑点熔断约束。
* 自动化执行必须受单次金额和周期额度限制。

### automation_vault 模块

在 PRD 范围内，该模块只作为可能的预算与执行状态承载方式，不作为 MVP 必选形态。

* 记录用户授权的自动化执行额度。
* 记录允许的最终资金目的地。
* 辅助追踪执行状态与结算结果。

### policy_guard 模块

* 校验滑点熔断条件。
* 校验终点白名单。
* 校验单次金额和周期业务配额。
* 在不满足策略时拒绝执行。

### credit_router 模块（核心）

* 从 DeFi 生息资产中提取当次交易所需资金。
* 路由至 DeepBook 完成交易。
* 将交易后的资产重新存入 DeFi 生息池或返还到白名单地址。

## 关键数据结构

### AutomationVault

* execution budget
* destination whitelist
* execution state
* connected credit sources

### ExecutionPolicy

* min output
* max slippage
* per-execution quota
* period quota
* destination whitelist

### CreditSource

* protocol
* asset
* available liquidity
* withdraw rule
* redeposit rule

⸻

## SDK / Runtime Layer（核心）

### Deepflow SDK

用户原本需要分别调用：

```text
withdraw from DeFi
-> deepbookClient.swap()
-> settle
-> redeposit to DeFi
```

Deepflow 将其替换为一次高级执行请求：

```text
deepflowClient.safeExecute(intent)
```

⸻

## 本地 SDK 原型

当前仓库已新增第一版 TypeScript SDK 原型：

```text
sdk/
```

第一版能力：

* 定义 `ExecutionIntent`、`ExecutionPolicy`、`CreditSource`、`RoutePlan`、`ExecutionResult`。
* 提供 `validateIntent(intent, policy)` 策略校验。
* 提供 `safeExecute(intent, policy, { creditSources })` 本地闭环入口。
* 校验资产、市场、终点白名单、滑点、单次额度、周期额度、执行频率、Session Scope、Kill Switch 和连续失败限制。
* 使用 mock route graph 模拟 `withdraw -> DeepBook trade -> settle -> redeposit / return`。
* 输出 mock PTB，并显式标记 `atomic: true` 和 `rollbackGuarantee: "all-or-nothing"`。

运行测试：

```sh
npm test
```

当前 SDK 原型不连接真实 Sui、DeepBook、NAVI 或 Cetus。真实适配器应在策略闭环稳定后再接入。

## 本地开发

仓库根即 Next.js Dashboard，常用命令：

```sh
npm install
npm run dev              # 启动 Dashboard（http://localhost:3000）
npm run build            # 生产构建
npm test                 # SDK 单元测试
```

`dev:dashboard` 与 `build:dashboard` 为兼容别名，等价于 `dev` / `build`。

⸻

## SDK 功能

* 接收 execution intent。
* 编排提款、交易、结算和重新存入的 PTB 流程。
* 校验滑点、终点和周期配额。
* 在不满足策略时返回明确拒绝原因。
* 路由 DeepBook 交易并处理自动结算。

⸻

## Runtime Protection

检测：

* 滑点超限。
* 最终目的地不在白名单中。
* 单次金额超限。
* 周期业务配额超限。
* 交易或流动性条件导致执行无法完整闭环。

异常时：

* 拒绝执行。
* 或依赖 PTB 原子化语义回滚整条链路。

⸻

## 前端 / Dashboard

仓库根已初始化 Next.js Dashboard（Sui dApp Kit + 四页路由占位）。本地启动见上文「本地开发」章节。

⸻

## 功能

### Vault Dashboard

`prd.md` 未定义 Vault Dashboard 为 MVP 功能，当前不作为 README 功能承诺。

### Credit Sources

PRD 范围内的 Credit Source 指用户已有的 DeFi 生息资产。

MVP 可先支持一个资金来源类型，用于验证：

* 从生息资产提取当次所需本金。
* DeepBook 完成交易。
* 交易后的资产重新存入 DeFi 生息池或返还到白名单地址。

### Bot / Agent Runtime Monitor

PRD 范围内，Bot / Agent 能力聚焦于受控执行网关：

* AI / Bot 提交交易意图。
* Deepflow 执行前校验滑点、终点和配额。
* 不满足策略时返回明确拒绝原因。
* 触发执行异常时通过原子化回滚保护资金。

### Policy Settings

PRD 范围内的策略配置包括：

* 最小输出或最大可接受损失。
* 最终收款白名单。
* 单次执行额度。
* 周期性业务配额。

⸻

## 技术架构

```text
User / Agent
-> Deepflow SDK
-> Policy Validation
-> PTB Liquidity Routing
-> DeepBook
-> DeFi redeposit / whitelist return
```

执行流程：

```text
Submit execution intent
-> Validate slippage, destination, and quota
-> Withdraw liquidity from DeFi credit source
-> Execute DeepBook trade
-> Settle trade
-> Redeposit / return to whitelist
```

⸻

## 与普通 Bot Wallet 的区别

| 普通 Bot Wallet | Deepflow |
| --- | --- |
| 只能通过少放余额降低风险。 | 通过滑点、终点和周期配额限制执行行为。 |
| 资金需要手动划转到 Bot 钱包。 | 可从 DeFi 生息资产中临时调度当次所需资金。 |
| 定投或交易预备金容易长期 idle。 | 交易触发前资金仍可停留在生息协议中。 |
| AI 异常操作可能直接影响钱包余额。 | 交易前校验策略，失败时依赖 PTB 原子化回滚。 |
| 多钱包管理复杂。 | 使用统一执行意图入口组织资金流转。 |

⸻

## 与 deepbook-sandbox 的区别

| deepbook-sandbox | Deepflow |
| --- | --- |
| 本地开发环境。 | DeFi 资金流转中间件。 |
| 用于测试和调试 DeepBook 交互。 | 用于组织真实业务中的提款、交易、结算和重新存入流程。 |
| 偏开发阶段工具。 | 偏业务执行路由。 |
| 不处理用户资金风控。 | 处理滑点、终点和周期配额约束。 |
| 不参与完整资金执行路径。 | 位于执行路径中，负责把多步资金流转折叠为原子流程。 |

⸻

## 技术难度评估

| 维度 | 难度 | 说明 |
| --- | --- | --- |
| Move 合约 | 待定 | `prd.md` 尚未指定最终合约模块拆分。 |
| PTB Orchestration | 高 | 多步提款、交易、结算和重新存入必须保持原子化。 |
| SDK Runtime | 中高 | 需要完成 intent 接收、策略校验、路由编排和可解释拒绝。 |
| 前端 | 暂不评估 | `prd.md` 未将 Dashboard 定义为 MVP 核心范围。 |
| 集成复杂度 | 中高 | 需要连接 DeepBook 与至少一个 DeFi 生息资金来源。 |

⸻

## MVP 范围（建议）

### 必做

* 一键资金调度。
* PTB 原子化执行。
* DeepBook 交易路由。
* 至少一个 DeFi 生息资金来源。
* 滑点熔断。
* 终点锁死。
* 周期性业务配额。
* AI Agent / Bot 受控执行网关。
* 可解释拒绝原因。

⸻

### 可选增强

`prd.md` 未定义独立可选增强项。后续如需加入多资金来源、Dashboard、自动监控或更复杂 Runtime 能力，应先同步更新 PRD。

⸻

## 商业模式

### Execution Fee（核心）

Deepflow 可采用成功导向的执行手续费：

* 用户每成功完成一次自动资金调度与跨协议交易执行，收取极小比例的服务费。
* 交易失败或触发安全回滚时不收费。
* 可引入单笔费用封顶，降低大额交易摩擦。

⸻

### Idle Yield Spread（可选）

`prd.md` 未将 Idle Yield Spread 定义为当前商业模式。当前 README 不将其作为产品承诺。

⸻

### Pro Runtime Plan（未来）

`prd.md` 明确当前采用轻量化、非协议化的 SDK 架构，不依赖复杂 SaaS 订阅和 DApp 运维。Pro Runtime Plan 不属于当前 README 范围。

⸻
