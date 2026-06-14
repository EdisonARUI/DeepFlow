import type { LiquidityPositionRaw } from "../types";

export type LiquidityProtocolId = "navi" | "suilend" | "scallop" | "cetus" | string;

export type ListLiquidityPositionsParams = {
  ownerAddress?: string;
};

export type ListLiquidityPositionsResult = {
  positions: LiquidityPositionRaw[];
  walletBalanceWarning?: string;
  configurationWarning?: string;
};

export type AssetMeta = {
  /**
   * Dashboard 展示用的资产标识（例如 `USDC` / `SUI`）
   */
  asset: string;
  decimals: number;
  /**
   * 可选：链上 coinType（不同协议可能需要用它做精确匹配）
   */
  coinType?: string;
};

export type MarketSnapshot = {
  /**
   * 协议内 market/pool 的唯一标识（例如 pool.id / uniqueId）
   */
  marketId: string;
  protocol: LiquidityProtocolId;
  asset: string;
  supplyApyBps: number;
  tvlUsd: number;
};

/**
 * DeFi 协议只读适配器：负责把协议的 market/positions 数据，转换为 Deepflow
 * Dashboard 统一的 `LiquidityPositionRaw` 领域模型。
 *
 * 写路径（supply/withdraw）不应出现在 Dashboard 的读适配器里。
 */
export interface LiquidityProtocolAdapter {
  readonly protocolId: LiquidityProtocolId;

  /**
   * Positions 用于填充用户余额（supply/借款等），并给出每个资产的关键池参数
   *（至少：供给 APY 与 TVL）以驱动 Liquidity 页展示。
   */
  listPositions(params: ListLiquidityPositionsParams): Promise<ListLiquidityPositionsResult>;

  /**
   * 可选：协议的市场快照（未来用于显示“无余额也能选资产/展示 APY”）。
   */
  listMarkets?: () => Promise<MarketSnapshot[]>;

  /**
   * 可选：协议内资产元信息（decimals/coinType 等），用于精确映射。
   */
  getAssetMeta?: () => Promise<AssetMeta[]>;
}

