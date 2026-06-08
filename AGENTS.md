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

4. `CODING-RULES.md`
   - 编码与目录规范。
   - 告诉 Agent 前端/SDK 代码应如何组织、命名、拆分组件与划定 client 边界。

如果用户最新明确需求与上述文档冲突，以用户最新需求为准，但必须同步更新相关文档。

修改前端目录或组件结构前，必须先阅读 `CODING-RULES.md`。

## 工作原则

- 一次只处理一个明确目标。
- 不要擅自扩大产品范围。
- 不要把 Deepflow 写成普通交易 Bot、中心化托管平台、钱包或通用 DEX。
- 不要默认引入后端托管服务，除非用户明确要求。
- 不要让 AI Agent 或 Bot 获得不受限制的资金控制权。
- 涉及产品需求变更时，必须更新 `PRODUCT.md`。
- 涉及技术架构、模块边界、安全模型变更时，必须更新 `ARCHITECTURE.md`。
- 涉及前端目录结构、组件拆分或编码风格变更时，必须更新 `CODING-RULES.md`。
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

- 已有 `sdk/` TypeScript SDK 原型（含策略校验、mock route、mock PTB、Vitest 测试）。
- 已有 `asset/figma/` Figma 设计资产（四屏截图、参考代码、图标、设计 token）。
- 仓库根已初始化 Next.js 15 Dashboard（dApp Kit + Tailwind v4），四页静态 UI 已按 Figma 还原。
- 前端目录已规范化为 `app/(dashboard)/{feature}/_components/` 共置模式。
- 尚无 Move 合约、真实链上 Adapter 或 CI 配置。
- 当前目录是 git 仓库，根 `package.json` 为 Dashboard，`workspaces: ["sdk"]` 管理 SDK。

## 前端开发指引

产品 Dashboard 位于**仓库根**（`app/`、`components/`），设计稿来源 `asset/figma/`。

已确认技术栈：

- Next.js 15（App Router）+ TypeScript
- @mysten/dapp-kit-react + @mysten/sui（钱包接入）
- shadcn/ui + Tailwind CSS（UI 组件）
- Recharts（图表）、Lucide React（图标）
- workspace 依赖 `@deepflow/sdk`

目录结构、组件拆分、命名与 client 边界等编码细则见 **`CODING-RULES.md`**。

前端安全约束（不可违背）：

- 钱包连接必须使用 Sui dApp Kit `ConnectButton`，禁止自研 Wallet Standard 适配。
- Dashboard 不是托管钱包，不得持有或代管用户私钥。
- 前端只提交执行意图和展示数据；策略校验必须走 SDK `validateIntent` / `safeExecute`。
- 不得绕过 Policy Engine 直接构造高权限 PTB。

## 推荐下一步

1. 接线 `@deepflow/sdk`：Trading 页 `validateIntent` / mock execute；Security 页映射 `ExecutionPolicy` 字段。
2. 浏览器内手动验证钱包连接（`npm run dev`）。
3. 并行推进真实 Sui SDK、PTB Builder 和 Move 合约设计。

## 完成标准

只有满足以下条件，才能说明一次任务完成：

- 本轮用户要求的文件或代码已经修改完成。
- 修改没有违背 `PRODUCT.md`、`ARCHITECTURE.md` 的核心约束。
- 如果修改了产品范围，已经同步更新 `PRODUCT.md`。
- 如果修改了架构假设，已经同步更新 `ARCHITECTURE.md`。
- 如果变更了编码规范或目录约定，已经同步更新 `CODING-RULES.md`。
- `SESSION-HANDSOFF.md` 已经记录本轮完成情况、未完成事项和下一步。
- 如果存在可运行代码，已经执行相关测试或说明无法测试的原因。
