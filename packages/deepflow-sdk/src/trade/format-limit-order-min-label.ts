import type { LimitOrderSide } from "./resolve-deepbook-limit-order.ts";
import type { LimitOrderQuantityBounds } from "./validate-limit-order-quantity.ts";

export function formatLimitOrderMinLabel(params: {
  bounds: LimitOrderQuantityBounds;
  side: LimitOrderSide;
  price: number;
  quoteAsset: string;
}): string {
  const { bounds, side, price, quoteAsset } = params;

  if (side === "SELL") {
    return `Min: ${bounds.minSizeHuman} ${bounds.baseAsset}`;
  }

  if (!Number.isFinite(price) || price <= 0) {
    return `Min: ${bounds.minSizeHuman} ${bounds.baseAsset}`;
  }

  const minPayHuman = bounds.minSizeHuman * price;
  return `Min: ${minPayHuman.toFixed(4)} ${quoteAsset}`;
}
