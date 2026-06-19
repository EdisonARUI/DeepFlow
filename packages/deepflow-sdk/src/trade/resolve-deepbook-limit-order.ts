import {
  FLOAT_SCALAR,
  GAS_BUDGET,
  mainnetCoins,
  mainnetPackageIds,
  mainnetPools,
  OrderType,
  SelfMatchingOptions,
} from "@mysten/deepbook-v3";
import type { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions";

import { createDeepbookClient } from "../sui/deepbook-client.ts";
import { appendDepositCoinToBalanceManagerArg } from "./append-deposit-to-balance-manager.ts";
import { resolveExpireTimestampArg } from "./resolve-limit-expire.ts";

function convertQuantity(value: number | bigint, scalar: number): bigint {
  return typeof value === "bigint" ? value : BigInt(Math.round(value * scalar));
}

function convertPrice(
  value: number | bigint,
  floatScalar: number,
  quoteScalar: number,
  baseScalar: number,
): bigint {
  return typeof value === "bigint"
    ? value
    : BigInt(Math.round((value * floatScalar * quoteScalar) / baseScalar));
}

function scalarToDecimals(scalar: number): number {
  let decimals = 0;
  let value = BigInt(scalar);
  while (value > 1n) {
    if (value % 10n !== 0n) {
      throw new Error(`Unsupported non-power-of-10 scalar: ${scalar}`);
    }
    value /= 10n;
    decimals += 1;
  }
  return decimals;
}

/** DeepBook fixed-point multiply: (a * b) / FLOAT_SCALAR */
export function deepBookMul(a: bigint, b: bigint): bigint {
  return (a * b) / BigInt(FLOAT_SCALAR);
}

export type LimitOrderSide = "BUY" | "SELL";

export type ResolvedLimitOrderDeposit = {
  depositAsset: string;
  depositAmount: bigint;
  quantityHuman: number;
  isBid: boolean;
  inputQuantity: bigint;
  inputPrice: bigint;
  makerFeeRaw: bigint;
};

export async function fetchPoolMakerFeeRaw(poolKey: string): Promise<bigint> {
  const client = createDeepbookClient();
  const { makerFee } = await client.deepbook.poolTradeParams(poolKey);
  return BigInt(Math.round(makerFee * FLOAT_SCALAR));
}

export function resolveLimitOrderDepositWithFee(params: {
  poolKey: string;
  side: LimitOrderSide;
  price: number;
  quantityBaseUnits: bigint;
  makerFeeRaw: bigint;
}): ResolvedLimitOrderDeposit {
  const { poolKey, side, price, quantityBaseUnits, makerFeeRaw } = params;
  const pool = mainnetPools[poolKey as keyof typeof mainnetPools];
  if (!pool) {
    throw new Error(`Unknown DeepBook pool: ${poolKey}`);
  }

  const baseCoin = mainnetCoins[pool.baseCoin as keyof typeof mainnetCoins];
  const quoteCoin = mainnetCoins[pool.quoteCoin as keyof typeof mainnetCoins];
  if (!baseCoin || !quoteCoin) {
    throw new Error(`Missing coin metadata for pool ${poolKey}`);
  }

  const baseDecimals = scalarToDecimals(baseCoin.scalar);
  const quantityHuman = Number(quantityBaseUnits) / 10 ** baseDecimals;

  if (quantityHuman <= 0 || !Number.isFinite(quantityHuman)) {
    throw new Error("quantity must be positive");
  }
  if (price <= 0 || !Number.isFinite(price)) {
    throw new Error("price must be positive");
  }

  const inputQuantity = convertQuantity(quantityBaseUnits, baseCoin.scalar);
  const inputPrice = convertPrice(price, FLOAT_SCALAR, quoteCoin.scalar, baseCoin.scalar);

  if (side === "SELL") {
    const makerFeeAmount = deepBookMul(makerFeeRaw, inputQuantity);
    return {
      depositAsset: pool.baseCoin,
      depositAmount: inputQuantity + makerFeeAmount,
      quantityHuman,
      isBid: false,
      inputQuantity,
      inputPrice,
      makerFeeRaw,
    };
  }

  const quoteQuantity = deepBookMul(inputQuantity, inputPrice);
  const makerFeeAmount = deepBookMul(makerFeeRaw, quoteQuantity);

  return {
    depositAsset: pool.quoteCoin,
    depositAmount: quoteQuantity + makerFeeAmount,
    quantityHuman,
    isBid: true,
    inputQuantity,
    inputPrice,
    makerFeeRaw,
  };
}

/** Principal-only deposit (legacy); prefer resolveLimitOrderDepositAmount. */
export function resolveLimitOrderDeposit(params: {
  poolKey: string;
  side: LimitOrderSide;
  price: number;
  quantityBaseUnits: bigint;
}): Omit<ResolvedLimitOrderDeposit, "inputQuantity" | "inputPrice" | "makerFeeRaw"> {
  const resolved = resolveLimitOrderDepositWithFee({ ...params, makerFeeRaw: 0n });
  return {
    depositAsset: resolved.depositAsset,
    depositAmount: resolved.depositAmount,
    quantityHuman: resolved.quantityHuman,
    isBid: resolved.isBid,
  };
}

export async function resolveLimitOrderDepositAmount(params: {
  poolKey: string;
  side: LimitOrderSide;
  price: number;
  quantityBaseUnits: bigint;
}): Promise<ResolvedLimitOrderDeposit> {
  const makerFeeRaw = await fetchPoolMakerFeeRaw(params.poolKey);
  return resolveLimitOrderDepositWithFee({ ...params, makerFeeRaw });
}

export async function validateLimitOrderParams(params: {
  poolKey: string;
  side: LimitOrderSide;
  price: number;
  quantityBaseUnits: bigint;
}): Promise<ResolvedLimitOrderDeposit> {
  if (params.quantityBaseUnits <= 0n) {
    throw new Error("quantity must be positive");
  }
  return resolveLimitOrderDepositAmount(params);
}

export function createClientOrderId(): string {
  return String(Date.now());
}

function bootstrapBalanceManager(
  tx: Transaction,
  params: {
    sender: string;
    packageId: string;
    registryId: string;
    referralId?: string;
  },
): TransactionObjectArgument {
  const { sender, packageId, registryId, referralId } = params;

  const manager = tx.moveCall({
    target: `${packageId}::balance_manager::new_with_custom_owner`,
    arguments: [tx.pure.address(sender)],
  });

  tx.moveCall({
    target: `${packageId}::balance_manager::register_balance_manager`,
    arguments: [manager, tx.object(registryId)],
  });

  if (referralId) {
    const tradeCap = tx.moveCall({
      target: `${packageId}::balance_manager::mint_trade_cap`,
      arguments: [manager],
    });

    tx.moveCall({
      target: `${packageId}::balance_manager::set_balance_manager_referral`,
      arguments: [manager, tx.object(referralId), tradeCap],
    });
  }

  return manager;
}

function appendPlaceLimitOrderCalls(
  tx: Transaction,
  params: {
    packageId: string;
    poolAddress: string;
    manager: TransactionObjectArgument;
    baseCoinType: string;
    quoteCoinType: string;
    clientOrderId: string;
    inputPrice: bigint;
    inputQuantity: bigint;
    isBid: boolean;
    payWithDeep?: boolean;
    expireAtMs?: number;
  },
): void {
  const expireTimestamp = resolveExpireTimestampArg(params.expireAtMs);
  const payWithDeep = params.payWithDeep ?? false;
  const tradeProof = tx.moveCall({
    target: `${params.packageId}::balance_manager::generate_proof_as_owner`,
    arguments: [params.manager],
  });

  tx.moveCall({
    target: `${params.packageId}::pool::place_limit_order`,
    arguments: [
      tx.object(params.poolAddress),
      params.manager,
      tradeProof,
      tx.pure.u64(BigInt(params.clientOrderId)),
      tx.pure.u8(OrderType.NO_RESTRICTION),
      tx.pure.u8(SelfMatchingOptions.SELF_MATCHING_ALLOWED),
      tx.pure.u64(params.inputPrice),
      tx.pure.u64(params.inputQuantity),
      tx.pure.bool(params.isBid),
      tx.pure.bool(payWithDeep),
      tx.pure.u64(expireTimestamp),
      tx.object.clock(),
    ],
    typeArguments: [params.baseCoinType, params.quoteCoinType],
  });
}

export function appendLimitOrderLeg(
  tx: Transaction,
  params: {
    sender: string;
    poolKey: string;
    inputPrice: bigint;
    inputQuantity: bigint;
    isBid: boolean;
    depositCoin: TransactionObjectArgument;
    depositCoinType: string;
    managerId: string | null;
    referralId?: string;
    clientOrderId: string;
    payWithDeep?: boolean;
    expireAtMs?: number;
  },
): void {
  tx.setGasBudgetIfNotSet(GAS_BUDGET);

  const {
    sender,
    poolKey,
    inputPrice,
    inputQuantity,
    isBid,
    depositCoin,
    depositCoinType,
    managerId,
    referralId,
    clientOrderId,
  } = params;

  const pool = mainnetPools[poolKey as keyof typeof mainnetPools];
  if (!pool) {
    throw new Error(`Unknown DeepBook pool: ${poolKey}`);
  }

  const baseCoin = mainnetCoins[pool.baseCoin as keyof typeof mainnetCoins];
  const quoteCoin = mainnetCoins[pool.quoteCoin as keyof typeof mainnetCoins];
  if (!baseCoin || !quoteCoin) {
    throw new Error(`Missing coin metadata for pool ${poolKey}`);
  }

  const packageId = mainnetPackageIds.DEEPBOOK_PACKAGE_ID;
  const registryId = mainnetPackageIds.REGISTRY_ID;

  const manager: TransactionObjectArgument = managerId
    ? tx.object(managerId)
    : bootstrapBalanceManager(tx, { sender, packageId, registryId, referralId });

  appendDepositCoinToBalanceManagerArg(tx, {
    packageId,
    manager,
    coinType: depositCoinType,
    coin: depositCoin,
  });

  appendPlaceLimitOrderCalls(tx, {
    packageId,
    poolAddress: pool.address,
    manager,
    baseCoinType: baseCoin.type,
    quoteCoinType: quoteCoin.type,
    clientOrderId,
    inputPrice,
    inputQuantity,
    isBid,
    payWithDeep: params.payWithDeep,
    expireAtMs: params.expireAtMs,
  });

  if (!managerId) {
    tx.moveCall({
      target: "0x2::transfer::public_share_object",
      arguments: [manager],
      typeArguments: [`${packageId}::balance_manager::BalanceManager`],
    });
  }
}
