import { Label } from "@/components/ui/label";

type PositionProtocolBannerProps = {
  mode: "supply" | "withdraw";
  protocol: string;
  protocolColor: string;
};

export function PositionProtocolBanner({
  mode,
  protocol,
  protocolColor,
}: PositionProtocolBannerProps) {
  const label = mode === "supply" ? "SUPPLY_TO" : "WITHDRAW_FROM";

  return (
    <div className="flex h-9 items-center justify-between rounded-[20px] bg-bg-secondary px-4">
      <Label className="text-[11px] font-bold tracking-[1.1px] text-text-muted uppercase">
        {label}
      </Label>
      <span className="inline-flex items-center gap-2 text-[12px] tracking-[0.6px] text-text-primary">
        <span className="size-2 rounded-full" style={{ backgroundColor: protocolColor }} />
        {protocol}
      </span>
    </div>
  );
}
