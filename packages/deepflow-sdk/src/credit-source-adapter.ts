import type { CreditSourceProtocol, ExecutionIntent, ExecutionQuote, RoutePlan } from "./types.ts";

/**
 * Credit Source Adapter（写路径）——未来用于协议 supply/withdraw 的报价与 PTB 构建。
 *
 * 关键约束：
 * - 仅允许在 `@deepflow/sdk` 内部、且经过 `validateIntent` / Policy Engine 校验之后调用。
 * - Dashboard 的读适配器（protocols 子目录）只负责 positions/market 数据，禁止包含写路径逻辑，
 *   避免绕过资金安全边界（Policy + PTB Builder + Move 合约强约束）。
 */
export interface CreditSourceAdapter {
  readonly protocol: CreditSourceProtocol;

  /**
   * supply/withdraw 的报价（可用于 quoteExecution / simulation 等阶段）。
   * 注意：入参来自 Intent（已经在 SDK 内通过策略校验的字段集合）。
   */
  quoteSupplyWithdraw(params: {
    intent: ExecutionIntent;
  }): Promise<ExecutionQuote>;

  /**
   * 把已验证的 RoutePlan 转换为“协议相关”的 PTB 构造命令/片段。
   * 返回类型在未来会替换为真实 PTB/Command 结构（这里先用 unknown 保持计划可演进）。
   */
  buildSupplyWithdrawPtb(params: {
    routePlan: RoutePlan;
  }): Promise<unknown>;
}

