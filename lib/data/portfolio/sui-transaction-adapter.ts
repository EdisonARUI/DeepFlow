import { createSuiJsonRpcClient } from "@/lib/sui/network";
import type { PortfolioTransactionStatus, PortfolioTransactionType, PortfolioTransactionView } from "./types";

export type ListRecentTransactionsParams = {
  owner?: string;
  days?: number;
  limit?: number;
};

type RpcBalanceChange = {
  owner?: { AddressOwner?: string };
  coinType: string;
  amount: string;
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
        kind?: string;
        transactions?: Array<{ MoveCall?: { package?: string; module?: string; function?: string } }>;
      };
    };
  };
};

type QueryTransactionBlocksResponse = {
  data: RpcTransactionBlock[];
};

const DEFAULT_LIMIT = 50;

function truncateDigest(digest: string): string {
  if (digest.length <= 12) return digest;
  return `${digest.slice(0, 4)}...${digest.slice(-4)}`;
}

function extractAssetSymbol(coinType: string): string {
  const parts = coinType.split("::");
  return parts[parts.length - 1] ?? coinType;
}

function formatAmount(amount: bigint, asset: string): string {
  const sign = amount >= BigInt(0) ? "+" : "-";
  const abs = amount < BigInt(0) ? -amount : amount;
  const value = Number(abs) / 1e9;
  const formatted =
    value >= 1
      ? value.toLocaleString("en-US", { maximumFractionDigits: 2 })
      : value.toFixed(4);
  return `${sign}${formatted} ${asset}`;
}

function formatDate(timestampMs: string): string {
  const date = new Date(Number(timestampMs));
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function inferTransactionType(
  tx: RpcTransactionBlock,
  owner: string,
  balanceChange?: RpcBalanceChange,
): PortfolioTransactionType {
  const moveCalls =
    tx.transaction?.data?.transaction?.transactions?.flatMap((item) =>
      item.MoveCall ? [item.MoveCall] : [],
    ) ?? [];

  const joined = moveCalls
    .map((call) => `${call.package}::${call.module}::${call.function}`.toLowerCase())
    .join(" ");

  if (joined.includes("bridge")) return "BRIDGE";
  if (joined.includes("withdraw") || joined.includes("redeem")) return "WITHDRAW";
  if (joined.includes("deposit") || joined.includes("supply") || joined.includes("lending")) {
    return "SUPPLY";
  }

  const amount = balanceChange ? BigInt(balanceChange.amount) : BigInt(0);
  if (amount > BigInt(0)) return "SUPPLY";
  if (amount < BigInt(0)) return "WITHDRAW";
  return "GENERIC";
}

function mapStatus(tx: RpcTransactionBlock): PortfolioTransactionStatus {
  const status = tx.effects?.status?.status?.toLowerCase();
  if (status === "success") return "COMPLETED";
  if (status === "failure") return "FAILED";
  return "PENDING";
}

function mapTransactionBlock(
  tx: RpcTransactionBlock,
  owner: string,
): PortfolioTransactionView | null {
  if (!tx.timestampMs) return null;

  const ownerChanges =
    tx.balanceChanges?.filter(
      (change) => change.owner?.AddressOwner?.toLowerCase() === owner.toLowerCase(),
    ) ?? [];

  const primaryChange = ownerChanges.sort(
    (a, b) =>
      Number(BigInt(b.amount) < BigInt(0) ? -BigInt(b.amount) : BigInt(b.amount)) -
      Number(BigInt(a.amount) < BigInt(0) ? -BigInt(a.amount) : BigInt(a.amount)),
  )[0];

  const asset = primaryChange ? extractAssetSymbol(primaryChange.coinType) : "SUI";
  const amount = primaryChange
    ? formatAmount(BigInt(primaryChange.amount), asset)
    : "—";

  return {
    date: formatDate(tx.timestampMs),
    timestamp: Number(tx.timestampMs),
    type: inferTransactionType(tx, owner, primaryChange),
    asset,
    amount,
    status: mapStatus(tx),
    txHash: truncateDigest(tx.digest),
  };
}

async function queryTransactionsForFilter(
  filter: { FromAddress: string } | { ToAddress: string },
  limit: number,
): Promise<RpcTransactionBlock[]> {
  const client = createSuiJsonRpcClient();
  const response = await client.call<QueryTransactionBlocksResponse>(
    "suix_queryTransactionBlocks",
    [
      {
        filter,
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

export async function listRecentTransactions(
  params: ListRecentTransactionsParams,
): Promise<{ transactions: PortfolioTransactionView[]; warning?: string }> {
  const owner = params.owner;
  if (!owner) {
    return {
      transactions: [],
    };
  }

  const limit = params.limit ?? DEFAULT_LIMIT;
  const days = params.days ?? 30;
  const cutoffMs = Date.now() - days * 24 * 60 * 60 * 1000;

  try {
    const [fromTxs, toTxs] = await Promise.all([
      queryTransactionsForFilter({ FromAddress: owner }, limit),
      queryTransactionsForFilter({ ToAddress: owner }, limit),
    ]);

    const merged = new Map<string, RpcTransactionBlock>();
    for (const tx of [...fromTxs, ...toTxs]) {
      merged.set(tx.digest, tx);
    }

    const transactions = [...merged.values()]
      .map((tx) => mapTransactionBlock(tx, owner))
      .filter((tx): tx is PortfolioTransactionView => tx !== null)
      .filter((tx) => tx.timestamp >= cutoffMs)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    return { transactions };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load transactions";
    return {
      transactions: [],
      warning: `Failed to query on-chain transactions: ${message}`,
    };
  }
}
