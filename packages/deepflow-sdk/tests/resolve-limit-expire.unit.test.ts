import { MAX_TIMESTAMP } from "@mysten/deepbook-v3";
import { describe, expect, it } from "vitest";

import {
  resolveExpireTimestampArg,
  resolveExpireTimestampMs,
} from "../src/trade/resolve-limit-expire.ts";

describe("resolve-limit-expire (unit)", () => {
  it("maps gtc preset to MAX_TIMESTAMP", () => {
    expect(resolveExpireTimestampMs("gtc")).toBe(Number(MAX_TIMESTAMP));
    expect(resolveExpireTimestampArg(undefined)).toBe(MAX_TIMESTAMP);
  });

  it("maps day presets from a fixed clock", () => {
    const nowMs = 1_700_000_000_000;
    expect(resolveExpireTimestampMs("1d", nowMs)).toBe(nowMs + 86_400_000);
    expect(resolveExpireTimestampMs("7d", nowMs)).toBe(nowMs + 7 * 86_400_000);
    expect(resolveExpireTimestampMs("30d", nowMs)).toBe(nowMs + 30 * 86_400_000);
  });

  it("passes explicit expireAtMs through resolveExpireTimestampArg", () => {
    expect(resolveExpireTimestampArg(1_700_604_800_000)).toBe(1_700_604_800_000n);
  });
});
