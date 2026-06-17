# SESSION-HANDSOFF.md

## 当前任务

Portfolio 未连接钱包交易历史提示文案移除——已完成。

## 已完成

- [x] **Landing 首次跳转 dev 预编译预热修正（Portfolio/Liquidity/Trading）**：
  - 依据用户实测日志 `Compiling /portfolio ... 7.7s` 确认瓶颈为 Next dev on-demand compile（非 Portfolio 页面内数据加载）。
  - `app/_components/landing-portfolio-prefetch.tsx`：
    - 预热范围从单路由扩展为 `["/portfolio","/liquidity","/trading"]`。
    - session 去重 key 升级为 `__deepflow_prefetched_dashboard_routes__`，避免多入口重复触发。
    - 开发环境新增 dev-only 轻量 `fetch(route, { cache: "no-store" })` 预热请求，提前触发 route compile；生产环境保持 `router.prefetch` 轻量路径。
  - 自动化浏览器验证：landing 停留后点击 Portfolio 可直接离开 landing；终端复核未再出现新的 `/portfolio` 首次编译阻塞日志，后续访问为已预热快速响应（如 `GET /portfolio ... 264ms`）。
  - `ReadLints`：改动文件无新增 lint 问题。

- [x] **Landing → Portfolio 点击即时跳转优化**：
  - 新增 `app/(dashboard)/loading.tsx`：提供 route-group 级骨架，确保从 landing 跨段进入 dashboard 时优先显示目标路由加载壳，不再停留 landing 画面。
  - `app/_components/launch-app-link.tsx`：升级为 client 组件；对内部路由增加 `prefetch` + `onMouseEnter` / `onTouchStart` 主动预取，降低首击冷启动等待。
  - `app/_components/landing-portfolio-prefetch.tsx`：预取时机从“纯 idle”改为“首帧后短延时优先 + 可见性兜底（500ms）”，保留会话内去重。
  - 结果：点击 landing 的 Portfolio 入口会更快离开 landing，慢加载阶段以 dashboard/portfolio skeleton 承接。
  - 已对相关文件执行 `ReadLints`，无新增问题。

- [x] **移除 Portfolio 未连接钱包交易历史提示文案**：
  - `lib/data/portfolio/sui-transaction-adapter.ts`：`owner` 缺失时仅返回空 `transactions`，不再返回 `warning: "Connect wallet to view on-chain transaction history."`。
  - 结果：未连接钱包进入 Portfolio 时，不再显示该提示字样；其他错误 warning 保持不变。

- [x] **Dashboard 提示文案英文统一**：
  - 按用户确认范围（仅 Dashboard 用户可见文案）完成英文化，不改文档与纯开发注释。
  - 移除 Trading execute 模式提示文案：`Execute 将签名上链（消耗真实资产与 gas）`（`swap-widget.tsx`）。
  - Portfolio 未连接钱包提示改英文：`Connect wallet to view on-chain transaction history.`（`sui-transaction-adapter.ts`）。
  - Trading/Portfolio/Liquidity 可见错误与空状态文案统一改英文（含 `use-trade-simulation.ts`、`deepbook-trading-adapter.ts`、`resolve-trade-execution.ts`、`map-to-portfolio-view.ts`、`deepbook-usd-price-oracle.ts`、`use-supply-withdraw-simulation.ts`、NAVI/Suilend adapter warnings）。
  - 自检：`app/` 下无中文可见提示残留；`lib/data/` 下仅剩中文注释（非用户可见）。`ReadLints` 无新增错误（仅存在既有 Tailwind class 写法 warning）。

- [x] **修复 TopBar Connect 按钮对齐与 dApp Kit 弹窗异常圆角**：
  - 根因1（对齐）：`mysten-dapp-kit-connect-button` 实际可样式化 part 为 `trigger`，旧样式写成 `::part(button)` 未生效，内部按钮保持默认 `40px` 高度，导致与导航 `h-8` 视觉不齐。
  - 根因2（圆角）：`globals.css` 给 dashboard Connect host 设置了 `--radius: 9999px`，该变量被 dApp Kit modal 继承，导致连接/账户弹窗圆角异常。
  - 修复：
    - `app/globals.css`：将 `::part(button)` 改为 `::part(trigger)`，并统一 `height: 32px`、`padding: 0 32px`、`border-radius: 50px`、`line-height: 1`。
    - `app/globals.css`：`--radius` 从 `9999px` 调整为 `12px`，恢复 dApp Kit 弹窗合理圆角；保留按钮胶囊样式由 `::part(trigger)` 控制。
    - `components/connect-button.tsx`：dashboard 包裹层补充 `inline-flex h-8 items-center`，与顶栏导航同基线对齐。
  - 浏览器验证（localhost）：
    - 未连接状态：`PORTFOLIO` 导航、Connect host、内部 button 三者 `top/bottom/height` 一致（54/86/32）。
    - Connect 弹窗：`dialog border-radius` 恢复为 `12px`（修复前为异常继承值）。
    - 已连接账户弹窗需本地钱包连接后手动点检，但同一 host 变量链路已修复。

