import { alignBaseUnitsToLot } from "../trade/align-base-units-to-lot.ts";
import { formatBaseUnitsToHuman } from "./format-base-units-to-human.ts";
import { parseAmountToBaseUnits } from "./parse-base-units.ts";
import { truncateHumanAmountDecimals } from "./truncate-human-amount-decimals.ts";

/** Align a human-readable base amount down to lot_size and return as string. */
export function alignHumanBaseAmountToLot(
  amount: string,
  baseDecimals: number,
  lotBaseUnits?: bigint,
): string {
  if (!amount.trim()) {
    return "";
  }

  if (!lotBaseUnits || lotBaseUnits <= 0n) {
    return amount;
  }

  try {
    const normalized = truncateHumanAmountDecimals(amount, baseDecimals);
    const baseUnits = parseAmountToBaseUnits(normalized, baseDecimals);
    const aligned = alignBaseUnitsToLot(baseUnits, lotBaseUnits);

    if (aligned <= 0n) {
      return "";
    }

    return formatBaseUnitsToHuman(aligned, baseDecimals);
  } catch {
    return amount;
  }
}
