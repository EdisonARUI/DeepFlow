import type { DeepbookOrderRaw, OrderHistoryView } from "./types";
import { poolKeyToSlashPair } from "./map-to-trading-view";

function formatAmount(value: number, maximumFractionDigits = 4): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });
}

export function mapToOrderHistoryView(raw: DeepbookOrderRaw): OrderHistoryView {
  const kind = raw.kind ?? "swap";
  return {
    id: raw.orderId,
    kind,
    side: raw.side,
    pair: poolKeyToSlashPair(raw.poolKey),
    amount: formatAmount(raw.filledQuantity > 0 ? raw.filledQuantity : raw.quantity),
    price: raw.price !== undefined ? formatAmount(raw.price, 6) : undefined,
    status: raw.status,
  };
}

export function mapToOrderHistoryViews(raws: DeepbookOrderRaw[]): OrderHistoryView[] {
  return raws.map(mapToOrderHistoryView);
}