- [x] **移除 Portfolio / Liquidity / Trading 加载文案闪烁**：
  - 根因：三页 workspace 的 `isLoading` 分支渲染了 `Loading ...` 文案；路由级 `loading.tsx` 骨架后会短暂切换到文案态，造成“闪一下”。
  - 修复：将 `portfolio-workspace.tsx` / `liquidity-workspace.tsx` / `trading-workspace.tsx` 的加载分支统一替换为与各自路由 `loading.tsx` 结构一致的骨架组件，不再渲染 `Loading ...`。
  - 自检：在 `app/(dashboard)` 下检索已无 `Loading portfolio/liquidity/trading` 字样；对改动文件执行 lint 无新增问题。

- [x] **Landing → Portfolio 首访性能优化（生产路径）**：
  - landing 预热：新增 `app/_components/landing-portfolio-prefetch.tsx`，通过 `router.prefetch("/portfolio")` 在 idle 时机预拉取；并使用模块级标记 + `sessionStorage` 保证同会话仅触发一次。
  - 预热接线：`landing-hero.tsx`、`landing-products.tsx` 注入 `LandingPortfolioPrefetch`，覆盖用户首屏与产品区浏览路径。
  - Portfolio 首屏拆分：`portfolio-workspace.tsx` 将 `AssetComposition`、`ProtocolExposure` 改为 `next/dynamic` 按需加载（`ssr: false` + skeleton fallback），优先展示 summary 与页面框架。
  - 数据分阶段：`portfolio-repository.ts` 新增 `includeTransactions` 参数；`use-portfolio.ts` 先请求关键数据（不含 transactions）并立即结束首屏 loading，再后台补齐完整数据；`live/mock` repository 均支持该参数。
  - 生产验证：`npm run build` 通过；`npm run start -p 3001` 后实测 `landing: 0.033s`、`portfolio_first: 0.010s`、`portfolio_second: 0.002s`（本地环境）。首屏体感目标达成，图表与交易明细渐进补齐。

- [x] **开发态切页加载优化（最小改动）**：
  - `next.config.ts`：新增 `onDemandEntries`（`maxInactiveAge: 10min`、`pagesBufferLength: 10`），降低 dashboard 三页在开发环境来回切换时的重复编译概率。
  - 新增路由级加载骨架：`app/(dashboard)/portfolio/loading.tsx`、`app/(dashboard)/liquidity/loading.tsx`、`app/(dashboard)/trading/loading.tsx`，减少编译/加载期间空白等待体感。
  - 本地验证：`npm run dev` 后依次请求 `/portfolio -> /liquidity -> /trading -> /portfolio -> /liquidity -> /trading`；首轮分别触发编译（约 8.9s / 3.8s / 4.0s），二轮复访降至约 0.47s / 0.63s / 0.48s，确认复用已编译产物且切回明显更快。

- [x] **Portfolio Treemap 缺失 Suilend 资产**：
  - 根因：`EXPOSURE_PROTOCOLS` 白名单未含 `SUILEND`，`buildExposure` 静默跳过 Suilend 持仓；Asset Composition 的 `PROTOCOL_FILTERS` 已含 SUILEND，两模块配置不一致。
  - 修复：`types.ts` 新增 `SUILEND` 至 `EXPOSURE_PROTOCOLS`；`token-colors.ts` 补充 `#e5b842` 配色；`protocol-exposure.tsx` 图例标签 `Suilend`。
  - 测试：`deepbook-usd-price-oracle.test.ts` 增加 SUILEND exposure 分桶用例。
  - `PRODUCT.md` Treemap 协议桶描述同步更新。

- [x] **DeFi Connectivity 表格左对齐与资产图标**：
  - `defi-connectivity.tsx`：移除表头/表体 `text-right`，PROTOCOL / ASSET / TVL / APY / BALANCE 五列统一左对齐。
  - ASSET 列复用 `AssetIcon`（`size="sm"`），与 `position-amount-input` 下拉选项一致。

