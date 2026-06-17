import { Transaction } from "@mysten/sui/transactions";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockResolveNaviPoolKey = vi.fn();
const mockGetPool = vi.fn();
const mockGetCoins = vi.fn();
const mockMergeCoinsPTB = vi.fn();
const mockSwapExactQuantity = vi.fn();
const mockDeepBookContract = vi.fn();
const mockDeepBookConfig = vi.fn();

vi.mock("../src/credit-source/navi/resolve-navi-pool-key.ts", () => ({
  resolveNaviPoolKey: (...args: unknown[]) => mockResolveNaviPoolKey(...args),
}));

vi.mock("@naviprotocol/lending", () => ({
  getPool: (...args: unknown[]) => mockGetPool(...args),
  getCoins: (...args: unknown[]) => mockGetCoins(...args),
  mergeCoinsPTB: (...args: unknown[]) => mockMergeCoinsPTB(...args),
}));

vi.mock("@mysten/deepbook-v3", () => ({
  mainnetPools: {
    SUI_USDC: { baseCoin: "SUI", quoteCoin: "USDC" },
    DEEP_USDC: { baseCoin: "DEEP", quoteCoin: "USDC" },
    DEEP_SUI: { baseCoin: "DEEP", quoteCoin: "SUI" },
  },
  mainnetCoins: {
    SUI: { scalar: 1_000_000_000 },
    USDC: { scalar: 1_000_000 },
    DEEP: { scalar: 1_000_000 },
  },
  DeepBookConfig: class {
    constructor(...args: unknown[]) {
      mockDeepBookConfig(...args);
    }
  },
  DeepBookContract: class {
    swapExactQuantity = (...args: unknown[]) => mockSwapExactQuantity(...args);
    constructor(...args: unknown[]) {
      mockDeepBookContract(...args);
    }
  },
}));

const { buildTradeWalletSwapTx } = await import("../src/trade/build-trade-wallet-swap-tx.ts");

const SUI_COIN_TYPE =
  "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI";
const DEEP_COIN_TYPE =
  "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e0b0f24e1db0cce460f04c285a::deep::DEEP";

describe("buildTradeWalletSwapTx (unit)", () => {
  const sender = "0xabc";
  const client = {} as never;
  const inputCoinArg = { $kind: "inputCoin" };
  const baseChange = { $kind: "baseChange" };
  const outputCoin = { $kind: "outputCoin" };
  const deepChange = { $kind: "deepChange" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveNaviPoolKey.mockImplementation(async (asset: string) =>
      asset === "DEEP" ? DEEP_COIN_TYPE : SUI_COIN_TYPE,
    );
    mockGetPool.mockImplementation(async () => ({
      suiCoinType: SUI_COIN_TYPE,
      token: { symbol: "SUI" },
    }));
    mockGetCoins.mockResolvedValue(["0xcoin"]);
    mockMergeCoinsPTB.mockReturnValue(inputCoinArg);
    mockSwapExactQuantity.mockReturnValue(() => [baseChange, outputCoin, deepChange]);
  });

  it("merges wallet SUI, swaps SUI_USDC, and transfers output to sender", async () => {
    const tx = await buildTradeWalletSwapTx({
      sender,
      poolKey: "SUI_USDC",
      inputAsset: "SUI",
      outputAsset: "USDC",
      inputAmount: 10_000_000_000n,
      minOutput: 20_000_000n,
      deepAmount: 0,
      client,
    });

    expect(tx).toBeInstanceOf(Transaction);
    expect(mockMergeCoinsPTB.mock.invocationCallOrder[0]).toBeLessThan(
      mockSwapExactQuantity.mock.invocationCallOrder[0],
    );
    expect(mockSwapExactQuantity).toHaveBeenCalledWith({
      poolKey: "SUI_USDC",
      isBaseToCoin: true,
      baseCoin: inputCoinArg,
      amount: 10_000_000_000n,
      minOut: 20_000_000n,
      deepAmount: 0,
    });
  });

  it("swaps DEEP_SUI with quoteCoin when selling SUI for DEEP", async () => {
    await buildTradeWalletSwapTx({
      sender,
      poolKey: "DEEP_SUI",
      inputAsset: "SUI",
      outputAsset: "DEEP",
      inputAmount: 1_000_000_000n,
      minOutput: 10_000_000n,
      deepAmount: 0,
      client,
    });

    expect(mockResolveNaviPoolKey).toHaveBeenCalledWith("SUI");
    expect(mockSwapExactQuantity).toHaveBeenCalledWith({
      poolKey: "DEEP_SUI",
      isBaseToCoin: false,
      quoteCoin: inputCoinArg,
      amount: 1_000_000_000n,
      minOut: 10_000_000n,
      deepAmount: 0,
    });
    expect(mockSwapExactQuantity).not.toHaveBeenCalledWith(
      expect.objectContaining({ baseCoin: inputCoinArg }),
    );
  });

  it("swaps DEEP_USDC with isBaseToCoin true when selling DEEP", async () => {
    mockGetPool.mockImplementation(async () => ({
      suiCoinType: DEEP_COIN_TYPE,
      token: { symbol: "DEEP" },
    }));

    await buildTradeWalletSwapTx({
      sender,
      poolKey: "DEEP_USDC",
      inputAsset: "DEEP",
      outputAsset: "USDC",
      inputAmount: 1_000_000n,
      minOutput: 290_000n,
      deepAmount: 0,
      client,
    });

    expect(mockResolveNaviPoolKey).toHaveBeenCalledWith("DEEP");
    expect(mockSwapExactQuantity).toHaveBeenCalledWith(
      expect.objectContaining({
        poolKey: "DEEP_USDC",
        isBaseToCoin: true,
        baseCoin: inputCoinArg,
      }),
    );
  });
});
