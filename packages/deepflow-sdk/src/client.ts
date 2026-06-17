import { planMockRoute } from "./routing/mock-route.ts";
import { buildMockPtb } from "./simulation/mock-ptb.ts";
import { validateIntent } from "./policy/validate.ts";
import type {
  CreditSource,
  ExecutionIntent,
  ExecutionPolicy,
  ExecutionResult
} from "./types.ts";

export interface SafeExecuteOptions {
  nowMs?: number;
  creditSources: readonly CreditSource[];
}

export function safeExecute(
  intent: ExecutionIntent,
  policy: ExecutionPolicy,
  options: SafeExecuteOptions
): ExecutionResult {
  const nowMs = options.nowMs ?? Date.now();
  const preflight = validateIntent(intent, policy, undefined, nowMs);

  if (!preflight.allowed) {
    return {
      status: "rejected",
      reasonCode: preflight.issues[0]?.code,
      issues: preflight.issues
    };
  }

  const routeResult = planMockRoute(intent, policy, options.creditSources, nowMs);

  if (!routeResult.allowed || !routeResult.routePlan) {
    return {
      status: "rejected",
      reasonCode: routeResult.issue?.code,
      issues: routeResult.issue ? [routeResult.issue] : []
    };
  }

  const validation = validateIntent(intent, policy, routeResult.routePlan.quote, nowMs);

  if (!validation.allowed) {
    return {
      status: "rejected",
      reasonCode: validation.issues[0]?.code,
      issues: validation.issues
    };
  }

  const ptb = buildMockPtb(routeResult.routePlan);

  return {
    status: "simulated",
    routePlan: routeResult.routePlan,
    ptb,
    inputAmount: intent.amount,
    outputAmount: routeResult.routePlan.expectedFinalState.minAmount,
    feeAmount: 0n,
    finalDestination: routeResult.routePlan.expectedFinalState.destination
  };
}