- [x] **Landing Product 字体排版与布局修复**（Figma `156:785` / `156:801` / `156:817`）：
  - 根因：`landing-product-section.tsx` 标题 `text-[80px]` 配 `leading-[32px]`，行高小于字号导致两行标题重叠。
  - 修复：标题改为 `leading-none` + 固定 `min-h` 容器（行1 `80px` / 行2 `90px`）；文案列 `gap-10`、`max-w-[515px]`；描述 `text-[10px]`；配图 `max-w-[500px]`；卡片 `max-w-[1240px]`、`lg:gap-[65px]`。
  - 配图切换：`portfolio.png` / `liquidity.png` / `trading.png` 替换原 `*-dashboard.png`。
  - 已验证 `npm run build`。

- [x] **修复 Trading 页面 Orders 右侧留白（比例网格）**：
  - 根因：`trading-workspace.tsx` 使用固定像素三列 `350 / 420 / 350`，在大屏容器内产生剩余宽度并集中到右侧，表现为 ORDERS 右侧留白过大。
  - 修复：`xl:grid-cols` 改为比例列 `5fr / 6fr / 5fr`，总宽度随容器自适应，三列按固定比例伸缩；保留 `gap-5` 与现有面板结构不变。
  - 已验证：通过代码检查确认布局逻辑生效；已执行 `ReadLints` 检查改动文件无新增错误。

- [x] **Trading 页面 Figma 新设计落地**（Figma `169:3541`）：
  - `trading-workspace.tsx`：新增 `TradingShell`（蓝色圆角外壳）；三栏 grid 调整为 `350 / 420 / 350`。
  - `market-pairs.tsx`：换用共享 `DashboardPanel`；单 `AssetIcon`、选中左 cyan 边 + 浅青底。
  - `swap-widget.tsx` / `swap-segmented-control.tsx` / `swap-amount-block.tsx` / `swap-execution-info.tsx`：DEEPBOOK 面板、SOURCE/DESTINATION 同行 pill、圆角金额块、装饰性 chevron、紧凑 Execute 按钮；功能逻辑不变。
  - `deepbook-orders.tsx`：标题 **ORDERS**；BUY/SELL 左色条行样式；保留 status 弱化展示。
  - 已验证 `npm run build`。

- [x] **Liquidity 页面 Figma 新设计落地**（Figma `169:1943`）：
  - 抽取共享 `components/dashboard-panel.tsx`；Portfolio 三处子组件改引用并删除 `portfolio-panel.tsx`。
  - `liquidity/page.tsx` 简化为薄编排；`liquidity-workspace.tsx` 新增 `LiquidityShell`（蓝色圆角外壳）。
  - `defi-connectivity.tsx`：`DEFI` 面板 + TVL/APY 表头、右对齐行、选中高亮 `accent-cyan-muted`。
  - `position-management.tsx`：胶囊 Supply/Withdraw Tab + `DashboardPanel`。
  - 表单子组件圆角化（`position-protocol-banner`、`position-amount-input`、`position-percentage-slider`、`transaction-overview-panel`）；Supply/Withdraw 双列 1:1 布局。
  - `suilend-liquidity-adapter.ts`：协议色对齐设计稿 `#e5b842`。
  - 已验证 `npm run build`。

- [x] **Portfolio 四项修复**：
  - `connect-button.tsx` + `globals.css`：dashboard variant 通过 `mysten-dapp-kit-connect-button` CSS 变量与 slot 对齐 Figma 胶囊样式。
  - `protocol-exposure.tsx`：Treemap 块间距 4px、块内文字固定黑色。
  - `portfolio-workspace.tsx`：`usePortfolio` 固定拉取 30 天，时间切换仅客户端过滤交易表，避免整页 loading。
  - 已验证 `npm run build`。

- [x] **Portfolio 页面 Figma 新设计落地**（Figma `164:1942`）：
  - `globals.css`：新增 dashboard/portfolio 设计 token（`bg-dashboard-shell`、`bg-dashboard-card`、`accent-cyan-pill` 等）。
  - `app-shell.tsx` / `top-bar.tsx`：移除 Sidebar 偏移，改为黑色背景 + 蓝色胶囊顶栏（品牌徽章 + 3 导航 pill + Connect Wallet）。
  - `connect-button.tsx`：新增 `variant="dashboard"` 胶囊样式。
  - 新增 `components/dashboard-panel.tsx`（原 `portfolio-panel.tsx`）；Portfolio 四块子组件换用新面板样式。
  - `portfolio-workspace.tsx`：蓝色圆角内容外壳；统计卡重排顺序与圆角样式。
  - `asset-composition.tsx`：pill 筛选、300px 饼图；`protocol-exposure.tsx`：Treemap 圆角与图例；`transaction-history.tsx`：胶囊时间切换。
  - `token-colors.ts`：WAL 色值对齐设计稿。
  - 已验证 `npm run build`。

