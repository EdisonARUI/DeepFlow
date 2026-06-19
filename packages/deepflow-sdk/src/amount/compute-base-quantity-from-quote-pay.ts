import { alignBaseUnitsToLot } from "../trade/align-base-units-to-lot.ts";
import { formatBaseUnitsToHuman } from "./format-base-units-to-human.ts";
import { parseAmountToBaseUnits } from "./parse-base-units.ts";

function parsePriceRational(limitPrice: string): { numerator: bigint; scale: bigint } | null {
  const trimmed = limitPrice.trim();
  if (!trimmed || !/^\d+(\.\d+)?$/.test(trimmed)) {
    return null;
  }

  const [wholePart, fractionPart = ""] = trimmed.split(".");
  const numerator = BigInt(`${wholePart}${fractionPart}`);
  if (numerator <= 0n) {
    return null;
  }

  return {
    numerator,
    scale: 10n ** BigInt(fractionPart.length),
  };
}

/**
 * Convert a quote-side pay amount into a base quantity using bigint math.
 * baseUnits = payUnits × priceScale × 10^baseDec / (priceNumerator × 10^quoteDec)
 */
export function computeBaseQuantityFromQuotePay(
  payAmount: string,
  limitPrice: string,
  quoteDecimals: number,
  baseDecimals: number,
  lotBaseUnits?: bigint,
): string {
  if (!payAmount.trim() || !limitPrice.trim()) {
    return "";
  }

  try {
    const payUnits = parseAmountToBaseUnits(payAmount, quoteDecimals);
    const price = parsePriceRational(limitPrice);
    if (!price) {
      return "";
    }

    const quoteFactor = 10n ** BigInt(quoteDecimals);
    const baseFactor = 10n ** BigInt(baseDecimals);
    let baseUnits =
      (payUnits * price.scale * baseFactor) / (price.numerator * quoteFactor);

    if (lotBaseUnits && lotBaseUnits > 0n) {
      baseUnits = alignBaseUnitsToLot(baseUnits, lotBaseUnits);
    }

    if (baseUnits <= 0n) {
      return "";
    }

    return formatBaseUnitsToHuman(baseUnits, baseDecimals);
  } catch {
    return "";
  }
}
