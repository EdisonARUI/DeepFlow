import { mainnetCoins, mainnetPools } from "@mysten/deepbook-v3";
import { expect } from "vitest";

import { getReferralId } from "../../src/deepbook/referral-config.ts";
import { createSuilendExecutionContext } from "../../src/credit-source/suilend/create-suilend-client.ts";
import { requireExistingSuilendObligation } from "../../src/credit-source/suilend/resolve-obligation-cap.ts";
import { createDeepbookClient } from "../../src/sui/deepbook-client.ts";
import {
  balanceManagerConfigEntry,
  DEFAULT_BALANCE_MANAGER_KEY,
  resolveUserBalanceManager,
} from "../../src/trade/resolve-user-balance-manager.ts";
import type { LimitOrderSide } from "../../src/trade/resolve-deepbook-limit-order.ts";
import type { LimitOrderFundSource } from "../../src/trade/simulate-limit-order.ts";
import type { LimitOrderSimulationParams } from "../../src/trade/simulate-limit-order.ts";
import type { SimulationMode, SimulationResult } from "../../src/simulation/simulate-transaction.ts";
import { simulateLimitOrder } from "../../src/trade/simulate-limit-order.ts";
import { resolveTickAlignedLimitPrice } from "../../src/trade/resolve-limit-order-price.ts";

export const shouldRun = process.env.RUN_MAINNET_INTEGRATION === "1";
export const sender = process.env.INTEGRATION_SENDER;
export const poolKey = process.env.INTEGRATION_POOL_KEY ?? "SUI_USDC";
/** Wallet SELL integration always sells SUI on SUI_USDC, regardless of INTEGRATION_POOL_KEY. */
export const WALLET_SELL_POOL_KEY = "SUI_USDC";
export const quantityBaseUnits = BigInt(process.env.INTEGRATION_AMOUNT ?? "1000000000");
/** Wallet BUY quantity (base units); default follows pool minSize at test runtime. */
export const walletBuyQuantityBaseUnits = process.env.INTEGRATION_BUY_AMOUNT
  ? BigInt(process.env.INTEGRATION_BUY_AMOUNT)
  : undefined;
/** Protocol SELL quantity override (base units); decoupled from wallet SUI INTEGRATION_AMOUNT. */
export const protocolSellQuantityBaseUnits = process.env.INTEGRATION_PROTOCOL_AMOUNT
  ? BigInt(process.env.INTEGRATION_PROTOCOL_AMOUNT)
  : undefined;

function defaultProtocolSellQuantity(targetPoolKey: string): bigint {
  const pool = mainnetPools[targetPoolKey as keyof typeof mainnetPools];
  if (pool?.baseCoin === "DEEP") {
    return 10_000_000n;
  }
  return quantityBaseUnits;
}

export function resolveProtocolSellQuantity(targetPoolKey: string = poolKey): bigint {
  if (protocolSellQuantityBaseUnits !== undefined) {
    return protocolSellQuantityBaseUnits;
  }
  return defaultProtocolSellQuantity(targetPoolKey);
}
export const withReferral = process.env.INTEGRATION_WITH_REFERRAL === "1";
export const referralId = getReferralId(poolKey);
export const openOrderIdOverride = process.env.INTEGRATION_OPEN_ORDER_ID;

const SUI_ADDRESS_RE = /^0x[a-fA-F0-9]{64}$/;

export function isValidIntegrationSender(value?: string): boolean {
  if (!value) {
    return false;
  }
  if (value.includes("...")) {
    return false;
  }
  return SUI_ADDRESS_RE.test(value);
}

export const integrationReady = shouldRun && isValidIntegrationSender(sender);

if (shouldRun && sender && !isValidIntegrationSender(sender)) {
  console.warn(
    "[limit-order integration] INTEGRATION_SENDER is invalid; skipping integration tests. " +
      "Use a real 66-character Sui address (0x + 64 hex), not the 0x... placeholder.",
  );
}

function resolveIntegrationReferralId(targetPoolKey: string = poolKey): string {
  if (!withReferral) {
    return "";
  }
  return getReferralId(targetPoolKey) ?? "";
}

export function humanBaseQuantity(amount: bigint, scalar: number): number {
  return Number(amount) / scalar;
}

