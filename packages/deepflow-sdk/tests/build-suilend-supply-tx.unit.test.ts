import { describe, expect, it } from "vitest";

import { buildSuilendSupplyTx } from "../src/credit-source/suilend/build-suilend-supply-tx.ts";
import { resetSuilendExecutionContextCache } from "../src/credit-source/suilend/create-suilend-client.ts";
import { simulateSupplyWithdraw } from "../src/supply-withdraw.ts";

const shouldRun = process.env.RUN_MAINNET_INTEGRATION === "1";
const sender = process.env.INTEGRATION_SENDER;

describe("buildSuilendSupplyTx", () => {
  it("rejects non-positive amount without hitting network", async () => {
    await expect(
      buildSuilendSupplyTx({
        sender: "0x0",
        asset: "USDC",
        amount: 0n,
      }),
    ).rejects.toThrow(/positive/i);
  });
});

describe.skipIf(!shouldRun || !sender)("buildSuilendSupplyTx mainnet smoke", () => {
  it("builds supply PTB and dry-runs on mainnet", async () => {
    resetSuilendExecutionContextCache();

    const result = await simulateSupplyWithdraw({
      protocol: "suilend",
      sender: sender!,
      asset: process.env.INTEGRATION_ASSET ?? "USDC",
      amount: BigInt(process.env.INTEGRATION_AMOUNT ?? "1000"),
      operation: "supply",
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("dryRun");
    expect(result.ok).toBe(true);
  });
});
