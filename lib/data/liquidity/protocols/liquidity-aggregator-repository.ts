import { SUI_NETWORK } from "@/lib/sui/network";
import { mapToLiquidityViews } from "../map-to-liquidity-view";
import type {
  LiquidityRepository,
  ListPositionsParams,
  ListPositionsResult,
} from "../liquidity-repository";
import type { LiquidityProtocolAdapter } from "./types";

type CacheEntry = {
  expiresAtMs: number;
  value: ListPositionsResult;
};

const CACHE = new Map<string, CacheEntry>();
const IN_FLIGHT = new Map<string, Promise<ListPositionsResult>>();

function resolveCacheTtlMs(): number {
  const raw = process.env.NEXT_PUBLIC_LIQUIDITY_CACHE_TTL_MS;
  const n = raw ? Number(raw) : 30_000;
  return Number.isFinite(n) && n > 0 ? n : 30_000;
}

function makeCacheKey(params: ListPositionsParams, protocolIds: readonly LiquidityProtocolAdapter["protocolId"][]) {
  const owner = params.owner ?? "";
  return `${owner}|${SUI_NETWORK}|${protocolIds.join(",")}`;
}

export class LiquidityAggregatorRepository implements LiquidityRepository {
  constructor(private readonly adapters: LiquidityProtocolAdapter[]) {}

  async listPositions(params: ListPositionsParams) {
    if (this.adapters.length === 0) {
      return { positions: [] };
    }

    const protocolIds = this.adapters.map((a) => a.protocolId);
    const cacheKey = makeCacheKey(params, protocolIds);
    const ttlMs = resolveCacheTtlMs();

    const cached = CACHE.get(cacheKey);
    if (cached && cached.expiresAtMs > Date.now()) {
      return cached.value;
    }

    const existing = IN_FLIGHT.get(cacheKey);
    if (existing) {
      return existing;
    }

    const fetchPromise = (async () => {
      const settled = await Promise.allSettled(
        this.adapters.map((adapter) => adapter.listPositions({ ownerAddress: params.owner })),
      );

      const fulfilled = settled.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
      const rawResults = fulfilled.flatMap((result) => result.positions);
      const walletBalanceWarning = fulfilled.find(
        (result) => result.walletBalanceWarning,
      )?.walletBalanceWarning;
      const configurationWarning = fulfilled.find(
        (result) => result.configurationWarning,
      )?.configurationWarning;

      const failures = settled.filter(
        (r): r is PromiseRejectedResult => r.status === "rejected",
      );

      if (rawResults.length === 0 && failures.length > 0) {
        const firstReason = failures[0].reason;
        throw firstReason instanceof Error
          ? firstReason
          : new Error("Failed to load liquidity positions");
      }

      return {
        positions: mapToLiquidityViews(rawResults),
        walletBalanceWarning,
        configurationWarning,
      };
    })();

    IN_FLIGHT.set(cacheKey, fetchPromise);

    try {
      const value = await fetchPromise;
      CACHE.set(cacheKey, {
        expiresAtMs: Date.now() + ttlMs,
        value,
      });
      return value;
    } finally {
      IN_FLIGHT.delete(cacheKey);
    }
  }
}

