import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function TerminalPanel({
  title,
  icon,
  actions,
  children,
  className,
  headerClassName,
  contentClassName,
  accentTop,
}: {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  accentTop?: string;
}) {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden rounded-none border-border-default bg-bg-panel py-0 shadow-none",
        accentTop && `border-t-4 ${accentTop}`,
        className,
      )}
    >
      {title !== undefined && (
        <div
          className={cn(
            "flex items-center justify-between border-b border-border-default bg-bg-panel-header px-4 py-3",
            headerClassName,
          )}
        >
          <div className="flex items-center gap-2">
            {icon}
            {typeof title === "string" ? (
              <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-text-primary uppercase">
                {title}
              </span>
            ) : (
              title
            )}
          </div>
          {actions}
        </div>
      )}
      <div className={cn("p-4", contentClassName)}>{children}</div>
    </Card>
  );
}
