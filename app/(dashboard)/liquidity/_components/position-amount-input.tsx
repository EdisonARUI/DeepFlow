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
};

export function PositionAmountInput({
  balanceLabel,
  balance,
  amount,
  onAmountChange,
  selectedAsset,
  assets,
  onAssetChange,
}: PositionAmountInputProps) {
  return (
    <div className="border border-border-default bg-bg-secondary p-4">
      <div className="mb-2 flex justify-between text-[11px] text-text-muted uppercase">
        <span>Input_amount</span>
        <span>
          {balanceLabel}: {balance}
        </span>
      </div>
      <div className="flex items-center gap-4 border border-border-default p-4">
        <Input
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          className="h-auto flex-1 rounded-none border-0 bg-transparent p-0 text-3xl shadow-none focus-visible:ring-0"
        />
        <Select
          value={selectedAsset}
          onValueChange={(asset) => {
            if (asset) onAssetChange(asset);
          }}
        >
          <SelectTrigger className="w-28 rounded-none border-border-default bg-bg-panel">
            <SelectValue placeholder={selectedAsset} />
          </SelectTrigger>
          <SelectContent>
            {assets.map((asset) => (
              <SelectItem key={asset} value={asset}>
                {asset}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
