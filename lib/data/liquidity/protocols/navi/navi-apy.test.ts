import { describe, expect, it } from "vitest";

import { formatLiquidityApr } from "../../liquidity-formatters";
import { parseNaviAprPercentToBps } from "./navi-apy";

describe("parseNaviAprPercentToBps", () => {
  it.each([
    ["0.537", 54],
    ["4.908", 491],
    ["8.1", 810],
    ["0.488", 49],
  ])("parses %s to %i bps", (aprPercent, expectedBps) => {
    expect(parseNaviAprPercentToBps(aprPercent)).toBe(expectedBps);
  });

  it("returns 0 for invalid input", () => {
    expect(parseNaviAprPercentToBps("not-a-number")).toBe(0);
  });
});

describe("formatLiquidityApr", () => {
  it.each([
    [54, "+0.54%"],
    [491, "+4.9%"],
    [810, "+8.1%"],
    [49, "+0.49%"],
  ])("formats %i bps as %s", (bps, expected) => {
    expect(formatLiquidityApr(bps)).toBe(expected);
  });
});
