"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export const LANDING_LAUNCH_PILL_CLASS =
  "h-16 w-60 rounded-[50px] bg-[#99f3ff] px-8 text-xl tracking-[0.6px] text-black hover:opacity-90";

type LaunchAppLinkProps = {
  variant: "button" | "text" | "start-now";
  className?: string;
  showArrow?: boolean;
  href?: string;
};

export function LaunchAppLink({
  variant,
  className,
  showArrow = variant === "button",
  href = "/portfolio",
}: LaunchAppLinkProps) {
  const router = useRouter();
  const isDashboardHref = href.startsWith("/");
  const prefetchDashboardRoute = useCallback(() => {
    if (!isDashboardHref) {
      return;
    }

    router.prefetch(href);
  }, [href, isDashboardHref, router]);

  if (variant === "start-now") {
    return (
      <Link
        href={href}
        prefetch={isDashboardHref}
        onMouseEnter={prefetchDashboardRoute}
        onTouchStart={prefetchDashboardRoute}
        className={cn(
          "inline-flex h-8 w-40 items-center justify-between gap-2 rounded-[50px] bg-white px-8 font-mono text-xs font-medium tracking-[0.6px] text-black drop-shadow-[0_0_10px_rgba(186,242,255,0.2)] transition-opacity hover:opacity-90",
          className,
        )}
      >
        START NOW
        <img
          src="/figma/landing/arrow-up-right.svg"
          alt=""
          width={16}
          height={16}
          className="size-4"
        />
      </Link>
    );
  }

  if (variant === "text") {
    return (
      <Link
        href={href}
        prefetch={isDashboardHref}
        onMouseEnter={prefetchDashboardRoute}
        onTouchStart={prefetchDashboardRoute}
        className={cn(
          "inline-flex items-center gap-2 font-mono text-sm tracking-[0.7px] text-accent-cyan underline decoration-solid underline-offset-4 transition-opacity hover:opacity-80",
          className,
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
      href={href}
      prefetch={isDashboardHref}
      onMouseEnter={prefetchDashboardRoute}
      onTouchStart={prefetchDashboardRoute}
      className={cn(
          "inline-flex items-center justify-center gap-2 bg-accent-cyan px-8 py-3 font-mono text-sm font-bold tracking-[0.7px] text-(--text-on-accent) transition-opacity hover:opacity-90",
        className,
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