- [x] **Footer Banner Logo 循环顺序修复**：
  - `landing-footer-banner.tsx`：`BANNER_SEQUENCE` 末项由 `deepflow` 改为 `brand`，循环单元对齐 `deepflow → logo → deepbook → logo`。
  - 已验证 `npm run build`。

- [x] **Landing 页面五项修复**：
  - `landing-footer-banner.tsx`：`BANNER_SEQUENCE` 改为 4 元组 `deepflow → logo → deepbook → deepflow`；品牌 icon 对齐 header 比例（`width={40} height={28}` + `object-contain`）。
  - `landing-partners.tsx`：按视口宽度动态计算 partner 重复次数，首屏两行铺满；外边距改为 `px-5 pt-5 pb-[10px]`。
  - `landing-product-section.tsx` / `landing-products.tsx`：外边距对齐 Hero（`px-5 pt-5 pb-[10px]`）；移除 products 容器多余 `py`。
  - `landing-product-portfolio.tsx` / `liquidity` / `trading`：添加 `id="landing-*"` section 锚点。
  - `landing-footer.tsx`：`NAV_LINKS` 改为页内锚点（`#landing-hero` / portfolio / liquidity / trading / partners）；`LaunchAppLink` CTA 仍跳转 Dashboard。
  - 已验证 `npm run build`。

- [x] **Landing 页面六项修复**（Figma `156:173` 等）：
  - `landing-header.tsx`：从页面级移入 Hero 内部；`sticky` + `IntersectionObserver` 改为 `absolute top-0 left-1/2 -translate-x-1/2` overlay；移除滚出 Hero 背景切换。
  - `landing-hero.tsx`：内嵌 `<LandingHeader />`；移除 `-mt-[100px]` hack。
  - `page.tsx`：移除顶层 Header 与 Roadmap 区块；删除 `landing-roadmap.tsx`。
  - `landing-social-links.tsx`：Discord/Telegram 图标改黑色；footer 四个社交格统一 `rounded-[45px]` 白底容器；Mail 使用 `social-mail-icon.svg`（header 仍用圆形 `social-mail.svg`）。
  - 新增 `social-mail-icon.svg`；更新 `social-discord.svg`、`social-telegram.svg` fill 为 `#000000`。
  - `globals.css`：footer banner marquee `40s` → `20s`；partners marquee `30s` → `15s`。
  - 已验证 `npm run build`。

- [x] **Landing Footer 改版**（Figma `156:853`）：
  - 新增 `landing-footer-banner.tsx`：DEEPFLOW / 品牌 / DEEPBOOK 三块瓷砖横向无限循环滚动。
  - `landing-footer.tsx`：左 2×2 社交网格 + 右信息面板（导航、法律链接、版权、渐变 watermark）。
  - `landing-social-links.tsx` 新增 `variant="footer"`（173px 白色圆角方块）。
  - `landing-partners.tsx` 添加 `id="landing-partners"` 供 PARTNER 锚点跳转。
  - `globals.css` 新增 `landing-footer-banner-marquee` 动画；新增 `footer-brand-icon.svg`。
  - 已验证 `npm run build`。

- [x] **Landing Partners 双行反向滚动改版**（Figma `156:415`）：
  - `landing-partners.tsx`：黑色背景、标题 `Our Partner`（64px）、120×120 白色圆角图标卡片。
  - 双行 `PartnerMarqueeRow` 横向无限滚动，上行向左、下行向右（`animate-landing-partners-marquee-reverse`）。
  - `globals.css` 新增反向 marquee keyframes；`prefers-reduced-motion` 时降级为 `overflow-x-auto`。
  - 新增圆形 logo 资源：`partner-navi-circle.png`、`partner-deepbook-circle.png`、`partner-sui-circle.png`、`partner-suilend-circle.png`。
  - 已验证 `npm run build`。

