/** Dashboard DeepBook adapter 注入的链上报价，SDK 不直接依赖 @mysten/deepbook-v3。 */
export interface DeepbookQuoteInput {
  estimatedOutput: bigint;
  minOutput: bigint;
  feeDeepAmount: bigint;
  feeLabel: string;
  slippageBps: number;
}
