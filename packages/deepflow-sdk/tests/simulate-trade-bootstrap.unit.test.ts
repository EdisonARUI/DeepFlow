import { Transaction } from "@mysten/sui/transactions";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockBuildTradeBootstrapTx = vi.fn();
const mockDryRunTransaction = vi.fn();
const mockDevInspectTransaction = vi.fn();
const mockCreateSuiJsonRpcClient = vi.fn();
const mockCreateSuiGrpcClient = vi.fn();

vi.mock("../src/trade/build-trade-bootstrap-tx.ts", () => ({
  buildTradeBootstrapTx: (...args: unknown[]) => mockBuildTradeBootstrapTx(...args),
}));

vi.mock("../src/simulation/simulate-transaction.ts", () => ({
  dryRunTransaction: (...args: unknown[]) => mockDryRunTransaction(...args),
  devInspectTransaction: (...args: unknown[]) => mockDevInspectTransaction(...args),
}));

vi.mock("../src/sui/client.ts", () => ({
  createSuiJsonRpcClient: () => mockCreateSuiJsonRpcClient(),
  createSuiGrpcClient: () => mockCreateSuiGrpcClient(),
}));

const { simulateTradeBootstrap, inspectTradeBootstrap } = await import(
  "../src/trade/simulate-trade-bootstrap.ts"
);

describe("simulateTradeBootstrap (unit)", () => {
  const sender = "0xabc";
  const params = {
    sender,
    suiAmount: 10_000_000_000n,
    minUsdcOut: 20_000_000n,
    deepAmount: 0,
    deepbookPoolKey: "SUI_USDC",
  };
  const mockTx = new Transaction();
  const mockGrpcClient = { core: {} };

  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildTradeBootstrapTx.mockResolvedValue(mockTx);
    mockCreateSuiJsonRpcClient.mockReturnValue({});
    mockCreateSuiGrpcClient.mockReturnValue(mockGrpcClient);
    mockDryRunTransaction.mockResolvedValue({ ok: true, mode: "dryRun", status: "Transaction" });
    mockDevInspectTransaction.mockResolvedValue({
      ok: true,
      mode: "devInspect",
      status: "Transaction",
    });
  });

  it("builds bootstrap PTB and dry-runs", async () => {
    const result = await simulateTradeBootstrap(params);

    expect(mockBuildTradeBootstrapTx).toHaveBeenCalledWith({
      ...params,
      client: {},
    });
    expect(mockDryRunTransaction).toHaveBeenCalledWith({
      client: mockGrpcClient,
      transaction: mockTx,
    });
    expect(result.ok).toBe(true);
    expect(result.transaction).toBe(mockTx);
    expect(result.mode).toBe("dryRun");
  });

  it("builds bootstrap PTB and devInspects", async () => {
    const result = await inspectTradeBootstrap(params);

    expect(mockDevInspectTransaction).toHaveBeenCalledWith({
      client: mockGrpcClient,
      transaction: mockTx,
    });
    expect(result.ok).toBe(true);
    expect(result.mode).toBe("devInspect");
  });

  it("propagates dry-run failure", async () => {
    mockDryRunTransaction.mockResolvedValue({
      ok: false,
      mode: "dryRun",
      error: "Insufficient DEEP",
    });

    const result = await simulateTradeBootstrap(params);

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Insufficient DEEP");
  });
});
