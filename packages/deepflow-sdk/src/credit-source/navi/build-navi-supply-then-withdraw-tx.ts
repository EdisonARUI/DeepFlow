import {
  depositCoinPTB,
  getCoins,
  getPool,
  mergeCoinsPTB,
  withdrawCoinPTB,
} from "@naviprotocol/lending";
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";

import { appendNaviOraclePreamble } from "./append-navi-oracle-preamble.ts";
import { toSafeAmountNumber } from "./amount.ts";
import { NAVI_ENV, NAVI_MAIN_MARKET } from "./constants.ts";
import { resolveNaviPoolKey } from "./resolve-navi-pool-key.ts";

export interface BuildNaviSupplyThenWithdrawTxParams {
  sender: string;
  asset: string;
  assetSymbol?: string;
  supplyAmount: bigint;
  withdrawAmount: bigint;
  client: SuiJsonRpcClient;
}

function isSuiCoin(coinType: string): boolean {
  const normalized = coinType.toLowerCase();
  return normalized === "0x2::sui::sui" || normalized.endsWith("::sui::sui");
}

function resolveDisplaySymbol(
  asset: string,
  assetSymbol: string | undefined,
  poolSymbol: string,
): string {
  return assetSymbol ?? (asset.includes("::") ? poolSymbol : asset);
}

export async function buildNaviSupplyThenWithdrawTx(
  params: BuildNaviSupplyThenWithdrawTxParams,
): Promise<Transaction> {
  const { sender, asset, assetSymbol, supplyAmount, withdrawAmount, client } = params;

  if (supplyAmount <= 0n) {
    throw new Error("supply amount must be positive");
  }
  if (withdrawAmount <= 0n) {
    throw new Error("withdraw amount must be positive");
  }
  if (withdrawAmount > supplyAmount) {
    throw new Error("withdraw amount cannot exceed supply amount");
  }

  const supplyAmountNumber = toSafeAmountNumber(supplyAmount, "supply amount");
  const withdrawAmountNumber = toSafeAmountNumber(withdrawAmount, "withdraw amount");

  const poolKey = await resolveNaviPoolKey(asset);
  const pool = await getPool(poolKey, { env: NAVI_ENV, market: NAVI_MAIN_MARKET });
  const coinType = pool.suiCoinType;
  const symbol = resolveDisplaySymbol(asset, assetSymbol, pool.token.symbol);

  const tx = new Transaction();
  tx.setSender(sender);

  const coins = await getCoins(sender, { coinType, client });
  if (coins.length === 0) {
    throw new Error(`No ${symbol} coins in wallet for sender ${sender}`);
  }

  const coinObject = isSuiCoin(coinType)
    ? mergeCoinsPTB(tx, coins, { balance: supplyAmountNumber, useGasCoin: true })
    : mergeCoinsPTB(tx, coins, { balance: supplyAmountNumber });

  await appendNaviOraclePreamble(tx, sender, [asset], client);

  await depositCoinPTB(tx, poolKey, coinObject, {
    env: NAVI_ENV,
    market: NAVI_MAIN_MARKET,
    amount: supplyAmountNumber,
  });

  const withdrawnCoin = await withdrawCoinPTB(tx, poolKey, withdrawAmountNumber, {
    env: NAVI_ENV,
    market: NAVI_MAIN_MARKET,
  });

  tx.transferObjects([withdrawnCoin], sender);

  return tx;
}
