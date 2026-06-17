import { Transaction } from "@mysten/sui/transactions";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockAppendSuilendWithdraw = vi.fn();
const mockAppendSuilendDeposit = vi.fn();
const mockSwapExactQuantity = vi.fn();
const mockDeepBookContract = vi.fn();
const mockDeepBookConfig = vi.fn();

vi.mock("../src/credit-source/suilend/append-suilend-swap-leg.ts", () => ({
  appendSuilendWithdraw: (...args: unknown[]) => mockAppendSuilendWithdraw(...args),
  appendSuilendDeposit: (...args: unknown[]) => mockAppendSuilendDeposit(...args),
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

const { buildSuilendTradeRoundTripTx } = await import(
  "../src/trade/build-suilend-trade-round-trip-tx.ts"
);

describe("buildSuilendTradeRoundTripTx (unit)", () => {
  const sender = "0xabc";
  const client = {} as never;
  const withdrawnCoin = { $kind: "withdrawnCoin" };
  const inputChange = { $kind: "inputChange" };
  const outputCoin = { $kind: "outputCoin" };
  const deepChange = { $kind: "deepChange" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAppendSuilendWithdraw.mockResolvedValue(withdrawnCoin);
    mockAppendSuilendDeposit.mockResolvedValue(undefined);
    mockSwapExactQuantity.mockReturnValue(() => [inputChange, outputCoin, deepChange]);
  });

  it("runs suilend withdraw → swap → suilend deposit in order", async () => {
    const tx = await buildSuilendTradeRoundTripTx({
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
    expect(mockAppendSuilendWithdraw.mock.invocationCallOrder[0]).toBeLessThan(
      mockSwapExactQuantity.mock.invocationCallOrder[0],
    );
    expect(mockSwapExactQuantity.mock.invocationCallOrder[0]).toBeLessThan(
      mockAppendSuilendDeposit.mock.invocationCallOrder[0],
    );
    expect(mockAppendSuilendDeposit).toHaveBeenCalledWith(
      expect.any(Transaction),
      expect.objectContaining({
        sender,
        outputAsset: "USDC",
        outputCoin,
        allowCreateObligation: false,
      }),
    );
  });
});
