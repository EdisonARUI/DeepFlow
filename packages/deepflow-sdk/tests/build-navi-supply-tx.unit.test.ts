import { Transaction } from "@mysten/sui/transactions";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockResolveNaviPoolKey = vi.fn();
const mockGetPool = vi.fn();
const mockGetCoins = vi.fn();
const mockMergeCoinsPTB = vi.fn();
const mockDepositCoinPTB = vi.fn();
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
}));

const { buildNaviSupplyTx } = await import("../src/credit-source/navi/build-navi-supply-tx.ts");

const USDC_COIN_TYPE =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";

describe("buildNaviSupplyTx (unit)", () => {
  const sender = "0xabc";
  const client = {} as never;
  const coinArg = { $kind: "coin" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveNaviPoolKey.mockResolvedValue(USDC_COIN_TYPE);
    mockGetPool.mockResolvedValue({
      suiCoinType: USDC_COIN_TYPE,
      token: { symbol: "USDC" },
    });
    mockGetCoins.mockResolvedValue(["0xcoin"]);
    mockMergeCoinsPTB.mockReturnValue(coinArg);
    mockAppendNaviOraclePreamble.mockResolvedValue(undefined);
    mockDepositCoinPTB.mockResolvedValue(undefined);
  });

  it("resolves symbol and uses suiCoinType for pool lookup and deposit", async () => {
    const tx = await buildNaviSupplyTx({
      sender,
      asset: "USDC",
      amount: 1_000_000n,
      client,
    });

    expect(mockResolveNaviPoolKey).toHaveBeenCalledWith("USDC");
    expect(mockGetPool).toHaveBeenCalledWith(USDC_COIN_TYPE, {
      env: "prod",
      market: "main",
    });
    expect(mockGetCoins).toHaveBeenCalledWith(sender, {
      coinType: USDC_COIN_TYPE,
      client,
    });
    expect(mockDepositCoinPTB).toHaveBeenCalledWith(
      expect.any(Transaction),
      USDC_COIN_TYPE,
      coinArg,
      expect.objectContaining({ env: "prod", market: "main", amount: 1_000_000 }),
    );
    expect(tx).toBeInstanceOf(Transaction);
  });

  it("uses useGasCoin when supplying native SUI", async () => {
    const SUI_COIN_TYPE = "0x2::sui::SUI";
    mockResolveNaviPoolKey.mockResolvedValue(SUI_COIN_TYPE);
    mockGetPool.mockResolvedValue({
      suiCoinType: SUI_COIN_TYPE,
      token: { symbol: "SUI" },
    });
    mockGetCoins.mockResolvedValue(["0xsui"]);

    await buildNaviSupplyTx({
      sender,
      asset: "SUI",
      amount: 10_000_000_000n,
      client,
    });

    expect(mockMergeCoinsPTB).toHaveBeenCalledWith(expect.any(Transaction), ["0xsui"], {
      balance: 10_000_000_000,
      useGasCoin: true,
    });
  });

  it("throws a symbol-based error when wallet has no coins", async () => {
    mockGetCoins.mockResolvedValue([]);

    await expect(
      buildNaviSupplyTx({
        sender,
        asset: USDC_COIN_TYPE,
        assetSymbol: "USDC",
        amount: 1_000_000n,
        client,
      }),
    ).rejects.toThrow("No USDC coins in wallet for sender 0xabc");
  });
});
