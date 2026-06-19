import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LiquidityProtocolOption } from "@/lib/data/liquidity/liquidity-formatters";

type PositionProtocolBannerProps = {
  mode: "supply" | "withdraw";
  protocol: string;
  protocolColor: string;
  protocols: LiquidityProtocolOption[];
  onProtocolChange: (protocol: string) => void;
};

export function PositionProtocolBanner({
  mode,
  protocol,
  protocolColor,
  protocols,
  onProtocolChange,
}: PositionProtocolBannerProps) {
  const label = mode === "supply" ? "SUPPLY_TO" : "WITHDRAW_FROM";

  return (
    <div className="flex h-16 items-center justify-between rounded-[20px] bg-bg-secondary px-4">
      <Label className="text-[11px] font-bold tracking-[1.1px] text-text-muted uppercase">
        {label}
      </Label>
      <Select
        value={protocol}
        onValueChange={(nextProtocol) => {
          if (nextProtocol) onProtocolChange(nextProtocol);
        }}
      >
        <SelectTrigger className="h-auto w-auto gap-2 rounded-[4px] border-border-default bg-bg-panel-header px-2 py-1 text-[12px] tracking-[0.6px] text-text-primary shadow-none">
          <span className="size-2 rounded-full" style={{ backgroundColor: protocolColor }} />
          <SelectValue placeholder={protocol} />
        </SelectTrigger>
        <SelectContent>
          {protocols.map((option) => (
            <SelectItem key={option.protocol} value={option.protocol}>
              <span className="inline-flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: option.protocolColor }}
                />
                {option.protocol}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
