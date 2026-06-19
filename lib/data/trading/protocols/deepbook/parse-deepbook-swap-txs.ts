import { mainnetCoins, mainnetPackageIds, mainnetPools } from "@mysten/deepbook-v3";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { createSuiJsonRpcClient } from "@/lib/sui/network";
import { resolveFeaturedPoolKeys } from "@/lib/data/pricing/deepbook-mid-price-service";
import type { DeepbookOrderRaw } from "../../types";

const DEFAULT_TX_LIMIT = 80;
const DEEPBOOK_PACKAGE = normalizeSuiAddress(mainnetPackageIds.DEEPBOOK_PACKAGE_ID);

const poolAddressToKey = new Map<string, string>(
  Object.entries(mainnetPools).map(([key, pool]) => [
    normalizeSuiAddress(pool.address),
    key,
  ]),
);

type RpcBalanceChange = {
  owner?: { AddressOwner?: string };
  coinType: string;
  amount: string;
};

type RpcMoveCall = {
  package?: string;
  module?: string;
  function?: string;
};

type RpcEvent = {
  type?: string;
  parsedJson?: Record<string, unknown>;
};

export type RpcSwapTransactionBlock = {
  digest: string;
  timestampMs?: string;
  effects?: {
    status?: { status?: string };
  };
  balanceChanges?: RpcBalanceChange[];
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
  data: RpcSwapTransactionBlock[];
};

export type ParseDeepbookSwapTxsParams = {
  owner: string;
  poolKey?: string;
  limit?: number;
  txScanLimit?: number;
};

const coinTypeToKey = new Map<string, string>(
  Object.entries(mainnetCoins).map(([key, coin]) => [coin.type.toLowerCase(), key]),
);

function extractMoveCalls(tx: RpcSwapTransactionBlock): RpcMoveCall[] {
  return (
    tx.transaction?.data?.transaction?.transactions?.flatMap((item) =>
      item.MoveCall ? [item.MoveCall] : [],
    ) ?? []
  );
}

function isDeepbookSwapCall(call: RpcMoveCall): boolean {
  if (!call.package || !call.function) return false;
  if (normalizeSuiAddress(call.package) !== DEEPBOOK_PACKAGE) return false;
  return call.function.includes("swap_exact");
}

