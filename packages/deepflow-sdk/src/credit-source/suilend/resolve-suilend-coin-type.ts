import { normalizeStructTag } from "@mysten/sui/utils";
import type { ParsedReserve } from "@suilend/sdk/parsers";

function normalizeSymbol(symbol: string): string {
  return symbol.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function reserveSymbol(reserve: ParsedReserve): string {
  return reserve.token?.symbol ?? reserve.symbol;
}

export function resolveSuilendCoinType(
  asset: string,
  parsedReserves: readonly ParsedReserve[],
): string {
  if (asset.includes("::")) {
    return normalizeStructTag(asset);
  }

  const normalized = normalizeSymbol(asset);
  const match = parsedReserves.find(
    (reserve) => normalizeSymbol(reserveSymbol(reserve)) === normalized,
  );

  if (!match) {
    throw new Error(`Unknown Suilend asset: ${asset}`);
  }

  return match.coinType;
}

export function aprPercentToBps(aprPercent: { toNumber(): number } | number): number {
  const value = typeof aprPercent === "number" ? aprPercent : aprPercent.toNumber();
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}

export function tvlUsdFromReserve(reserve: ParsedReserve): number {
  return reserve.depositedAmountUsd.toNumber();
}
