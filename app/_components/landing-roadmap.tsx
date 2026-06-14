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

export function LandingRoadmap() {
  return (
    <section className="relative overflow-hidden bg-[#101415] py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 mix-blend-luminosity opacity-20">
        <img
          src="/figma/landing/circuit-bg.png"
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
        <div className="relative h-[400px] w-full flex-1 md:h-[600px]">
          <img
            src="/figma/landing/roadmap-line.svg"
            alt=""
            className="absolute inset-0 size-full drop-shadow-[0px_0px_5px_rgba(0,224,255,0.5)]"
          />
          {MILESTONES.map((milestone) => (
            <div
              key={milestone.period}
              className={`absolute ${milestone.position}`}
            >
              <div className="relative flex items-center">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border-2 border-accent-cyan bg-[#00282e] p-0.5 shadow-[0px_0px_7.5px_rgba(0,224,255,0.6)]">
                  <img
                    src={milestone.icon}
                    alt=""
                    width={20}
                    height={20}
                    className="size-5"
                  />
                </div>
                <div
                  className={`absolute w-48 ${milestone.labelPosition}`}
                >
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
