export type TradingWriteMode = "simulate" | "execute";

export function resolveTradingWriteMode(): TradingWriteMode {
  return process.env.NEXT_PUBLIC_TRADING_WRITE_MODE === "execute" ? "execute" : "simulate";
}
