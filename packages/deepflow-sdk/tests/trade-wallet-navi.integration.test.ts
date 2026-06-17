import { mainnetCoins } from "@mysten/deepbook-v3";
import { describe, expect, it } from "vitest";

import { createDeepbookClient } from "../src/sui/deepbook-client.ts";
import { simulateTradeWalletSwap } from "../src/trade/simulate-trade-wallet-swap.ts";
import { simulateTradeWalletNavi } from "../src/trade/simulate-trade-wallet-navi.ts";
import {
  simulateTradeNaviReturn,
  simulateTradeNaviRoundTrip,
} from "../src/trade/simulate-trade-navi.ts";

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

async function deepSuiQuoteParams() {
  const deepSuiPoolKey = "DEEP_SUI";
  const client = createDeepbookClient(sender!);
  const suiHuman = humanAmountFromBaseUnits(inputAmount, "SUI");
  const quote = await client.deepbook.getBaseQuantityOutInputFee(deepSuiPoolKey, suiHuman);

  return {
    poolKey: deepSuiPoolKey,
    inputAsset: "SUI",
    outputAsset: "DEEP",
    inputAmount,
    minOutput: minOutputFromQuote(quote.baseOut, "DEEP"),
    deepAmount: quote.deepRequired,
  };
}

describe.skipIf(!shouldRun || !sender)("Trade wallet swap mainnet integration", () => {
  it("dry-runs wallet → DeepBook → wallet swap", async () => {
    const params = await quoteParams();
    const result = await simulateTradeWalletSwap({
      sender: sender!,
      ...params,
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("dryRun");
    expect(result.ok).toBe(true);
  });
});

describe.skipIf(!shouldRun || !sender)("Trade wallet → NAVI mainnet integration", () => {
  it("dry-runs wallet → DeepBook → NAVI supply USDC", async () => {
    const params = await quoteParams();
    const result = await simulateTradeWalletNavi({
      sender: sender!,
      ...params,
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("dryRun");
    expect(result.ok).toBe(true);
  });
});

describe.skipIf(!shouldRun || !sender)("Trade NAVI round-trip mainnet integration", () => {
  it("dry-runs NAVI withdraw → swap → NAVI deposit", async () => {
    const params = await quoteParams();
    const result = await simulateTradeNaviRoundTrip({
      sender: sender!,
      ...params,
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("dryRun");
    expect(result.ok).toBe(true);
  });
});

describe.skipIf(!shouldRun || !sender)("Trade NAVI return mainnet integration", () => {
  it("dry-runs NAVI withdraw → swap → wallet return", async () => {
    const params = await quoteParams();
    const result = await simulateTradeNaviReturn({
      sender: sender!,
      ...params,
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("dryRun");
    expect(result.ok).toBe(true);
  });
});

describe.skipIf(!shouldRun || !sender)("Trade DEEP_SUI SUI→DEEP mainnet integration", () => {
  it("dry-runs wallet → DeepBook → wallet swap", async () => {
    const params = await deepSuiQuoteParams();
    const result = await simulateTradeWalletSwap({
      sender: sender!,
      ...params,
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("dryRun");
    expect(result.ok).toBe(true);
  });

  it("dry-runs wallet → DeepBook → NAVI supply DEEP", async () => {
    const params = await deepSuiQuoteParams();
    const result = await simulateTradeWalletNavi({
      sender: sender!,
      ...params,
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("dryRun");
    expect(result.ok).toBe(true);
  });

  it("dry-runs NAVI withdraw → swap → NAVI deposit", async () => {
    const params = await deepSuiQuoteParams();
    const result = await simulateTradeNaviRoundTrip({
      sender: sender!,
      ...params,
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("dryRun");
    expect(result.ok).toBe(true);
  });

  it("dry-runs NAVI withdraw → swap → wallet return", async () => {
    const params = await deepSuiQuoteParams();
    const result = await simulateTradeNaviReturn({
      sender: sender!,
      ...params,
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("dryRun");
    expect(result.ok).toBe(true);
  });
});
