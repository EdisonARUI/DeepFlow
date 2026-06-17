import { describe, expect, it } from "vitest";

import { toLiquidityPositionDisplay } from "../../lib/data/liquidity/liquidity-formatters.ts";
import type { LiquidityPositionView } from "../../lib/data/liquidity/types.ts";

function basePosition(overrides: Partial<LiquidityPositionView> = {}): LiquidityPositionView {
  return {
    id: "[NAVI]-USDC",
    protocol: "[NAVI]",
    protocolColor: "#18c8ff",
    asset: "USDC",
    coinType:
      "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
    tvlUsd: 1_000_000,
    supplyApyBps: 810,
    suppliedBalance: BigInt("12500500000"),
    walletCoinBalance: BigInt("5000000000"),
    decimals: 6,
    ...overrides,
  };
}

describe("toLiquidityPositionDisplay", () => {
  it("formats supplied and wallet coin balances separately", () => {
    const display = toLiquidityPositionDisplay(basePosition());

    expect(display.suppliedBalanceDisplay).toBe("12,500.50");
    expect(display.walletCoinBalanceDisplay).toBe("5,000.00");
  });
});