- [x] **Landing Products 三页重构**（Figma `156:785` / `156:801` / `156:817`）：
  - 移除 Tab 切换，改为纵向展示 Portfolio / Liquidity / Trading 三个独立区块。
  - 新增 `landing-product-section.tsx` 共享布局（`#003d7a` 圆角卡片、Anton 双行标题、预览框、START NOW）。
  - 新增 `landing-product-portfolio.tsx`、`landing-product-liquidity.tsx`、`landing-product-trading.tsx`。
  - `landing-products.tsx` 改为 Server Component 薄编排。
  - `launch-app-link.tsx` 新增 `start-now` 变体与 `href` prop，分别跳转 `/portfolio`、`/liquidity`、`/trading`。
  - 新增资源：`liquidity-dashboard.png`、`trading-dashboard.png`、`arrow-up-right.svg`；更新 `portfolio-dashboard.png`。
  - Liquidity 区块文左图右（`reversed`）；移动端 Liquidity 文案在上。
  - 已验证 `npm run build`。

- [x] **Landing Hero + Header 新设计落地**（Figma `156:173`）：
  - `landing-hero.tsx`：圆角渐变卡片（`rounded-[45px]`）、Anton 主标题 `DEEPFLOW`、副标题 `Unify Liquidity on DeepBook`（Liquidity `#baf2ff`）、胶囊 CTA；保留 `LandingHeroWaves` 背景；`-mt-[100px]` 与 Header 重叠。
  - `landing-header.tsx`：`h-[100px]`、紫色圆形品牌徽章、Hero 上 `backdrop-blur` + cyan 阴影、滚出后 `bg-[#101415]/95`；`rootMargin -100px`。
  - `landing-social-links.tsx`：新增 `variant`（`header` / `default`）；Header 白色圆形社交按钮 + Email；Footer 保持原样式。
  - `launch-app-link.tsx`：导出 `LANDING_LAUNCH_PILL_CLASS` 供 Hero/Header 复用。
  - 新增资源：`public/figma/landing/brand-icon.svg`、`social-mail.svg`（Figma MCP 下载）。
  - 已验证 `npm run build`。

- [x] **修复 navi→suilend 误报「请先在 Suilend 存入资产」**：
  - 根因：`build-navi-swap-then-supply-suilend-tx` 的 `appendSuilendDeposit` 使用 `allowCreateObligation: false`，无 Suilend obligation 时在 PTB 构建前即失败；`wallet_suilend` 为 `true` 故可通过。
  - 修复：`navi_suilend` 与 `wallet_suilend` 对齐为 `allowCreateObligation: true`；仅 `suilend_suilend` redeposit 保持 `false`。
  - 更新单元测试与 `PRODUCT.md` / `ARCHITECTURE.md`。
  - 已验证 `npm test` 与 `npm run build`。

- [x] **Landing Roadmap 动效连线、Partners 横向滚动、Footer 装饰字裁切**：
  - `landing-roadmap.tsx`：改为 Client Component；移除静态 `roadmap-line.svg`；通过 DOM 测点计算 milestone 图标中心，用 CSS `div` 线段 + `scaleX` 动效逐段绘制；`IntersectionObserver`（threshold 0.25）触发入场；milestone 依次淡入；`ResizeObserver` 响应式重算；`prefers-reduced-motion` 跳过动画。
  - `landing-partners.tsx`：Grid 改为双份 PARTNERS 无限横向 marquee；`globals.css` 新增 `landing-partners-marquee` keyframes；减少动态效果时降级为 `overflow-x-auto`。
  - `landing-footer.tsx`：装饰字容器限高 `h-[60px] md:h-[140px]`（字号 50%），仅露出上半部分。
  - 已验证 `npm run build`。

- [x] **Landing Header 滚动背景与 Roadmap 背景替换**：
  - `landing-header.tsx`：改为 Client Component；`fixed` → `sticky`；`IntersectionObserver` 监听 `#landing-hero`，Hero 区域透明、滚出后 `bg-[#020617]/95 backdrop-blur-md` 过渡。
  - `landing-hero.tsx`：添加 `id="landing-hero"` 与 `-mt-20` 与 header 重叠。
  - `landing-roadmap.tsx`：背景图 `circuit-bg.png` → `contour_map.svg`。

- [x] **Landing Header 与社交图标样式修复**：
  - `landing-header.tsx`：移除 `backdrop-blur-md`，header 背景完全透明。
  - `landing-social-links.tsx`：图标按钮背景透明度 `rgba(0,218,248,0.2)` → `0.1`。
  - Discord 图标：配置 `w-6 h-auto` 保持原始宽高比；`social-discord.svg` 的 `preserveAspectRatio` 改为 `xMidYMid meet`。

