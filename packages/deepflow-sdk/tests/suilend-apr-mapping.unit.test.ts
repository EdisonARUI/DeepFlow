import { describe, expect, it } from "vitest";

import { aprPercentToBps, tvlUsdFromReserve } from "../src/credit-source/suilend/resolve-suilend-coin-type.ts";

describe("Suilend APR/TVL mapping", () => {
  it("converts APR percent to basis points", () => {
    expect(aprPercentToBps(8.1)).toBe(810);
    expect(aprPercentToBps(0.081)).toBe(8);
  });

  it("reads TVL from depositedAmountUsd", () => {
    expect(
      tvlUsdFromReserve({
        depositedAmountUsd: { toNumber: () => 1_250_000.42 },
      } as never),
    ).toBe(1_250_000.42);
  });
});
