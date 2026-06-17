import type { ReasonCode } from "./reason-codes.ts";

export type AssetId = string;
export type Address = string;
export type MarketId = string;
export type SessionKeyId = string;
export type StrategyId = string;

export type TradeSide = "buy" | "sell";
export type SettlementMode = "redeposit" | "return";
export type CreditSourceProtocol = "mock" | "navi" | "suilend" | "cetus";

export interface ExecutionIntent {
  id: string;
  market: MarketId;
  side: TradeSide;
  inputAsset: AssetId;
  outputAsset: AssetId;
  amount: bigint;
  minOutput?: bigint;
  maxSlippageBps?: number;
  destination: Address;
  deadlineMs: number;
  strategyId?: StrategyId;
  sessionKeyId?: SessionKeyId;
  creditSourceId: string;
  settlementMode: SettlementMode;
  createdAtMs?: number;
}

export interface SessionScope {
  sessionKeyId: SessionKeyId;
  expiresAtMs: number;
  allowedStrategies?: readonly StrategyId[];
  allowedMarkets?: readonly MarketId[];
  allowedAssets?: readonly AssetId[];
  allowedDestinations?: readonly Address[];
  maxAmountPerExecution?: bigint;
}

export interface PeriodBudget {
  windowMs: number;
  maxAmount: bigint;
  maxExecutions: number;
}

export interface ExecutionState {
  periodStartedAtMs: number;
  amountUsed: bigint;
  executionsUsed: number;
  consecutiveFailures: number;
  lastExecutionAtMs?: number;
}

export interface ExecutionPolicy {
  allowedAssets: readonly AssetId[];
  allowedMarkets: readonly MarketId[];
  allowedDestinations: readonly Address[];
  maxAmountPerExecution: bigint;
  periodBudget: PeriodBudget;
  maxSlippageBps: number;
  sessionScope?: SessionScope;
  killSwitchEnabled: boolean;
  minExecutionIntervalMs?: number;
  repeatedFailureLimit?: number;
  maxQuoteAgeMs?: number;
  state: ExecutionState;
}

export interface CreditSource {
  id: string;
  protocol: CreditSourceProtocol;
  asset: AssetId;
  availableLiquidity: bigint;
  withdrawRule: "exact-input";
  repayRule?: "none" | "repay";
  redepositRule: "same-protocol" | "return-only";
}

export interface ExecutionQuote {
  inputAmount: bigint;
  estimatedOutput: bigint;
  minOutput: bigint;
  slippageBps: number;
  createdAtMs: number;
}

export type RouteOperationType =
  | "withdraw"
  | "deepbook_trade"
  | "settle"
  | "fee"
  | "redeposit"
  | "return";

export interface RouteOperation {
  type: RouteOperationType;
  protocol: string;
  asset: AssetId;
  amount: bigint;
  destination?: Address;
}

export interface RoutePlan {
  id: string;
  intentId: string;
  creditSourceId: string;
  quote: ExecutionQuote;
  sourceOperations: readonly RouteOperation[];
  tradeOperation: RouteOperation;
  settlementOperations: readonly RouteOperation[];
  feeOperation?: RouteOperation;
  expectedFinalState: {
    asset: AssetId;
    minAmount: bigint;
    destination: Address;
    settlementMode: SettlementMode;
  };
  validatedAtMs: number;
}

export interface MockPtbCommand {
  op: RouteOperationType;
  description: string;
}

export interface MockPtb {
  kind: "mock-ptb";
  routePlanId: string;
  atomic: true;
  commands: readonly MockPtbCommand[];
  rollbackGuarantee: "all-or-nothing";
}

export interface ValidationIssue {
  code: ReasonCode;
  message: string;
  field?: string;
}

export interface ValidationResult {
  allowed: boolean;
  issues: readonly ValidationIssue[];
}

export interface ExecutionResult {
  status: "rejected" | "simulated";
  reasonCode?: ReasonCode;
  issues?: readonly ValidationIssue[];
  routePlan?: RoutePlan;
  ptb?: MockPtb;
  inputAmount?: bigint;
  outputAmount?: bigint;
  feeAmount?: bigint;
  finalDestination?: Address;
}
