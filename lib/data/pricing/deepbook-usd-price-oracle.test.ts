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
  DEEP_USDC: 0.29,
  WAL_SUI: 0.122,
  XBTC_USDC: 95000,
};

describe("resolveAssetUsdPrice", () => {
  it("anchors stablecoins to USDC", () => {
    expect(resolveAssetUsdPrice("USDC", SAMPLE_MID_PRICES)).toBe(1);
    expect(resolveAssetUsdPrice("suiUSDe", SAMPLE_MID_PRICES)).toBe(1);
  });

  it("uses SUI_USDC mid price for SUI", () => {
    expect(resolveAssetUsdPrice("SUI", SAMPLE_MID_PRICES)).toBe(0.748);
  });

  it("prefers DEEP_USDC direct price for DEEP", () => {
    expect(resolveAssetUsdPrice("DEEP", SAMPLE_MID_PRICES)).toBe(0.29);
  });

  it("derives WAL USDC price via WAL_SUI cross rate", () => {
    expect(resolveAssetUsdPrice("WAL", SAMPLE_MID_PRICES)).toBeCloseTo(
      0.122 * 0.748,
      6,
    );
  });

  it("uses XBTC_USDC mid price for XBTC", () => {
    expect(resolveAssetUsdPrice("XBTC", SAMPLE_MID_PRICES)).toBe(95000);
  });
});

describe("collectPoolKeysForAssets", () => {
  it("collects pools needed for mixed portfolio assets", () => {
    const keys = collectPoolKeysForAssets(["SUI", "DEEP", "WAL", "USDC", "XBTC", "SUIUSDE"]);
    expect(keys).toContain("SUI_USDC");
    expect(keys).toContain("DEEP_USDC");
    expect(keys).toContain("WAL_SUI");
    expect(keys).toContain("XBTC_USDC");
    expect(keys).toContain("SUIUSDE_USDC");
  });
});

describe("buildUsdPriceMap", () => {
  it("uses live XBTC_USDC price when available", () => {
    const { prices, fallbackUsed, missing } = buildUsdPriceMap(
      ["SUI", "XBTC"],
      SAMPLE_MID_PRICES,
      {},
    );

    expect(prices.SUI).toBe(0.748);
    expect(prices.XBTC).toBe(95000);
    expect(fallbackUsed).toEqual([]);
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
