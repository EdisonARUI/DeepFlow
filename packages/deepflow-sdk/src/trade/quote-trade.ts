import type { ExecutionIntent, ExecutionQuote } from "../types.ts";
import type { DeepbookQuoteInput } from "./types.ts";

export function quoteTrade(
  intent: ExecutionIntent,
  deepbookQuote: DeepbookQuoteInput,
  nowMs = Date.now(),
): ExecutionQuote {
  return {
    inputAmount: intent.amount,
    estimatedOutput: deepbookQuote.estimatedOutput,
    minOutput: deepbookQuote.minOutput,
    slippageBps: deepbookQuote.slippageBps,
    createdAtMs: nowMs,
  };
}
