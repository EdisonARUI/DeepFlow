import { withdrawCoinPTB, getPool } from "@naviprotocol/lending";
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";

import { appendNaviOraclePreamble } from "../credit-source/navi/append-navi-oracle-preamble.ts";
import { toSafeAmountNumber } from "../credit-source/navi/amount.ts";
import { NAVI_ENV, NAVI_MAIN_MARKET } from "../credit-source/navi/constants.ts";
import { resolveNaviPoolKey } from "../credit-source/navi/resolve-navi-pool-key.ts";
import { getReferralId } from "../deepbook/referral-config.ts";
import {
  appendLimitOrderLeg,
  createClientOrderId,
  validateLimitOrderParams,
} from "./resolve-deepbook-limit-order.ts";
import { resolveTickAlignedLimitPrice } from "./resolve-limit-order-price.ts";
import { requireNaviClient } from "./resolve-deepbook-swap.ts";
import type { TradeLimitOrderParams } from "./build-limit-order-core.ts";

export interface BuildNaviLimitOrderTxParams extends TradeLimitOrderParams {}

export async function buildNaviLimitOrderTx(
  params: BuildNaviLimitOrderTxParams,
): Promise<Transaction> {
  const price = await resolveTickAlignedLimitPrice(params.poolKey, params.price);
  const resolved = await validateLimitOrderParams({
    poolKey: params.poolKey,
    side: params.side,
    price,
    quantityBaseUnits: params.quantityBaseUnits,
  });

  const client = requireNaviClient(params.client);
  const withdrawAmountNumber = toSafeAmountNumber(
    resolved.depositAmount,
    "withdraw amount",
  );
  const inputPoolKey = await resolveNaviPoolKey(resolved.depositAsset);
  const inputPool = await getPool(inputPoolKey, { env: NAVI_ENV, market: NAVI_MAIN_MARKET });

  const tx = new Transaction();
  tx.setSender(params.sender);

  await appendNaviOraclePreamble(
    tx,
    params.sender,
    [resolved.depositAsset],
    client,
  );

  const withdrawnCoin = await withdrawCoinPTB(tx, inputPoolKey, withdrawAmountNumber, {
    env: NAVI_ENV,
    market: NAVI_MAIN_MARKET,
  });

  appendLimitOrderLeg(tx, {
    sender: params.sender,
    poolKey: params.poolKey,
    inputPrice: resolved.inputPrice,
    inputQuantity: resolved.inputQuantity,
    isBid: resolved.isBid,
    depositCoin: withdrawnCoin,
    depositCoinType: inputPool.suiCoinType,
    managerId: params.managerId,
    referralId: params.referralId ?? getReferralId(params.poolKey),
    clientOrderId: params.clientOrderId ?? createClientOrderId(),
    expireAtMs: params.expireAtMs,
  });

  return tx;
}
