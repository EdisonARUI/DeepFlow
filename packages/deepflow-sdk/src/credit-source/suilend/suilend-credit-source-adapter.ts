import type { SuiGrpcClient } from "@mysten/sui/grpc";
import type { Transaction } from "@mysten/sui/transactions";

import type { CreditSourceAdapter } from "../../credit-source-adapter.ts";
import type { ExecutionIntent, ExecutionQuote, RoutePlan } from "../../types.ts";
import { buildSuilendSupplyTx } from "./build-suilend-supply-tx.ts";
import { buildSuilendWithdrawTx } from "./build-suilend-withdraw-tx.ts";

export interface SuilendCreditSourceAdapterOptions {
  sender: string;
  grpcClient: SuiGrpcClient;
}

export class SuilendCreditSourceAdapter implements CreditSourceAdapter {
  readonly protocol = "suilend" as const;

  constructor(private readonly options: SuilendCreditSourceAdapterOptions) {}

  async quoteSupplyWithdraw(params: { intent: ExecutionIntent }): Promise<ExecutionQuote> {
    const { intent } = params;
    return {
      inputAmount: intent.amount,
      estimatedOutput: intent.amount,
      minOutput: intent.minOutput ?? intent.amount,
      slippageBps: intent.maxSlippageBps ?? 0,
      createdAtMs: Date.now(),
    };
  }

  async buildSupplyWithdrawPtb(params: { routePlan: RoutePlan }): Promise<Transaction> {
    const { routePlan } = params;
    const { sender } = this.options;

    const withdrawOp = routePlan.sourceOperations.find(
      (op) => op.type === "withdraw" && op.protocol === "suilend",
    );
    if (withdrawOp) {
      return buildSuilendWithdrawTx({
        sender,
        asset: withdrawOp.asset,
        amount: withdrawOp.amount,
      });
    }

    const redepositOp = routePlan.settlementOperations.find(
      (op) => op.type === "redeposit" && op.protocol === "suilend",
    );
    if (redepositOp) {
      return buildSuilendSupplyTx({
        sender,
        asset: redepositOp.asset,
        amount: redepositOp.amount,
      });
    }

    throw new Error(
      "RoutePlan has no Suilend withdraw or redeposit operation for buildSupplyWithdrawPtb",
    );
  }

  async buildSupplyPtb(asset: string, amount: bigint): Promise<Transaction> {
    return buildSuilendSupplyTx({
      sender: this.options.sender,
      asset,
      amount,
    });
  }

  async buildWithdrawPtb(asset: string, amount: bigint): Promise<Transaction> {
    return buildSuilendWithdrawTx({
      sender: this.options.sender,
      asset,
      amount,
    });
  }
}
