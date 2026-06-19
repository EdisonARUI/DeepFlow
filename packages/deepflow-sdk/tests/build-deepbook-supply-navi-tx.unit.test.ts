import { Transaction } from "@mysten/sui/transactions";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockResolveNaviPoolKey = vi.fn();
const mockGetPool = vi.fn();
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
  depositCoinPTB: (...args: unknown[]) => mockDepositCoinPTB(...args),
}));

const { buildDeepbookSupplyNaviTx } = await import(
  "../src/supply-withdraw/build-deepbook-supply-navi-tx.ts"
);

const USDC_COIN_TYPE =
  "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC";
const DEEP_COIN_TYPE =
  "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP";
const MANAGER_ID =
  "0x0000000000000000000000000000000000000000000000000000000000000abc";

describe("buildDeepbookSupplyNaviTx (unit)", () => {
  const sender = "0x0000000000000000000000000000000000000000000000000000000000000001";
  const client = {} as never;

  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveNaviPoolKey.mockResolvedValue(USDC_COIN_TYPE);
    mockGetPool.mockResolvedValue({
      suiCoinType: USDC_COIN_TYPE,
      token: { symbol: "USDC" },
    });
    mockAppendNaviOraclePreamble.mockResolvedValue(undefined);
    mockDepositCoinPTB.mockResolvedValue(undefined);
  });

  it("builds balance_manager withdraw followed by NAVI deposit", async () => {
    const tx = await buildDeepbookSupplyNaviTx({
      sender,
      asset: "USDC",
      amount: 1_000_000n,
      managerId: MANAGER_ID,
      client,
    });

    expect(mockDepositCoinPTB).toHaveBeenCalledWith(
      expect.any(Transaction),
      USDC_COIN_TYPE,
      expect.anything(),
      expect.objectContaining({ env: "prod", market: "main", amount: 1_000_000 }),
    );
    expect(mockAppendNaviOraclePreamble).toHaveBeenCalledWith(
      expect.any(Transaction),
      sender,
      ["USDC"],
      client,
    );
    expect(tx).toBeInstanceOf(Transaction);
  });

  it("resolves DeepBook coin via assetSymbol when asset is a coin type", async () => {
    mockResolveNaviPoolKey.mockResolvedValue(DEEP_COIN_TYPE);
    mockGetPool.mockResolvedValue({
      suiCoinType: DEEP_COIN_TYPE,
      token: { symbol: "DEEP" },
    });

    const tx = await buildDeepbookSupplyNaviTx({
      sender,
      asset: DEEP_COIN_TYPE,
      assetSymbol: "DEEP",
      amount: 20_000_000n,
      managerId: MANAGER_ID,
      client,
    });

    expect(mockDepositCoinPTB).toHaveBeenCalledWith(
      expect.any(Transaction),
      DEEP_COIN_TYPE,
      expect.anything(),
      expect.objectContaining({ env: "prod", market: "main", amount: 20_000_000 }),
    );
    expect(mockAppendNaviOraclePreamble).toHaveBeenCalledWith(
      expect.any(Transaction),
      sender,
      ["DEEP"],
      client,
    );
    expect(tx).toBeInstanceOf(Transaction);
  });
});
