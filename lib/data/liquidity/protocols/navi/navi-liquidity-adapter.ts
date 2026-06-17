import { getLendingPositions, getPools } from "@naviprotocol/lending";

import type { LiquidityPositionRaw } from "../../types";
import type {
  LiquidityProtocolAdapter,
  ListLiquidityPositionsParams,
  ListLiquidityPositionsResult,
} from "../types";
import { parseNaviAprPercentToBps } from "./navi-apy";
import { createNaviRpcClient } from "./navi-rpc-client";
import { buildSupplyBalanceMap } from "./navi-supply-balance";

const NAVI_PROTOCOL_ID = "navi" as const;
const NAVI_PROTOCOL_LABEL = "[NAVI]";
const NAVI_PROTOCOL_COLOR = "#18c8ff";
const NAVI_MAIN_MARKET = "main" as const;
const NAVI_CACHE_TIME_MS = 30_000;

const DEFAULT_NAVI_MAIN_ASSET_ALLOWLIST = [
  "USDC",
  "SUIUSDE",
  "SUI",
  "WAL",
  "DEEP",
  "XBTC",
] as const;

const NAVI_ENV = "prod" as const;

const MAINNET_LEGACY_TESTNET_ALIASES: Record<string, string> = {
  BTC: "XBTC",
  BTCTEST: "XBTC",
};

function mapLegacyTestnetAssetToMainnet(asset: string): string {
  const stripped = asset.replace(/_TEST$/i, "");
  const normalized = normalizeSymbol(stripped);
  return MAINNET_LEGACY_TESTNET_ALIASES[normalized] ?? stripped;
}

function resolveNaviAssetAllowlist(): readonly string[] {
  const override = process.env.NEXT_PUBLIC_NAVI_ASSETS;
  if (!override) {
    return DEFAULT_NAVI_MAIN_ASSET_ALLOWLIST;
  }

  const parsed = override
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (parsed.length === 0) {
    return DEFAULT_NAVI_MAIN_ASSET_ALLOWLIST;
  }

  const hasLegacyTestnetSymbols = parsed.some((asset) => /_TEST$/i.test(asset));
  if (hasLegacyTestnetSymbols) {
    console.warn(
      "[NaviLiquidityAdapter] NEXT_PUBLIC_NAVI_ASSETS contains testnet symbols (*_TEST); " +
        "mapping to mainnet equivalents. Update .env.local to use USDC,SUI,... instead.",
    );
  }

  const mapped = parsed.map((asset) =>
    hasLegacyTestnetSymbols ? mapLegacyTestnetAssetToMainnet(asset) : asset,
  );

  const unique = [...new Set(mapped.map((asset) => normalizeSymbol(asset)))].map((normalized) => {
    const match = mapped.find((asset) => normalizeSymbol(asset) === normalized);
    return match ?? normalized;
  });

  return unique.length > 0 ? unique : DEFAULT_NAVI_MAIN_ASSET_ALLOWLIST;
}

