import { describe, expect, it } from "vitest";

import { alignHumanBaseAmountToLot } from "../src/amount/align-human-base-amount-to-lot.ts";
import { computeBaseQuantityFromQuotePay } from "../src/amount/compute-base-quantity-from-quote-pay.ts";
import { formatBaseUnitsToHuman } from "../src/amount/format-base-units-to-human.ts";
import { parseAmountToBaseUnits } from "../src/amount/parse-base-units.ts";
import { truncateHumanAmountDecimals } from "../src/amount/truncate-human-amount-decimals.ts";
import { alignBaseUnitsToLot } from "../src/trade/align-base-units-to-lot.ts";
import { formatLimitOrderMinLabel } from "../src/trade/format-limit-order-min-label.ts";

describe("formatBaseUnitsToHuman", () => {
  it("formats whole amounts without trailing zeros", () => {
    expect(formatBaseUnitsToHuman(10_000_000n, 6)).toBe("10");
  });

  it("formats fractional amounts", () => {
    expect(formatBaseUnitsToHuman(11_876_484n, 6)).toBe("11.876484");
  });
});

describe("truncateHumanAmountDecimals", () => {
  it("truncates excess fractional digits", () => {
    expect(truncateHumanAmountDecimals("11.876484561755344", 6)).toBe("11.876484");
  });

  it("preserves amounts within precision", () => {
    expect(truncateHumanAmountDecimals("1.5", 9)).toBe("1.5");
  });
});

describe("computeBaseQuantityFromQuotePay", () => {
  it("converts DEEP/SUI BUY pay amount without exceeding base decimals", () => {
    const baseQuantity = computeBaseQuantityFromQuotePay("1", "0.0842", 9, 6);
    expect(baseQuantity).toBe("11.876484");
    expect(() => parseAmountToBaseUnits(baseQuantity, 6)).not.toThrow();
  });

  it("converts WAL/SUI BUY pay amount without exceeding base decimals", () => {
    const baseQuantity = computeBaseQuantityFromQuotePay("1", "0.122", 9, 9);
    expect(baseQuantity.split(".")[1]?.length ?? 0).toBeLessThanOrEqual(9);
    expect(() => parseAmountToBaseUnits(baseQuantity, 9)).not.toThrow();
  });

  it("returns empty string for invalid inputs", () => {
    expect(computeBaseQuantityFromQuotePay("", "0.0842", 9, 6)).toBe("");
    expect(computeBaseQuantityFromQuotePay("1", "", 9, 6)).toBe("");
    expect(computeBaseQuantityFromQuotePay("1", "0", 9, 6)).toBe("");
  });

  it("aligns BUY pay conversion down to lot_size", () => {
    const lotBaseUnits = 1_000_000n;
    const baseQuantity = computeBaseQuantityFromQuotePay(
      "1",
      "0.0235",
      9,
      6,
      lotBaseUnits,
    );

    expect(baseQuantity).toBe("42");
    expect(parseAmountToBaseUnits(baseQuantity, 6) % lotBaseUnits).toBe(0n);
  });
});

describe("alignBaseUnitsToLot", () => {
  it("floors base units to lot multiple", () => {
    expect(alignBaseUnitsToLot(42_553_191n, 1_000_000n)).toBe(42_000_000n);
  });
});

describe("alignHumanBaseAmountToLot", () => {
  it("aligns human base input down to lot multiple", () => {
    expect(alignHumanBaseAmountToLot("10.5", 6, 1_000_000n)).toBe("10");
  });
});

describe("formatLimitOrderMinLabel", () => {
  const bounds = {
    minBaseUnits: 10_000_000n,
    lotBaseUnits: 1_000_000n,
    minSizeHuman: 10,
    lotSizeHuman: 1,
    baseAsset: "DEEP",
  };

  it("shows base min for SELL", () => {
    expect(
      formatLimitOrderMinLabel({
        bounds,
        side: "SELL",
        price: 0.0842,
        quoteAsset: "SUI",
      }),
    ).toBe("Min: 10 DEEP");
  });

  it("shows quote min for BUY", () => {
    expect(
      formatLimitOrderMinLabel({
        bounds,
        side: "BUY",
        price: 0.0842,
        quoteAsset: "SUI",
      }),
    ).toBe("Min: 0.8420 SUI");
  });
});
