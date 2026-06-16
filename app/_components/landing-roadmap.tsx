"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MILESTONES = [
  {
    period: "2026",
    title: "Launch",
    icon: "/figma/landing/roadmap-launch.svg",
    position: "bottom-[8%] left-[8%]",
    labelPosition: "left-[calc(100%+16px)] top-1/2 -translate-y-1/2",
  },
  {
    period: "Q1 2027",
    title: "Ecosystem Expansion",
    icon: "/figma/landing/roadmap-flag.svg",
    position: "bottom-[38%] left-[32%]",
    labelPosition: "left-[calc(100%+16px)] top-1/2 -translate-y-1/2",
  },
  {
    period: "Q2 2027",
    title: "AI Agent Integration",
    icon: "/figma/landing/roadmap-flag.svg",
    position: "bottom-[62%] left-[56%]",
    labelPosition: "right-[calc(100%+16px)] top-1/2 -translate-y-1/2 text-right",
  },
  {
    period: "Q3 2027",
    title: "Scaling & Market Expansion",
    icon: "/figma/landing/roadmap-flag.svg",
    position: "bottom-[86%] left-[80%]",
    labelPosition: "right-[calc(100%+16px)] top-1/2 -translate-y-1/2 text-right",
  },
] as const;

const SEGMENT_DURATION_MS = 500;
const MILESTONE_DELAY_OFFSET_MS = 200;

type Point = { x: number; y: number };

type Segment = {
  x: number;
  y: number;
  length: number;
  angle: number;
};

function computeSegments(points: Point[]): Segment[] {
  const segments: Segment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const from = points[i];
    const to = points[i + 1];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    segments.push({
      x: from.x,
      y: from.y,
      length: Math.hypot(dx, dy),
      angle: (Math.atan2(dy, dx) * 180) / Math.PI,
    });
  }
  return segments;
}

export function LandingRoadmap() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const measureSegments = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const points: Point[] = iconRefs.current
      .filter((el): el is HTMLDivElement => el !== null)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
        };
      });

    if (points.length === MILESTONES.length) {
      setSegments(computeSegments(points));
    }
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduceMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);
    return () => media.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    measureSegments();

    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(measureSegments);
    resizeObserver.observe(container);
    window.addEventListener("resize", measureSegments);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureSegments);
    };
  }, [measureSegments]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const showAnimated = isVisible || reduceMotion;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#101415] py-16 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 mix-blend-luminosity opacity-20">
        <img
          src="/figma/landing/contour_map.svg"
          alt=""
          className="size-full object-cover"
        />
      </div>
      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col items-center gap-10 px-5 md:flex-row md:gap-10 md:px-10">
        <div className="flex flex-1 flex-col gap-10">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-[-2.56px] text-[#e0e3e5] md:text-[48px] md:leading-[70.4px]">
            We Unify Yield and Liquidity
            <br />
            On DeepBook
          </h2>
          <p className="max-w-xl text-xl leading-[28.8px] text-[#bac9cd] md:text-2xl">
            Deepflow seamlessly connects top yield protocols with instant trading
            liquidity, ensuring your assets never sit idle.
          </p>
        </div>
        <div
          ref={containerRef}
          className="relative h-[400px] w-full flex-1 md:h-[600px]"
        >
          {segments.map((segment, index) => (
            <div
              key={index}
              className="pointer-events-none absolute h-[2px] origin-left shadow-[0px_0px_5px_rgba(0,224,255,0.5)]"
              style={{
                left: segment.x,
                top: segment.y,
                width: segment.length,
                transform: `rotate(${segment.angle}deg) scaleX(${showAnimated ? 1 : 0})`,
                transition: reduceMotion
                  ? "none"
                  : `transform ${SEGMENT_DURATION_MS}ms ease-out ${index * SEGMENT_DURATION_MS}ms`,
                background: "rgba(0, 224, 255, 0.2)",
              }}
            />
          ))}
          {MILESTONES.map((milestone, index) => (
            <div
              key={milestone.period}
              className={cn(
                `absolute transition-all duration-500 ease-out ${milestone.position}`,
                showAnimated ? "scale-100 opacity-100" : "scale-90 opacity-0",
              )}
              style={
                reduceMotion
                  ? undefined
                  : {
                      transitionDelay: `${index * SEGMENT_DURATION_MS + MILESTONE_DELAY_OFFSET_MS}ms`,
                    }
              }
            >
              <div className="relative flex items-center">
                <div
                  ref={(el) => {
                    iconRefs.current[index] = el;
                  }}
                  className="flex size-14 shrink-0 items-center justify-center rounded-xl border-2 border-accent-cyan bg-[#00282e] p-0.5 shadow-[0px_0px_7.5px_rgba(0,224,255,0.6)]"
                >
                  <img
                    src={milestone.icon}
                    alt=""
                    width={20}
                    height={20}
                    className="size-5"
                  />
                </div>
                <div className={`absolute w-48 ${milestone.labelPosition}`}>
                  <p className="font-mono text-lg text-accent-cyan">
                    {milestone.period}
                  </p>
                  <p className="text-sm text-[#e0e3e5]">{milestone.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
