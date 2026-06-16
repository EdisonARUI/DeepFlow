import { mainnetCoins, mainnetPackageIds, mainnetPools } from "@mysten/deepbook-v3";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { createSuiJsonRpcClient } from "@/lib/sui/network";
import { resolveFeaturedPoolKeys } from "@/lib/data/pricing/deepbook-mid-price-service";
import type { DeepbookOrderRaw } from "../../types";

const DEFAULT_TX_LIMIT = 80;
const DEEPBOOK_PACKAGE = normalizeSuiAddress(mainnetPackageIds.DEEPBOOK_PACKAGE_ID);

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

type RpcTransactionBlock = {
  digest: string;
  timestampMs?: string;
  effects?: {
    status?: { status?: string };
  };
  balanceChanges?: RpcBalanceChange[];
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

export type ParseDeepbookSwapTxsParams = {
  owner: string;
  poolKey?: string;
  limit?: number;
  txScanLimit?: number;
};

const coinTypeToKey = new Map<string, string>(
  Object.entries(mainnetCoins).map(([key, coin]) => [coin.type.toLowerCase(), key]),
);

function extractMoveCalls(tx: RpcTransactionBlock): RpcMoveCall[] {
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

function ownerBalanceChanges(tx: RpcTransactionBlock, owner: string): RpcBalanceChange[] {
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

function parseSwapFromTransaction(
  tx: RpcTransactionBlock,
  owner: string,
  poolKeyFilter?: string,
): DeepbookOrderRaw | null {
  if (tx.effects?.status?.status?.toLowerCase() !== "success") return null;
  if (!tx.timestampMs) return null;

  const swapCalls = extractMoveCalls(tx).filter(isDeepbookSwapCall);
  if (swapCalls.length === 0) return null;

  const changes = ownerBalanceChanges(tx, owner);
  const poolKey = resolvePoolKeyFromChanges(changes, poolKeyFilter);
  if (!poolKey) return null;

  const functionSide = sideFromSwapFunction(swapCalls[0]?.function ?? "") ?? null;
  const resolved = resolveSideAndQuantity(poolKey, changes, functionSide);
  if (!resolved) return null;

  return {
    orderId: tx.digest,
    poolKey,
    side: resolved.side,
    quantity: resolved.quantity,
    filledQuantity: resolved.quantity,
    status: "FILLED",
    placedAtMs: Number(tx.timestampMs),
  };
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
          showBalanceChanges: true,
          showInput: true,
        },
        limit,
        order: "descending",
      },
    ],
  );
  return response.data ?? [];
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
