import { Transaction } from "@mysten/sui/transactions";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockBuildNaviSupplyTx = vi.fn();
const mockBuildNaviWithdrawTx = vi.fn();
const mockBuildNaviSupplyThenWithdrawTx = vi.fn();
const mockDryRunTransaction = vi.fn();
const mockCreateSuiJsonRpcClient = vi.fn();
const mockCreateSuiGrpcClient = vi.fn();

vi.mock("../src/credit-source/navi/build-navi-supply-tx.ts", () => ({
  buildNaviSupplyTx: (...args: unknown[]) => mockBuildNaviSupplyTx(...args),
}));

vi.mock("../src/credit-source/navi/build-navi-withdraw-tx.ts", () => ({
  buildNaviWithdrawTx: (...args: unknown[]) => mockBuildNaviWithdrawTx(...args),
}));

vi.mock("../src/credit-source/navi/build-navi-supply-then-withdraw-tx.ts", () => ({
  buildNaviSupplyThenWithdrawTx: (...args: unknown[]) =>
    mockBuildNaviSupplyThenWithdrawTx(...args),
}));

vi.mock("../src/simulation/simulate-transaction.ts", () => ({
  dryRunTransaction: (...args: unknown[]) => mockDryRunTransaction(...args),
  devInspectTransaction: vi.fn(),
}));

vi.mock("../src/sui/client.ts", () => ({
  createSuiJsonRpcClient: () => mockCreateSuiJsonRpcClient(),
  createSuiGrpcClient: () => mockCreateSuiGrpcClient(),
}));

const { simulateSupplyThenWithdraw, simulateSupplyWithdraw } = await import(
  "../src/supply-withdraw.ts"
);

describe("simulateSupplyWithdraw (unit)", () => {
  const sender = "0xabc";
  const asset = "USDC";
  const amount = 1_000_000n;
  const mockTx = new Transaction();
  const mockGrpcClient = { core: {} };

  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildNaviSupplyTx.mockResolvedValue(mockTx);
    mockBuildNaviWithdrawTx.mockResolvedValue(mockTx);
    mockBuildNaviSupplyThenWithdrawTx.mockResolvedValue(mockTx);
    mockCreateSuiJsonRpcClient.mockReturnValue({});
    mockCreateSuiGrpcClient.mockReturnValue(mockGrpcClient);
    mockDryRunTransaction.mockResolvedValue({ ok: true, mode: "dryRun", status: "Transaction" });
  });

  it("builds supply PTB and dry-runs", async () => {
    const result = await simulateSupplyWithdraw({
      sender,
      asset,
      amount,
      operation: "supply",
    });

    expect(mockBuildNaviSupplyTx).toHaveBeenCalledWith({
      sender,
      asset,
      amount,
      client: {},
    });
    expect(mockBuildNaviWithdrawTx).not.toHaveBeenCalled();
    expect(mockDryRunTransaction).toHaveBeenCalledWith({
      client: mockGrpcClient,
      transaction: mockTx,
    });
    expect(result.ok).toBe(true);
    expect(result.transaction).toBe(mockTx);
    expect(result.mode).toBe("dryRun");
  });

  it("builds withdraw PTB and dry-runs", async () => {
    const result = await simulateSupplyWithdraw({
      sender,
      asset,
      amount,
      operation: "withdraw",
    });

    expect(mockBuildNaviWithdrawTx).toHaveBeenCalledWith({
      sender,
      asset,
      amount,
      client: {},
    });
    expect(mockBuildNaviSupplyTx).not.toHaveBeenCalled();
    expect(result.ok).toBe(true);
    expect(result.transaction).toBe(mockTx);
  });

  it("propagates dry-run failure", async () => {
    mockDryRunTransaction.mockResolvedValue({
      ok: false,
      mode: "dryRun",
      error: "Insufficient balance",
    });

    const result = await simulateSupplyWithdraw({
      sender,
      asset,
      amount,
      operation: "supply",
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Insufficient balance");
    expect(result.transaction).toBe(mockTx);
  });

  it("propagates PTB build errors", async () => {
    mockBuildNaviSupplyTx.mockRejectedValue(new Error("No USDC coins found"));

    await expect(
      simulateSupplyWithdraw({
        sender,
        asset,
        amount,
        operation: "supply",
      }),
    ).rejects.toThrow("No USDC coins found");
  });

  it("builds supply-then-withdraw PTB and dry-runs", async () => {
    const result = await simulateSupplyThenWithdraw({
      sender,
      asset,
      supplyAmount: amount,
      withdrawAmount: amount,
    });

    expect(mockBuildNaviSupplyThenWithdrawTx).toHaveBeenCalledWith({
      sender,
      asset,
      supplyAmount: amount,
      withdrawAmount: amount,
      client: {},
    });
    expect(mockBuildNaviSupplyTx).not.toHaveBeenCalled();
    expect(mockBuildNaviWithdrawTx).not.toHaveBeenCalled();
    expect(result.ok).toBe(true);
    expect(result.transaction).toBe(mockTx);
  });
});
