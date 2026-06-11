import type { TradingMarketView } from "@/lib/data/trading/types";

export function formatBalance(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getSwapAssets(market: TradingMarketView, isReversed: boolean) {
  const from = isReversed ? market.quoteAsset : market.baseAsset;
  const to = isReversed ? market.baseAsset : market.quoteAsset;
  const displayRate = isReversed ? 1 / market.rate : market.rate;

  return { from, to, displayRate };
}

export function computeToAmount(
  fromAmount: number,
  market: TradingMarketView,
  isReversed: boolean,
  quoteOutput?: number | null,
) {
  if (!Number.isFinite(fromAmount) || fromAmount <= 0) return 0;
  if (quoteOutput != null && quoteOutput > 0) return quoteOutput;
  return isReversed ? fromAmount / market.rate : fromAmount * market.rate;
}
