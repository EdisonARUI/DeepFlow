import { describe, expect, it } from "vitest";
import {
  deepbookQuoteFromHuman,
  planTradeRoute,
  simulateTrade,
} from "../src/trade.ts";
import type { CreditSource, ExecutionIntent, ExecutionPolicy } from "../src/index.ts";

const nowMs = 1_800_000_000_000;

function basePolicy(overrides: Partial<ExecutionPolicy> = {}): ExecutionPolicy {
  return {
    allowedAssets: ["SUI", "USDC"],
    allowedMarkets: ["DEEPBOOK:SUI-USDC"],
    allowedDestinations: ["0xUSER", "navi:SUI-vault"],
    maxAmountPerExecution: 1_000n,
    periodBudget: {
      windowMs: 86_400_000,
      maxAmount: 5_000n,
      maxExecutions: 5,
    },
    maxSlippageBps: 50,
    killSwitchEnabled: false,
    state: {
      periodStartedAtMs: nowMs - 1_000,
      amountUsed: 0n,
      executionsUsed: 0,
      consecutiveFailures: 0,
    },
    ...overrides,
  };
}

function baseIntent(overrides: Partial<ExecutionIntent> = {}): ExecutionIntent {
  return {
    id: "intent-1",
    market: "DEEPBOOK:SUI-USDC",
    side: "sell",
    inputAsset: "SUI",
    outputAsset: "USDC",
    amount: 100n,
    minOutput: 95n,
    maxSlippageBps: 50,
    destination: "0xUSER",
    deadlineMs: nowMs + 60_000,
    creditSourceId: "navi-sui",
    settlementMode: "redeposit",
    ...overrides,
  };
}

const creditSources: CreditSource[] = [
  {
    id: "navi-sui",
    protocol: "navi",
    asset: "SUI",
    availableLiquidity: 1_000n,
    withdrawRule: "exact-input",
    repayRule: "none",
    redepositRule: "same-protocol",
  },
];

const deepbookQuote = deepbookQuoteFromHuman({
  estimatedOutput: 345,
  minOutput: 340,
  deepRequired: 2000,
  feeLabel: "~0.002 DEEP",
  slippageBps: 50,
});

describe("planTradeRoute", () => {
  it("merges deepbook quote and fee operation", () => {
    const result = planTradeRoute(
      baseIntent(),
      basePolicy(),
      creditSources,
      deepbookQuote,
      nowMs,
    );

    expect(result.allowed).toBe(true);
    expect(result.routePlan?.quote.estimatedOutput).toBe(deepbookQuote.estimatedOutput);
    expect(result.routePlan?.feeOperation?.asset).toBe("DEEP");
    expect(result.routePlan?.tradeOperation.protocol).toBe("deepbook");
  });
});

describe("simulateTrade", () => {
  it("returns simulated pipeline on success", () => {
    const result = simulateTrade({
      intent: baseIntent(),
      policy: basePolicy(),
      creditSources,
      deepbookQuote,
      nowMs,
    });

    expect(result.status).toBe("simulated");
    expect(result.pipelineSteps.every((step) => step.status === "done")).toBe(true);
    expect(result.feeAmount).toBe(deepbookQuote.feeDeepAmount);
  });

  it("rejects when credit source is missing", () => {
    const result = simulateTrade({
      intent: baseIntent({ creditSourceId: "missing" }),
      policy: basePolicy(),
      creditSources,
      deepbookQuote,
      nowMs,
    });

    expect(result.status).toBe("rejected");
    expect(result.pipelineSteps.some((step) => step.status === "error")).toBe(true);
  });
});
