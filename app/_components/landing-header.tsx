"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LaunchAppLink } from "./launch-app-link";
import { LandingSocialLinks } from "./landing-social-links";

export function LandingHeader() {
  const [isOverHero, setIsOverHero] = useState(true);

  useEffect(() => {
    const hero = document.getElementById("landing-hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsOverHero(entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-[background-color,backdrop-filter] duration-300",
        isOverHero ? "bg-transparent" : "bg-[#020617]/95 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 md:px-10">
        <div className="flex items-center gap-3">
          <img
            src="/figma/icons/logo.svg"
            alt="DeepFlow"
            width={45}
            height={32}
            className="h-8 w-auto"
          />
          <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-white md:text-2xl">
            DEEPFLOW
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <LandingSocialLinks />
          <LaunchAppLink variant="button" className="hidden h-8 px-8 py-0 sm:inline-flex" showArrow={false} />
        </div>
      </div>
    </header>
  );
}
