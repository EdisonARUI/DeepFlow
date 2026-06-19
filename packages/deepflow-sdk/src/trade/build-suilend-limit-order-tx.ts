import { Transaction } from "@mysten/sui/transactions";

import { createSuilendExecutionContext } from "../credit-source/suilend/create-suilend-client.ts";
import {
  appendSuilendWithdraw,
  resolveSuilendCoinTypeForAsset,
} from "../credit-source/suilend/append-suilend-swap-leg.ts";
import { getReferralId } from "../deepbook/referral-config.ts";
import {
  appendLimitOrderLeg,
  createClientOrderId,
  validateLimitOrderParams,
} from "./resolve-deepbook-limit-order.ts";
import { resolveTickAlignedLimitPrice } from "./resolve-limit-order-price.ts";
import type { TradeLimitOrderParams } from "./build-limit-order-core.ts";

export interface BuildSuilendLimitOrderTxParams extends TradeLimitOrderParams {}

export async function buildSuilendLimitOrderTx(
  params: BuildSuilendLimitOrderTxParams,
): Promise<Transaction> {
  const price = await resolveTickAlignedLimitPrice(params.poolKey, params.price);
  const resolved = await validateLimitOrderParams({
    poolKey: params.poolKey,
    side: params.side,
    price,
    quantityBaseUnits: params.quantityBaseUnits,
  });

  const suilendContext = await createSuilendExecutionContext();
  const depositCoinType = resolveSuilendCoinTypeForAsset(
    resolved.depositAsset,
    suilendContext,
  );

  const tx = new Transaction();
  tx.setSender(params.sender);

  const withdrawnCoin = await appendSuilendWithdraw(tx, {
    sender: params.sender,
    inputAsset: resolved.depositAsset,
    inputAmount: resolved.depositAmount,
    context: suilendContext,
  });

  appendLimitOrderLeg(tx, {
    sender: params.sender,
    poolKey: params.poolKey,
    inputPrice: resolved.inputPrice,
    inputQuantity: resolved.inputQuantity,
    isBid: resolved.isBid,
    depositCoin: withdrawnCoin,
    depositCoinType,
    managerId: params.managerId,
    referralId: params.referralId ?? getReferralId(params.poolKey),
    clientOrderId: params.clientOrderId ?? createClientOrderId(),
    expireAtMs: params.expireAtMs,
  });

  return tx;
}
