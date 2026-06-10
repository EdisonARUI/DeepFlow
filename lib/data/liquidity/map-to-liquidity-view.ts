import type { LiquidityPositionRaw, LiquidityPositionView } from "./types";
import { getLiquidityPositionId } from "./types";

export function mapToLiquidityView(raw: LiquidityPositionRaw): LiquidityPositionView {
  return {
    id: getLiquidityPositionId(raw.protocolLabel, raw.asset),
    protocol: raw.protocolLabel,
    protocolColor: raw.protocolColor,
    asset: raw.asset,
    coinType: raw.coinType,
    tvlUsd: raw.tvlUsd,
    supplyApyBps: raw.supplyApyBps,
    suppliedBalance: raw.suppliedBalance,
    walletCoinBalance: raw.walletCoinBalance,
    decimals: raw.decimals,
  };
}

export function mapToLiquidityViews(rawList: readonly LiquidityPositionRaw[]): LiquidityPositionView[] {
  return rawList.map(mapToLiquidityView);
}
