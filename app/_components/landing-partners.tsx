"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const PARTNERS = [
  {
    name: "Sui Foundation",
    icon: "/figma/landing/partner-sui.png",
    iconClass: "h-8 w-[25px]",
  },
  {
    name: "DeepBook",
    icon: "/figma/landing/partner-deepbook.png",
    iconClass: "size-8",
  },
  {
    name: "Suilend",
    icon: "/figma/landing/partner-suilend.png",
    iconClass: "size-8",
  },
  {
    name: "NAVI",
    icon: "/figma/landing/partner-navi.png",
    iconClass: "h-8 w-[33px]",
  },
] as const;

const MARQUEE_PARTNERS = [...PARTNERS, ...PARTNERS];

function PartnerCard({
  partner,
}: {
  partner: (typeof PARTNERS)[number];
}) {
  return (
    <div className="flex h-[90px] w-[280px] shrink-0 items-center justify-center gap-2.5 rounded border border-[#363a3b] bg-[#191c1e] px-4">
      <img src={partner.icon} alt="" className={partner.iconClass} />
      <span className="font-[family-name:var(--font-display)] text-xl font-bold text-white md:text-2xl">
        {partner.name}
      </span>
    </div>
  );
}

export function LandingPartners() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduceMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  return (
    <section className="bg-[#101415] py-16 md:py-20">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-5 md:px-10">
        <h2 className="text-center font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.8px] text-[#e0e3e5] md:text-[40px] md:leading-[48px]">
          Our Partners
        </h2>
        <div
          className={cn(
            "w-full",
            reduceMotion ? "overflow-x-auto" : "overflow-hidden",
          )}
        >
          <div
            className={cn(
              "flex w-max gap-4",
              !reduceMotion && "animate-landing-partners-marquee",
            )}
          >
            {MARQUEE_PARTNERS.map((partner, index) => (
              <PartnerCard
                key={`${partner.name}-${index}`}
                partner={partner}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
