import type { CreditSource, ExecutionPolicy } from "@deepflow/sdk";

const DEMO_NOW_MS = Date.now();

/** Trading 页演示用策略（与 Security 页 mock 白名单语义对齐）。 */
export function createDemoTradingPolicy(
  destination: string,
  overrides: Partial<ExecutionPolicy> = {},
): ExecutionPolicy {
  return {
    allowedAssets: ["SUI", "USDC", "DEEP", "WAL", "WUSDT", "USDT"],
    allowedMarkets: [
      "DEEPBOOK:SUI-USDC",
      "DEEPBOOK:DEEP-SUI",
      "DEEPBOOK:WUSDT-USDC",
      "DEEPBOOK:WAL-USDC",
    ],
    allowedDestinations: [destination, "navi:SUI-vault", "navi:USDC-vault"],
    maxAmountPerExecution: 1_000_000_000_000n,
    periodBudget: {
      windowMs: 86_400_000,
      maxAmount: 10_000_000_000_000n,
      maxExecutions: 50,
    },
    maxSlippageBps: 100,
    killSwitchEnabled: false,
    minExecutionIntervalMs: 0,
    repeatedFailureLimit: 5,
    maxQuoteAgeMs: 60_000,
    state: {
      periodStartedAtMs: DEMO_NOW_MS - 1_000,
      amountUsed: 0n,
      executionsUsed: 0,
      consecutiveFailures: 0,
    },
    ...overrides,
  };
}

export function creditSourceFromLiquidityPosition(position: {
  asset: string;
  suppliedBalance: bigint;
  protocol: string;
  protocolId?: string;
}): CreditSource {
  const protocolId = position.protocolId?.toLowerCase();
  const protocolLabel = position.protocol.toLowerCase();

  let protocol: CreditSource["protocol"] = "mock";
  if (protocolId === "navi" || protocolLabel.includes("navi")) {
    protocol = "navi";
  } else if (protocolId === "suilend" || protocolLabel.includes("suilend")) {
    protocol = "suilend";
  }

  return {
    id: `${protocol}-${position.asset.toLowerCase()}`,
    protocol,
    asset: position.asset,
    availableLiquidity: position.suppliedBalance,
    withdrawRule: "exact-input",
    repayRule: "none",
    redepositRule: "same-protocol",
  };
}
