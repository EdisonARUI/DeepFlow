import { describe, expect, it } from "vitest";

import { parseAmountToBaseUnits } from "../src/amount/parse-base-units.ts";

describe("parseAmountToBaseUnits", () => {
  it("parses integer amounts", () => {
    expect(parseAmountToBaseUnits("12", 6)).toBe(12_000_000n);
  });

  it("parses decimal amounts", () => {
    expect(parseAmountToBaseUnits("12.50", 6)).toBe(12_500_000n);
  });

  it("parses amounts with fewer fraction digits than decimals", () => {
    expect(parseAmountToBaseUnits("1.5", 9)).toBe(1_500_000_000n);
  });

  it("trims whitespace", () => {
    expect(parseAmountToBaseUnits("  1.00  ", 6)).toBe(1_000_000n);
  });

  it("rejects empty amounts", () => {
    expect(() => parseAmountToBaseUnits("", 6)).toThrow(/required/);
    expect(() => parseAmountToBaseUnits("   ", 6)).toThrow(/required/);
  });

  it("rejects zero and non-positive amounts", () => {
    expect(() => parseAmountToBaseUnits("0", 6)).toThrow(/positive/);
    expect(() => parseAmountToBaseUnits("0.00", 6)).toThrow(/positive/);
  });

  it("rejects invalid formats", () => {
    expect(() => parseAmountToBaseUnits("abc", 6)).toThrow(/Invalid amount/);
    expect(() => parseAmountToBaseUnits("1.2.3", 6)).toThrow(/Invalid amount/);
    expect(() => parseAmountToBaseUnits("-1", 6)).toThrow(/Invalid amount/);
  });

  it("rejects precision overflow", () => {
    expect(() => parseAmountToBaseUnits("1.1234567", 6)).toThrow(/decimal places/);
  });
});
