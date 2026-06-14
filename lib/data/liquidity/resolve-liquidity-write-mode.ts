export type LiquidityWriteMode = "simulate" | "execute";

export function resolveLiquidityWriteMode(): LiquidityWriteMode {
  return process.env.NEXT_PUBLIC_LIQUIDITY_WRITE_MODE === "execute" ? "execute" : "simulate";
}
