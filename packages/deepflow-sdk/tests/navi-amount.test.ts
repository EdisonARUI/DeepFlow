import { describe, expect, it } from "vitest";

import { toSafeAmountNumber } from "../src/credit-source/navi/amount.ts";

describe("toSafeAmountNumber", () => {
  it("rejects zero and negative amounts", () => {
    expect(() => toSafeAmountNumber(0n)).toThrow(/positive/);
    expect(() => toSafeAmountNumber(-1n)).toThrow(/positive/);
  });

  it("accepts safe positive integers", () => {
    expect(toSafeAmountNumber(1_000n)).toBe(1000);
  });
});
