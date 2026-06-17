import { validateIntent } from "../policy/validate.ts";
import { buildMockPtb } from "../simulation/mock-ptb.ts";
import type {
  CreditSource,
  ExecutionIntent,
  ExecutionPolicy,
  ExecutionResult,
} from "../types.ts";
import {
  buildIdlePipelineSteps,
  buildPipelineStepsFromPtb,
  type PipelineStep,
} from "./map-pipeline-steps.ts";
import { planTradeRoute } from "./plan-trade-route.ts";
import type { DeepbookQuoteInput } from "./types.ts";

export interface SimulateTradeParams {
  intent: ExecutionIntent;
  policy: ExecutionPolicy;
  creditSources: readonly CreditSource[];
  deepbookQuote: DeepbookQuoteInput;
  nowMs?: number;
}

export type SimulateTradeResult = ExecutionResult & {
  pipelineSteps: PipelineStep[];
};

export function simulateTrade(params: SimulateTradeParams): SimulateTradeResult {
  const nowMs = params.nowMs ?? Date.now();
  const idleSteps = buildIdlePipelineSteps();

  const preflight = validateIntent(params.intent, params.policy, undefined, nowMs);

  if (!preflight.allowed) {
    return {
      status: "rejected",
      reasonCode: preflight.issues[0]?.code,
      issues: preflight.issues,
      pipelineSteps: idleSteps.map((step, index) =>
        index === 0 ? { ...step, status: "error" } : step,
      ),
    };
  }

  const routeResult = planTradeRoute(
    params.intent,
    params.policy,
    params.creditSources,
    params.deepbookQuote,
    nowMs,
  );

  if (!routeResult.allowed || !routeResult.routePlan) {
    return {
      status: "rejected",
      reasonCode: routeResult.issue?.code,
      issues: routeResult.issue ? [routeResult.issue] : [],
      pipelineSteps: idleSteps.map((step, index) =>
        index === 1 ? { ...step, status: "error" } : step,
      ),
    };
  }

  const validation = validateIntent(
    params.intent,
    params.policy,
    routeResult.routePlan.quote,
    nowMs,
  );

  if (!validation.allowed) {
    return {
      status: "rejected",
      reasonCode: validation.issues[0]?.code,
      issues: validation.issues,
      pipelineSteps: idleSteps.map((step, index) =>
        index === 2 ? { ...step, status: "error" } : step,
      ),
    };
  }

  const ptb = buildMockPtb(routeResult.routePlan);
  const pipelineSteps = buildPipelineStepsFromPtb(ptb, "success");

  return {
    status: "simulated",
    routePlan: routeResult.routePlan,
    ptb,
    inputAmount: params.intent.amount,
    outputAmount: routeResult.routePlan.expectedFinalState.minAmount,
    feeAmount: params.deepbookQuote.feeDeepAmount,
    finalDestination: routeResult.routePlan.expectedFinalState.destination,
    pipelineSteps,
  };
}
