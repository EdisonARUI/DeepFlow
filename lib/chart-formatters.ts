export const chartAxisTickStyle = {
  fill: "#b9ccb2",
  fontSize: 10,
  fontFamily: "var(--font-mono)",
};

export function formatChartDate(date: string) {
  const [, month, day] = date.split("-");
  return `${month}/${day}`;
}

export function formatChartValue(value: number) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export function formatTooltipValue(value: number) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
