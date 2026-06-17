import { Transaction } from "@mysten/sui/transactions";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockResolveNaviPoolKey = vi.fn();
const mockGetPool = vi.fn();
const mockGetCoins = vi.fn();
const mockMergeCoinsPTB = vi.fn();
const mockDepositCoinPTB = vi.fn();
const mockWithdrawCoinPTB = vi.fn();
const mockAppendNaviOraclePreamble = vi.fn();

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
  withdrawCoinPTB: (...args: unknown[]) => mockWithdrawCoinPTB(...args),
}));

const { buildNaviSupplyThenWithdrawTx } = await import(
  "../src/credit-source/navi/build-navi-supply-then-withdraw-tx.ts"
);

const SUI_COIN_TYPE =
  "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI";

describe("buildNaviSupplyThenWithdrawTx (unit)", () => {
  const sender = "0xabc";
  const client = {} as never;
  const coinArg = { $kind: "coin" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveNaviPoolKey.mockResolvedValue(SUI_COIN_TYPE);
    mockGetPool.mockResolvedValue({
      suiCoinType: SUI_COIN_TYPE,
      token: { symbol: "SUI" },
    });
    mockGetCoins.mockResolvedValue(["0xsui"]);
    mockMergeCoinsPTB.mockReturnValue(coinArg);
    mockAppendNaviOraclePreamble.mockResolvedValue(undefined);
    mockDepositCoinPTB.mockResolvedValue(undefined);
    mockWithdrawCoinPTB.mockReturnValue({ $kind: "withdrawnCoin" });
  });

  it("deposits then withdraws on the same transaction", async () => {
    const tx = await buildNaviSupplyThenWithdrawTx({
      sender,
      asset: "SUI",
      supplyAmount: 10_000_000_000n,
      withdrawAmount: 10_000_000_000n,
      client,
    });

    expect(tx).toBeInstanceOf(Transaction);
    expect(mockDepositCoinPTB.mock.invocationCallOrder[0]).toBeLessThan(
      mockWithdrawCoinPTB.mock.invocationCallOrder[0],
    );
    expect(mockDepositCoinPTB).toHaveBeenCalledWith(
      expect.any(Transaction),
      SUI_COIN_TYPE,
      coinArg,
      expect.objectContaining({ env: "prod", market: "main", amount: 10_000_000_000 }),
    );
    expect(mockWithdrawCoinPTB).toHaveBeenCalledWith(
      expect.any(Transaction),
      SUI_COIN_TYPE,
      10_000_000_000,
      expect.objectContaining({ env: "prod", market: "main" }),
    );
  });

  it("uses useGasCoin for native SUI supply leg", async () => {
    await buildNaviSupplyThenWithdrawTx({
      sender,
      asset: "SUI",
      supplyAmount: 10_000_000_000n,
      withdrawAmount: 5_000_000_000n,
      client,
    });

    expect(mockMergeCoinsPTB).toHaveBeenCalledWith(expect.any(Transaction), ["0xsui"], {
      balance: 10_000_000_000,
      useGasCoin: true,
    });
  });

  it("rejects withdraw amount greater than supply amount", async () => {
    await expect(
      buildNaviSupplyThenWithdrawTx({
        sender,
        asset: "SUI",
        supplyAmount: 5_000_000_000n,
        withdrawAmount: 10_000_000_000n,
        client,
      }),
    ).rejects.toThrow("withdraw amount cannot exceed supply amount");
  });
});