- [x] **Landing Hero 波浪密度与垂直铺满微调**：
  - `lineSpacing` 提升至 9–12px，`frequency` 降至 0.0018–0.0028，细线与波峰更稀疏。
  - `drawWaves` 按画布高度比例计算层偏移（`spread = height * 0.22`）、`ribbonHeight`、`amplitude`（基准 700px），4 层纵向分布覆盖约 66% 高度。
  - 容器恢复 `h-[240%] -translate-y-1/2` 纵向溢出，对齐原 PNG 首屏铺满效果。
  - 已验证 `npm run build`。

- [x] **Landing Hero 波浪背景动效**：
  - 新增 `app/_components/landing-hero-waves.tsx`：Canvas 多层细线正弦波浪 + `requestAnimationFrame` 相位循环（`phase %= 2π` 无缝衔接）。
  - 4 层波浪配置（不同振幅/频率/速度/透明度），`ResizeObserver` + `devicePixelRatio` 适配；`visibilitychange` 隐藏时暂停绘制。
  - `prefers-reduced-motion: reduce` 时仅绘制静态帧，不启动动画循环。
  - `landing-hero.tsx` 用 `LandingHeroWaves` 替换静态 `hero-wave.png`（PNG 保留作降级资源）。
  - 已验证 `npm run build`。

- [x] **DeepBook Swap 成交历史数据源**：
  - 新增 `parse-deepbook-swap-txs.ts`：Sui RPC `FromAddress` 扫描 + DeepBook `swap_exact_*` MoveCall 解析（不依赖 Balance Manager）。
  - 扩展 `deepbook-indexer-client.ts`：`fetchIndexerTrades` + `enrichSwapsWithIndexerTrades`（按 `digest` 富化数量与方向）。
  - 重写 `DeepbookTradingAdapter.listUserOrders`：swap 历史路径，移除 `getBalanceManagerIds` + `/orders` 硬依赖。
  - Mock fixture 全部改为 `FILLED` swap 记录；UI 面板标题改为 `DEEPBOOK_SWAPS`，空状态文案更新。
  - 更新 `PRODUCT.md`、`ARCHITECTURE.md`。
  - 已验证 `npm run build`。

- [x] **Trading Suilend 路由支持**：
  - SDK：新增 `append-suilend-swap-leg.ts`（`withdraw` + `deposit(coin)` 同 PTB 串联）。
  - 新增 5 条路由 builder / simulate：`wallet_suilend`、`suilend_suilend`、`suilend_wallet`、`navi_suilend`、`suilend_navi`。
  - Dashboard：`resolveTradeExecutionRoute` 完整 3×3 矩阵；`use-trade-simulation` 接线 9 路由 dry-run。
  - Pipeline step builders 与 Suilend obligation 友好错误文案。
  - 测试：`build-suilend-trade-round-trip-tx.unit.test.ts`、`build-navi-swap-then-supply-suilend-tx.unit.test.ts`、`trade-suilend.integration.test.ts`。
  - 更新 `PRODUCT.md`、`ARCHITECTURE.md`。
  - 已验证 `npm test`（89 passed, 27 skipped）与 `npm run build`。

- [x] **修复非 SUI-USDC 交易对 PTB 构建错误**：
  - 根因：`appendDeepbookSwap` 在 `isBaseToCoin=false`（卖 quote 买 base，如 DEEP_SUI 池 SUI→DEEP）时仍传 `baseCoin`，且固定把 swap 第二返回值当 output；导致 UnusedValueWithoutDrop / NAVI deposit TypeMismatch。
  - 修复：按方向传 `baseCoin` 或 `quoteCoin`；`outputCoin` / `inputChange` 按 `isBaseToCoin` 映射到 `baseResult` / `quoteResult`。
  - 影响四个 builder：`build-trade-wallet-swap-tx`、`build-wallet-swap-then-supply-tx`、`build-navi-trade-round-trip-tx`、`build-navi-trade-return-tx`。
  - 测试：DEEP_SUI SUI→DEEP 单元测试；集成测试四路由（门禁 `RUN_MAINNET_INTEGRATION=1`）。
  - 已验证 `npm test`（87 passed, 25 skipped）与 `npm run build`。

