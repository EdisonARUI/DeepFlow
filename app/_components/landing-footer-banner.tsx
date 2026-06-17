"use client";

import { Anton } from "next/font/google";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-banner",
});

const BANNER_SEQUENCE = ["deepflow", "brand", "deepbook", "brand"] as const;
const MARQUEE_SEQUENCE = [...BANNER_SEQUENCE, ...BANNER_SEQUENCE];

function BannerTile({
  type,
  decorative = false,
}: {
  type: (typeof BANNER_SEQUENCE)[number];
  decorative?: boolean;
}) {
  if (type === "deepflow") {
    return (
      <div
        className="flex h-[120px] w-[360px] shrink-0 items-center justify-center rounded-[20px] bg-[#99f3ff] p-2.5 md:h-[200px] md:w-[600px]"
        aria-hidden={decorative}
      >
        <span className="font-[family-name:var(--font-banner)] text-[80px] uppercase leading-[110px] tracking-[-4.8px] text-black md:text-[160px]">
          DEEPFLOW
        </span>
      </div>
    );
  }

  if (type === "brand") {
    return (
      <div
        className="flex size-[120px] shrink-0 items-center justify-center rounded-full bg-[#babbff] md:size-[200px]"
        aria-hidden={decorative}
      >
        <img
          src="/figma/landing/brand-icon.svg"
          alt={decorative ? "" : "DeepFlow"}
          width={40}
          height={28}
          className="h-[50px] w-auto object-contain md:h-[84px]"
        />
      </div>
    );
  }

  return (
    <div
      className="flex h-[120px] w-[360px] shrink-0 items-center justify-center rounded-[20px] bg-[#004a8b] p-2.5 md:h-[200px] md:w-[600px]"
      aria-hidden={decorative}
    >
      <span className="font-[family-name:var(--font-banner)] text-[80px] uppercase leading-[110px] tracking-[-4.8px] text-white md:text-[160px]">
        DEEPBOOK
      </span>
    </div>
  );
}

export function LandingFooterBanner() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduceMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  return (
    <div className={`${anton.variable} w-full`}>
      <div
        className={cn(
          "w-full",
          reduceMotion ? "overflow-x-auto" : "overflow-hidden",
        )}
      >
        <div
          className={cn(
            "flex w-max gap-[31px]",
            !reduceMotion && "animate-landing-footer-banner-marquee",
          )}
        >
          {MARQUEE_SEQUENCE.map((type, index) => (
            <BannerTile
              key={`${type}-${index}`}
              type={type}
              decorative={index >= BANNER_SEQUENCE.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
