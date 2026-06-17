import { Transaction } from "@mysten/sui/transactions";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockResolveNaviPoolKey = vi.fn();
const mockGetPool = vi.fn();
const mockGetCoins = vi.fn();
const mockMergeCoinsPTB = vi.fn();
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
  getPool: (...args: unknown[]) => mockGetPool(...args),
  getCoins: (...args: unknown[]) => mockGetCoins(...args),
  mergeCoinsPTB: (...args: unknown[]) => mockMergeCoinsPTB(...args),
  depositCoinPTB: (...args: unknown[]) => mockDepositCoinPTB(...args),
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

const { buildWalletSwapThenSupplyTx } = await import(
  "../src/trade/build-wallet-swap-then-supply-tx.ts"
);

const SUI_COIN_TYPE =
  "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI";
const USDC_COIN_TYPE =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";

describe("buildWalletSwapThenSupplyTx (unit)", () => {
  const sender = "0xabc";
  const client = {} as never;
  const suiCoinArg = { $kind: "suiCoin" };
  const baseChange = { $kind: "baseChange" };
  const usdcCoin = { $kind: "usdcCoin" };
  const deepChange = { $kind: "deepChange" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveNaviPoolKey.mockImplementation(async (asset: string) =>
      asset === "SUI" ? SUI_COIN_TYPE : USDC_COIN_TYPE,
    );
    mockGetPool.mockResolvedValue({
      suiCoinType: SUI_COIN_TYPE,
      token: { symbol: "SUI" },
    });
    mockGetCoins.mockResolvedValue(["0xsui"]);
    mockMergeCoinsPTB.mockReturnValue(suiCoinArg);
    mockAppendNaviOraclePreamble.mockResolvedValue(undefined);
    mockDepositCoinPTB.mockResolvedValue(undefined);
    mockSwapExactQuantity.mockReturnValue(() => [baseChange, usdcCoin, deepChange]);
  });

  it("runs wallet merge → swap → oracle preamble → NAVI supply USDC", async () => {
    const tx = await buildWalletSwapThenSupplyTx({
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
    expect(mockSwapExactQuantity.mock.invocationCallOrder[0]).toBeLessThan(
      mockAppendNaviOraclePreamble.mock.invocationCallOrder[0],
    );
    expect(mockAppendNaviOraclePreamble.mock.invocationCallOrder[0]).toBeLessThan(
      mockDepositCoinPTB.mock.invocationCallOrder[0],
    );
    expect(mockAppendNaviOraclePreamble).toHaveBeenCalledWith(
      expect.any(Transaction),
      sender,
      ["USDC"],
      client,
    );
    expect(mockDepositCoinPTB).toHaveBeenCalledWith(
      expect.any(Transaction),
      USDC_COIN_TYPE,
      usdcCoin,
      expect.objectContaining({ env: "prod", market: "main" }),
    );
  });
});
