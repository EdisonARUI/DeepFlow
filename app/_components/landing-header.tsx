"use client";

import { cn } from "@/lib/utils";
import { LaunchAppLink, LANDING_LAUNCH_PILL_CLASS } from "./launch-app-link";
import { LandingSocialLinks } from "./landing-social-links";

export function LandingHeader() {
  return (
    <header className="absolute left-1/2 top-0 z-20 w-full -translate-x-1/2 bg-transparent ">
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
          <LandingSocialLinks variant="header" />
          <LaunchAppLink
            variant="button"
            showArrow={false}
            className={cn(
              LANDING_LAUNCH_PILL_CLASS,
              "hidden h-12 w-44 text-base sm:inline-flex md:h-16 md:w-60 md:text-xl",
            )}
          />
        </div>
      </div>
    </header>
  );
}
