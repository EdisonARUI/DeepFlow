import { MOCK_TOKEN_USD_PRICES } from "@/lib/fixtures/portfolio";
import {
  fetchDeepbookMidPrices,
  isPoolAvailable,
  resolveFeaturedPoolKeys,
} from "./deepbook-mid-price-service";

export type FetchUsdPricesResult = {
  prices: Record<string, number>;
  warning?: string;
};

function normalizeSymbol(asset: string): string {
  return asset.toUpperCase();
}

function isStablecoin(asset: string): boolean {
  const upper = normalizeSymbol(asset);
  return upper === "USDC" || upper === "WUSDT" || upper === "SUIUSDE";
}

function resolveFallbackPrice(
  asset: string,
  fallbackPrices: Record<string, number>,
): number | undefined {
  if (asset in fallbackPrices) return fallbackPrices[asset];
  const upper = normalizeSymbol(asset);
  if (upper in fallbackPrices) return fallbackPrices[upper];
  return undefined;
}

/** Collect DeepBook pool keys required to price the given assets in USDC. */
export function collectPoolKeysForAssets(assets: readonly string[]): string[] {
  const keys = new Set<string>();

  for (const asset of assets) {
    const upper = normalizeSymbol(asset);

    if (upper === "WUSDT" && isPoolAvailable("WUSDT_USDC")) {
      keys.add("WUSDT_USDC");
    }

    if (upper === "SUI" || upper === "DEEP" || upper === "VSUI") {
      if (isPoolAvailable("SUI_USDC")) keys.add("SUI_USDC");
    }

    if (upper === "WAL" && isPoolAvailable("WAL_USDC")) {
      keys.add("WAL_USDC");
    }

    if (upper === "DEEP" && isPoolAvailable("DEEP_SUI")) {
      keys.add("DEEP_SUI");
    }
  }

  return [...keys];
}

/**
 * Resolve a single asset's USDC price from pre-fetched DeepBook mid prices.
 * Returns undefined when no live price is available for this asset.
 */
export function resolveAssetUsdPrice(
  asset: string,
  midPrices: Record<string, number>,
): number | undefined {
  if (isStablecoin(asset)) {
    if (normalizeSymbol(asset) === "WUSDT" && midPrices.WUSDT_USDC !== undefined) {
      return midPrices.WUSDT_USDC;
    }
    return 1;
  }

  const upper = normalizeSymbol(asset);

  if (upper === "SUI" || upper === "VSUI") {
    const suiUsd = midPrices.SUI_USDC;
    return suiUsd !== undefined && Number.isFinite(suiUsd) ? suiUsd : undefined;
  }

  if (upper === "WAL") {
    const walUsd = midPrices.WAL_USDC;
    return walUsd !== undefined && Number.isFinite(walUsd) ? walUsd : undefined;
  }

  if (upper === "DEEP") {
    const deepInSui = midPrices.DEEP_SUI;
    const suiUsd = midPrices.SUI_USDC;
    if (
      deepInSui !== undefined &&
      suiUsd !== undefined &&
      Number.isFinite(deepInSui) &&
      Number.isFinite(suiUsd)
    ) {
      return deepInSui * suiUsd;
    }
    return undefined;
  }

  return undefined;
}

export type BuildUsdPriceMapResult = {
  prices: Record<string, number>;
  fallbackUsed: string[];
  missing: string[];
};

/** Pure pricing step — easy to unit test without RPC. */
export function buildUsdPriceMap(
  assets: readonly string[],
  midPrices: Record<string, number>,
  fallbackPrices: Record<string, number> = MOCK_TOKEN_USD_PRICES,
): BuildUsdPriceMapResult {
  const uniqueAssets = [...new Set(assets)];
  const prices: Record<string, number> = {};
  const fallbackUsed: string[] = [];
  const missing: string[] = [];

  for (const asset of uniqueAssets) {
    const livePrice = resolveAssetUsdPrice(asset, midPrices);
    if (livePrice !== undefined) {
      prices[asset] = livePrice;
      continue;
    }

    const fallback = resolveFallbackPrice(asset, fallbackPrices);
    if (fallback !== undefined) {
      prices[asset] = fallback;
      fallbackUsed.push(asset);
      continue;
    }

    missing.push(asset);
  }

  return { prices, fallbackUsed, missing };
}

function buildPriceWarning(
  fallbackUsed: string[],
  missing: string[],
): string | undefined {
  const parts: string[] = ["估值基于 DeepBook 中间价（USDC 计价）。"];

  if (fallbackUsed.length > 0) {
    parts.push(
      `以下资产无 DeepBook 池，已回退静态价：${fallbackUsed.join(", ")}。`,
    );
  }

  if (missing.length > 0) {
    parts.push(`以下资产缺少 USD 价格，已按 $0 计入：${missing.join(", ")}。`);
  }

  return parts.length > 1 ? parts.join(" ") : parts[0];
}

export function uniqueAssetsFromPositions(
  positions: readonly { asset: string }[],
): string[] {
  return [...new Set(positions.map((position) => position.asset))];
}

export function mergePriceWarnings(
  ...warnings: (string | undefined)[]
): string | undefined {
  const parts = warnings.filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : undefined;
}

export async function fetchDeepbookUsdPrices(
  assets: readonly string[],
  fallbackPrices: Record<string, number> = MOCK_TOKEN_USD_PRICES,
): Promise<FetchUsdPricesResult> {
  const poolKeys =
    assets.length > 0 ? collectPoolKeysForAssets(assets) : resolveFeaturedPoolKeys();

  const midPrices = await fetchDeepbookMidPrices(poolKeys);
  const { prices, fallbackUsed, missing } = buildUsdPriceMap(
    assets,
    midPrices,
    fallbackPrices,
  );

  return {
    prices,
    warning: buildPriceWarning(fallbackUsed, missing),
  };
}
