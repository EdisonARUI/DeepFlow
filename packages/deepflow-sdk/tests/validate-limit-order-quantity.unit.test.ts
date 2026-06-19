import { describe, expect, it, vi, beforeEach } from "vitest";

const mockPoolBookParams = vi.fn();

vi.mock("../src/sui/deepbook-client.ts", () => ({
  createDeepbookClient: () => ({
    deepbook: {
      poolBookParams: mockPoolBookParams,
    },
  }),
}));

vi.mock("@mysten/deepbook-v3", () => ({
  mainnetPools: {
    SUI_USDC: { baseCoin: "SUI", quoteCoin: "USDC" },
    DEEP_SUI: { baseCoin: "DEEP", quoteCoin: "SUI" },
  },
  mainnetCoins: {
    SUI: { scalar: 1_000_000_000 },
    USDC: { scalar: 1_000_000 },
    DEEP: { scalar: 1_000_000 },
  },
}));

import {
  resolveLimitOrderQuantityBounds,
  validateLimitOrderQuantity,
} from "../src/trade/validate-limit-order-quantity.ts";

describe("validateLimitOrderQuantity (unit)", () => {
  beforeEach(() => {
    mockPoolBookParams.mockReset();
  });

  it("resolves min and lot base units for DEEP_SUI", async () => {
    mockPoolBookParams.mockResolvedValue({ minSize: 10, lotSize: 1, tickSize: 0.0001 });

    const bounds = await resolveLimitOrderQuantityBounds("DEEP_SUI");

    expect(bounds.minBaseUnits).toBe(10_000_000n);
    expect(bounds.lotBaseUnits).toBe(1_000_000n);
    expect(bounds.minSizeHuman).toBe(10);
    expect(bounds.baseAsset).toBe("DEEP");
  });

  it("accepts quantity at or above min_size for SUI_USDC", async () => {
    mockPoolBookParams.mockResolvedValue({ minSize: 1, lotSize: 0.1, tickSize: 0.0001 });

    await expect(
      validateLimitOrderQuantity({
        poolKey: "SUI_USDC",
        quantityBaseUnits: 1_000_000_000n,
      }),
    ).resolves.toMatchObject({ minBaseUnits: 1_000_000_000n });
  });

  it("rejects quantity below min_size for DEEP_SUI", async () => {
    mockPoolBookParams.mockResolvedValue({ minSize: 10, lotSize: 1, tickSize: 0.0001 });

    await expect(
      validateLimitOrderQuantity({
        poolKey: "DEEP_SUI",
        quantityBaseUnits: 1_000_000n,
      }),
    ).rejects.toThrow("Order quantity must be at least 10 DEEP");
  });

  it("rejects quantity not aligned to lot_size", async () => {
    mockPoolBookParams.mockResolvedValue({ minSize: 1, lotSize: 0.5, tickSize: 0.0001 });

    await expect(
      validateLimitOrderQuantity({
        poolKey: "SUI_USDC",
        quantityBaseUnits: 1_300_000_000n,
      }),
    ).rejects.toThrow("Order quantity must be a multiple of 0.5 SUI");
  });
});
