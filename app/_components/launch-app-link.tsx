import Link from "next/link";
import { cn } from "@/lib/utils";

type LaunchAppLinkProps = {
  variant: "button" | "text";
  className?: string;
  showArrow?: boolean;
};

export function LaunchAppLink({
  variant,
  className,
  showArrow = variant === "button",
}: LaunchAppLinkProps) {
  if (variant === "text") {
    return (
      <Link
        href="/portfolio"
        className={cn(
          "inline-flex items-center gap-2 font-mono text-sm tracking-[0.7px] text-accent-cyan underline decoration-solid underline-offset-4 transition-opacity hover:opacity-80",
          className
        )}
      >
        LAUNCH APP
        <img
          src="/figma/landing/arrow-external.svg"
          alt=""
          width={11}
          height={11}
          className="size-[11px]"
        />
      </Link>
    );
  }

  return (
    <Link
      href="/portfolio"
      className={cn(
        "inline-flex items-center justify-center gap-2 bg-accent-cyan px-8 py-3 font-mono text-sm font-bold tracking-[0.7px] text-[var(--text-on-accent)] transition-opacity hover:opacity-90",
        className
      )}
    >
      LAUNCH APP
      {showArrow ? (
        <img
          src="/figma/landing/arrow-right.svg"
          alt=""
          width={10}
          height={10}
          className="size-[10px]"
        />
      ) : null}
    </Link>
  );
}
