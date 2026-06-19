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

export function getLimitDisplayAssets(
  market: TradingMarketView,
  side: "BUY" | "SELL",
) {
  if (side === "SELL") {
    return {
      payAsset: market.baseAsset,
      receiveAsset: market.quoteAsset,
    };
  }
  return {
    payAsset: market.quoteAsset,
    receiveAsset: market.baseAsset,
  };
}

export function computeLimitPayAmount(
  side: "BUY" | "SELL",
  baseQuantity: number,
  limitPrice: number,
) {
  if (!Number.isFinite(baseQuantity) || baseQuantity <= 0) return 0;
  if (!Number.isFinite(limitPrice) || limitPrice <= 0) return 0;
  if (side === "SELL") return baseQuantity;
  return baseQuantity * limitPrice;
}

export function computeLimitReceiveEst(
  side: "BUY" | "SELL",
  baseQuantity: number,
  limitPrice: number,
) {
  if (!Number.isFinite(baseQuantity) || baseQuantity <= 0) return 0;
  if (!Number.isFinite(limitPrice) || limitPrice <= 0) return 0;
  if (side === "SELL") return baseQuantity * limitPrice;
  return baseQuantity;
}

export function formatLimitRateLabel(
  market: TradingMarketView,
  limitPrice: string,
) {
  const price = parseFloat(limitPrice);
  if (!Number.isFinite(price) || price <= 0) {
    return `1 ${market.baseAsset} = — ${market.quoteAsset}`;
  }
  return `1 ${market.baseAsset} = ${price.toFixed(4)} ${market.quoteAsset}`;
}
