/** Format base units (bigint) as a human-readable decimal string without trailing zeros. */
export function formatBaseUnitsToHuman(baseUnits: bigint, decimals: number): string {
  if (baseUnits <= 0n) {
    return "0";
  }

  const divisor = 10n ** BigInt(decimals);
  const whole = baseUnits / divisor;
  const fraction = baseUnits % divisor;

  if (fraction === 0n) {
    return whole.toString();
  }

  const fractionText = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole}.${fractionText}`;
}
