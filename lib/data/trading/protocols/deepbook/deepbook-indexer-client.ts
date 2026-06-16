import type { DeepbookOrderRaw } from "../../types";

const DEEPBOOK_INDEXER_MAINNET =
  "https://deepbook-indexer.mainnet.mystenlabs.com";

export type IndexerOrder = {
  order_id: string;
  balance_manager_id: string;
  type: string;
  current_status: string;
  price: number;
  placed_at: number;
  last_updated_at: number;
  original_quantity: number;
  filled_quantity: number;
  remaining_quantity: number;
};

export type IndexerTrade = {
  digest: string;
  trade_id: string;
  base_volume: number;
  quote_volume: number;
  price: number;
  taker_is_bid: boolean;
  timestamp: number;
  type: string;
};

export async function fetchIndexerOrders(params: {
  poolName: string;
  balanceManagerId: string;
  limit?: number;
  statuses?: string[];
}): Promise<IndexerOrder[]> {
  const { poolName, balanceManagerId, limit = 20, statuses } = params;
  const search = new URLSearchParams();
  search.set("limit", String(limit));
  if (statuses?.length) {
    search.set("status", statuses.join(","));
  }

  const url = `${DEEPBOOK_INDEXER_MAINNET}/orders/${poolName}/${balanceManagerId}?${search.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`DeepBook indexer orders failed: ${response.status}`);
  }

  return (await response.json()) as IndexerOrder[];
}

export async function fetchIndexerTrades(params: {
  poolName: string;
  limit?: number;
  startTime?: number;
  endTime?: number;
}): Promise<IndexerTrade[]> {
  const { poolName, limit = 100, startTime, endTime } = params;
  const search = new URLSearchParams();
  search.set("limit", String(limit));
  if (startTime !== undefined) {
    search.set("start_time", String(startTime));
  }
  if (endTime !== undefined) {
    search.set("end_time", String(endTime));
  }

  const url = `${DEEPBOOK_INDEXER_MAINNET}/trades/${poolName}?${search.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`DeepBook indexer trades failed: ${response.status}`);
  }

  return (await response.json()) as IndexerTrade[];
}

export function enrichSwapsWithIndexerTrades(
  swaps: DeepbookOrderRaw[],
  tradesByDigest: Map<string, IndexerTrade[]>,
): DeepbookOrderRaw[] {
  return swaps.map((swap) => {
    const trades = tradesByDigest.get(swap.orderId);
    if (!trades?.length) return swap;

    const totalBaseVolume = trades.reduce((sum, trade) => sum + trade.base_volume, 0);
    const takerIsBid = trades[0]?.taker_is_bid ?? swap.side === "BUY";

    return {
      ...swap,
      side: takerIsBid ? "BUY" : "SELL",
      quantity: totalBaseVolume > 0 ? totalBaseVolume : swap.quantity,
      filledQuantity: totalBaseVolume > 0 ? totalBaseVolume : swap.filledQuantity,
    };
  });
}
