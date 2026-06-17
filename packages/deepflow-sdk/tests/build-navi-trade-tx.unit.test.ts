import { Transaction } from "@mysten/sui/transactions";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockResolveNaviPoolKey = vi.fn();
const mockWithdrawCoinPTB = vi.fn();
const mockDepositCoinPTB = vi.fn();
const mockAppendNaviOraclePreamble = vi.fn();
const mockSwapExactQuantity = vi.fn();
const mockDeepBookContract = vi.fn();
const mockDeepBookConfig = vi.fn();

vi.mock("../src/credit-source/navi/resolve-navi-pool-key.ts", () => ({
  resolveNaviPoolKey: (...args: unknown[]) => mockResolveNaviPoolKey(...args),
}));

vi.mock("../src/credit-source/navi/append-navi-oracle-preamble.ts", () => ({
  appendNaviOraclePreamble: (...args: unknown[]) => mockAppendNaviOraclePreamble(...args),
}));

vi.mock("@naviprotocol/lending", () => ({
  withdrawCoinPTB: (...args: unknown[]) => mockWithdrawCoinPTB(...args),
  depositCoinPTB: (...args: unknown[]) => mockDepositCoinPTB(...args),
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

const { buildNaviTradeRoundTripTx } = await import(
  "../src/trade/build-navi-trade-round-trip-tx.ts"
);
const { buildNaviTradeReturnTx } = await import("../src/trade/build-navi-trade-return-tx.ts");

const SUI_COIN_TYPE =
  "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI";
const USDC_COIN_TYPE =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";
const DEEP_COIN_TYPE =
  "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e0b0f24e1db0cce460f04c285a::deep::DEEP";

describe("buildNaviTradeRoundTripTx (unit)", () => {
  const sender = "0xabc";
  const client = {} as never;
  const withdrawnCoin = { $kind: "withdrawnCoin" };
  const baseChange = { $kind: "baseChange" };
  const usdcCoin = { $kind: "usdcCoin" };
  const deepChange = { $kind: "deepChange" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveNaviPoolKey.mockImplementation(async (asset: string) =>
      asset === "SUI" ? SUI_COIN_TYPE : USDC_COIN_TYPE,
    );
    mockWithdrawCoinPTB.mockReturnValue(withdrawnCoin);
    mockDepositCoinPTB.mockResolvedValue(undefined);
    mockAppendNaviOraclePreamble.mockResolvedValue(undefined);
    mockSwapExactQuantity.mockReturnValue(() => [baseChange, usdcCoin, deepChange]);
  });

  it("runs oracle preamble → withdraw → swap → supply USDC in order", async () => {
    const tx = await buildNaviTradeRoundTripTx({
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
    expect(mockAppendNaviOraclePreamble.mock.invocationCallOrder[0]).toBeLessThan(
      mockWithdrawCoinPTB.mock.invocationCallOrder[0],
    );
    expect(mockWithdrawCoinPTB.mock.invocationCallOrder[0]).toBeLessThan(
      mockSwapExactQuantity.mock.invocationCallOrder[0],
    );
    expect(mockSwapExactQuantity.mock.invocationCallOrder[0]).toBeLessThan(
      mockDepositCoinPTB.mock.invocationCallOrder[0],
    );
    expect(mockDepositCoinPTB).toHaveBeenCalledWith(
      expect.any(Transaction),
      USDC_COIN_TYPE,
      usdcCoin,
      expect.objectContaining({ env: "prod", market: "main" }),
    );
  });

  it("deposits DEEP output (baseResult) when swapping SUI to DEEP on DEEP_SUI", async () => {
    const deepOutput = { $kind: "deepOutput" };
    const suiChange = { $kind: "suiChange" };
    mockResolveNaviPoolKey.mockImplementation(async (asset: string) =>
      asset === "SUI" ? SUI_COIN_TYPE : DEEP_COIN_TYPE,
    );
    mockSwapExactQuantity.mockReturnValue(() => [deepOutput, suiChange, deepChange]);

    await buildNaviTradeRoundTripTx({
      sender,
      poolKey: "DEEP_SUI",
      inputAsset: "SUI",
      outputAsset: "DEEP",
      inputAmount: 1_000_000_000n,
      minOutput: 10_000_000n,
      deepAmount: 0,
      client,
    });

    expect(mockSwapExactQuantity).toHaveBeenCalledWith(
      expect.objectContaining({
        poolKey: "DEEP_SUI",
        isBaseToCoin: false,
        quoteCoin: withdrawnCoin,
      }),
    );
    expect(mockDepositCoinPTB).toHaveBeenCalledWith(
      expect.any(Transaction),
      DEEP_COIN_TYPE,
      deepOutput,
      expect.objectContaining({ env: "prod", market: "main" }),
    );
  });
});

describe("buildNaviTradeReturnTx (unit)", () => {
  const sender = "0xabc";
  const client = {} as never;
  const withdrawnCoin = { $kind: "withdrawnCoin" };
  const baseChange = { $kind: "baseChange" };
  const usdcCoin = { $kind: "usdcCoin" };
  const deepChange = { $kind: "deepChange" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveNaviPoolKey.mockResolvedValue(SUI_COIN_TYPE);
    mockWithdrawCoinPTB.mockReturnValue(withdrawnCoin);
    mockAppendNaviOraclePreamble.mockResolvedValue(undefined);
    mockSwapExactQuantity.mockReturnValue(() => [baseChange, usdcCoin, deepChange]);
  });

  it("runs oracle preamble → withdraw → swap without NAVI deposit", async () => {
    const tx = await buildNaviTradeReturnTx({
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
    expect(mockAppendNaviOraclePreamble).toHaveBeenCalledWith(
      expect.any(Transaction),
      sender,
      ["SUI"],
      client,
    );
    expect(mockWithdrawCoinPTB).toHaveBeenCalled();
    expect(mockSwapExactQuantity).toHaveBeenCalled();
  });
});
