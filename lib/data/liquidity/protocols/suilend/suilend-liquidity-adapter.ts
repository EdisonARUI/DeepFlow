import { SuilendClient } from "@suilend/sdk";
import { parseObligation } from "@suilend/sdk/parsers";
import BigNumber from "bignumber.js";

import type { LiquidityPositionRaw } from "../../types";
import type {
  LiquidityProtocolAdapter,
  ListLiquidityPositionsParams,
  ListLiquidityPositionsResult,
} from "../types";
import {
  createInitializedSuilendContext,
  LENDING_MARKET_TYPE,
} from "./suilend-client-factory";
import { createSuilendJsonRpcClient } from "./suilend-json-rpc-client";

const SUILEND_PROTOCOL_ID = "suilend" as const;
const SUILEND_PROTOCOL_LABEL = "[SUILEND]";
const SUILEND_PROTOCOL_COLOR = "#4ADE80";

const DEFAULT_SUILEND_ASSET_ALLOWLIST = [
  "USDC",
  "SUIUSDE",
  "SUI",
  "WAL",
  "DEEP",
  "XBTC",
] as const;

type ParsedReserve = Awaited<
  ReturnType<typeof createInitializedSuilendContext>
>["lendingMarket"]["reserves"][number];

function resolveSuilendAssetAllowlist(): readonly string[] {
  const override = process.env.NEXT_PUBLIC_SUILEND_ASSETS;
  if (!override) {
    return DEFAULT_SUILEND_ASSET_ALLOWLIST;
  }

  const parsed = override
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : DEFAULT_SUILEND_ASSET_ALLOWLIST;
}

