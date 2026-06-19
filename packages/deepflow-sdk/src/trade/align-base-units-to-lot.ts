/** Floor base quantity to the nearest lot_size multiple (DeepBook order constraint). */
export function alignBaseUnitsToLot(baseUnits: bigint, lotBaseUnits: bigint): bigint {
  if (lotBaseUnits <= 0n) {
    return baseUnits;
  }

  return (baseUnits / lotBaseUnits) * lotBaseUnits;
}
