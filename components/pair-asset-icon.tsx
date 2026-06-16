import { AssetIcon } from "@/components/asset-icon";
import { cn } from "@/lib/utils";

type PairAssetIconProps = {
  baseAsset: string;
  quoteAsset: string;
  className?: string;
};

export function PairAssetIcon({ baseAsset, quoteAsset, className }: PairAssetIconProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <AssetIcon asset={baseAsset} size="sm" className="z-10 ring-1 ring-bg-panel" />
      <AssetIcon asset={quoteAsset} size="sm" className="-ml-2 ring-1 ring-bg-panel" />
    </div>
  );
}
