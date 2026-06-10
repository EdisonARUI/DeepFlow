# CODING-RULES.md

Deepflow 项目编码与目录规范。回答：**代码怎么组织、怎么写**。

与 Harness 文档的分工：

| 文档 | 职责 |
|------|------|
| `PRODUCT.md` | 做什么、不做什么 |
| `ARCHITECTURE.md` | 架构、模块边界、数据流 |
| `SESSION-HANDSOFF.md` | 当前进度与下一步 |
| `CODING-RULES.md` | 编码细则与目录约定（本文件） |

规范变更时同步更新本文件；架构级变更仍走 `ARCHITECTURE.md`。

---

## 1. 仓库与目录约定

- 仓库根 = Next.js Dashboard；`sdk/` 为独立 workspace 包（`@deepflow/sdk`）。
- `app/`：路由与页面编排。
  - `app/(dashboard)/` 为 route group，共享 `AppShell` layout，URL 不含 `(dashboard)` 段。
  - `app/(dashboard)/{feature}/_components/`：仅该路由使用的 UI（`_` 前缀为 private folder，不生成路由）。
- `components/`：跨路由共享 UI（`app-shell/`、`ui/`、`terminal-*`、`connect-button` 等）。
- `lib/`：纯函数、mock 数据、与 UI 无关的工具（如 `mock-data.ts`、`chart-formatters.ts`）。\n+  - `lib/fixtures/`：静态原始数据（mock fixture），用于被数据层组装。\n+  - `lib/data/`：Dashboard 读路径数据层（Repository/Mapper/Hook），组件通过 hook 消费视图数据。

**禁止：**

- 在 `components/{portfolio,liquidity,trading,security}/` 下放页面专属 UI。
- 使用 `*-sections.tsx` 式多组件单文件。
- 使用 `index.ts` barrel 聚合导出（直接从叶子文件导入）。

---

## 2. 页面与组件规则

- `page.tsx` 保持薄 **Server Component**：只做页面级布局与组合，不写业务逻辑。
- **一文件一主组件**；文件名 kebab-case，导出名 PascalCase（如 `net-worth-chart.tsx` → `NetWorthChart`）。
- 多面板需共享状态时，用 `{feature}-workspace.tsx` 编排（如 `liquidity-workspace`、`trading-workspace`），状态提升在 workspace 内完成。
- 从 `page.tsx` 直接导入 `./_components/...` 叶子文件，不经过 barrel。

目标结构示例：

```text
app/(dashboard)/
  portfolio/
    page.tsx
    _components/
      portfolio-summary-stats.tsx
      asset-composition.tsx
      protocol-exposure.tsx
      transaction-history.tsx
components/          # 仅跨页共享
  app-shell/
  ui/
  terminal-panel.tsx
lib/
  mock-data.ts
```

---

## 3. Client / Server 边界

- 默认 **Server Component**；仅在需要 `useState`、事件处理、浏览器 API、Recharts 等交互的叶子组件顶部加 `"use client"`。
- 不把无状态展示块 unnecessarily 标为 client（如纯 Table 展示、静态 PTB 管线）。
- 前端不得绕过 SDK 直接构造高权限 PTB；策略校验走 `validateIntent` / `safeExecute`。

---

## 4. UI 与设计资产

- 使用 shadcn/ui + Tailwind；设计 token 来自 `app/globals.css`（映射 `asset/figma/tokens.json`）。
- 钱包连接仅用 dApp Kit `ConnectButton`（`components/connect-button.tsx` 封装挂载逻辑）。
- 参照 `asset/figma/reference/*.tsx` 实现，不直接运行参考代码。
- Liquidity 多协议展示为设计示意；MVP 仍只接一个 credit source。
- 侧栏 Logo 使用 `public/figma/icons/logo.svg`（原生 `<img>`，勿用 `next/image` 加载 SVG）。

---

## 5. SDK 与命名

- 代码与协议命名用英文；面向用户/维护者的文档用中文。
- SDK 修改在 `sdk/` 内完成；Dashboard 通过 `@deepflow/sdk` workspace 依赖引用。
- Dashboard 不是托管钱包，不得持有或代管用户私钥。

---

## 6. 完成检查清单

每轮改代码后自检：

- [ ] 新组件是否放在正确目录（路由专属 `_components/` vs 共享 `components/`）？
- [ ] `page.tsx` 是否足够薄？
- [ ] `"use client"` 是否最小化？
- [ ] 是否更新了 `SESSION-HANDSOFF.md`？
- [ ] 架构/产品/规范变更是否同步了 `ARCHITECTURE.md` / `PRODUCT.md` / `CODING-RULES.md`？