- [x] **Trading 多交易对与图标扩展**：
  - 移除错误池 `WUSDT_USDC`；`FEATURED_POOL_KEYS` 扩展为 7 池：`SUI_USDC`、`DEEP_SUI`、`WAL_SUI`、`DEEP_USDC`、`SUI_SUIUSDE`、`SUIUSDE_USDC`、`XBTC_USDC`。
  - SDK：新增 `resolve-deepbook-swap.ts`；泛化四路由 PTB builder / simulate 参数（`inputAsset` / `outputAsset` / `inputAmount` / `minOutput`）；`build-wallet-swap-then-supply-tx` 替代 USDC 专用 builder。
  - Dashboard：`use-trade-simulation` 放开 7 池双向 swap；`assertValidSwapAssets`；动态 `resolveOutputDecimals`；SUI gas 预留仅 pay SUI 时生效。
  - UI：新增 `components/pair-asset-icon.tsx`；`market-pairs` 每行展示重叠双币图标。
  - 估值：`deepbook-usd-price-oracle` 支持 `XBTC_USDC`、`DEEP_USDC`、`WAL_SUI` 等池。
  - 更新 `PRODUCT.md`、`ARCHITECTURE.md`。
  - 已验证 `npm test`（84 passed, 21 skipped）与 `npm run build`。

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
- [x] **Trading Navi 路径 Execute 模拟修复（修订版）**：
  - **wallet→navi** 修正为 `buildWalletSwapThenSupplyUsdcTx`（wallet merge SUI → DeepBook swap → NAVI deposit USDC）；Trading 页不再走 `simulateTradeBootstrap`。
  - 新增 `appendNaviOraclePreamble`：PTB 含 NAVI lending 时在首笔 deposit/withdraw 前刷新链上 oracle（非 DeepBook 报价）。
  - `use-trade-simulation`：DeepBook 报价用 `baseUnits` 对齐 human amount、`minUsdcOut` 预检、wallet 源 0.5 SUI gas 预留、1502/minUsdcOut 友好错误。
  - 测试：`build-wallet-swap-then-supply-usdc-tx.unit.test.ts`；集成 `trade-wallet-navi.integration.test.ts` 新增 wallet→NAVI case。
  - 已验证 `npm test`（52 passed, 21 skipped）。
- [x] **Trading Execute 实际上链（`signAndExecuteTransaction`）**：
  - 新增 `NEXT_PUBLIC_TRADING_WRITE_MODE`（默认 `simulate`；`execute` 时 dry-run 通过后 `dAppKit.signAndExecuteTransaction` 上链）。
  - `resolve-trading-write-mode.ts`；`use-trade-simulation` 抽取 `finishSimulation`，9 条 SOURCE×DESTINATION 路由统一 dry-run → 可选上链；execute 模式要求 `NEXT_PUBLIC_DATA_SOURCE=live`。
  - `swap-widget`：executing / executed 状态、Suiscan 链接；`trading-workspace` 上链后 `refetchPositions`。
  - 已更新 `PRODUCT.md`、`ARCHITECTURE.md`。

- [x] **PPT 重构与风格/框架对齐**：
  - 基于 `speech.md` 与 `prd v8.md` 重构 PPT 框架。
  - PPT 整体大纲与结构严格按 `frame.md` 进行对齐（共 12 页，划分 Part 01 与 Part 02）。
  - PPT 视觉风格完全参考 `style/` 截图，配置了混凝土背景色、黄色高亮块与黑色文字的卡片化设计。
  - 已生成并输出最新的 slide 模块，对应生成的 PPTX 文件处于可编辑状态。

## 未完成 / 待处理

- [ ] Security 页映射 `ExecutionPolicy` 字段到 `lib/data/*`。
- [ ] Liquidity **Withdraw 写路径 execute**：Supply 已支持；Withdraw 与 bootstrap 仍仅 simulate。
- [ ] 扩展 Liquidity 协议适配器：Scallop / Cetus 等（Suilend 已完成）。
- [ ] 创建 Move 合约模块：`automation_vault`、`policy_guard`、`credit_router`。
- [ ] 浏览器内手动验证：连接 mainnet 钱包后 Liquidity 页 Supply **execute 模式**小额上链（`.env.local` 设 `NEXT_PUBLIC_LIQUIDITY_WRITE_MODE=execute`）；simulate 模式验证 **Simulation passed**（无签名）。
- [ ] 浏览器内手动验证：Trading 页 9 条 SOURCE×DESTINATION 路由 **execute 模式**小额上链（`.env.local` 设 `NEXT_PUBLIC_DATA_SOURCE=live` + `NEXT_PUBLIC_TRADING_WRITE_MODE=execute`）；simulate 模式验证「模拟通过」（无签名）。

