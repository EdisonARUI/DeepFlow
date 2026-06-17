import { ReasonCode } from "../reason-codes.ts";
import { planMockRoute } from "../routing/mock-route.ts";
import type { RoutePlanningResult } from "../routing/mock-route.ts";
import type {
  CreditSource,
  ExecutionIntent,
  ExecutionPolicy,
  RoutePlan,
} from "../types.ts";
import { quoteTrade } from "./quote-trade.ts";
import type { DeepbookQuoteInput } from "./types.ts";

export function planTradeRoute(
  intent: ExecutionIntent,
  policy: ExecutionPolicy,
  creditSources: readonly CreditSource[],
  deepbookQuote: DeepbookQuoteInput,
  nowMs = Date.now(),
): RoutePlanningResult {
  const base = planMockRoute(intent, policy, creditSources, nowMs);

  if (!base.allowed || !base.routePlan) {
    return base;
  }

  const quote = quoteTrade(intent, deepbookQuote, nowMs);
  const routePlan: RoutePlan = {
    ...base.routePlan,
    quote,
    tradeOperation: {
      ...base.routePlan.tradeOperation,
      protocol: "deepbook",
    },
    settlementOperations: base.routePlan.settlementOperations.map((op) => ({
      ...op,
      amount: quote.minOutput,
    })),
    feeOperation: {
      type: "fee",
      protocol: "deepbook",
      asset: "DEEP",
      amount: deepbookQuote.feeDeepAmount,
    },
    expectedFinalState: {
      ...base.routePlan.expectedFinalState,
      minAmount: quote.minOutput,
    },
  };

  if (!policy.allowedDestinations.includes(routePlan.expectedFinalState.destination)) {
    return {
      allowed: false,
      issue: {
        code: ReasonCode.DESTINATION_NOT_ALLOWED,
        message: "Route final destination is outside policy whitelist.",
        field: "expectedFinalState.destination",
      },
    };
  }

  return {
    allowed: true,
    routePlan,
  };
}
