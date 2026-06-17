import { ReasonCode } from "../reason-codes.ts";
import type {
  ExecutionIntent,
  ExecutionPolicy,
  ExecutionQuote,
  ValidationIssue,
  ValidationResult
} from "../types.ts";

export function validateIntent(
  intent: ExecutionIntent,
  policy: ExecutionPolicy,
  quote?: ExecutionQuote,
  nowMs = Date.now()
): ValidationResult {
  const issues: ValidationIssue[] = [];

  const reject = (code: ReasonCode, message: string, field?: string) => {
    issues.push({ code, message, field });
  };

  if (policy.killSwitchEnabled) {
    reject(ReasonCode.KILL_SWITCH_ACTIVE, "Kill Switch is active.");
  }

  if (intent.amount <= 0n) {
    reject(ReasonCode.INVALID_INTENT, "Execution amount must be greater than zero.", "amount");
  }

  if (intent.deadlineMs <= nowMs) {
    reject(ReasonCode.INVALID_INTENT, "Execution intent is past its deadline.", "deadlineMs");
  }

  if (!policy.allowedMarkets.includes(intent.market)) {
    reject(ReasonCode.MARKET_NOT_ALLOWED, "Market is not allowed by policy.", "market");
  }

  if (
    !policy.allowedAssets.includes(intent.inputAsset) ||
    !policy.allowedAssets.includes(intent.outputAsset)
  ) {
    reject(ReasonCode.ASSET_NOT_ALLOWED, "Input or output asset is not allowed by policy.", "asset");
  }

  if (!policy.allowedDestinations.includes(intent.destination)) {
    reject(
      ReasonCode.DESTINATION_NOT_ALLOWED,
      "Final destination is not in the policy whitelist.",
      "destination"
    );
  }

  if (intent.minOutput === undefined && intent.maxSlippageBps === undefined) {
    reject(
      ReasonCode.MISSING_SLIPPAGE_LIMIT,
      "Intent must include minOutput or maxSlippageBps.",
      "minOutput"
    );
  }

  if (intent.maxSlippageBps !== undefined && intent.maxSlippageBps > policy.maxSlippageBps) {
    reject(
      ReasonCode.SLIPPAGE_TOO_HIGH,
      "Requested slippage exceeds policy maximum.",
      "maxSlippageBps"
    );
  }

  if (quote) {
    if (quote.slippageBps > policy.maxSlippageBps) {
      reject(ReasonCode.SLIPPAGE_TOO_HIGH, "Route quote slippage exceeds policy maximum.", "quote");
    }

    if (intent.minOutput !== undefined && quote.minOutput < intent.minOutput) {
      reject(ReasonCode.SLIPPAGE_TOO_HIGH, "Route quote cannot satisfy intent minOutput.", "minOutput");
    }

    if (policy.maxQuoteAgeMs !== undefined && nowMs - quote.createdAtMs > policy.maxQuoteAgeMs) {
      reject(ReasonCode.STALE_QUOTE, "Route quote is too old for this policy.", "quote");
    }
  }

  if (intent.amount > policy.maxAmountPerExecution) {
    reject(
      ReasonCode.BUDGET_EXCEEDED,
      "Intent amount exceeds maxAmountPerExecution.",
      "amount"
    );
  }

  const periodElapsed = nowMs - policy.state.periodStartedAtMs;
  const amountUsed = periodElapsed > policy.periodBudget.windowMs ? 0n : policy.state.amountUsed;
  const executionsUsed = periodElapsed > policy.periodBudget.windowMs ? 0 : policy.state.executionsUsed;

  if (amountUsed + intent.amount > policy.periodBudget.maxAmount) {
    reject(ReasonCode.BUDGET_EXCEEDED, "Intent would exceed period amount budget.", "amount");
  }

  if (executionsUsed + 1 > policy.periodBudget.maxExecutions) {
    reject(
      ReasonCode.EXECUTION_FREQUENCY_LIMIT,
      "Intent would exceed period execution count.",
      "periodBudget.maxExecutions"
    );
  }

  if (
    policy.minExecutionIntervalMs !== undefined &&
    policy.state.lastExecutionAtMs !== undefined &&
    nowMs - policy.state.lastExecutionAtMs < policy.minExecutionIntervalMs
  ) {
    reject(
      ReasonCode.EXECUTION_FREQUENCY_LIMIT,
      "Intent is too soon after the previous execution.",
      "minExecutionIntervalMs"
    );
  }

  if (
    policy.repeatedFailureLimit !== undefined &&
    policy.state.consecutiveFailures >= policy.repeatedFailureLimit
  ) {
    reject(
      ReasonCode.REPEATED_FAILURE_LIMIT,
      "Consecutive failure limit has been reached.",
      "state.consecutiveFailures"
    );
  }

  validateSessionScope(intent, policy, reject, nowMs);

  return {
    allowed: issues.length === 0,
    issues
  };
}

function validateSessionScope(
  intent: ExecutionIntent,
  policy: ExecutionPolicy,
  reject: (code: ReasonCode, message: string, field?: string) => void,
  nowMs: number
) {
  const scope = policy.sessionScope;

  if (!scope) {
    return;
  }

  if (intent.sessionKeyId !== scope.sessionKeyId) {
    reject(ReasonCode.SESSION_SCOPE_DENIED, "Session key does not match policy scope.", "sessionKeyId");
  }

  if (scope.expiresAtMs <= nowMs) {
    reject(ReasonCode.SESSION_EXPIRED, "Session key is expired.", "sessionScope.expiresAtMs");
  }

  if (scope.allowedStrategies && !intent.strategyId) {
    reject(ReasonCode.SESSION_SCOPE_DENIED, "Session requires a scoped strategy.", "strategyId");
  }

  if (
    scope.allowedStrategies &&
    intent.strategyId &&
    !scope.allowedStrategies.includes(intent.strategyId)
  ) {
    reject(ReasonCode.SESSION_SCOPE_DENIED, "Strategy is outside the session scope.", "strategyId");
  }

  if (scope.allowedMarkets && !scope.allowedMarkets.includes(intent.market)) {
    reject(ReasonCode.SESSION_SCOPE_DENIED, "Market is outside the session scope.", "market");
  }

  if (
    scope.allowedAssets &&
    (!scope.allowedAssets.includes(intent.inputAsset) ||
      !scope.allowedAssets.includes(intent.outputAsset))
  ) {
    reject(ReasonCode.SESSION_SCOPE_DENIED, "Asset is outside the session scope.", "asset");
  }

  if (scope.allowedDestinations && !scope.allowedDestinations.includes(intent.destination)) {
    reject(ReasonCode.SESSION_SCOPE_DENIED, "Destination is outside the session scope.", "destination");
  }

  if (scope.maxAmountPerExecution !== undefined && intent.amount > scope.maxAmountPerExecution) {
    reject(ReasonCode.SESSION_SCOPE_DENIED, "Amount exceeds session scope limit.", "amount");
  }
}
