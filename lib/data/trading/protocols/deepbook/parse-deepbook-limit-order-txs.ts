import {
  FLOAT_SCALAR,
  mainnetCoins,
  mainnetPackageIds,
  mainnetPools,
} from "@mysten/deepbook-v3";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { createSuiJsonRpcClient } from "@/lib/sui/network";
import type { TradeOrderHistoryRaw } from "../../types";

const DEFAULT_TX_LIMIT = 80;
const DEEPBOOK_PACKAGE = normalizeSuiAddress(mainnetPackageIds.DEEPBOOK_PACKAGE_ID);

const poolAddressToKey = new Map<string, string>(
  Object.entries(mainnetPools).map(([key, pool]) => [
    normalizeSuiAddress(pool.address),
    key,
  ]),
);

type RpcMoveCall = {
  package?: string;
  module?: string;
  function?: string;
};

type RpcEvent = {
  type?: string;
  parsedJson?: Record<string, unknown>;
};

type RpcTransactionBlock = {
  digest: string;
  timestampMs?: string;
  effects?: {
    status?: { status?: string };
  };
  events?: RpcEvent[];
  transaction?: {
    data?: {
      transaction?: {
        transactions?: Array<{ MoveCall?: RpcMoveCall }>;
      };
    };
  };
};

type QueryTransactionBlocksResponse = {
  data: RpcTransactionBlock[];
};

export type ParseDeepbookLimitOrderTxsParams = {
  owner: string;
  poolKey?: string;
  limit?: number;
  txScanLimit?: number;
};

function extractMoveCalls(tx: RpcTransactionBlock): RpcMoveCall[] {
  return (
    tx.transaction?.data?.transaction?.transactions?.flatMap((item) =>
      item.MoveCall ? [item.MoveCall] : [],
    ) ?? []
  );
}

function isDeepbookLimitPlaceCall(call: RpcMoveCall): boolean {
  if (!call.package || !call.function) return false;
  if (normalizeSuiAddress(call.package) !== DEEPBOOK_PACKAGE) return false;
  return call.function === "place_limit_order";
}

function isDeepbookLimitCancelCall(call: RpcMoveCall): boolean {
  if (!call.package || !call.function) return false;
  if (normalizeSuiAddress(call.package) !== DEEPBOOK_PACKAGE) return false;
  return (
    call.function === "cancel_order" ||
    call.function === "cancel_live_order" ||
    call.function === "cancel_all_orders"
  );
}

function eventName(type: string): string {
  const parts = type.split("::");
  return parts[parts.length - 1] ?? type;
}

function readString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  return undefined;
}

function readBool(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  return undefined;
}

function resolvePoolKey(poolId: string | undefined, poolKeyFilter?: string): string | null {
  if (!poolId) return null;
  const poolKey = poolAddressToKey.get(normalizeSuiAddress(poolId));
  if (!poolKey) return null;
  if (poolKeyFilter && poolKey !== poolKeyFilter) return null;
  return poolKey;
}

function humanBaseQuantity(poolKey: string, rawQuantity: string): number {
  const pool = mainnetPools[poolKey as keyof typeof mainnetPools];
  if (!pool) return 0;
  const baseCoin = mainnetCoins[pool.baseCoin as keyof typeof mainnetCoins];
  if (!baseCoin) return 0;
  return Number(rawQuantity) / baseCoin.scalar;
}

function humanLimitPrice(poolKey: string, rawPrice: string): number | undefined {
  const pool = mainnetPools[poolKey as keyof typeof mainnetPools];
  if (!pool) return undefined;
  const baseCoin = mainnetCoins[pool.baseCoin as keyof typeof mainnetCoins];
  const quoteCoin = mainnetCoins[pool.quoteCoin as keyof typeof mainnetCoins];
  if (!baseCoin || !quoteCoin) return undefined;

  const price = BigInt(rawPrice);
  const human =
    Number(price * BigInt(baseCoin.scalar)) /
    (FLOAT_SCALAR * quoteCoin.scalar);
  return Number.isFinite(human) ? human : undefined;
}

