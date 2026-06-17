import { cn } from "@/lib/utils";

type DashboardPanelProps = {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function DashboardPanel({
  title,
  actions,
  children,
  className,
  contentClassName,
}: DashboardPanelProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-5 border border-border-default bg-bg-dashboard-card rounded-[20px] p-[21px]",
        className,
      )}
    >
      <div className="flex h-8 items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white uppercase">
          {title}
        </h2>
        {actions}
      </div>
      <div className={cn("min-h-0 flex-1", contentClassName)}>{children}</div>
    </section>
  );
}
