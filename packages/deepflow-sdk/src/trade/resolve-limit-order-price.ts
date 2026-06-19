import { createDeepbookClient } from "../sui/deepbook-client.ts";

/** Round a human-readable limit price to the pool tick size. */
export async function resolveTickAlignedLimitPrice(
  poolKey: string,
  price: number,
): Promise<number> {
  const client = createDeepbookClient();
  const { tickSize } = await client.deepbook.poolBookParams(poolKey);
  if (!Number.isFinite(tickSize) || tickSize <= 0) {
    return price;
  }
  return Math.round(price / tickSize) * tickSize;
}
