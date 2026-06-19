"use client";

import { ChevronDown } from "lucide-react";
import {
  LIMIT_EXPIRE_PRESET_LABELS,
  type LimitExpirePreset,
} from "@deepflow/sdk/trade";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PRESETS = Object.keys(LIMIT_EXPIRE_PRESET_LABELS) as LimitExpirePreset[];

type LimitExpireSelectProps = {
  value: LimitExpirePreset;
  onChange: (value: LimitExpirePreset) => void;
};

export function LimitExpireSelect({ value, onChange }: LimitExpireSelectProps) {
  return (
    <div className="relative rounded-[20px] border border-border-muted/60 bg-[rgba(11,15,16,0.8)] p-[17px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
      <div className="mb-2">
        <span className="text-[11px] tracking-[0.55px] text-text-muted/70 uppercase">
          EXPIRE IN
        </span>
      </div>
      <Select value={value} onValueChange={(next) => onChange(next as LimitExpirePreset)}>
        <SelectTrigger className="flex h-auto w-full items-center justify-between border-0 bg-transparent p-0 text-sm text-white shadow-none focus:ring-0 [&>svg:last-child]:hidden">
          <SelectValue />
          <ChevronDown className="size-3.5 text-text-muted" aria-hidden />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((preset) => (
            <SelectItem key={preset} value={preset}>
              {LIMIT_EXPIRE_PRESET_LABELS[preset]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