## 下一步建议

1. 浏览器内手动验证 Trading execute 模式：按 `wallet_wallet` → `wallet_navi` → … → `suilend_navi` 顺序小额验证 9 条路由。
2. Security 页映射 `ExecutionPolicy` 字段。

## 注意事项

- **DeFi 层与 dApp Kit 固定 mainnet**；不再使用 testnet 或 `NEXT_PUBLIC_SUI_NETWORK` 切换。
- 切 mainnet 后 **`NEXT_PUBLIC_NAVI_ASSETS` 不得使用 `*_TEST` 后缀**（如 `USDC_TEST`）；应使用 `USDC,SUIUSDE,SUI,WAL,DEEP,XBTC` 或删除该变量使用默认白名单。代码会对遗留 `*_TEST` 配置自动映射并 `console.warn`。
- Liquidity live 模式依赖 `@naviprotocol/lending` 与 `@suilend/sdk`；NAVI 构建时可能对 `getFullnodeUrl` 有 webpack 警告，运行时通过 `lib/shims/mysten-sui-client.ts` 兼容。Suilend 使用 gRPC client，无需 mysten v1 shim。
- **`NEXT_PUBLIC_LIQUIDITY_WRITE_MODE`**：默认 `simulate`（仅 dry-run）；`execute` 时 **Supply** dry-run 通过后签名上链。Withdraw / bootstrap 始终 simulate。修改后需重启 `npm run dev`。
- **`NEXT_PUBLIC_TRADING_WRITE_MODE`**：默认 `simulate`（仅 dry-run）；`execute` 时 dry-run 通过后签名上链，需同时设 `NEXT_PUBLIC_DATA_SOURCE=live`。修改后需重启 `npm run dev`。
- **`NEXT_PUBLIC_SUILEND_ASSETS`** 默认与 NAVI 白名单相同；可选 **`NEXT_PUBLIC_SUILEND_USE_BETA_MARKET=true`** 切换 beta market（由 `@suilend/sdk` 读取）。
- Suilend 首次 supply（无 obligation）须在 PTB 末尾 `sendObligationToUser`（`finalizeNewSuilendObligationCap`）；已有 obligation 则复用链上 cap id。
- `next.config.ts` 中 `turbopack.resolveAlias` 必须使用项目相对路径；Webpack `resolve.alias` 用绝对路径。
- 环境变量见 `ARCHITECTURE.md` Liquidity 专节；修改 `NEXT_PUBLIC_*` 后需重启 `npm run dev`。
- supply/withdraw PTB 与模拟仅在 `@deepflow/sdk`；Dashboard 读适配器（`lib/data/liquidity/protocols/*`）禁止包含写路径。
- SUI supply 须先 `getCoins` 再 `mergeCoinsPTB(..., useGasCoin: true)`；勿传空 coins 数组。
- SDK 集成测试 SUI supply 示例：`RUN_MAINNET_INTEGRATION=1 INTEGRATION_SENDER=0x... INTEGRATION_ASSET=SUI INTEGRATION_AMOUNT=10000000000 npm test --workspace @deepflow/sdk -- tests/navi-supply-withdraw.integration.test.ts -t "builds supply"`。
- Withdraw 无 NAVI 持仓时 UI/SDK 走 **supply→withdraw 单 PTB bootstrap**；集成测试：`-t "supply-then-withdraw"` + `INTEGRATION_WITHDRAW_AMOUNT=10000000000`。
- Trading **wallet→navi** 走 `simulateTradeWalletNavi`（非 bootstrap）；集成测试：`RUN_MAINNET_INTEGRATION=1 INTEGRATION_SENDER=0x... INTEGRATION_AMOUNT=1000000000 npm test --workspace @deepflow/sdk -- tests/trade-wallet-navi.integration.test.ts`（1 SUI）。
- Liquidity 无 NAVI 持仓 withdraw bootstrap 仍用 `buildTradeBootstrapTx` / `simulateTradeBootstrap`；集成：`tests/trade-bootstrap.integration.test.ts`。
- 页面专属 UI 放在 `app/(dashboard)/{feature}/_components/` 或根路由 `app/_components/`（landing）；跨页共享 UI 放在 `components/`。
- Dashboard 不是资金安全边界；supply/withdraw 必须走 SDK 策略校验，不得绕过 Policy Engine。
- 当前测试：`npm test`（SDK Vitest + Dashboard `test:dashboard`）、`npm run build`（Dashboard）。
