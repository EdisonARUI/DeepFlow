"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const PREFETCH_KEY = "__deepflow_prefetched_portfolio__";
const PORTFOLIO_ROUTE = "/portfolio";
const IDLE_ROUTES = ["/liquidity", "/trading"] as const;
let portfolioWarmupDone = false;

export function LandingPortfolioPrefetch() {
  const router = useRouter();

  useEffect(() => {
    const isDev = process.env.NODE_ENV === "development";

    if (!isDev && typeof window !== "undefined" && window.sessionStorage.getItem(PREFETCH_KEY) === "1") {
      return;
    }

    let cancelled = false;
    let warmupTimeoutId: number | null = null;

    const warmupPortfolio = () => {
      if (cancelled || portfolioWarmupDone) {
        return;
      }

      portfolioWarmupDone = true;

      if (isDev) {
        void fetch(PORTFOLIO_ROUTE, {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
          keepalive: true,
        }).catch(() => undefined);
      } else {
        router.prefetch(PORTFOLIO_ROUTE);
      }

      if (!isDev && typeof window !== "undefined") {
        window.sessionStorage.setItem(PREFETCH_KEY, "1");
      }
    };

    const schedulePortfolioWarmup = () => {
      if (cancelled) {
        return;
      }

      warmupTimeoutId = window.setTimeout(warmupPortfolio, 1000);
    };

    if (typeof window !== "undefined") {
      if (document.readyState === "complete") {
        schedulePortfolioWarmup();
      } else {
        window.addEventListener("load", schedulePortfolioWarmup, { once: true });
      }
    }

    const warmupIdleRoutes = () => {
      if (cancelled) {
        return;
      }

      for (const route of IDLE_ROUTES) {
        router.prefetch(route);
      }
    };

    let idleTimeoutId: number | null = null;

    if (typeof window !== "undefined") {
      idleTimeoutId = window.setTimeout(warmupIdleRoutes, 3000);
    }

    return () => {
      cancelled = true;
      if (warmupTimeoutId !== null) {
        window.clearTimeout(warmupTimeoutId);
      }
      if (idleTimeoutId !== null) {
        window.clearTimeout(idleTimeoutId);
      }
    };
  }, [router]);

  return null;
}
