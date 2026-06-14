import { mainnetPools } from "@mysten/deepbook-v3";
import { createDeepbookClient } from "@/lib/sui/deepbook-client";

export const FEATURED_POOL_KEYS = [
  "SUI_USDC",
  "DEEP_SUI",
  "WUSDT_USDC",
  "WAL_USDC",
] as const;

export type FeaturedPoolKey = (typeof FEATURED_POOL_KEYS)[number];

const MID_PRICE_CACHE_TTL_MS = 30_000;

type MidPriceCacheEntry = {
  price: number;
  expiresAt: number;
};

const midPriceCache = new Map<string, MidPriceCacheEntry>();

export function resolveFeaturedPoolKeys(): FeaturedPoolKey[] {
  return FEATURED_POOL_KEYS.filter((key) => key in mainnetPools);
}

export function isPoolAvailable(poolKey: string): boolean {
  return poolKey in mainnetPools;
}

/** Clear cache — for tests only. */
export function clearDeepbookMidPriceCache(): void {
  midPriceCache.clear();
}

/**
 * Batch-fetch DeepBook mid prices with in-memory TTL cache (shared by Trading + Portfolio).
 */
export async function fetchDeepbookMidPrices(
  poolKeys: readonly string[],
): Promise<Record<string, number>> {
  const now = Date.now();
  const uniqueKeys = [...new Set(poolKeys.filter(isPoolAvailable))];
  const staleKeys = uniqueKeys.filter((key) => {
    const cached = midPriceCache.get(key);
    return !cached || cached.expiresAt <= now;
  });

  if (staleKeys.length > 0) {
    const client = createDeepbookClient();
    await Promise.all(
      staleKeys.map(async (poolKey) => {
        try {
          const price = await client.deepbook.midPrice(poolKey);
          if (Number.isFinite(price) && price > 0) {
            midPriceCache.set(poolKey, {
              price,
              expiresAt: now + MID_PRICE_CACHE_TTL_MS,
            });
          }
        } catch {
          // Single pool failure should not block others.
        }
      }),
    );
  }

  const result: Record<string, number> = {};
  for (const key of uniqueKeys) {
    const cached = midPriceCache.get(key);
    if (cached && cached.expiresAt > now) {
      result[key] = cached.price;
    }
  }
  return result;
}

export async function fetchDeepbookMidPrice(poolKey: string): Promise<number | undefined> {
  const prices = await fetchDeepbookMidPrices([poolKey]);
  return prices[poolKey];
}
