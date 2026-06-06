import { cn } from "@/lib/utils";

export function TerminalLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "text-[11px] font-bold tracking-[1.1px] text-accent-cyan uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}
