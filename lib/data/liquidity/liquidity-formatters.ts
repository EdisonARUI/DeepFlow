import type { LiquidityPositionView } from "./types";

export function formatLiquidityTvl(tvlUsd: number | null): string {
  if (tvlUsd === null) {
    return "-";
  }
  if (tvlUsd >= 1_000_000) {
    return `$${(tvlUsd / 1_000_000).toFixed(1)}M`;
  }
  if (tvlUsd >= 1_000) {
    return `$${Math.round(tvlUsd / 1_000)}K`;
  }
  return `$${tvlUsd.toFixed(0)}`;
}

export function formatLiquidityApy(supplyApyBps: number): string {
  const percent = supplyApyBps / 100;
  return `+${percent.toFixed(1)}%`;
}

export function formatLiquidityBalance(balance: bigint, decimals: number): string {
  const divisor = 10 ** decimals;
  const value = Number(balance) / divisor;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export type LiquidityPositionDisplay = LiquidityPositionView & {
  tvl: string;
  apy: string;
  suppliedBalanceDisplay: string;
  walletCoinBalanceDisplay: string;
};

export function toLiquidityPositionDisplay(
  position: LiquidityPositionView,
): LiquidityPositionDisplay {
  return {
    ...position,
    tvl: formatLiquidityTvl(position.tvlUsd),
    apy: formatLiquidityApy(position.supplyApyBps),
    suppliedBalanceDisplay: formatLiquidityBalance(
      position.suppliedBalance,
      position.decimals,
    ),
    walletCoinBalanceDisplay: formatLiquidityBalance(
      position.walletCoinBalance,
      position.decimals,
    ),
  };
}
