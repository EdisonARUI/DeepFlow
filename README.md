Deepflow

一个面向 DeepBook Predict Bot 的安全自动化执行层，支持使用独立 Vault 或已有 DeFi 存款为 Predict 策略提供可编程 Execution Credit，并通过 Runtime Guardrails 防止 Bot 异常执行。

解决什么问题

当前 Sui 上的大多数 Predict / 套利 Bot：

* 需要手动向 Bot Wallet 划转资金
* 资金分散在 Navi / Cetus / Lending Pool 中无法直接用于自动化执行
* Bot 缺少独立风控层
* AI 生成 Bot 容易出现无限循环、异常交易、错误执行

个人开发者通常只能：

* 给 Bot Wallet 少放点钱
* 手动管理资金
* 自己实现简单风控

这会导致：

* 资金利用率低
* 多钱包管理复杂
* Bot 风险不可控
* 大量资金闲置在 DeFi 中无法参与 Predict Automation

Deepflow 允许用户：

* 使用独立 Vault 为 Bot 提供 Execution Budget
* 或直接使用已有 DeFi 资产作为 Automation Credit
* 在不修改策略逻辑的情况下安全运行 Predict Bot

⸻

核心功能

* Predict Bot Execution Vault（独立自动化资金账户）
* Runtime Guardrails（异常交易保护）
* Session Key 授权（Bot 独立执行权限）
* DeFi-backed Execution Credit（核心）
* Idle Capital Routing（可选）
* Execution Kill Switch（异常熔断）

⸻

Runtime Guardrails

防止：

* 无限 mint/redeem 循环
* 异常 tx spam
* stale oracle 执行
* 超大仓位错误
* AI-generated bot 异常行为

⸻

DeFi-backed Execution Credit（核心）

允许用户：

直接使用：

* NAVI Protocol
* Cetus

等协议中的已有资产：

作为 Predict Bot 的 Execution Credit。

Bot 真正执行时：

通过 Sui PTB：

borrow / withdraw liquidity
→ execute Predict trade
→ settle
→ repay / redeposit

无需：

* 手动划转资金
* 维护独立 Bot Wallet 余额
* 预留大量 Idle Capital

⸻

Idle Capital Routing（可选）

Vault 中未使用资金：

可自动：

* supply 到 lending protocol
* 或提供低风险流动性

真正执行时：

PTB 原子：

withdraw
→ execute
→ redeposit

提高资金利用率。

⸻

使用的 DeepBook / Sui 能力

能力	用途
predict::mint	执行 Predict 策略
predict::redeem_permissionless	自动结算与赎回
PredictManager	管理 Bot Predict 仓位
Sui PTB	原子 liquidity routing + execution
Session Key	Bot 独立执行权限
DeepBook SDK	底层 Predict 交互
Navi / Cetus Liquidity	提供 Execution Credit

⸻

实现方案

智能合约 (Move)

automation_vault 模块

* 管理 Bot Execution Vault
* Session Key 验证
* Execution Budget Tracking

policy_guard 模块

* Runtime 风控
* Exposure 检查
* Kill Switch

credit_router 模块（核心）

* DeFi Liquidity Routing
* PTB Credit Execution
* 自动 repay/redeposit

关键数据结构

AutomationVault

* execution budget
* session authority
* runtime state
* connected liquidity sources

ExecutionPolicy

* max exposure
* abnormal tx threshold
* kill switch state

CreditSource

* Navi deposit
* Cetus LP
* available liquidity
* routing rules

⸻

SDK / Runtime Layer（核心）

Deepflow SDK

用户：

原本：

predictClient.mint()

替换为：

creditClient.safeExecute(ptb)

⸻

SDK 功能

* PTB interception
* policy validation
* execution simulation
* tx anomaly detection
* liquidity routing
* automatic settlement routing

⸻

Runtime Protection

检测：

* abnormal tx frequency
* excessive exposure
* stale oracle execution
* repeated failed tx
* infinite execution loops

异常时：

自动：

freeze execution

⸻

前端 / Dashboard

技术栈

* Next.js
* Sui SDK
* React
* Recharts / ECharts

⸻

功能

Vault Dashboard

* 当前 Execution Budget
* Exposure
* Active Sessions
* Vault Balance

Credit Sources

* Navi 存款
* Cetus LP
* 可用 Liquidity

Bot Runtime Monitor

* Approved Tx
* Rejected Tx
* Kill Switch 状态
* Runtime Alerts

Policy Settings

* Conservative
* Balanced
* Aggressive

⸻

技术架构

用户 Bot → Deepflow SDK → Runtime Policy Engine → PTB Liquidity Routing → DeepBook Predict

执行流程：

Bot detects opportunity
→ SDK intercepts execution
→ Validate runtime policy
→ Pull liquidity from Navi/Cetus
→ Execute Predict transaction
→ Settle trade
→ Repay/redeposit liquidity
→ Update vault exposure

⸻

与普通 Bot Wallet 的区别

普通 Bot Wallet	Deepflow
只能限制余额	限制执行行为
资金需要手动划转	可直接使用 DeFi 存款
资金大量 idle	动态 liquidity routing
Bot 风险完全暴露	Runtime Guardrails
多钱包难管理	统一 Automation Vault
无独立权限系统	Session Key + Vault

⸻

与 deepbook-sandbox 的区别

deepbook-sandbox	Deepflow
本地开发环境	生产运行时执行层
用于测试和调试	用于真实 Bot Runtime
开发阶段工具	Automation Execution Layer
不处理风控	Runtime 风险控制
不参与执行路径	Sitting in execution path

⸻

技术难度评估

维度	难度	说明
Move 合约	⭐️⭐️⭐️	Vault / Policy / Credit Routing
PTB Orchestration	⭐️⭐️⭐️⭐️⭐️	多协议原子执行核心
SDK Runtime	⭐️⭐️⭐️⭐️	Execution Interceptor
前端	⭐️⭐️	Dashboard + Vault 管理
集成复杂度	⭐️⭐️⭐️⭐️	DeepBook + Navi/Cetus

⸻

MVP 范围（建议）

必做

* DeepBook Predict 集成
* Automation Vault
* Session Key
* Runtime Guardrails
* PTB Credit Execution
* Navi 或 Cetus（二选一）

⸻

可选增强

* Idle Yield Routing
* Advanced Runtime Detection
* Multi-liquidity Sources
* Auto-redeem Keeper

⸻

商业模式

Execution Fee（核心）

对：

safeExecute()

收取：

* fixed execution fee
* 或 execution spread fee

⸻

Idle Yield Spread（可选）

Vault Idle Capital：

自动获取收益。

协议：

抽取：

yield spread

⸻

Pro Runtime Plan（未来）

高级：

* anomaly detection
* oracle monitoring
* PTB simulation
* advanced routing

⸻
