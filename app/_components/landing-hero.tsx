import { LaunchAppLink } from "./launch-app-link";
import { LandingHeroWaves } from "./landing-hero-waves";

export function LandingHero() {
  return (
    <section
      id="landing-hero"
      className="relative -mt-20 flex min-h-[696px] flex-col items-center justify-end overflow-hidden border-b border-[rgba(59,73,76,0.2)] pb-10 pt-40 md:pb-[41px] md:pt-[400px]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <LandingHeroWaves />
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col items-center gap-5 px-5 md:px-10">
        <h1 className="max-w-4xl text-center font-[family-name:var(--font-display)] text-4xl font-bold tracking-[-2.56px] text-[#e0e3e5] md:text-[64px] md:leading-[70.4px]">
          Unify{" "}
          <span className="bg-gradient-to-r from-[#00daf8] to-[#3b82f6] bg-clip-text text-transparent">
            Liquidity
          </span>{" "}
          on DeepBook
        </h1>
        <p className="max-w-2xl text-center text-lg text-[#bac9cd] md:text-[18px] md:leading-[28.8px]">
          Seamlessly route trades, manage complex portfolios.
        </p>
        <LaunchAppLink variant="button" />
      </div>
    </section>
  );
}
