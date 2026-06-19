"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LaunchAppLink, LANDING_LAUNCH_PILL_CLASS } from "./launch-app-link";
import { LandingSocialLinks } from "./landing-social-links";

export function LandingHeader() {
  const [isHeroVisible, setIsHeroVisible] = useState(true);

  useEffect(() => {
    const hero = document.getElementById("landing-hero");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <header className="fixed inset-x-5 top-5 z-20 bg-transparent">
      <div className="mx-auto flex h-[100px] items-center justify-between p-5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#babbff] md:size-16">
          <img
            src="/figma/landing/brand-icon.svg"
            alt="DeepFlow"
            width={40}
            height={28}
            className="h-5 w-auto md:h-7"
          />
        </div>
        <div className="flex items-center gap-2.5">
          {isHeroVisible ? <LandingSocialLinks variant="header" /> : null}
          <LaunchAppLink
            variant="button"
            showArrow={false}
            className={cn(
              LANDING_LAUNCH_PILL_CLASS,
              "h-12 w-44 text-base md:h-16 md:w-60 md:text-xl",
              isHeroVisible ? "hidden sm:inline-flex" : "inline-flex",
            )}
          />
        </div>
      </div>
    </header>
  );
}
