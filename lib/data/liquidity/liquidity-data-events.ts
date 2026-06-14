type LiquidityPositionsChangedListener = () => void;

const listeners = new Set<LiquidityPositionsChangedListener>();

/** Notify subscribers that on-chain liquidity positions may have changed. */
export function notifyLiquidityPositionsChanged() {
  for (const listener of listeners) {
    listener();
  }
}

/** Subscribe to liquidity position changes (e.g. after Supply execute). */
export function subscribeLiquidityPositionsChanged(
  listener: LiquidityPositionsChangedListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