export async function resolveLimitPrice(targetPoolKey: string = poolKey): Promise<number> {
  const configured = process.env.INTEGRATION_LIMIT_PRICE;
  if (configured && Number.isFinite(Number(configured))) {
    return Number(configured);
  }

  try {
    const client = createDeepbookClient();
    const mid = await client.deepbook.midPrice(targetPoolKey);
    return resolveTickAlignedLimitPrice(targetPoolKey, mid);
  } catch (error) {
    throw new Error(
      `Failed to fetch mid price for ${targetPoolKey}. Set INTEGRATION_LIMIT_PRICE or check RPC connectivity. ` +
        `Cause: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function resolveMinOrderQuantityBaseUnits(
  targetPoolKey: string = poolKey,
): Promise<bigint> {
  const client = createDeepbookClient();
  const bookParams = await client.deepbook.poolBookParams(targetPoolKey);
  const pool = mainnetPools[targetPoolKey as keyof typeof mainnetPools];
  if (!pool) {
    throw new Error(`Unknown pool ${targetPoolKey}`);
  }
  const baseCoin = mainnetCoins[pool.baseCoin as keyof typeof mainnetCoins];
  if (!baseCoin) {
    throw new Error(`Missing coin metadata for pool ${targetPoolKey}`);
  }
  return BigInt(Math.ceil(bookParams.minSize * baseCoin.scalar));
}

export async function buildLimitOrderParams(options: {
  fundSource: LimitOrderFundSource;
  side: LimitOrderSide;
  poolKey?: string;
  quantityBaseUnits?: bigint;
}): Promise<LimitOrderSimulationParams> {
  const targetPoolKey = options.poolKey ?? poolKey;
  const price = await resolveLimitPrice(targetPoolKey);
  const minQuantity = await resolveMinOrderQuantityBaseUnits(targetPoolKey);
  const resolvedQuantity =
    options.quantityBaseUnits ??
    (options.side === "SELL" && options.fundSource !== "wallet"
      ? resolveProtocolSellQuantity(targetPoolKey)
      : options.side === "BUY" && options.fundSource === "wallet"
        ? (walletBuyQuantityBaseUnits ?? minQuantity)
        : quantityBaseUnits);

  const quantityBaseUnitsFinal =
    resolvedQuantity >= minQuantity ? resolvedQuantity : minQuantity;

  return {
    sender: sender!,
    poolKey: targetPoolKey,
    side: options.side,
    price,
    quantityBaseUnits: quantityBaseUnitsFinal,
    fundSource: options.fundSource,
    referralId: resolveIntegrationReferralId(targetPoolKey),
  };
}

export async function buildWalletBuyLimitOrderParams(): Promise<LimitOrderSimulationParams> {
  return buildLimitOrderParams({
    fundSource: "wallet",
    side: "BUY",
  });
}

export async function buildWalletSellLimitOrderParams(): Promise<LimitOrderSimulationParams> {
  return buildLimitOrderParams({
    fundSource: "wallet",
    side: "SELL",
    poolKey: WALLET_SELL_POOL_KEY,
  });
}

export async function resolveManagerAndOpenOrder(
  targetPoolKey: string = poolKey,
): Promise<{ managerId: string | null; openOrderId?: string }> {
  const { managerId } = await resolveUserBalanceManager(sender!);
  if (!managerId) {
    return { managerId: null };
  }

  if (openOrderIdOverride) {
    return { managerId, openOrderId: openOrderIdOverride };
  }

  const client = createDeepbookClient(sender!, {
    balanceManagers: balanceManagerConfigEntry(managerId),
  });

  const openOrderIds = await client.deepbook.accountOpenOrders(
    targetPoolKey,
    DEFAULT_BALANCE_MANAGER_KEY,
  );

  return {
    managerId,
    openOrderId: openOrderIds[0],
  };
}

export async function hasSuilendObligation(): Promise<boolean> {
  try {
    const context = await createSuilendExecutionContext();
    await requireExistingSuilendObligation({ sender: sender!, context });
    return true;
  } catch {
    return false;
  }
}

export async function canSimulateNaviLimitSell(): Promise<boolean> {
  try {
    const params = await buildLimitOrderParams({ fundSource: "navi", side: "SELL" });
    const result = await simulateLimitOrder(params);
    return result.ok;
  } catch {
    return false;
  }
}

export async function canSimulateSuilendLimitSell(): Promise<boolean> {
  try {
    const params = await buildLimitOrderParams({ fundSource: "suilend", side: "SELL" });
    const result = await simulateLimitOrder(params);
    return result.ok;
  } catch {
    return false;
  }
}

export function assertSimulationOk(
  result: SimulationResult & { transaction?: unknown },
  mode: SimulationMode,
): void {
  if (!result.ok) {
    throw new Error(
      `Expected ${mode} simulation to pass but got error: ${result.error ?? "unknown"}`,
    );
  }

  expect(result.transaction).toBeDefined();
  expect(result.mode).toBe(mode);
  expect(result.ok).toBe(true);
}

export function resolvePoolBaseAsset(targetPoolKey: string = poolKey): string {
  const pool = mainnetPools[targetPoolKey as keyof typeof mainnetPools];
  if (!pool) {
    throw new Error(`Unknown pool ${targetPoolKey}`);
  }
  return pool.baseCoin;
}
