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
