import { describe, expect, it } from "vitest";
import { ReasonCode, safeExecute, validateIntent } from "../src/index.ts";
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
      maxExecutions: 5
    },
    maxSlippageBps: 50,
    killSwitchEnabled: false,
    minExecutionIntervalMs: 60_000,
    repeatedFailureLimit: 3,
    maxQuoteAgeMs: 30_000,
    state: {
      periodStartedAtMs: nowMs - 1_000,
      amountUsed: 0n,
      executionsUsed: 0,
      consecutiveFailures: 0,
      lastExecutionAtMs: nowMs - 120_000
    },
    ...overrides
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
    minOutput: 99n,
    maxSlippageBps: 50,
    destination: "0xUSER",
    deadlineMs: nowMs + 60_000,
    strategyId: "dca-sui-usdc",
    sessionKeyId: "session-1",
    creditSourceId: "mock-sui",
    settlementMode: "return",
    ...overrides
  };
}

const creditSources: CreditSource[] = [
  {
    id: "mock-sui",
    protocol: "mock",
    asset: "SUI",
    availableLiquidity: 1_000n,
    withdrawRule: "exact-input",
    repayRule: "none",
    redepositRule: "same-protocol"
  }
];

describe("validateIntent", () => {
  it("allows an intent inside policy limits", () => {
    const result = validateIntent(baseIntent(), basePolicy(), undefined, nowMs);

    expect(result.allowed).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("rejects destinations outside the whitelist", () => {
    const result = validateIntent(
      baseIntent({ destination: "0xATTACKER" }),
      basePolicy(),
      undefined,
      nowMs
    );

    expect(result.allowed).toBe(false);
    expect(result.issues[0]?.code).toBe(ReasonCode.DESTINATION_NOT_ALLOWED);
  });

  it("rejects missing slippage protection", () => {
    const result = validateIntent(
      baseIntent({ minOutput: undefined, maxSlippageBps: undefined }),
      basePolicy(),
      undefined,
      nowMs
    );

    expect(result.allowed).toBe(false);
    expect(result.issues[0]?.code).toBe(ReasonCode.MISSING_SLIPPAGE_LIMIT);
  });

  it("rejects slippage above policy", () => {
    const result = validateIntent(
      baseIntent({ maxSlippageBps: 100 }),
      basePolicy(),
      undefined,
      nowMs
    );

    expect(result.allowed).toBe(false);
    expect(result.issues[0]?.code).toBe(ReasonCode.SLIPPAGE_TOO_HIGH);
  });

  it("rejects per-execution budget breaches", () => {
    const result = validateIntent(baseIntent({ amount: 2_000n }), basePolicy(), undefined, nowMs);

    expect(result.allowed).toBe(false);
    expect(result.issues[0]?.code).toBe(ReasonCode.BUDGET_EXCEEDED);
  });

  it("rejects period amount budget breaches", () => {
    const result = validateIntent(
      baseIntent({ amount: 100n }),
      basePolicy({ state: { ...basePolicy().state, amountUsed: 4_950n } }),
      undefined,
      nowMs
    );

    expect(result.allowed).toBe(false);
    expect(result.issues[0]?.code).toBe(ReasonCode.BUDGET_EXCEEDED);
  });

  it("rejects session scope violations", () => {
    const result = validateIntent(
      baseIntent({ strategyId: "unauthorized-strategy" }),
      basePolicy({
        sessionScope: {
          sessionKeyId: "session-1",
          expiresAtMs: nowMs + 60_000,
          allowedStrategies: ["dca-sui-usdc"],
          allowedDestinations: ["0xUSER"],
          maxAmountPerExecution: 200n
        }
      }),
      undefined,
      nowMs
    );

    expect(result.allowed).toBe(false);
    expect(result.issues[0]?.code).toBe(ReasonCode.SESSION_SCOPE_DENIED);
  });

  it("rejects active kill switch", () => {
    const result = validateIntent(
      baseIntent(),
      basePolicy({ killSwitchEnabled: true }),
      undefined,
      nowMs
    );

    expect(result.allowed).toBe(false);
    expect(result.issues[0]?.code).toBe(ReasonCode.KILL_SWITCH_ACTIVE);
  });

  it("rejects repeated failure limit", () => {
    const result = validateIntent(
      baseIntent(),
      basePolicy({ state: { ...basePolicy().state, consecutiveFailures: 3 } }),
      undefined,
      nowMs
    );

    expect(result.allowed).toBe(false);
    expect(result.issues[0]?.code).toBe(ReasonCode.REPEATED_FAILURE_LIMIT);
  });
});

describe("safeExecute", () => {
  it("returns a simulated atomic mock PTB for an allowed request", () => {
    const result = safeExecute(baseIntent(), basePolicy(), { creditSources, nowMs });

    expect(result.status).toBe("simulated");
    expect(result.ptb?.atomic).toBe(true);
    expect(result.ptb?.rollbackGuarantee).toBe("all-or-nothing");
    expect(result.ptb?.commands.map((command) => command.op)).toEqual([
      "withdraw",
      "deepbook_trade",
      "settle",
      "return"
    ]);
    expect(result.finalDestination).toBe("0xUSER");
  });

  it("rejects a route that cannot be funded by the credit source", () => {
    const result = safeExecute(
      baseIntent({ amount: 2_000n }),
      basePolicy({
        maxAmountPerExecution: 3_000n
      }),
      {
        creditSources,
        nowMs
      }
    );

    expect(result.status).toBe("rejected");
    expect(result.reasonCode).toBe(ReasonCode.INSUFFICIENT_LIQUIDITY);
  });
});
