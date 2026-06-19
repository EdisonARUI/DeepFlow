import { mainnetCoins } from "@mysten/deepbook-v3";
import { describe, expect, it } from "vitest";

import {
  resolveDeepbookCoinKey,
  resolveDeepbookCoinType,
} from "../src/supply-withdraw/append-deepbook-withdraw-coin.ts";

const DEEP_COIN_TYPE = mainnetCoins.DEEP.type;

describe("resolveDeepbookCoinKey (unit)", () => {
  it("resolves symbol keys", () => {
    expect(resolveDeepbookCoinKey("DEEP")).toBe("DEEP");
    expect(resolveDeepbookCoinKey("deep")).toBe("DEEP");
  });

  it("resolves coin type via reverse lookup", () => {
    expect(resolveDeepbookCoinKey(DEEP_COIN_TYPE)).toBe("DEEP");
  });

  it("throws for unsupported assets", () => {
    expect(() => resolveDeepbookCoinKey("UNKNOWN")).toThrow(
      /not supported for DeepBook BalanceManager withdraw/,
    );
  });
});

describe("resolveDeepbookCoinType (unit)", () => {
  it("returns mainnet coin type for symbol and coin type inputs", () => {
    expect(resolveDeepbookCoinType("DEEP")).toBe(DEEP_COIN_TYPE);
    expect(resolveDeepbookCoinType(DEEP_COIN_TYPE)).toBe(DEEP_COIN_TYPE);
  });
});