function normalizeSymbol(symbol: string): string {
  return symbol.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function isAllowedAsset(symbol: string, allowlist: readonly string[]): boolean {
  const normalized = normalizeSymbol(symbol);
  return allowlist.some((asset) => normalizeSymbol(asset) === normalized);
}

function reserveSymbol(reserve: ParsedReserve): string {
  return reserve.token?.symbol ?? reserve.symbol;
}

function aprPercentToBps(aprPercent: BigNumber): number {
  if (!aprPercent.isFinite()) return 0;
  return Math.round(aprPercent.times(100).toNumber());
}

function depositedAmountToBaseUnits(
  depositedAmount: BigNumber,
  decimals: number,
): bigint {
  const raw = depositedAmount
    .times(new BigNumber(10).pow(decimals))
    .integerValue(BigNumber.ROUND_DOWN)
    .toFixed(0);
  try {
    return BigInt(raw);
  } catch {
    return BigInt(0);
  }
}

function buildParsedReserveMap(
  reserves: ParsedReserve[],
): Record<string, ParsedReserve> {
  return Object.fromEntries(reserves.map((reserve) => [reserve.coinType, reserve]));
}

async function buildSupplyBalanceMap(
  ownerAddress: string,
  reserves: ParsedReserve[],
  allowlist: readonly string[],
  grpcClient: Awaited<ReturnType<typeof createInitializedSuilendContext>>["grpcClient"],
): Promise<Map<string, bigint>> {
  const parsedReserveMap = buildParsedReserveMap(reserves);
  const caps = await SuilendClient.getObligationOwnerCaps(
    ownerAddress,
    [LENDING_MARKET_TYPE],
    grpcClient,
  );

  const balances = new Map<string, bigint>();

  for (const cap of caps) {
    const obligation = await SuilendClient.getObligation(
      cap.obligationId,
      [LENDING_MARKET_TYPE],
      grpcClient,
    );
    const parsed = parseObligation(obligation, parsedReserveMap);

    for (const deposit of parsed.deposits) {
      const symbol = reserveSymbol(deposit.reserve);
      if (!isAllowedAsset(symbol, allowlist)) continue;

      const key = normalizeSymbol(symbol);
      const amount = depositedAmountToBaseUnits(
        deposit.depositedAmount,
        deposit.reserve.mintDecimals,
      );
      balances.set(key, (balances.get(key) ?? BigInt(0)) + amount);
    }
  }

  return balances;
}

async function buildWalletCoinBalanceMap(
  ownerAddress: string,
  reserves: ParsedReserve[],
  allowlist: readonly string[],
): Promise<Map<string, bigint>> {
  const client = createSuilendJsonRpcClient();
  const filtered = reserves.filter((reserve) =>
    isAllowedAsset(reserveSymbol(reserve), allowlist),
  );

  const entries = await Promise.all(
    filtered.map(async (reserve) => {
      try {
        const { totalBalance } = await client.getBalance({
          owner: ownerAddress,
          coinType: reserve.coinType,
        });
        return [normalizeSymbol(reserveSymbol(reserve)), BigInt(totalBalance)] as const;
      } catch {
        return [normalizeSymbol(reserveSymbol(reserve)), BigInt(0)] as const;
      }
    }),
  );

  return new Map(entries);
}

function mapReservesToRows(
  reserves: ParsedReserve[],
  suppliedBalances: Map<string, bigint>,
  walletCoinBalances: Map<string, bigint>,
  allowlist: readonly string[],
): LiquidityPositionRaw[] {
  return reserves
    .filter((reserve) => isAllowedAsset(reserveSymbol(reserve), allowlist))
    .map((reserve) => {
      const symbol = reserveSymbol(reserve);
      const key = normalizeSymbol(symbol);
      return {
        protocol: SUILEND_PROTOCOL_ID,
        protocolLabel: SUILEND_PROTOCOL_LABEL,
        protocolColor: SUILEND_PROTOCOL_COLOR,
        asset: symbol,
        coinType: reserve.coinType,
        supplyApyBps: aprPercentToBps(reserve.depositAprPercent),
        tvlUsd: reserve.depositedAmountUsd.toNumber(),
        suppliedBalance: suppliedBalances.get(key) ?? BigInt(0),
        walletCoinBalance: walletCoinBalances.get(key) ?? BigInt(0),
        decimals: reserve.mintDecimals,
      };
    });
}

function sortByAllowlist(
  rows: LiquidityPositionRaw[],
  allowlist: readonly string[],
): LiquidityPositionRaw[] {
  const order = new Map(allowlist.map((asset, index) => [normalizeSymbol(asset), index]));

  return [...rows].sort((a, b) => {
    const aOrder = order.get(normalizeSymbol(a.asset)) ?? Number.MAX_SAFE_INTEGER;
    const bOrder = order.get(normalizeSymbol(b.asset)) ?? Number.MAX_SAFE_INTEGER;
    return aOrder - bOrder;
  });
}

export class SuilendLiquidityAdapter implements LiquidityProtocolAdapter {
  readonly protocolId = SUILEND_PROTOCOL_ID;

  async listPositions(params: ListLiquidityPositionsParams): Promise<ListLiquidityPositionsResult> {
    const ownerAddress = params.ownerAddress;
    const allowlist = resolveSuilendAssetAllowlist();

    let lendingMarket: Awaited<
      ReturnType<typeof createInitializedSuilendContext>
    >["lendingMarket"];
    let grpcClient: Awaited<
      ReturnType<typeof createInitializedSuilendContext>
    >["grpcClient"];

    try {
      ({ lendingMarket, grpcClient } = await createInitializedSuilendContext());
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unknown error while loading Suilend lending market";
      throw new Error(
        `Failed to load Suilend lending market on mainnet. Switch to mock mode or check RPC connectivity. (${message})`,
      );
    }

    const reserves = lendingMarket.reserves;
    let suppliedBalances = new Map<string, bigint>();
    let walletCoinBalances = new Map<string, bigint>();
    let walletBalanceWarning: string | undefined;
    let configurationWarning: string | undefined;

    if (ownerAddress) {
      try {
        suppliedBalances = await buildSupplyBalanceMap(
          ownerAddress,
          reserves,
          allowlist,
          grpcClient,
        );
      } catch (err) {
        console.warn(
          "[SuilendLiquidityAdapter] getObligation failed, supplied balances default to 0:",
          err,
        );
        walletBalanceWarning =
          "个人 supply 余额暂时无法加载，市场池数据正常展示。";
      }

      try {
        walletCoinBalances = await buildWalletCoinBalanceMap(
          ownerAddress,
          reserves,
          allowlist,
        );
      } catch (err) {
        console.warn(
          "[SuilendLiquidityAdapter] getBalance failed, wallet coin balances default to 0:",
          err,
        );
      }
    }

    const rows = sortByAllowlist(
      mapReservesToRows(reserves, suppliedBalances, walletCoinBalances, allowlist),
      allowlist,
    );

    if (reserves.length > 0 && rows.length === 0) {
      configurationWarning =
        "标的白名单与 mainnet reserve symbol 不匹配，请检查 NEXT_PUBLIC_SUILEND_ASSETS。";
    }

    return {
      positions: rows,
      walletBalanceWarning,
      configurationWarning,
    };
  }
}
