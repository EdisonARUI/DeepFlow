import {
  depositCoinPTB,
  getCoins,
  getPool,
  mergeCoinsPTB,
  withdrawCoinPTB,
} from "@naviprotocol/lending";
import { DeepBookConfig, DeepBookContract } from "@mysten/deepbook-v3";
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { Transaction } from "@mysten/sui/transactions";

import { appendNaviOraclePreamble } from "../credit-source/navi/append-navi-oracle-preamble.ts";
import { toSafeAmountNumber } from "../credit-source/navi/amount.ts";
import { NAVI_ENV, NAVI_MAIN_MARKET } from "../credit-source/navi/constants.ts";
import { resolveNaviPoolKey } from "../credit-source/navi/resolve-navi-pool-key.ts";
import { SUI_NETWORK } from "../sui/client.ts";

export interface BuildTradeBootstrapTxParams {
  sender: string;
  suiAmount: bigint;
  minUsdcOut: bigint;
  deepAmount: number;
  deepbookPoolKey?: string;
  client: SuiJsonRpcClient;
}

const SUI_ASSET = "SUI";
const USDC_ASSET = "USDC";

function isSuiCoin(coinType: string): boolean {
  const normalized = coinType.toLowerCase();
  return normalized === "0x2::sui::sui" || normalized.endsWith("::sui::sui");
}

export async function buildTradeBootstrapTx(
  params: BuildTradeBootstrapTxParams,
): Promise<Transaction> {
  const {
    sender,
    suiAmount,
    minUsdcOut,
    deepAmount,
    deepbookPoolKey = "SUI_USDC",
    client,
  } = params;

  if (suiAmount <= 0n) {
    throw new Error("sui amount must be positive");
  }
  if (minUsdcOut <= 0n) {
    throw new Error("minUsdcOut must be positive");
  }
  if (deepAmount < 0) {
    throw new Error("deepAmount must be non-negative");
  }

  const supplyAmountNumber = toSafeAmountNumber(suiAmount, "supply amount");
  const withdrawAmountNumber = supplyAmountNumber;

  const suiPoolKey = await resolveNaviPoolKey(SUI_ASSET);
  const suiPool = await getPool(suiPoolKey, { env: NAVI_ENV, market: NAVI_MAIN_MARKET });
  const suiCoinType = suiPool.suiCoinType;

  const tx = new Transaction();
  tx.setSender(sender);

  const coins = await getCoins(sender, { coinType: suiCoinType, client });
  if (coins.length === 0) {
    throw new Error(`No SUI coins in wallet for sender ${sender}`);
  }

  const suiCoinObject = isSuiCoin(suiCoinType)
    ? mergeCoinsPTB(tx, coins, { balance: supplyAmountNumber, useGasCoin: true })
    : mergeCoinsPTB(tx, coins, { balance: supplyAmountNumber });

  await appendNaviOraclePreamble(tx, sender, [SUI_ASSET, USDC_ASSET], client);

  await depositCoinPTB(tx, suiPoolKey, suiCoinObject, {
    env: NAVI_ENV,
    market: NAVI_MAIN_MARKET,
    amount: supplyAmountNumber,
  });

  const withdrawnSuiCoin = await withdrawCoinPTB(tx, suiPoolKey, withdrawAmountNumber, {
    env: NAVI_ENV,
    market: NAVI_MAIN_MARKET,
  });

  const deepBookConfig = new DeepBookConfig({
    address: sender,
    network: SUI_NETWORK,
  });
  const deepBook = new DeepBookContract(deepBookConfig);

  // Fee strategy (must stay paired with Dashboard quote API):
  // - deepAmount === 0 → input-fee: pool::swap_exact_quantity sets pay_with_deep=false,
  //   taker fee deducted from SUI input; no wallet DEEP required.
  // - deepAmount > 0  → DEEP-fee: SDK synthesizes DEEP via coinWithBalance; sender must
  //   hold enough DEEP. Pair with getQuoteQuantityOut, not getQuoteQuantityOutInputFee.
  const [baseChange, usdcCoin, deepChange] = tx.add(
    deepBook.swapExactQuantity({
      poolKey: deepbookPoolKey,
      isBaseToCoin: true,
      baseCoin: withdrawnSuiCoin,
      amount: suiAmount,
      minOut: minUsdcOut,
      deepAmount,
    }),
  );

  tx.transferObjects([baseChange, deepChange], sender);

  const usdcPoolKey = await resolveNaviPoolKey(USDC_ASSET);
  await depositCoinPTB(tx, usdcPoolKey, usdcCoin, {
    env: NAVI_ENV,
    market: NAVI_MAIN_MARKET,
  });

  return tx;
}
