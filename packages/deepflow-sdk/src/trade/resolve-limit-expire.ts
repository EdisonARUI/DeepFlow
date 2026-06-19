import { MAX_TIMESTAMP } from "@mysten/deepbook-v3";

export type LimitExpirePreset = "1d" | "7d" | "30d" | "gtc";

const PRESET_DAYS: Record<Exclude<LimitExpirePreset, "gtc">, number> = {
  "1d": 1,
  "7d": 7,
  "30d": 30,
};

export const LIMIT_EXPIRE_PRESET_LABELS: Record<LimitExpirePreset, string> = {
  "1d": "1 Day",
  "7d": "7 Days",
  "30d": "30 Days",
  gtc: "GTC",
};

export function resolveExpireTimestampMs(
  preset: LimitExpirePreset,
  nowMs = Date.now(),
): number {
  if (preset === "gtc") {
    return Number(MAX_TIMESTAMP);
  }
  return nowMs + PRESET_DAYS[preset] * 86_400_000;
}

export function resolveExpireTimestampArg(expireAtMs?: number): bigint {
  if (expireAtMs == null) {
    return MAX_TIMESTAMP;
  }
  return BigInt(Math.max(0, Math.floor(expireAtMs)));
}
