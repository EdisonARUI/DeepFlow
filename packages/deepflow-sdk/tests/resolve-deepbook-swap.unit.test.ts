import { describe, expect, it } from "vitest";
import {
  assertSwapLegAssets,
  resolveOutputDecimals,
  resolveSwapDirection,
} from "../src/trade/resolve-deepbook-swap.ts";

describe("resolveSwapDirection", () => {
  it("marks selling base as isBaseToCoin true for SUI_USDC", () => {
    expect(resolveSwapDirection("SUI_USDC", "SUI")).toEqual({
      isBaseToCoin: true,
      baseAsset: "SUI",
      quoteAsset: "USDC",
    });
  });

  it("marks selling quote as isBaseToCoin false for DEEP_USDC", () => {
    expect(resolveSwapDirection("DEEP_USDC", "USDC")).toEqual({
      isBaseToCoin: false,
      baseAsset: "DEEP",
      quoteAsset: "USDC",
    });
  });

  it("marks selling quote as isBaseToCoin false for DEEP_SUI SUI to DEEP", () => {
    expect(resolveSwapDirection("DEEP_SUI", "SUI")).toEqual({
      isBaseToCoin: false,
      baseAsset: "DEEP",
      quoteAsset: "SUI",
    });
  });
});

describe("assertSwapLegAssets", () => {
  it("accepts valid DEEP_USDC leg", () => {
    expect(assertSwapLegAssets("DEEP_USDC", "DEEP", "USDC")).toEqual({
      isBaseToCoin: true,
      baseAsset: "DEEP",
      quoteAsset: "USDC",
    });
  });

  it("rejects mismatched output asset", () => {
    expect(() => assertSwapLegAssets("DEEP_USDC", "DEEP", "SUI")).toThrow(
      /does not match pool DEEP_USDC/,
    );
  });
});

describe("resolveOutputDecimals", () => {
  it("derives decimals from mainnet coin scalar", () => {
    expect(resolveOutputDecimals("USDC")).toBe(6);
    expect(resolveOutputDecimals("SUI")).toBe(9);
    expect(resolveOutputDecimals("XBTC")).toBe(8);
  });
});
