import { cn } from "@/lib/utils";
import { resolveCoinIconPath } from "@/lib/figma/coin-icons";

const TOKEN_BADGE_COLORS: Record<string, string> = {
  SUI: "bg-blue-500",
  USDC: "bg-blue-700",
  DEEP: "bg-emerald-600",
  WAL: "bg-purple-600",
  WUSDT: "bg-teal-600",
  USDT: "bg-teal-600",
};

const SIZE_CLASSES = {
  sm: "size-4 text-[7px]",
  md: "size-5 text-[8px]",
} as const;

type AssetIconProps = {
  asset: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
};

export function AssetIcon({ asset, size = "md", className }: AssetIconProps) {
  const iconPath = resolveCoinIconPath(asset);
  const sizeClass = SIZE_CLASSES[size];

  if (iconPath) {
    const dimension = size === "sm" ? 16 : 20;
    return (
      <img
        src={iconPath}
        alt=""
        width={dimension}
        height={dimension}
        className={cn("shrink-0 rounded-full object-cover", sizeClass, className)}
      />
    );
  }

  const badgeColor = TOKEN_BADGE_COLORS[asset.toUpperCase()] ?? "bg-zinc-600";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        sizeClass,
        badgeColor,
        className,
      )}
    >
      {asset.slice(0, 1)}
    </div>
  );
}
