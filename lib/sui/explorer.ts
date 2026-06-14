import { SUI_NETWORK } from "./network";

export function getTransactionExplorerUrl(digest: string): string {
  return `https://suiscan.xyz/${SUI_NETWORK}/tx/${digest}`;
}
