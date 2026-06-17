import { getCoins, getPool, mergeCoinsPTB } from "@naviprotocol/lending";
import { DeepBookConfig, DeepBookContract, mainnetCoins, mainnetPools } from "@mysten/deepbook-v3";
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import {
  Transaction,
  type TransactionObjectArgument,
} from "@mysten/sui/transactions";

import { toSafeAmountNumber } from "../credit-source/navi/amount.ts";
import { NAVI_ENV, NAVI_MAIN_MARKET } from "../credit-source/navi/constants.ts";
import { resolveNaviPoolKey } from "../credit-source/navi/resolve-navi-pool-key.ts";
import { SUI_NETWORK } from "../sui/client.ts";

export interface TradeSwapLegParams {
  sender: string;
  poolKey: string;
  inputAsset: string;
  outputAsset: string;
  inputAmount: bigint;
  minOutput: bigint;
  deepAmount: number;
  client?: SuiJsonRpcClient;
}

export function requireNaviClient(client: SuiJsonRpcClient | undefined): SuiJsonRpcClient {
  if (!client) {
    throw new Error("NAVI trade route requires a Sui JSON-RPC client");
  }
  return client;
}

export type SwapDirection = {
  isBaseToCoin: boolean;
  baseAsset: string;
  quoteAsset: string;
};

function normalizeAsset(asset: string): string {
  return asset.toUpperCase();
}

function isSuiCoin(coinType: string): boolean {
  const normalized = coinType.toLowerCase();
  return normalized === "0x2::sui::sui" || normalized.endsWith("::sui::sui");
}

export function resolvePoolAssets(poolKey: string): { baseAsset: string; quoteAsset: string } {
  const pool = mainnetPools[poolKey as keyof typeof mainnetPools];
  if (!pool) {
    throw new Error(`Unknown DeepBook pool: ${poolKey}`);
  }

  return {
    baseAsset: pool.baseCoin,
    quoteAsset: pool.quoteCoin,
  };
}

export function resolveSwapDirection(poolKey: string, inputAsset: string): SwapDirection {
  const { baseAsset, quoteAsset } = resolvePoolAssets(poolKey);
  const normalizedInput = normalizeAsset(inputAsset);

  if (normalizeAsset(baseAsset) === normalizedInput) {
    return { isBaseToCoin: true, baseAsset, quoteAsset };
  }

  if (normalizeAsset(quoteAsset) === normalizedInput) {
    return { isBaseToCoin: false, baseAsset, quoteAsset };
  }

  throw new Error(
    `Input asset ${inputAsset} is not part of pool ${poolKey} (${baseAsset}/${quoteAsset})`,
  );
}

export function assertSwapLegAssets(
  poolKey: string,
  inputAsset: string,
  outputAsset: string,
): SwapDirection {
  const direction = resolveSwapDirection(poolKey, inputAsset);
  const expectedOutput = direction.isBaseToCoin ? direction.quoteAsset : direction.baseAsset;

  if (normalizeAsset(expectedOutput) !== normalizeAsset(outputAsset)) {
    throw new Error(
      `Output asset ${outputAsset} does not match pool ${poolKey} direction for input ${inputAsset}`,
    );
  }

  return direction;
}

export function resolveOutputDecimals(outputAsset: string): number {
  const coin = mainnetCoins[outputAsset as keyof typeof mainnetCoins];
  if (!coin?.scalar) {
    throw new Error(`Unknown output asset decimals: ${outputAsset}`);
  }

  const scalar = BigInt(coin.scalar);
  let decimals = 0;
  let value = scalar;
  while (value > 1n) {
    if (value % 10n !== 0n) {
      throw new Error(`Unsupported non-power-of-10 scalar for ${outputAsset}`);
    }
    value /= 10n;
    decimals += 1;
  }

  return decimals;
}

export function validateSwapLegParams(params: TradeSwapLegParams): SwapDirection {
  if (params.inputAmount <= 0n) {
    throw new Error("input amount must be positive");
  }
  if (params.minOutput <= 0n) {
    throw new Error("minOutput must be positive");
  }
  if (params.deepAmount < 0) {
    throw new Error("deepAmount must be non-negative");
  }

  return assertSwapLegAssets(params.poolKey, params.inputAsset, params.outputAsset);
}

export async function mergeWalletInputCoin(
  tx: Transaction,
  sender: string,
  inputAsset: string,
  inputAmount: bigint,
  client: SuiJsonRpcClient,
): Promise<TransactionObjectArgument> {
  const inputPoolKey = await resolveNaviPoolKey(inputAsset);
  const inputPool = await getPool(inputPoolKey, { env: NAVI_ENV, market: NAVI_MAIN_MARKET });
  const inputCoinType = inputPool.suiCoinType;

  const coins = await getCoins(sender, { coinType: inputCoinType, client });
  if (coins.length === 0) {
    throw new Error(`No ${inputAsset} coins in wallet for sender ${sender}`);
  }

  const swapAmountNumber = toSafeAmountNumber(inputAmount, "swap amount");

  return (isSuiCoin(inputCoinType)
    ? mergeCoinsPTB(tx, coins, {
        balance: swapAmountNumber,
        useGasCoin: true,
      })
    : mergeCoinsPTB(tx, coins, {
        balance: swapAmountNumber,
      })) as TransactionObjectArgument;
}

export function createDeepbookContract(sender: string): DeepBookContract {
  const deepBookConfig = new DeepBookConfig({
    address: sender,
    network: SUI_NETWORK,
  });

  return new DeepBookContract(deepBookConfig);
}

export function appendDeepbookSwap(
  tx: Transaction,
  deepBook: DeepBookContract,
  params: {
    poolKey: string;
    inputCoin: TransactionObjectArgument;
    inputAmount: bigint;
    minOutput: bigint;
    isBaseToCoin: boolean;
    deepAmount: number;
  },
) {
  const swapArgs = {
    poolKey: params.poolKey,
    isBaseToCoin: params.isBaseToCoin,
    amount: params.inputAmount,
    minOut: params.minOutput,
    deepAmount: params.deepAmount,
    ...(params.isBaseToCoin
      ? { baseCoin: params.inputCoin }
      : { quoteCoin: params.inputCoin }),
  };

  const [baseResult, quoteResult, deepChange] = tx.add(deepBook.swapExactQuantity(swapArgs));

  const inputChange = params.isBaseToCoin ? baseResult : quoteResult;
  const outputCoin = params.isBaseToCoin ? quoteResult : baseResult;

  return { inputChange, outputCoin, deepChange };
}
