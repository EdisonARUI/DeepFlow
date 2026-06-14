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
  if (isSuilendInvolved(source, destination)) {
    return "unsupported";
  }

  if (source === "wallet" && destination === "wallet") return "wallet_wallet";
  if (source === "wallet" && destination === "navi") return "wallet_navi";
  if (source === "navi" && destination === "navi") return "navi_navi";
  if (source === "navi" && destination === "wallet") return "navi_wallet";

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

export const SUPPORTED_TRADE_POOL_KEY = "SUI_USDC";

export function assertSupportedTradePool(poolKey: string): string | undefined {
  if (poolKey !== SUPPORTED_TRADE_POOL_KEY) {
    return `当前 Execute 模拟仅支持 ${SUPPORTED_TRADE_POOL_KEY}（SUI→USDC）`;
  }
  return undefined;
}
