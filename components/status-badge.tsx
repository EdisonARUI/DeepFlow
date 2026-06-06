import { cn } from "@/lib/utils";

const variants = {
  active: "border-accent-green/30 bg-accent-green/10 text-accent-green",
  completed: "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan",
  pending: "border-accent-orange/30 bg-accent-orange/10 text-accent-orange",
  default: "border-border-default bg-bg-panel-header text-text-muted",
} as const;

export function StatusBadge({
  children,
  variant = "default",
  dot = false,
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-2 py-0.5 text-[11px] font-bold tracking-[0.6px] uppercase",
        variants[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "size-1.5 rounded-full",
            variant === "completed" && "bg-accent-cyan",
            variant === "active" && "bg-accent-green",
            variant === "pending" && "bg-accent-orange",
          )}
        />
      )}
      {children}
    </span>
  );
}
