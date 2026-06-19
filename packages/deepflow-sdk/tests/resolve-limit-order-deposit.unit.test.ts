import { FLOAT_SCALAR } from "@mysten/deepbook-v3";
import { describe, expect, it } from "vitest";

import {
  deepBookMul,
  resolveLimitOrderDepositWithFee,
} from "../src/trade/resolve-deepbook-limit-order.ts";

const MAKER_FEE_RAW = BigInt(Math.round(0.0025 * FLOAT_SCALAR));

describe("resolveLimitOrderDepositWithFee (unit)", () => {
  it("adds maker input-fee to SELL base deposit", () => {
    const quantityBaseUnits = 1_000_000_000n;
    const resolved = resolveLimitOrderDepositWithFee({
      poolKey: "SUI_USDC",
      side: "SELL",
      price: 2.5,
      quantityBaseUnits,
      makerFeeRaw: MAKER_FEE_RAW,
    });

    expect(resolved.depositAsset).toBe("SUI");
    expect(resolved.inputQuantity).toBe(quantityBaseUnits);
    expect(resolved.depositAmount).toBeGreaterThan(quantityBaseUnits);
    expect(resolved.depositAmount).toBe(
      quantityBaseUnits + deepBookMul(MAKER_FEE_RAW, quantityBaseUnits),
    );
  });

  it("uses deepBookMul for BUY quote deposit including maker fee", () => {
    const quantityBaseUnits = 1_000_000_000n;
    const price = 2.5;
    const resolved = resolveLimitOrderDepositWithFee({
      poolKey: "SUI_USDC",
      side: "BUY",
      price,
      quantityBaseUnits,
      makerFeeRaw: MAKER_FEE_RAW,
    });

    const quoteQuantity = deepBookMul(resolved.inputQuantity, resolved.inputPrice);
    const expectedDeposit = quoteQuantity + deepBookMul(MAKER_FEE_RAW, quoteQuantity);

    expect(resolved.depositAsset).toBe("USDC");
    expect(resolved.depositAmount).toBe(expectedDeposit);
    expect(resolved.depositAmount).toBeGreaterThan(quoteQuantity);
  });

  it("matches principal-only deposit when maker fee is zero", () => {
    const quantityBaseUnits = 1_000_000_000n;
    const resolved = resolveLimitOrderDepositWithFee({
      poolKey: "SUI_USDC",
      side: "SELL",
      price: 2.5,
      quantityBaseUnits,
      makerFeeRaw: 0n,
    });

    expect(resolved.depositAmount).toBe(quantityBaseUnits);
  });
});
