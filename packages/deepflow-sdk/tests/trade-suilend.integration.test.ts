import { mainnetCoins } from "@mysten/deepbook-v3";
import { describe, expect, it } from "vitest";

import { createDeepbookClient } from "../src/sui/deepbook-client.ts";
import { simulateTradeSuilendReturn } from "../src/trade/simulate-trade-suilend.ts";
import { simulateTradeWalletSuilend } from "../src/trade/simulate-trade-suilend.ts";

const shouldRun = process.env.RUN_MAINNET_INTEGRATION === "1";
const sender = process.env.INTEGRATION_SENDER;
const inputAmount = BigInt(process.env.INTEGRATION_AMOUNT ?? "10000000000");
const poolKey = "SUI_USDC";
const slippageBps = 50;

function humanAmountFromBaseUnits(amount: bigint, asset: string): number {
  const scalar = mainnetCoins[asset as keyof typeof mainnetCoins]?.scalar ?? 1e9;
  return Number(amount) / scalar;
}

function minOutputFromQuote(quoteOutHuman: number, outputAsset: string): bigint {
  const quoteScalar = mainnetCoins[outputAsset as keyof typeof mainnetCoins]?.scalar ?? 1e6;
  const minHuman = quoteOutHuman * (1 - slippageBps / 10_000);
  return BigInt(Math.round(minHuman * quoteScalar));
}

async function quoteParams() {
  const client = createDeepbookClient(sender!);
  const suiHuman = humanAmountFromBaseUnits(inputAmount, "SUI");
  const quote = await client.deepbook.getQuoteQuantityOutInputFee(poolKey, suiHuman);

  return {
    poolKey,
    inputAsset: "SUI",
    outputAsset: "USDC",
    inputAmount,
    minOutput: minOutputFromQuote(quote.quoteOut, "USDC"),
    deepAmount: quote.deepRequired,
  };
}

describe.skipIf(!shouldRun || !sender)("Trade wallet → Suilend mainnet integration", () => {
  it("dry-runs wallet → DeepBook → Suilend supply", async () => {
    const params = await quoteParams();
    const result = await simulateTradeWalletSuilend({
      sender: sender!,
      ...params,
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("dryRun");
    expect(result.ok).toBe(true);
  });
});

describe.skipIf(!shouldRun || !sender)("Trade Suilend return mainnet integration", () => {
  it("dry-runs Suilend withdraw → swap → wallet return", async () => {
    const params = await quoteParams();
    const result = await simulateTradeSuilendReturn({
      sender: sender!,
      ...params,
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("dryRun");
    expect(result.ok).toBe(true);
  });
});
