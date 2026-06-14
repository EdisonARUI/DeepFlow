import { describe, expect, it } from "vitest";

import {
  buildSupplyBalanceMap,
  parseNaviSupplyAmountToBaseUnits,
  type NaviSupplyPositionLike,
} from "./navi-supply-balance";

const ALLOWLIST = ["SUI", "USDC"] as const;

function makeSupplyPosition(
  symbol: string,
  amount: string,
  decimals: number,
  type: "navi-lending-supply" | "navi-lending-emode-supply" = "navi-lending-supply",
): NaviSupplyPositionLike {
  const supplyPayload = {
    amount,
    token: { symbol, decimals },
  };

  if (type === "navi-lending-emode-supply") {
    return {
      protocol: "navi",
      type,
      "navi-lending-emode-supply": supplyPayload,
    };
  }

  return {
    protocol: "navi",
    type,
    "navi-lending-supply": supplyPayload,
  };
}

describe("parseNaviSupplyAmountToBaseUnits", () => {
  it.each([
    ["1", 9, 1_000_000_000n],
    ["1.5", 6, 1_500_000n],
    ["0", 9, 0n],
    ["", 9, 0n],
    ["invalid", 9, 0n],
  ])("parses %s with %i decimals to %s", (amount, decimals, expected) => {
    expect(parseNaviSupplyAmountToBaseUnits(amount, decimals)).toBe(expected);
  });
});

describe("buildSupplyBalanceMap", () => {
  it("converts main-market supply amounts to base units", () => {
    const positions = [makeSupplyPosition("SUI", "1", 9)];

    const balances = buildSupplyBalanceMap(positions, ALLOWLIST);

    expect(balances.get("SUI")).toBe(1_000_000_000n);
  });

  it("accumulates emode-supply positions by symbol", () => {
    const positions = [
      makeSupplyPosition("SUI", "1", 9, "navi-lending-supply"),
      makeSupplyPosition("SUI", "0.5", 9, "navi-lending-emode-supply"),
    ];

    const balances = buildSupplyBalanceMap(positions, ALLOWLIST);

    expect(balances.get("SUI")).toBe(1_500_000_000n);
  });

  it("ignores assets outside the allowlist", () => {
    const positions = [makeSupplyPosition("DEEP", "10", 6)];

    const balances = buildSupplyBalanceMap(positions, ALLOWLIST);

    expect(balances.size).toBe(0);
  });
});
