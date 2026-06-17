import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetPools = vi.fn();

vi.mock("@naviprotocol/lending", () => ({
  getPools: (...args: unknown[]) => mockGetPools(...args),
}));

const { resolveNaviPoolKey } = await import("../src/credit-source/navi/resolve-navi-pool-key.ts");

const USDC_COIN_TYPE =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";

describe("resolveNaviPoolKey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPools.mockResolvedValue([
      {
        market: "main",
        token: { symbol: "USDC", decimals: 6 },
        suiCoinType: USDC_COIN_TYPE,
      },
      {
        market: "main",
        token: { symbol: "SUI", decimals: 9 },
        suiCoinType: "0x2::sui::SUI",
      },
    ]);
  });

  it("returns coin type unchanged when input already contains ::", async () => {
    await expect(resolveNaviPoolKey(USDC_COIN_TYPE)).resolves.toBe(USDC_COIN_TYPE);
    expect(mockGetPools).not.toHaveBeenCalled();
  });

  it("resolves symbol to suiCoinType", async () => {
    await expect(resolveNaviPoolKey("USDC")).resolves.toBe(USDC_COIN_TYPE);
    expect(mockGetPools).toHaveBeenCalledWith({
      env: "prod",
      markets: ["main"],
      cacheTime: 30_000,
    });
  });

  it("matches symbols case-insensitively", async () => {
    await expect(resolveNaviPoolKey("usdc")).resolves.toBe(USDC_COIN_TYPE);
  });

  it("throws when symbol is not found", async () => {
    await expect(resolveNaviPoolKey("UNKNOWN")).rejects.toThrow(
      "NAVI pool not found for asset: UNKNOWN",
    );
  });
});
