import type { MarketPair } from "@/lib/mock-data";

export function formatBalance(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getSwapAssets(pair: MarketPair, isReversed: boolean) {
  const from = isReversed ? pair.quoteAsset : pair.baseAsset;
  const to = isReversed ? pair.baseAsset : pair.quoteAsset;
  const fromBalance = isReversed ? pair.quoteBalance : pair.baseBalance;
  const toBalance = isReversed ? pair.baseBalance : pair.quoteBalance;
  const displayRate = isReversed ? 1 / pair.rate : pair.rate;

  return { from, to, fromBalance, toBalance, displayRate };
}

export function computeToAmount(
  fromAmount: number,
  pair: MarketPair,
  isReversed: boolean,
) {
  if (!Number.isFinite(fromAmount) || fromAmount <= 0) return 0;
  return isReversed ? fromAmount / pair.rate : fromAmount * pair.rate;
}
