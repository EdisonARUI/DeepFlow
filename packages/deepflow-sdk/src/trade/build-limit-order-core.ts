import { getPool } from "@naviprotocol/lending";
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";

import { getReferralId } from "../deepbook/referral-config.ts";
import { NAVI_ENV, NAVI_MAIN_MARKET } from "../credit-source/navi/constants.ts";
import { resolveNaviPoolKey } from "../credit-source/navi/resolve-navi-pool-key.ts";
import {
  appendLimitOrderLeg,
  createClientOrderId,
  validateLimitOrderParams,
  type LimitOrderSide,
} from "./resolve-deepbook-limit-order.ts";
import { resolveTickAlignedLimitPrice } from "./resolve-limit-order-price.ts";
import { mergeWalletInputCoin, requireNaviClient, resolvePoolAssets } from "./resolve-deepbook-swap.ts";

export type TradeLimitOrderParams = {
  sender: string;
  poolKey: string;
  side: LimitOrderSide;
  price: number;
  quantityBaseUnits: bigint;
  managerId: string | null;
  referralId?: string;
  clientOrderId?: string;
  client?: SuiJsonRpcClient;
  expireAtMs?: number;
};

async function resolveDepositCoinType(
  depositAsset: string,
  client: SuiJsonRpcClient,
): Promise<string> {
  const poolKey = await resolveNaviPoolKey(depositAsset);
  const pool = await getPool(poolKey, { env: NAVI_ENV, market: NAVI_MAIN_MARKET });
  return pool.suiCoinType;
}

export async function buildWalletLimitOrderTx(
  params: TradeLimitOrderParams,
): Promise<Transaction> {
  const price = await resolveTickAlignedLimitPrice(params.poolKey, params.price);
  const resolved = await validateLimitOrderParams({
    poolKey: params.poolKey,
    side: params.side,
    price,
    quantityBaseUnits: params.quantityBaseUnits,
  });

  const client = requireNaviClient(params.client);
  const tx = new Transaction();
  tx.setSender(params.sender);

  const depositCoin = await mergeWalletInputCoin(
    tx,
    params.sender,
    resolved.depositAsset,
    resolved.depositAmount,
    client,
  );
  const depositCoinType = await resolveDepositCoinType(resolved.depositAsset, client);

  appendLimitOrderLeg(tx, {
    sender: params.sender,
    poolKey: params.poolKey,
    inputPrice: resolved.inputPrice,
    inputQuantity: resolved.inputQuantity,
    isBid: resolved.isBid,
    depositCoin,
    depositCoinType,
    managerId: params.managerId,
    referralId: params.referralId ?? getReferralId(params.poolKey),
    clientOrderId: params.clientOrderId ?? createClientOrderId(),
    expireAtMs: params.expireAtMs,
  });

  return tx;
}

export function resolveLimitOrderAssets(
  poolKey: string,
  side: LimitOrderSide,
): {
  depositAsset: string;
  baseAsset: string;
  quoteAsset: string;
} {
  const { baseAsset, quoteAsset } = resolvePoolAssets(poolKey);
  const depositAsset = side === "SELL" ? baseAsset : quoteAsset;
  return { depositAsset, baseAsset, quoteAsset };
}
