import { parseAmountToBaseUnits } from "@deepflow/sdk/amount/parse-base-units";
import type { LiquidityPositionView } from "./types";

export function formatLiquidityTotalSupply(tvlUsd: number | null): string {
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

export function formatLiquidityApr(supplyAprBps: number): string {
  const percent = supplyAprBps / 100;
  const fractionDigits = percent < 1 ? 2 : 1;
  return `+${percent.toFixed(fractionDigits)}%`;
}

export function formatLiquidityBalance(balance: bigint, decimals: number): string {
  const divisor = 10 ** decimals;
  const value = Number(balance) / divisor;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatAmountFromPercentage(
  balance: bigint,
  decimals: number,
  percentage: number,
): string {
  const scaled = (balance * BigInt(Math.round(percentage))) / 100n;
  return formatLiquidityBalance(scaled, decimals);
}

export function percentageFromAmount(
  amount: string,
  maxBalance: bigint,
  decimals: number,
): number {
  const trimmed = amount.trim();
  if (!trimmed || maxBalance === 0n) {
    return 0;
  }

  try {
    const baseUnits = parseAmountToBaseUnits(trimmed, decimals);
    const pct = Number((baseUnits * 100n) / maxBalance);
    return Math.min(100, Math.max(0, pct));
  } catch {
    return 0;
  }
}

export type LiquidityPositionDisplay = LiquidityPositionView & {
  totalSupply: string;
  apr: string;
  suppliedBalanceDisplay: string;
  walletCoinBalanceDisplay: string;
};

export function toLiquidityPositionDisplay(
  position: LiquidityPositionView,
): LiquidityPositionDisplay {
  return {
    ...position,
    totalSupply: formatLiquidityTotalSupply(position.tvlUsd),
    apr: formatLiquidityApr(position.supplyApyBps),
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
