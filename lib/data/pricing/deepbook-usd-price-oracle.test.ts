import { describe, expect, it } from "vitest";
import { mapToPortfolioView } from "@/lib/data/portfolio/map-to-portfolio-view";
import {
  buildUsdPriceMap,
  collectPoolKeysForAssets,
  resolveAssetUsdPrice,
} from "@/lib/data/pricing/deepbook-usd-price-oracle";

const SAMPLE_MID_PRICES = {
  SUI_USDC: 0.748,
  DEEP_SUI: 0.0842,
  WAL_USDC: 0.42,
  WUSDT_USDC: 1.0001,
};

describe("resolveAssetUsdPrice", () => {
  it("anchors stablecoins to USDC", () => {
    expect(resolveAssetUsdPrice("USDC", SAMPLE_MID_PRICES)).toBe(1);
    expect(resolveAssetUsdPrice("suiUSDe", SAMPLE_MID_PRICES)).toBe(1);
    expect(resolveAssetUsdPrice("WUSDT", SAMPLE_MID_PRICES)).toBe(1.0001);
  });

  it("uses SUI_USDC mid price for SUI", () => {
    expect(resolveAssetUsdPrice("SUI", SAMPLE_MID_PRICES)).toBe(0.748);
  });

  it("derives DEEP USDC price via DEEP_SUI cross rate", () => {
    expect(resolveAssetUsdPrice("DEEP", SAMPLE_MID_PRICES)).toBeCloseTo(
      0.0842 * 0.748,
      6,
    );
  });

  it("uses WAL_USDC mid price for WAL", () => {
    expect(resolveAssetUsdPrice("WAL", SAMPLE_MID_PRICES)).toBe(0.42);
  });
});

describe("collectPoolKeysForAssets", () => {
  it("collects pools needed for mixed portfolio assets", () => {
    const keys = collectPoolKeysForAssets(["SUI", "DEEP", "WAL", "USDC", "XBTC"]);
    expect(keys).toContain("SUI_USDC");
    expect(keys).toContain("DEEP_SUI");
    expect(keys).toContain("WAL_USDC");
    expect(keys).not.toContain("WUSDT_USDC");
  });
});

describe("buildUsdPriceMap", () => {
  it("falls back to static prices for assets without DeepBook pools", () => {
    const fallback = { XBTC: 95000 };
    const { prices, fallbackUsed, missing } = buildUsdPriceMap(
      ["SUI", "XBTC"],
      SAMPLE_MID_PRICES,
      fallback,
    );

    expect(prices.SUI).toBe(0.748);
    expect(prices.XBTC).toBe(95000);
    expect(fallbackUsed).toEqual(["XBTC"]);
    expect(missing).toEqual([]);
  });

  it("tracks assets with no live or fallback price", () => {
    const { prices, missing } = buildUsdPriceMap(["UNKNOWN"], SAMPLE_MID_PRICES, {});
    expect(prices.UNKNOWN).toBeUndefined();
    expect(missing).toEqual(["UNKNOWN"]);
  });
});

describe("mapToPortfolioView with DeepBook prices", () => {
  it("values 13.29 SUI idle wallet balance using live mid price", () => {
    const suiBalance = BigInt("13290000000");
    const view = mapToPortfolioView({
      positions: [
        {
          protocol: "navi",
          asset: "SUI",
          coinType: "0x2::sui::SUI",
          suppliedBalance: BigInt(0),
          walletCoinBalance: suiBalance,
          decimals: 9,
        },
      ],
      transactions: [],
      usdPrices: { SUI: 0.748 },
    });

    expect(view.summary.idleCapital).toBeCloseTo(13.29 * 0.748, 2);
    expect(view.summary.totalAssets).toBeCloseTo(13.29 * 0.748, 2);
    expect(view.summary.workingCapital).toBe(0);
  });
});
