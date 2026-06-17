/**
 * Parse a human-readable decimal amount into base units (bigint).
 * e.g. "12.50" with decimals 6 -> 12500000n
 */
export function parseAmountToBaseUnits(amount: string, decimals: number): bigint {
  const trimmed = amount.trim();
  if (!trimmed) {
    throw new Error("Amount is required");
  }

  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(`Invalid amount: ${amount}`);
  }

  if (!Number.isInteger(decimals) || decimals < 0) {
    throw new Error(`Invalid decimals: ${decimals}`);
  }

  const [wholePart, fractionPart = ""] = trimmed.split(".");
  if (fractionPart.length > decimals) {
    throw new Error(`Amount exceeds ${decimals} decimal places`);
  }

  const paddedFraction = fractionPart.padEnd(decimals, "0");
  const combined = `${wholePart}${paddedFraction}`.replace(/^0+/, "") || "0";
  const baseUnits = BigInt(combined);

  if (baseUnits <= BigInt(0)) {
    throw new Error("Amount must be positive");
  }

  return baseUnits;
}
