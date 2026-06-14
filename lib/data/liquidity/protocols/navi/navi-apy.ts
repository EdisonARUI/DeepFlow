/** NAVI `supplyIncentiveApyInfo.apy` is already a percent string (e.g. "0.537" = 0.537%). */
export function parseNaviAprPercentToBps(aprPercent: string): number {
  const n = Number(aprPercent);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}
