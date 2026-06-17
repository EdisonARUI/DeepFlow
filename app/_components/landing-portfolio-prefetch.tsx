"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const PREFETCH_KEY = "__deepflow_prefetched_dashboard_routes__";
const DASHBOARD_ROUTES = ["/portfolio", "/liquidity", "/trading"] as const;
let didPrefetchInSession = false;

export function LandingPortfolioPrefetch() {
  const router = useRouter();

  useEffect(() => {
    if (didPrefetchInSession) {
      return;
    }

    if (typeof window !== "undefined" && window.sessionStorage.getItem(PREFETCH_KEY) === "1") {
      didPrefetchInSession = true;
      return;
    }

    let cancelled = false;
    const prefetch = () => {
      if (cancelled) {
        return;
      }

      for (const route of DASHBOARD_ROUTES) {
        router.prefetch(route);
      }

      if (process.env.NODE_ENV === "development") {
        for (const route of DASHBOARD_ROUTES) {
          void fetch(route, {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin",
            keepalive: true,
          }).catch(() => undefined);
        }
      }

      didPrefetchInSession = true;
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(PREFETCH_KEY, "1");
      }
    };

    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      let timeoutId: number | null = null;
      const rafId = window.requestAnimationFrame(() => {
        timeoutId = window.setTimeout(prefetch, 250);
      });

      return () => {
        cancelled = true;
        window.cancelAnimationFrame(rafId);
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }
      };
    }

    const onVisible = () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      prefetch();
      document.removeEventListener("visibilitychange", onVisible);
    };

    document.addEventListener("visibilitychange", onVisible);
    const fallbackTimeoutId = window.setTimeout(prefetch, 500);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.clearTimeout(fallbackTimeoutId);
    };
  }, [router]);

  return null;
}
