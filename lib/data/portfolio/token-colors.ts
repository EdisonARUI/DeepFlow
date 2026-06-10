const TOKEN_CHART_COLORS: Record<string, string> = {
  SUI: "#00ff41",
  USDC: "#00e0ff",
  DEEP: "#ffba20",
  suiUSDe: "#72ff70",
  SUIUSDE: "#72ff70",
  WAL: "#ff9100",
  vSUI: "#e5e2e1",
};

const EXPOSURE_COLORS: Record<string, { color: string; textColor?: string }> = {
  NAVI: { color: "#00e0ff", textColor: "#001f25" },
  SCALLOP: { color: "#ffd792", textColor: "#00daf8" },
  CETUS: { color: "#72ff70", textColor: "#001f25" },
  DEEPBOOK: { color: "#00ff41", textColor: "#00daf8" },
  WALLET: { color: "#e5e2e1", textColor: "#00daf8" },
};

export function resolveTokenColor(asset: string): string {
  return TOKEN_CHART_COLORS[asset] ?? TOKEN_CHART_COLORS[asset.toUpperCase()] ?? "#e5e2e1";
}

export function resolveExposureStyle(protocol: string): { color: string; textColor?: string } {
  return EXPOSURE_COLORS[protocol] ?? { color: "#e5e2e1", textColor: "#00daf8" };
}
