import { mainnetCoins, mainnetPools } from "@mysten/deepbook-v3";
import type { OpenLimitOrderView } from "./types";
import { poolKeyToSlashPair } from "./map-to-trading-view";

type NormalizedOrder = {
  order_id: string;
  client_order_id: string;
  quantity: string;
  filled_quantity: string;
  isBid: boolean;
  normalized_price: string;
  expire_timestamp?: string;
};

function formatAmount(value: number, maximumFractionDigits = 4): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });
}

function parseHumanQuantity(raw: string, scalar: number): number {
  const parsed = Number(raw);
  if (Number.isFinite(parsed) && parsed < 1_000_000) {
    return parsed;
  }
  return Number(raw) / scalar;
}

export function mapToOpenLimitOrderViews(
  poolKey: string,
  orders: NormalizedOrder[],
): OpenLimitOrderView[] {
  const pool = mainnetPools[poolKey as keyof typeof mainnetPools];
  if (!pool) return [];

  const baseCoin = mainnetCoins[pool.baseCoin as keyof typeof mainnetCoins];
  const baseScalar = baseCoin?.scalar ?? 1;

  const views: OpenLimitOrderView[] = [];

  for (const order of orders) {
    const quantity = parseHumanQuantity(order.quantity, baseScalar);
    const filledQuantity = parseHumanQuantity(order.filled_quantity, baseScalar);
    const remaining = quantity - filledQuantity;

    if (remaining <= 0) {
      continue;
    }

    views.push({
      orderId: order.order_id,
      clientOrderId: order.client_order_id,
      poolKey,
      side: order.isBid ? "BUY" : "SELL",
      pair: poolKeyToSlashPair(poolKey),
      price: formatAmount(Number(order.normalized_price), 6),
      quantity: formatAmount(quantity),
      filledQuantity: formatAmount(filledQuantity),
      status: filledQuantity > 0 ? "PARTIAL" : "OPEN",
      expireAt: order.expire_timestamp,
    });
  }

  return views;
}
