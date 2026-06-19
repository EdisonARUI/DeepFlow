import type { Transaction, TransactionObjectArgument } from "@mysten/sui/transactions";

export function appendDepositCoinToBalanceManager(
  tx: Transaction,
  params: {
    packageId: string;
    managerId: string;
    coinType: string;
    coin: TransactionObjectArgument;
  },
): void {
  tx.moveCall({
    target: `${params.packageId}::balance_manager::deposit`,
    arguments: [tx.object(params.managerId), params.coin],
    typeArguments: [params.coinType],
  });
}

export function appendDepositCoinToBalanceManagerArg(
  tx: Transaction,
  params: {
    packageId: string;
    manager: TransactionObjectArgument;
    coinType: string;
    coin: TransactionObjectArgument;
  },
): void {
  tx.moveCall({
    target: `${params.packageId}::balance_manager::deposit`,
    arguments: [params.manager, params.coin],
    typeArguments: [params.coinType],
  });
}