function sideFromSwapFunction(functionName: string): "BUY" | "SELL" | null {
  if (functionName.includes("base_for_quote")) return "SELL";
  if (functionName.includes("quote_for_base")) return "BUY";
  return null;
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

function ownerBalanceChanges(tx: RpcSwapTransactionBlock, owner: string): RpcBalanceChange[] {
  return (
    tx.balanceChanges?.filter(
      (change) => change.owner?.AddressOwner?.toLowerCase() === owner.toLowerCase(),
    ) ?? []
  );
}

function resolvePoolKeyFromChanges(
  changes: RpcBalanceChange[],
  poolKeyFilter?: string,
): string | null {
  const changedCoinKeys = new Set<string>();
  for (const change of changes) {
    const key = coinTypeToKey.get(change.coinType.toLowerCase());
    if (key) changedCoinKeys.add(key);
  }

  const candidatePoolKeys = poolKeyFilter
    ? [poolKeyFilter]
    : [...resolveFeaturedPoolKeys(), ...Object.keys(mainnetPools)];

  for (const poolKey of candidatePoolKeys) {
    const pool = mainnetPools[poolKey as keyof typeof mainnetPools];
    if (!pool) continue;
    if (changedCoinKeys.has(pool.baseCoin) && changedCoinKeys.has(pool.quoteCoin)) {
      return poolKey;
    }
  }

  const singleCoinMatches: string[] = [];
  for (const poolKey of candidatePoolKeys) {
    const pool = mainnetPools[poolKey as keyof typeof mainnetPools];
    if (!pool) continue;
    if (changedCoinKeys.has(pool.baseCoin) || changedCoinKeys.has(pool.quoteCoin)) {
      singleCoinMatches.push(poolKey);
    }
  }

  if (singleCoinMatches.length === 1) {
    return singleCoinMatches[0];
  }

  return null;
}

function resolveSideAndQuantity(
  poolKey: string,
  changes: RpcBalanceChange[],
  functionSide: "BUY" | "SELL" | null,
): { side: "BUY" | "SELL"; quantity: number } | null {
  const pool = mainnetPools[poolKey as keyof typeof mainnetPools];
  if (!pool) return null;

  const baseCoin = mainnetCoins[pool.baseCoin as keyof typeof mainnetCoins];
  if (!baseCoin) return null;

  const baseChange = changes.find(
    (change) => change.coinType.toLowerCase() === baseCoin.type.toLowerCase(),
  );
  const baseDelta = baseChange ? BigInt(baseChange.amount) : BigInt(0);
  const baseScalar = baseCoin.scalar;

  let side = functionSide;
  if (!side) {
    if (baseDelta < BigInt(0)) side = "SELL";
    else if (baseDelta > BigInt(0)) side = "BUY";
    else return null;
  }

  const quantity =
    baseDelta !== BigInt(0)
      ? Number(baseDelta < BigInt(0) ? -baseDelta : baseDelta) / baseScalar
      : 0;

  if (quantity <= 0) return { side, quantity: 0 };

  return { side, quantity };
}

function parseSwapFromEvents(
  tx: RpcSwapTransactionBlock,
  poolKeyFilter?: string,
): { poolKey: string; side: "BUY" | "SELL"; quantity: number } | null {
  const filledEvents = (tx.events ?? []).filter((event) =>
    eventName(event.type ?? "").includes("OrderFilled"),
  );

  if (filledEvents.length > 0) {
    const byPool = new Map<string, { side: "BUY" | "SELL"; quantity: bigint }>();

    for (const event of filledEvents) {
      const json = event.parsedJson ?? {};
      const poolKey = resolvePoolKey(readString(json.pool_id), poolKeyFilter);
      if (!poolKey) continue;

      const takerIsBid = readBool(json.taker_is_bid);
      if (takerIsBid === undefined) continue;

      const side: "BUY" | "SELL" = takerIsBid ? "BUY" : "SELL";
      const baseQty = BigInt(readString(json.base_quantity) ?? "0");
      if (baseQty <= BigInt(0)) continue;

      const existing = byPool.get(poolKey);
      if (existing) {
        existing.quantity += baseQty;
      } else {
        byPool.set(poolKey, { side, quantity: baseQty });
      }
    }

    if (byPool.size > 0) {
      const [poolKey, aggregate] = [...byPool.entries()][0]!;
      const quantity = humanBaseQuantity(poolKey, aggregate.quantity.toString());
      if (quantity > 0) {
        return { poolKey, side: aggregate.side, quantity };
      }
    }
  }

  const orderInfoEvents = (tx.events ?? []).filter((event) =>
    eventName(event.type ?? "").includes("OrderInfo"),
  );

  for (const event of orderInfoEvents) {
    const json = event.parsedJson ?? {};
    const poolKey = resolvePoolKey(readString(json.pool_id), poolKeyFilter);
    if (!poolKey) continue;

    const isBid = readBool(json.is_bid);
    if (isBid === undefined) continue;

    const executedQuantity = readString(json.executed_quantity) ?? "0";
    const quantity = humanBaseQuantity(poolKey, executedQuantity);
    if (quantity <= 0) continue;

    return {
      poolKey,
      side: isBid ? "BUY" : "SELL",
      quantity,
    };
  }

  return null;
}

export function parseSwapFromTransaction(
  tx: RpcSwapTransactionBlock,
  owner: string,
  poolKeyFilter?: string,
): DeepbookOrderRaw | null {
  if (tx.effects?.status?.status?.toLowerCase() !== "success") return null;
  if (!tx.timestampMs) return null;

  const swapCalls = extractMoveCalls(tx).filter(isDeepbookSwapCall);
  if (swapCalls.length === 0) return null;

  const functionSide = sideFromSwapFunction(swapCalls[0]?.function ?? "") ?? null;

  const fromEvents = parseSwapFromEvents(tx, poolKeyFilter);
  if (fromEvents && fromEvents.quantity > 0) {
    return {
      orderId: tx.digest,
      poolKey: fromEvents.poolKey,
      kind: "swap",
      side: fromEvents.side,
      quantity: fromEvents.quantity,
      filledQuantity: fromEvents.quantity,
      status: "FILLED",
      placedAtMs: Number(tx.timestampMs),
    };
  }

  const changes = ownerBalanceChanges(tx, owner);
  const poolKey = resolvePoolKeyFromChanges(changes, poolKeyFilter);
  if (!poolKey) return null;

  const resolved = resolveSideAndQuantity(poolKey, changes, functionSide);
  if (!resolved || resolved.quantity <= 0) return null;

  return {
    orderId: tx.digest,
    poolKey,
    kind: "swap",
    side: resolved.side,
    quantity: resolved.quantity,
    filledQuantity: resolved.quantity,
    status: "FILLED",
    placedAtMs: Number(tx.timestampMs),
  };
}

const TRANSACTION_BLOCK_OPTIONS = {
  showEffects: true,
  showBalanceChanges: true,
  showInput: true,
  showEvents: true,
};

async function queryTransactionsFromAddress(
  owner: string,
  limit: number,
): Promise<RpcSwapTransactionBlock[]> {
  const client = createSuiJsonRpcClient();
  const response = await client.call<QueryTransactionBlocksResponse>(
    "suix_queryTransactionBlocks",
    [
      {
        filter: { FromAddress: owner },
        options: TRANSACTION_BLOCK_OPTIONS,
        limit,
        order: "descending",
      },
    ],
  );
  return response.data ?? [];
}

export async function fetchSwapOrderFromDigest(
  digest: string,
  owner: string,
  poolKeyFilter?: string,
): Promise<DeepbookOrderRaw | null> {
  const client = createSuiJsonRpcClient();
  const tx = await client.call<RpcSwapTransactionBlock>("sui_getTransactionBlock", [
    digest,
    TRANSACTION_BLOCK_OPTIONS,
  ]);
  return parseSwapFromTransaction(tx, owner, poolKeyFilter);
}

export async function parseDeepbookSwapTxs(
  params: ParseDeepbookSwapTxsParams,
): Promise<DeepbookOrderRaw[]> {
  const { owner, poolKey, limit = 20, txScanLimit = DEFAULT_TX_LIMIT } = params;

  const transactions = await queryTransactionsFromAddress(owner, txScanLimit);
  const swaps: DeepbookOrderRaw[] = [];

  for (const tx of transactions) {
    const swap = parseSwapFromTransaction(tx, owner, poolKey);
    if (swap) swaps.push(swap);
  }

  swaps.sort((a, b) => b.placedAtMs - a.placedAtMs);
  return swaps.slice(0, limit);
}
