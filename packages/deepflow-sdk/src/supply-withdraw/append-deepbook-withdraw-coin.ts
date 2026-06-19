import { mainnetCoins, mainnetPackageIds } from "@mysten/deepbook-v3";
import type { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions";

const ASSET_TO_COIN_KEY: Record<string, keyof typeof mainnetCoins> = {
  USDC: "USDC",
  SUI: "SUI",
  WAL: "WAL",
  DEEP: "DEEP",
  SUIUSDE: "SUIUSDE",
  XBTC: "XBTC",
};

function normalizeCoinType(coinType: string): string {
  return coinType.toLowerCase();
}

function resolveDeepbookCoinKeyByType(coinType: string): keyof typeof mainnetCoins | undefined {
  const normalized = normalizeCoinType(coinType);
  for (const [key, coin] of Object.entries(mainnetCoins)) {
    if (coin.type.toLowerCase() === normalized) {
      return key as keyof typeof mainnetCoins;
    }
  }
  return undefined;
}

export function resolveDeepbookCoinKey(asset: string): keyof typeof mainnetCoins {
  const normalized = asset.toUpperCase();
  const symbolKey = ASSET_TO_COIN_KEY[normalized];
  if (symbolKey) {
    return symbolKey;
  }

  if (asset.includes("::")) {
    const typeKey = resolveDeepbookCoinKeyByType(asset);
    if (typeKey) {
      return typeKey;
    }
  }

  throw new Error(`Asset ${asset} is not supported for DeepBook BalanceManager withdraw`);
}

export function resolveDeepbookCoinType(asset: string): string {
  const coinKey = resolveDeepbookCoinKey(asset);
  return mainnetCoins[coinKey].type;
}

export function appendDeepbookWithdrawCoin(
  tx: Transaction,
  params: {
    managerId: string;
    coinType: string;
    amount: bigint;
    packageId?: string;
  },
): TransactionObjectArgument {
  if (params.amount <= 0n) {
    throw new Error("withdraw amount must be positive");
  }

  const packageId = params.packageId ?? mainnetPackageIds.DEEPBOOK_PACKAGE_ID;

  return tx.moveCall({
    target: `${packageId}::balance_manager::withdraw`,
    arguments: [tx.object(params.managerId), tx.pure.u64(params.amount)],
    typeArguments: [params.coinType],
  });
}
