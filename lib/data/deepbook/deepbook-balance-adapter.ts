import { mainnetCoins } from "@mysten/deepbook-v3";
import {
  balanceManagerConfigEntry,
  resolveUserBalanceManager,
} from "@deepflow/sdk/trade/resolve-user-balance-manager";
import type { LiquidityPositionRaw } from "@/lib/data/liquidity/types";
import { createDeepbookClient } from "@/lib/sui/deepbook-client";

const DEEPBOOK_PROTOCOL_ID = "deepbook" as const;
const DEEPBOOK_PROTOCOL_LABEL = "[DEEPBOOK]";
const DEEPBOOK_PROTOCOL_COLOR = "#00ff41";

const DEFAULT_DEEPBOOK_ASSET_ALLOWLIST = [
  "USDC",
  "SUIUSDE",
  "SUI",
  "WAL",
  "DEEP",
  "XBTC",
] as const;

const ASSET_TO_COIN_KEY: Record<string, keyof typeof mainnetCoins> = {
  USDC: "USDC",
  SUI: "SUI",
  WAL: "WAL",
  DEEP: "DEEP",
  SUIUSDE: "SUIUSDE",
  XBTC: "XBTC",
};

function normalizeSymbol(asset: string): string {
  return asset.toUpperCase();
}

function resolveDeepbookAssetAllowlist(): readonly string[] {
  const override = process.env.NEXT_PUBLIC_NAVI_ASSETS ?? process.env.NEXT_PUBLIC_DEEPBOOK_ASSETS;
  if (!override) {
    return DEFAULT_DEEPBOOK_ASSET_ALLOWLIST;
  }

  return override
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function resolveCoinKey(asset: string): keyof typeof mainnetCoins | undefined {
  const normalized = normalizeSymbol(asset);
  return ASSET_TO_COIN_KEY[normalized];
}

function scalarToDecimals(scalar: number): number {
  if (scalar <= 0) return 0;
  return Math.round(Math.log10(scalar));
}

function humanBalanceToBaseUnits(balance: number, scalar: number): bigint {
  if (!Number.isFinite(balance) || balance <= 0) {
    return 0n;
  }
  return BigInt(Math.round(balance * scalar));
}

export type DeepbookBalanceEntry = {
  asset: string;
  coinType: string;
  balance: bigint;
  decimals: number;
};

export type FetchDeepbookBalancesResult = {
  entries: DeepbookBalanceEntry[];
  managerId?: string;
  warning?: string;
};

export async function fetchDeepbookBalances(
  owner: string | undefined,
): Promise<FetchDeepbookBalancesResult> {
  if (!owner) {
    return { entries: [] };
  }

  try {
    const { managerId } = await resolveUserBalanceManager(owner);
    if (!managerId) {
      return { entries: [] };
    }

    const allowlist = resolveDeepbookAssetAllowlist();
    const coinKeys = [
      ...new Set(
        allowlist
          .map((asset) => resolveCoinKey(asset))
          .filter((key): key is keyof typeof mainnetCoins => key !== undefined),
      ),
    ];

    if (coinKeys.length === 0) {
      return { entries: [], managerId };
    }

    const client = createDeepbookClient(owner, {
      balanceManagers: balanceManagerConfigEntry(managerId),
    });

    const balancesByManager = await client.deepbook.checkManagerBalancesWithAddress(
      [managerId],
      coinKeys,
    );
    const balancesByCoinType = balancesByManager[managerId] ?? {};

    const entries: DeepbookBalanceEntry[] = [];

    for (const asset of allowlist) {
      const coinKey = resolveCoinKey(asset);
      if (!coinKey) continue;

      const coin = mainnetCoins[coinKey];
      const humanBalance = balancesByCoinType[coin.type] ?? 0;
      const baseUnits = humanBalanceToBaseUnits(humanBalance, coin.scalar);
      if (baseUnits <= 0n) continue;

      entries.push({
        asset: normalizeSymbol(asset) === "SUIUSDE" ? "SUIUSDE" : asset,
        coinType: coin.type,
        balance: baseUnits,
        decimals: scalarToDecimals(coin.scalar),
      });
    }

    return { entries, managerId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[DeepbookBalanceAdapter] fetchDeepbookBalances failed:", message);
    return {
      entries: [],
      warning: "Failed to load DeepBook BalanceManager balances.",
    };
  }
}

export function mapDeepbookBalancesToPositionRaw(
  entries: readonly DeepbookBalanceEntry[],
): LiquidityPositionRaw[] {
  return entries.map((entry) => ({
    protocol: DEEPBOOK_PROTOCOL_ID,
    protocolLabel: DEEPBOOK_PROTOCOL_LABEL,
    protocolColor: DEEPBOOK_PROTOCOL_COLOR,
    asset: entry.asset,
    coinType: entry.coinType,
    supplyApyBps: 0,
    tvlUsd: 0,
    suppliedBalance: entry.balance,
    walletCoinBalance: 0n,
    decimals: entry.decimals,
  }));
}

export async function fetchDeepbookBalancePositions(
  owner: string | undefined,
): Promise<FetchDeepbookBalancesResult & { positions: LiquidityPositionRaw[] }> {
  const result = await fetchDeepbookBalances(owner);
  return {
    ...result,
    positions: mapDeepbookBalancesToPositionRaw(result.entries),
  };
}

export function deepbookEntriesToBalanceMap(
  entries: readonly DeepbookBalanceEntry[],
): Record<string, bigint> {
  const map: Record<string, bigint> = {};
  for (const entry of entries) {
    const key = normalizeSymbol(entry.asset);
    map[key] = entry.balance;
  }
  return map;
}
