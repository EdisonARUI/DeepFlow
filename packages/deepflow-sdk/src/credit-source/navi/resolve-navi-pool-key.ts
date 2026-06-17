import { getPools } from "@naviprotocol/lending";

import { NAVI_CACHE_TIME_MS, NAVI_ENV, NAVI_MAIN_MARKET } from "./constants.ts";

function normalizeSymbol(symbol: string): string {
  return symbol.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function isSuiCoinType(assetOrCoinType: string): boolean {
  return assetOrCoinType.includes("::");
}

export interface ResolveNaviPoolKeyOptions {
  env?: typeof NAVI_ENV;
  market?: typeof NAVI_MAIN_MARKET;
}

/** Resolve dashboard symbol or pool key to NAVI suiCoinType. */
export async function resolveNaviPoolKey(
  assetOrCoinType: string,
  options: ResolveNaviPoolKeyOptions = {},
): Promise<string> {
  if (isSuiCoinType(assetOrCoinType)) {
    return assetOrCoinType;
  }

  const env = options.env ?? NAVI_ENV;
  const market = options.market ?? NAVI_MAIN_MARKET;
  const normalized = normalizeSymbol(assetOrCoinType);

  const pools = await getPools({
    env,
    markets: [market],
    cacheTime: NAVI_CACHE_TIME_MS,
  });

  const pool = pools.find(
    (candidate) =>
      candidate.market === market &&
      normalizeSymbol(candidate.token.symbol) === normalized,
  );

  if (!pool) {
    throw new Error(`NAVI pool not found for asset: ${assetOrCoinType}`);
  }

  return pool.suiCoinType;
}
