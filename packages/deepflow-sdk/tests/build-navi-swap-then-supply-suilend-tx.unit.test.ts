import { Transaction } from "@mysten/sui/transactions";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockResolveNaviPoolKey = vi.fn();
const mockWithdrawCoinPTB = vi.fn();
const mockAppendNaviOraclePreamble = vi.fn();
const mockAppendSuilendDeposit = vi.fn();
const mockSwapExactQuantity = vi.fn();
const mockDeepBookContract = vi.fn();
const mockDeepBookConfig = vi.fn();

vi.mock("../src/credit-source/navi/resolve-navi-pool-key.ts", () => ({
  resolveNaviPoolKey: (...args: unknown[]) => mockResolveNaviPoolKey(...args),
}));

vi.mock("../src/credit-source/navi/append-navi-oracle-preamble.ts", () => ({
  appendNaviOraclePreamble: (...args: unknown[]) => mockAppendNaviOraclePreamble(...args),
}));

vi.mock("../src/credit-source/suilend/append-suilend-swap-leg.ts", () => ({
  appendSuilendDeposit: (...args: unknown[]) => mockAppendSuilendDeposit(...args),
}));

vi.mock("@naviprotocol/lending", () => ({
  withdrawCoinPTB: (...args: unknown[]) => mockWithdrawCoinPTB(...args),
}));

vi.mock("@mysten/deepbook-v3", () => ({
  mainnetPools: {
    SUI_USDC: { baseCoin: "SUI", quoteCoin: "USDC" },
  },
  mainnetCoins: {
    SUI: { scalar: 1_000_000_000 },
    USDC: { scalar: 1_000_000 },
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

const { buildNaviSwapThenSupplySuilendTx } = await import(
  "../src/trade/build-navi-swap-then-supply-suilend-tx.ts"
);

const SUI_COIN_TYPE =
  "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI";

describe("buildNaviSwapThenSupplySuilendTx (unit)", () => {
  const sender = "0xabc";
  const client = {} as never;
  const withdrawnCoin = { $kind: "withdrawnCoin" };
  const inputChange = { $kind: "inputChange" };
  const outputCoin = { $kind: "outputCoin" };
  const deepChange = { $kind: "deepChange" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveNaviPoolKey.mockResolvedValue(SUI_COIN_TYPE);
    mockWithdrawCoinPTB.mockReturnValue(withdrawnCoin);
    mockAppendNaviOraclePreamble.mockResolvedValue(undefined);
    mockAppendSuilendDeposit.mockResolvedValue(undefined);
    mockSwapExactQuantity.mockReturnValue(() => [inputChange, outputCoin, deepChange]);
  });

  it("runs oracle preamble before NAVI withdraw and ends with Suilend deposit", async () => {
    const tx = await buildNaviSwapThenSupplySuilendTx({
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
      mockAppendSuilendDeposit.mock.invocationCallOrder[0],
    );
    expect(mockAppendSuilendDeposit).toHaveBeenCalledWith(
      expect.any(Transaction),
      expect.objectContaining({
        outputAsset: "USDC",
        allowCreateObligation: true,
      }),
    );
  });
});