function normalizeSymbol(symbol: string): string {
  return symbol.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function isAllowedAsset(symbol: string, allowlist: readonly string[]): boolean {
  const normalized = normalizeSymbol(symbol);
  return allowlist.some((asset) => normalizeSymbol(asset) === normalized);
}

function parseUsdNumber(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

async function buildWalletCoinBalanceMap(
  ownerAddress: string,
  pools: Awaited<ReturnType<typeof getPools>>,
  allowlist: readonly string[],
): Promise<Map<string, bigint>> {
  const client = createNaviRpcClient();
  const filteredPools = pools.filter(
    (pool) =>
      pool.market === NAVI_MAIN_MARKET && isAllowedAsset(pool.token.symbol, allowlist),
  );

  const entries = await Promise.all(
    filteredPools.map(async (pool) => {
      try {
        const { totalBalance } = await client.getBalance({
          owner: ownerAddress,
          coinType: pool.suiCoinType,
        });
        return [normalizeSymbol(pool.token.symbol), BigInt(totalBalance)] as const;
      } catch {
        return [normalizeSymbol(pool.token.symbol), BigInt(0)] as const;
      }
    }),
  );

  return new Map(entries);
}

function mapPoolsToRows(
  pools: Awaited<ReturnType<typeof getPools>>,
  suppliedBalances: Map<string, bigint>,
  walletCoinBalances: Map<string, bigint>,
  allowlist: readonly string[],
): LiquidityPositionRaw[] {
  return pools
    .filter(
      (pool) =>
        pool.market === NAVI_MAIN_MARKET && isAllowedAsset(pool.token.symbol, allowlist),
    )
    .map((pool) => {
      const key = normalizeSymbol(pool.token.symbol);
      return {
        protocol: NAVI_PROTOCOL_ID,
        protocolLabel: NAVI_PROTOCOL_LABEL,
        protocolColor: NAVI_PROTOCOL_COLOR,
        asset: pool.token.symbol,
        coinType: pool.suiCoinType,
        supplyApyBps: parseNaviAprPercentToBps(pool.supplyIncentiveApyInfo.apy),
        tvlUsd: parseUsdNumber(pool.poolSupplyValue),
        suppliedBalance: suppliedBalances.get(key) ?? BigInt(0),
        walletCoinBalance: walletCoinBalances.get(key) ?? BigInt(0),
        decimals: pool.token.decimals,
      };
    });
}

function sortByAllowlist(
  rows: LiquidityPositionRaw[],
  allowlist: readonly string[],
): LiquidityPositionRaw[] {
  const order = new Map(allowlist.map((asset, index) => [normalizeSymbol(asset), index]));

  return [...rows].sort((a, b) => {
    const aOrder = order.get(normalizeSymbol(a.asset)) ?? Number.MAX_SAFE_INTEGER;
    const bOrder = order.get(normalizeSymbol(b.asset)) ?? Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });
}

export class NaviLiquidityAdapter implements LiquidityProtocolAdapter {
  readonly protocolId = NAVI_PROTOCOL_ID;

  async listPositions(params: ListLiquidityPositionsParams): Promise<ListLiquidityPositionsResult> {
    const ownerAddress = params.ownerAddress;
    const allowlist = resolveNaviAssetAllowlist();
    const sdkOptions = {
      env: NAVI_ENV,
      markets: [NAVI_MAIN_MARKET],
      cacheTime: NAVI_CACHE_TIME_MS,
      ...(params.bustCache ? { disableCache: true } : {}),
    };

    let pools: Awaited<ReturnType<typeof getPools>>;
    try {
      pools = await getPools(sdkOptions);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unknown error while loading NAVI Main Market pools";
      throw new Error(
        `Failed to load NAVI Main Market pools on mainnet. Switch to mock mode or check RPC connectivity. (${message})`,
      );
    }

    let suppliedBalances = new Map<string, bigint>();
    let walletCoinBalances = new Map<string, bigint>();
    let walletBalanceWarning: string | undefined;
    let configurationWarning: string | undefined;

    if (ownerAddress) {
      try {
        const client = createNaviRpcClient();
        const positions = await getLendingPositions(ownerAddress, {
          ...sdkOptions,
          client,
        });
        suppliedBalances = buildSupplyBalanceMap(positions, allowlist);
      } catch (err) {
        console.warn(
          "[NaviLiquidityAdapter] getLendingPositions failed, supplied balances default to 0:",
          err,
        );
        walletBalanceWarning =
          "Personal supply balance is temporarily unavailable. Market pool data is still shown.";
      }

      try {
        walletCoinBalances = await buildWalletCoinBalanceMap(
          ownerAddress,
          pools,
          allowlist,
        );
      } catch (err) {
        console.warn(
          "[NaviLiquidityAdapter] getBalance failed, wallet coin balances default to 0:",
          err,
        );
      }
    }

    const mainMarketPools = pools.filter((pool) => pool.market === NAVI_MAIN_MARKET);
    const rows = sortByAllowlist(
      mapPoolsToRows(pools, suppliedBalances, walletCoinBalances, allowlist),
      allowlist,
    );

    if (mainMarketPools.length > 0 && rows.length === 0) {
      configurationWarning =
        "Asset allowlist does not match mainnet pool symbols. Check NEXT_PUBLIC_NAVI_ASSETS (use USDC,SUI,... and avoid *_TEST).";
    }

    return {
      positions: rows,
      walletBalanceWarning,
      configurationWarning,
    };
  }
}
