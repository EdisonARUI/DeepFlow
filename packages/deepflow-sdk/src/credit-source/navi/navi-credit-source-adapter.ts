import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import type { Transaction } from "@mysten/sui/transactions";

import type { CreditSourceAdapter } from "../../credit-source-adapter.ts";
import type { ExecutionIntent, ExecutionQuote, RoutePlan } from "../../types.ts";
import { buildNaviSupplyTx } from "./build-navi-supply-tx.ts";
import { buildNaviWithdrawTx } from "./build-navi-withdraw-tx.ts";
import { toSafeAmountNumber } from "./amount.ts";

export interface NaviCreditSourceAdapterOptions {
  /** Required for PTB construction from route operations. */
  sender: string;
  jsonRpcClient: SuiJsonRpcClient;
}

export class NaviCreditSourceAdapter implements CreditSourceAdapter {
  readonly protocol = "navi" as const;

  constructor(private readonly options: NaviCreditSourceAdapterOptions) {}

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
    const { sender, jsonRpcClient } = this.options;

    const withdrawOp = routePlan.sourceOperations.find(
      (op) => op.type === "withdraw" && op.protocol === "navi",
    );
    if (withdrawOp) {
      return buildNaviWithdrawTx({
        sender,
        asset: withdrawOp.asset,
        amount: withdrawOp.amount,
        client: jsonRpcClient,
      });
    }

    const redepositOp = routePlan.settlementOperations.find(
      (op) => op.type === "redeposit" && op.protocol === "navi",
    );
    if (redepositOp) {
      return buildNaviSupplyTx({
        sender,
        asset: redepositOp.asset,
        amount: redepositOp.amount,
        client: jsonRpcClient,
      });
    }

    throw new Error(
      "RoutePlan has no NAVI withdraw or redeposit operation for buildSupplyWithdrawPtb",
    );
  }

  /** Standalone supply PTB builder (Liquidity 页 / 集成测试入口). */
  async buildSupplyPtb(asset: string, amount: bigint): Promise<Transaction> {
    toSafeAmountNumber(amount, "supply amount");
    return buildNaviSupplyTx({
      sender: this.options.sender,
      asset,
      amount,
      client: this.options.jsonRpcClient,
    });
  }

  /** Standalone withdraw PTB builder (Liquidity 页 / 集成测试入口). */
  async buildWithdrawPtb(asset: string, amount: bigint): Promise<Transaction> {
    toSafeAmountNumber(amount, "withdraw amount");
    return buildNaviWithdrawTx({
      sender: this.options.sender,
      asset,
      amount,
      client: this.options.jsonRpcClient,
    });
  }
}
