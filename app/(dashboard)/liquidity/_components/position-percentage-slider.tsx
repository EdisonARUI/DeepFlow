import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const PERCENTAGE_MARKS = ["0%", "25%", "50%", "75%", "100%"] as const;

type PositionPercentageSliderProps = {
  value: number[];
  onValueChange: (value: number[]) => void;
  accentClassName?: string;
};

export function PositionPercentageSlider({
  value,
  onValueChange,
  accentClassName = "[&_[data-slot=slider-range]]:bg-accent-cyan [&_[data-slot=slider-thumb]]:border-accent-cyan",
}: PositionPercentageSliderProps) {
  return (
    <div className="space-y-2 pt-4">
      <Slider
        value={value}
        onValueChange={(next) => onValueChange(Array.isArray(next) ? [...next] : [next])}
        max={100}
        step={25}
        className={cn(accentClassName)}
      />
      <div className="flex justify-between text-[11px] font-bold text-text-muted uppercase">
        {PERCENTAGE_MARKS.map((mark) => (
          <span key={mark}>{mark}</span>
        ))}
      </div>
    </div>
  );
}
