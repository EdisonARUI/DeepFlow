import { describe, expect, it } from "vitest";

import {
  inspectSupplyThenWithdraw,
  inspectSupplyWithdraw,
  simulateSupplyThenWithdraw,
  simulateSupplyWithdraw,
} from "../src/supply-withdraw.ts";

const shouldRun = process.env.RUN_MAINNET_INTEGRATION === "1";
const sender = process.env.INTEGRATION_SENDER;
const asset = process.env.INTEGRATION_ASSET ?? "USDC";
const supplyAmount = BigInt(process.env.INTEGRATION_AMOUNT ?? "1000");
const withdrawAmount = BigInt(process.env.INTEGRATION_WITHDRAW_AMOUNT ?? "100");

describe.skipIf(!shouldRun || !sender)("Suilend supply/withdraw mainnet integration", () => {
  it("builds supply PTB and dry-runs on mainnet", async () => {
    const result = await simulateSupplyWithdraw({
      protocol: "suilend",
      sender: sender!,
      asset,
      amount: supplyAmount,
      operation: "supply",
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("dryRun");
    // Dry run may fail when wallet lacks balance; PTB must not hit UnusedValueWithoutDrop.
    if (!result.ok) {
      expect(result.error).toBeTruthy();
      expect(result.error).not.toMatch(/UnusedValueWithoutDrop/i);
    }
  });

  it("builds supply PTB and devInspects on mainnet", async () => {
    const result = await inspectSupplyWithdraw({
      protocol: "suilend",
      sender: sender!,
      asset,
      amount: supplyAmount,
      operation: "supply",
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("devInspect");
  });

  it("builds withdraw PTB and dry-runs on mainnet", async () => {
    const result = await simulateSupplyWithdraw({
      protocol: "suilend",
      sender: sender!,
      asset,
      amount: withdrawAmount,
      operation: "withdraw",
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("dryRun");
  });

  it("builds withdraw PTB and devInspects on mainnet", async () => {
    const result = await inspectSupplyWithdraw({
      protocol: "suilend",
      sender: sender!,
      asset,
      amount: withdrawAmount,
      operation: "withdraw",
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("devInspect");
  });

  it("builds supply-then-withdraw PTB and dry-runs on mainnet", async () => {
    const result = await simulateSupplyThenWithdraw({
      protocol: "suilend",
      sender: sender!,
      asset,
      supplyAmount,
      withdrawAmount,
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("dryRun");
    expect(result.ok).toBe(true);
  });

  it("builds supply-then-withdraw PTB and devInspects on mainnet", async () => {
    const result = await inspectSupplyThenWithdraw({
      protocol: "suilend",
      sender: sender!,
      asset,
      supplyAmount,
      withdrawAmount,
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("devInspect");
  });
});