function parseFilledLimitFromEvents(
  tx: RpcTransactionBlock,
  poolKeyFilter?: string,
): TradeOrderHistoryRaw | null {
  const orderInfoEvents = (tx.events ?? []).filter((event) =>
    eventName(event.type ?? "").includes("OrderInfo"),
  );
  const fullyFilledEvents = (tx.events ?? []).filter((event) =>
    eventName(event.type ?? "").includes("OrderFullyFilled"),
  );

  const fullyFilledIds = new Set(
    fullyFilledEvents
      .map((event) => readString(event.parsedJson?.order_id))
      .filter((id): id is string => Boolean(id)),
  );

  for (const event of orderInfoEvents) {
    const json = event.parsedJson ?? {};
    const poolKey = resolvePoolKey(readString(json.pool_id), poolKeyFilter);
    if (!poolKey) continue;

    const orderId = readString(json.order_id) ?? tx.digest;
    const originalQuantity = readString(json.original_quantity) ?? "0";
    const executedQuantity = readString(json.executed_quantity) ?? "0";
    const quantity = humanBaseQuantity(poolKey, originalQuantity);
    const filledQuantity = humanBaseQuantity(poolKey, executedQuantity);
    const isBid = readBool(json.is_bid);
    const orderInserted = readBool(json.order_inserted);
    const rawPrice = readString(json.price);

    const isFullyFilled =
      fullyFilledIds.has(orderId) ||
      (filledQuantity > 0 && filledQuantity >= quantity);

    if (!isFullyFilled) {
      if (orderInserted && filledQuantity <= 0) {
        continue;
      }
      if (orderInserted && filledQuantity < quantity) {
        continue;
      }
    }

    if (filledQuantity <= 0 && !isFullyFilled) continue;

    return {
      orderId,
      poolKey,
      kind: "limit",
      side: isBid ? "BUY" : "SELL",
      quantity,
      filledQuantity: filledQuantity > 0 ? filledQuantity : quantity,
      price: rawPrice ? humanLimitPrice(poolKey, rawPrice) : undefined,
      status: filledQuantity > 0 && filledQuantity < quantity ? "PARTIAL" : "FILLED",
      placedAtMs: Number(tx.timestampMs),
    };
  }

  for (const event of fullyFilledEvents) {
    const json = event.parsedJson ?? {};
    const poolKey = resolvePoolKey(readString(json.pool_id), poolKeyFilter);
    if (!poolKey) continue;

    const orderId = readString(json.order_id) ?? tx.digest;
    const originalQuantity = readString(json.original_quantity) ?? "0";
    const quantity = humanBaseQuantity(poolKey, originalQuantity);
    const isBid = readBool(json.is_bid);

    return {
      orderId,
      poolKey,
      kind: "limit",
      side: isBid ? "BUY" : "SELL",
      quantity,
      filledQuantity: quantity,
      status: "FILLED",
      placedAtMs: Number(tx.timestampMs),
    };
  }

  return null;
}

function parseCanceledLimitFromTransaction(
  tx: RpcTransactionBlock,
  poolKeyFilter?: string,
): TradeOrderHistoryRaw | null {
  const cancelCalls = extractMoveCalls(tx).filter(isDeepbookLimitCancelCall);
  if (cancelCalls.length === 0) return null;

  const cancelEvent = (tx.events ?? []).find((event) => {
    const name = eventName(event.type ?? "");
    return name.includes("OrderCanceled") || name.includes("OrderCancelled");
  });

  if (cancelEvent?.parsedJson) {
    const json = cancelEvent.parsedJson;
    const poolKey = resolvePoolKey(readString(json.pool_id), poolKeyFilter);
    if (!poolKey) return null;

    const orderId = readString(json.order_id) ?? tx.digest;
    const originalQuantity = readString(json.original_quantity) ?? "0";
    const executedQuantity = readString(json.executed_quantity) ?? "0";
    const quantity = humanBaseQuantity(poolKey, originalQuantity);
    const filledQuantity = humanBaseQuantity(poolKey, executedQuantity);
    const isBid = readBool(json.is_bid);
    const rawPrice = readString(json.price);

    return {
      orderId,
      poolKey,
      kind: "limit",
      side: isBid ? "BUY" : "SELL",
      quantity,
      filledQuantity,
      price: rawPrice ? humanLimitPrice(poolKey, rawPrice) : undefined,
      status: "CANCELED",
      placedAtMs: Number(tx.timestampMs),
    };
  }

  return null;
}

function parseLimitOrderFromTransaction(
  tx: RpcTransactionBlock,
  poolKeyFilter?: string,
): TradeOrderHistoryRaw | null {
  if (tx.effects?.status?.status?.toLowerCase() !== "success") return null;
  if (!tx.timestampMs) return null;

  const moveCalls = extractMoveCalls(tx);
  const hasPlace = moveCalls.some(isDeepbookLimitPlaceCall);
  const hasCancel = moveCalls.some(isDeepbookLimitCancelCall);

  if (hasPlace) {
    return parseFilledLimitFromEvents(tx, poolKeyFilter);
  }

  if (hasCancel) {
    return parseCanceledLimitFromTransaction(tx, poolKeyFilter);
  }

  return null;
}

async function queryTransactionsFromAddress(
  owner: string,
  limit: number,
): Promise<RpcTransactionBlock[]> {
  const client = createSuiJsonRpcClient();
  const response = await client.call<QueryTransactionBlocksResponse>(
    "suix_queryTransactionBlocks",
    [
      {
        filter: { FromAddress: owner },
        options: {
          showEffects: true,
          showEvents: true,
          showInput: true,
        },
        limit,
        order: "descending",
      },
    ],
  );
  return response.data ?? [];
}

export async function parseDeepbookLimitOrderTxs(
  params: ParseDeepbookLimitOrderTxsParams,
): Promise<TradeOrderHistoryRaw[]> {
  const { owner, poolKey, limit = 20, txScanLimit = DEFAULT_TX_LIMIT } = params;

  const transactions = await queryTransactionsFromAddress(owner, txScanLimit);
  const orders: TradeOrderHistoryRaw[] = [];

  for (const tx of transactions) {
    const order = parseLimitOrderFromTransaction(tx, poolKey);
    if (order) orders.push(order);
  }

  orders.sort((a, b) => b.placedAtMs - a.placedAtMs);
  return orders.slice(0, limit);
}
