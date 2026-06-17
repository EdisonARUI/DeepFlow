import { mainnetCoins } from "@mysten/deepbook-v3";
import { describe, expect, it } from "vitest";

import { createDeepbookClient } from "../src/sui/deepbook-client.ts";
import {
  inspectTradeBootstrap,
  simulateTradeBootstrap,
} from "../src/trade/simulate-trade-bootstrap.ts";

const shouldRun = process.env.RUN_MAINNET_INTEGRATION === "1";
const sender = process.env.INTEGRATION_SENDER;
const suiAmount = BigInt(process.env.INTEGRATION_AMOUNT ?? "10000000000");
const poolKey = "SUI_USDC";
const slippageBps = 50;

function humanSuiFromBaseUnits(amount: bigint): number {
  const scalar = mainnetCoins.SUI?.scalar ?? 1e9;
  return Number(amount) / scalar;
}

function minUsdcOutFromQuote(quoteOutHuman: number): bigint {
  const quoteScalar = mainnetCoins.USDC?.scalar ?? 1e6;
  const minHuman = quoteOutHuman * (1 - slippageBps / 10_000);
  return BigInt(Math.round(minHuman * quoteScalar));
}

describe.skipIf(!shouldRun || !sender)("Trade bootstrap mainnet integration", () => {
  it("builds trade bootstrap PTB and dry-runs on mainnet", async () => {
    const client = createDeepbookClient(sender!);
    const suiHuman = humanSuiFromBaseUnits(suiAmount);
    const quote = await client.deepbook.getQuoteQuantityOutInputFee(poolKey, suiHuman);

    expect(quote.deepRequired).toBe(0);

    const result = await simulateTradeBootstrap({
      sender: sender!,
      suiAmount,
      minUsdcOut: minUsdcOutFromQuote(quote.quoteOut),
      deepAmount: quote.deepRequired,
      deepbookPoolKey: poolKey,
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("dryRun");
    expect(result.ok).toBe(true);
  });

  it("builds trade bootstrap PTB and devInspects on mainnet", async () => {
    const client = createDeepbookClient(sender!);
    const suiHuman = humanSuiFromBaseUnits(suiAmount);
    const quote = await client.deepbook.getQuoteQuantityOutInputFee(poolKey, suiHuman);

    expect(quote.deepRequired).toBe(0);

    const result = await inspectTradeBootstrap({
      sender: sender!,
      suiAmount,
      minUsdcOut: minUsdcOutFromQuote(quote.quoteOut),
      deepAmount: quote.deepRequired,
      deepbookPoolKey: poolKey,
    });

    expect(result.transaction).toBeDefined();
    expect(result.mode).toBe("devInspect");
    expect(result.ok).toBe(true);
  });

  it("DEEP-fee quote returns non-zero deepRequired", async () => {
    const client = createDeepbookClient(sender!);
    const suiHuman = humanSuiFromBaseUnits(suiAmount);
    const quote = await client.deepbook.getQuoteQuantityOut(poolKey, suiHuman);

    expect(quote.deepRequired).toBeGreaterThan(0);
  });

  it("DEEP-fee bootstrap dry-run fails without wallet DEEP", async () => {
    const client = createDeepbookClient(sender!);
    const suiHuman = humanSuiFromBaseUnits(suiAmount);
    const quote = await client.deepbook.getQuoteQuantityOut(poolKey, suiHuman);

    expect(quote.deepRequired).toBeGreaterThan(0);

    const result = await simulateTradeBootstrap({
      sender: sender!,
      suiAmount,
      minUsdcOut: minUsdcOutFromQuote(quote.quoteOut),
      deepAmount: quote.deepRequired,
      deepbookPoolKey: poolKey,
    });

    expect(result.mode).toBe("dryRun");
    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
