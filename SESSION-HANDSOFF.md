# SESSION-HANDSOFF.md

## 当前任务

修复 `dev:dashboard` 脚本错误，验证 dApp Kit 本地 dev 启动。

## 已完成

- [x] 已将 `apps/dashboard/` 内容上提到仓库根（`app/`、`components/`、Next.js 配置文件）。
- [x] 已将 `packages/sdk/` 提升为根级 `sdk/`（包名保持 `@deepflow/sdk`）。
- [x] 已删除 `apps/` 与 `packages/` 嵌套目录。
- [x] 已合并根 `package.json`：Dashboard 脚本（`dev`/`build`/`start`/`lint`）+ `workspaces: ["sdk"]`。
- [x] 已更新 `next.config.ts`（`transpilePackages` 含 SDK，`outputFileTracingRoot` 指向仓库根）。
- [x] 已更新 `tsconfig.json`（排除 `sdk/` 避免 Next.js 类型检查冲突）。
- [x] 已合并 `.gitignore`（加入 Next.js 构建产物规则）。
- [x] 已重装依赖并验证 `npm run build` 与 `npm test`（11 passed）。
- [x] 已重写 `ARCHITECTURE.md`：新增「仓库布局」专节、合并重复目录描述、更新全部路径引用。
- [x] 已同步更新 `AGENTS.md`、`README.md` 中的路径与仓库描述。
- [x] 已删除误引入的开发工具目录及对应文档引用。
- [x] 已在 `package.json` 添加 `dev:dashboard` / `build:dashboard` 兼容别名（指向 `dev` / `build`）。
- [x] 已在 `README.md` 补充「本地开发」章节（`npm run dev` 等命令）。
- [x] 已验证 `npm run dev:dashboard` 启动成功，`/`、`/portfolio`、`/liquidity`、`/trading`、`/security` 均返回 200；首页加载 dApp Kit 与 ConnectButton 相关 chunk。

## 未完成 / 待处理

- [ ] 安装 shadcn/ui、Recharts、Lucide 依赖。
- [ ] 实现 AppShell + 四页静态 UI（mock 数据，按 Figma 还原）。
- [ ] `@deepflow/sdk` workspace 依赖接线（根 package.json 已声明，页面尚未 import）。
- [ ] 接入真实 Sui TypeScript SDK。
- [ ] 实现真实 PTB Builder。
- [ ] 实现 DeepBook spot 或 Predict Adapter。
- [ ] 实现真实 Credit Source Adapter，例如 NAVI 或 Cetus。
- [ ] 创建 Move 合约模块：`automation_vault`、`policy_guard`、`credit_router`。
- [ ] 将资金去向、额度、权限等硬约束迁移到链上可强制执行。
- [ ] 确认 MVP 首个 DeFi 生息资金来源。
- [ ] 确认首个 DeepBook 交易路径是否只做 spot。

## 下一步建议

1. 安装 shadcn/ui + Recharts + Lucide，映射 `asset/figma/tokens.json` 终端风设计 token。
2. 实现共享 AppShell（256px 侧栏 + 顶栏面包屑 + ConnectButton）。
3. 按 Figma 参考代码还原四页静态布局（mock 数据）。
4. 接线 `@deepflow/sdk`，Trading 页提交 mock intent，Security 页映射 policy 字段。
5. 浏览器内手动验证钱包连接（`npm run dev` 或 `npm run dev:dashboard`）。

并行推进 SDK 链上适配：

1. 决定 MVP 首个路径：DeepBook spot 还是 DeepBook Predict。
2. 决定 MVP 首个 Credit Source：继续 mock、NAVI 还是 Cetus。
3. 设计真实 PTB Builder 接口，并保持只能接收已验证 `RoutePlan`。

## 注意事项

- 扁平化后 Dashboard 启动命令为 `npm run dev`；`dev:dashboard` 仅为兼容别名。
- `asset/figma/reference/*.tsx` 为 Figma MCP 参考代码，仅供实现对照，不可直接运行。
- Figma MCP 临时 asset URL 已本地化到 `asset/figma/icons/`，避免 7 天过期。
- `sdk/` 当前是本地安全闭环原型，不是完整链上执行 SDK。
- Dashboard UI 不构成资金安全边界，执行前必须走 SDK 策略校验。
- 仓库根即 Next.js Dashboard，不再使用 `apps/dashboard` 路径。
- 当前测试使用 Vitest（`npm test`）。
- 如果后续修改产品功能，需要同步更新 `PRODUCT.md`。
- 如果后续修改架构或目录结构，需要同步更新 `ARCHITECTURE.md`。
