import { FEATURED_POOL_KEYS } from "@/lib/data/pricing/deepbook-mid-price-service";
import type { LiquidityPositionView } from "@/lib/data/liquidity/types";
import type { TradeExecutionRoute, TradeFundLocation } from "./types";

export function isSuilendInvolved(
  source: TradeFundLocation,
  destination: TradeFundLocation,
): boolean {
  return source === "suilend" || destination === "suilend";
}

export function resolveTradeExecutionRoute(
  source: TradeFundLocation,
  destination: TradeFundLocation,
): TradeExecutionRoute {
  if (source === "wallet" && destination === "wallet") return "wallet_wallet";
  if (source === "wallet" && destination === "navi") return "wallet_navi";
  if (source === "wallet" && destination === "suilend") return "wallet_suilend";
  if (source === "navi" && destination === "navi") return "navi_navi";
  if (source === "navi" && destination === "wallet") return "navi_wallet";
  if (source === "navi" && destination === "suilend") return "navi_suilend";
  if (source === "suilend" && destination === "suilend") return "suilend_suilend";
  if (source === "suilend" && destination === "wallet") return "suilend_wallet";
  if (source === "suilend" && destination === "navi") return "suilend_navi";

  return "unsupported";
}

function matchesProtocol(location: TradeFundLocation, protocolId: string): boolean {
  if (location === "wallet") return true;
  return protocolId.toLowerCase() === location;
}

export function resolveBalanceForLocation(
  location: TradeFundLocation,
  asset: string,
  positions: readonly LiquidityPositionView[],
): bigint {
  const normalizedAsset = asset.toUpperCase();
  const matching = positions.filter(
    (p) => p.asset.toUpperCase() === normalizedAsset && matchesProtocol(location, p.protocolId),
  );

  if (matching.length === 0) return 0n;

  if (location === "wallet") {
    const byCoinType = new Map<string, bigint>();
    for (const position of matching) {
      const existing = byCoinType.get(position.coinType) ?? 0n;
      if (position.walletCoinBalance > existing) {
        byCoinType.set(position.coinType, position.walletCoinBalance);
      }
    }
    return [...byCoinType.values()].reduce((max, value) => (value > max ? value : max), 0n);
  }

  return matching.reduce((max, position) => {
    return position.suppliedBalance > max ? position.suppliedBalance : max;
  }, 0n);
}

export function findPositionForLocation(
  location: TradeFundLocation,
  asset: string,
  positions: readonly LiquidityPositionView[],
): LiquidityPositionView | undefined {
  const normalizedAsset = asset.toUpperCase();
  return positions.find(
    (p) => p.asset.toUpperCase() === normalizedAsset && matchesProtocol(location, p.protocolId),
  );
}

export const SUPPORTED_TRADE_POOL_KEYS = FEATURED_POOL_KEYS;

export function assertSupportedTradePool(poolKey: string): string | undefined {
  if (!SUPPORTED_TRADE_POOL_KEYS.includes(poolKey as (typeof SUPPORTED_TRADE_POOL_KEYS)[number])) {
    return `Current execute simulation supports featured DeepBook pools only: ${SUPPORTED_TRADE_POOL_KEYS.join(", ")}`;
  }
  return undefined;
}

export function assertValidSwapAssets(
  poolKey: string,
  baseAsset: string,
  quoteAsset: string,
  fromAsset: string,
  toAsset: string,
): string | undefined {
  const normalizedFrom = fromAsset.toUpperCase();
  const normalizedTo = toAsset.toUpperCase();
  const normalizedBase = baseAsset.toUpperCase();
  const normalizedQuote = quoteAsset.toUpperCase();

  const validPair =
    (normalizedFrom === normalizedBase && normalizedTo === normalizedQuote) ||
    (normalizedFrom === normalizedQuote && normalizedTo === normalizedBase);

  if (!validPair) {
    return `${fromAsset}->${toAsset} does not match pool ${poolKey} (${baseAsset}/${quoteAsset})`;
  }

  return undefined;
}
