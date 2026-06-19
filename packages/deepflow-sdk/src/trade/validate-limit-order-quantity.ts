import { mainnetCoins, mainnetPools } from "@mysten/deepbook-v3";

import { createDeepbookClient } from "../sui/deepbook-client.ts";

export type LimitOrderQuantityBounds = {
  minBaseUnits: bigint;
  lotBaseUnits: bigint;
  minSizeHuman: number;
  lotSizeHuman: number;
  baseAsset: string;
};

function resolveBaseCoin(poolKey: string) {
  const pool = mainnetPools[poolKey as keyof typeof mainnetPools];
  if (!pool) {
    throw new Error(`Unknown DeepBook pool: ${poolKey}`);
  }

  const baseCoin = mainnetCoins[pool.baseCoin as keyof typeof mainnetCoins];
  if (!baseCoin) {
    throw new Error(`Missing coin metadata for pool ${poolKey}`);
  }

  return { pool, baseCoin };
}

export async function resolveLimitOrderQuantityBounds(
  poolKey: string,
): Promise<LimitOrderQuantityBounds> {
  const { pool, baseCoin } = resolveBaseCoin(poolKey);
  const client = createDeepbookClient();
  const { minSize, lotSize } = await client.deepbook.poolBookParams(poolKey);

  const minBaseUnits = BigInt(Math.ceil(minSize * baseCoin.scalar));
  const lotBaseUnits = BigInt(Math.round(lotSize * baseCoin.scalar));

  return {
    minBaseUnits,
    lotBaseUnits,
    minSizeHuman: minSize,
    lotSizeHuman: lotSize,
    baseAsset: pool.baseCoin,
  };
}

export async function validateLimitOrderQuantity(params: {
  poolKey: string;
  quantityBaseUnits: bigint;
}): Promise<LimitOrderQuantityBounds> {
  const bounds = await resolveLimitOrderQuantityBounds(params.poolKey);

  if (params.quantityBaseUnits < bounds.minBaseUnits) {
    throw new Error(
      `Order quantity must be at least ${bounds.minSizeHuman} ${bounds.baseAsset} (min_size for ${params.poolKey})`,
    );
  }

  if (bounds.lotBaseUnits > 0n && params.quantityBaseUnits % bounds.lotBaseUnits !== 0n) {
    throw new Error(
      `Order quantity must be a multiple of ${bounds.lotSizeHuman} ${bounds.baseAsset} (lot_size for ${params.poolKey})`,
    );
  }

  return bounds;
}
