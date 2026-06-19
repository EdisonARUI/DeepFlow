/** Truncate a human-readable decimal string to at most `decimals` fractional digits. */
export function truncateHumanAmountDecimals(amount: string, decimals: number): string {
  const trimmed = amount.trim();
  if (!trimmed) {
    return "";
  }

  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return trimmed;
  }

  const [wholePart, fractionPart = ""] = trimmed.split(".");
  if (decimals <= 0) {
    return wholePart;
  }

  const truncatedFraction = fractionPart.slice(0, decimals);
  if (!truncatedFraction) {
    return wholePart;
  }

  const cleanedFraction = truncatedFraction.replace(/0+$/, "");
  return cleanedFraction ? `${wholePart}.${cleanedFraction}` : wholePart;
}
