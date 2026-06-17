import { AssetIcon } from "@/components/asset-icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PositionAmountInputProps = {
  balanceLabel: string;
  balance: string;
  amount: string;
  onAmountChange: (value: string) => void;
  selectedAsset: string;
  assets: string[];
  onAssetChange: (asset: string) => void;
  footer?: React.ReactNode;
};

export function PositionAmountInput({
  balanceLabel,
  balance,
  amount,
  onAmountChange,
  selectedAsset,
  assets,
  onAssetChange,
  footer,
}: PositionAmountInputProps) {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-[20px] bg-bg-secondary p-4">
      <div className="flex justify-between text-[11px] text-text-muted uppercase">
        <span className="font-bold">INPUT_AMOUNT</span>
        <span className="text-[12px] normal-case tracking-[0.6px]">
          {balanceLabel}: {balance}
        </span>
      </div>
      <div className="flex items-center gap-4 rounded-[20px] border border-border-default p-4">
        <Input
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.00"
          className="h-auto flex-1 rounded-none border-0 bg-transparent p-0 text-3xl shadow-none placeholder:text-[#353534] focus-visible:ring-0"
        />
        <Select
          value={selectedAsset}
          onValueChange={(asset) => {
            if (asset) onAssetChange(asset);
          }}
        >
          <SelectTrigger className="w-[100px] rounded-[4px] border-border-default bg-bg-panel-header">
            <AssetIcon asset={selectedAsset} size="sm" />
            <SelectValue placeholder={selectedAsset} />
          </SelectTrigger>
          <SelectContent>
            {assets.map((asset) => (
              <SelectItem key={asset} value={asset}>
                <AssetIcon asset={asset} size="sm" />
                {asset}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {footer}
    </div>
  );
}
