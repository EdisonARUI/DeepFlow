import { ReasonCode } from "../reason-codes.ts";
import type {
  CreditSource,
  ExecutionIntent,
  ExecutionPolicy,
  ExecutionQuote,
  RoutePlan,
  ValidationIssue
} from "../types.ts";

export interface RoutePlanningResult {
  allowed: boolean;
  issue?: ValidationIssue;
  routePlan?: RoutePlan;
}

export function quoteExecution(
  intent: ExecutionIntent,
  creditSource: CreditSource,
  nowMs = Date.now()
): ExecutionQuote {
  const requestedSlippage = intent.maxSlippageBps ?? 0;
  const slippageBps = Math.max(0, requestedSlippage);
  const estimatedOutput = intent.amount;
  const slippageAmount = (estimatedOutput * BigInt(slippageBps)) / 10_000n;
  const minOutput = intent.minOutput ?? estimatedOutput - slippageAmount;

  if (creditSource.asset !== intent.inputAsset) {
    return {
      inputAmount: intent.amount,
      estimatedOutput: 0n,
      minOutput: 0n,
      slippageBps,
      createdAtMs: nowMs
    };
  }

  return {
    inputAmount: intent.amount,
    estimatedOutput,
    minOutput,
    slippageBps,
    createdAtMs: nowMs
  };
}

export function planMockRoute(
  intent: ExecutionIntent,
  policy: ExecutionPolicy,
  creditSources: readonly CreditSource[],
  nowMs = Date.now()
): RoutePlanningResult {
  const creditSource = creditSources.find((source) => source.id === intent.creditSourceId);

  if (!creditSource) {
    return {
      allowed: false,
      issue: {
        code: ReasonCode.CREDIT_SOURCE_NOT_FOUND,
        message: "Requested credit source was not found.",
        field: "creditSourceId"
      }
    };
  }

  if (creditSource.asset !== intent.inputAsset || creditSource.availableLiquidity < intent.amount) {
    return {
      allowed: false,
      issue: {
        code: ReasonCode.INSUFFICIENT_LIQUIDITY,
        message: "Credit source cannot satisfy the requested input amount.",
        field: "creditSourceId"
      }
    };
  }

  const quote = quoteExecution(intent, creditSource, nowMs);
  const routePlan: RoutePlan = {
    id: `route-${intent.id}`,
    intentId: intent.id,
    creditSourceId: creditSource.id,
    quote,
    sourceOperations: [
      {
        type: "withdraw",
        protocol: creditSource.protocol,
        asset: intent.inputAsset,
        amount: intent.amount
      }
    ],
    tradeOperation: {
      type: "deepbook_trade",
      protocol: "deepbook-mock",
      asset: intent.inputAsset,
      amount: intent.amount
    },
    settlementOperations: [
      {
        type: "settle",
        protocol: "deepbook-mock",
        asset: intent.outputAsset,
        amount: quote.minOutput
      },
      {
        type: intent.settlementMode === "redeposit" ? "redeposit" : "return",
        protocol: intent.settlementMode === "redeposit" ? creditSource.protocol : "wallet",
        asset: intent.outputAsset,
        amount: quote.minOutput,
        destination: intent.destination
      }
    ],
    expectedFinalState: {
      asset: intent.outputAsset,
      minAmount: quote.minOutput,
      destination: intent.destination,
      settlementMode: intent.settlementMode
    },
    validatedAtMs: nowMs
  };

  if (!policy.allowedDestinations.includes(routePlan.expectedFinalState.destination)) {
    return {
      allowed: false,
      issue: {
        code: ReasonCode.DESTINATION_NOT_ALLOWED,
        message: "Route final destination is outside policy whitelist.",
        field: "expectedFinalState.destination"
      }
    };
  }

  return {
    allowed: true,
    routePlan
  };
}
