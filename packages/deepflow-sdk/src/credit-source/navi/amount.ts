export function toSafeAmountNumber(amount: bigint, label = "amount"): number {
  if (amount <= 0n) {
    throw new Error(`Invalid ${label}: must be positive`);
  }

  const asNumber = Number(amount);
  if (!Number.isFinite(asNumber) || !Number.isSafeInteger(asNumber)) {
    throw new Error(`${label} ${amount} exceeds JavaScript safe integer range`);
  }

  return asNumber;
}
