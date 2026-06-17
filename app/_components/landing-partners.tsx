"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const PARTNERS = [
  {
    name: "NAVI",
    icon: "/figma/landing/partner-navi-circle.png",
    iconClass: "size-[90px]",
  },
  {
    name: "DeepBook",
    icon: "/figma/landing/partner-deepbook-circle.png",
    iconClass: "size-[90px]",
  },
  {
    name: "Sui Foundation",
    icon: "/figma/landing/partner-sui-circle.png",
    iconClass: "h-[90px] w-[72px]",
  },
  {
    name: "Suilend",
    icon: "/figma/landing/partner-suilend-circle.png",
    iconClass: "size-[90px]",
  },
] as const;

type Partner = (typeof PARTNERS)[number];

const CARD_WIDTH = 240;
const GAP = 15;
const ITEM_STRIDE = CARD_WIDTH + GAP;

function computePartnerCopies(viewportWidth: number) {
  const minItems =
    Math.ceil(viewportWidth / ITEM_STRIDE) + PARTNERS.length;
  const copies = Math.ceil(minItems / PARTNERS.length);
  return Math.max(2, copies);
}

function buildMarqueePartners(copies: number) {
  const basePartners = Array.from({ length: copies }, () => PARTNERS).flat();
  return {
    basePartners,
    marqueePartners: [...basePartners, ...basePartners],
  };
}

function PartnerLogoCard({
  partner,
  decorative = false,
}: {
  partner: Partner;
  decorative?: boolean;
}) {
  return (
    <div className="flex size-[240px] shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-white">
      <img
        src={partner.icon}
        alt={decorative ? "" : partner.name}
        aria-hidden={decorative}
        className={partner.iconClass}
      />
    </div>
  );
}

function PartnerMarqueeRow({
  direction,
  reduceMotion,
  marqueePartners,
  baseLength,
  className,
}: {
  direction: "left" | "right";
  reduceMotion: boolean;
  marqueePartners: Partner[];
  baseLength: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full",
        reduceMotion ? "overflow-x-auto" : "overflow-hidden",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-max gap-[15px]",
          !reduceMotion &&
            (direction === "left"
              ? "animate-landing-partners-marquee"
              : "animate-landing-partners-marquee-reverse"),
        )}
      >
        {marqueePartners.map((partner, index) => (
          <PartnerLogoCard
            key={`${partner.name}-${direction}-${index}`}
            partner={partner}
            decorative={index >= baseLength}
          />
        ))}
      </div>
    </div>
  );
}

export function LandingPartners() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [copies, setCopies] = useState(2);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduceMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    const updateCopies = () => setCopies(computePartnerCopies(window.innerWidth));
    updateCopies();
    window.addEventListener("resize", updateCopies);
    return () => window.removeEventListener("resize", updateCopies);
  }, []);

  const { basePartners, marqueePartners } = useMemo(
    () => buildMarqueePartners(copies),
    [copies],
  );

  return (
    <section
      id="landing-partners"
      className="bg-black px-5 pb-[10px] pt-5"
    >
      <h2 className="text-center font-[family-name:var(--font-display)] text-[40px] font-bold leading-[52px] text-white md:text-[64px]">
        Our Partner
      </h2>
      <div className="mt-10 flex flex-col gap-[15px]">
        <PartnerMarqueeRow
          direction="left"
          reduceMotion={reduceMotion}
          marqueePartners={marqueePartners}
          baseLength={basePartners.length}
        />
        <PartnerMarqueeRow
          direction="right"
          reduceMotion={reduceMotion}
          marqueePartners={marqueePartners}
          baseLength={basePartners.length}
          className="md:pl-[67px]"
        />
      </div>
    </section>
  );
}
