import { Anton } from "next/font/google";
import { LaunchAppLink, LANDING_LAUNCH_PILL_CLASS } from "./launch-app-link";
import { LandingHeader } from "./landing-header";
import { LandingHeroWaves } from "./landing-hero-waves";
import { LandingPortfolioPrefetch } from "./landing-portfolio-prefetch";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-hero",
});

export function LandingHero() {
  return (
    <section
      id="landing-hero"
      className={`${anton.variable} relative px-5 pb-[10px] pt-5`}
    >
      <LandingPortfolioPrefetch />
      <div className="relative flex min-h-[696px] flex-col items-center justify-center overflow-hidden rounded-[45px]">
        <LandingHeader />
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <LandingHeroWaves />
        </div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(126.23deg, rgba(0,218,248,0.05) 50.416%, rgba(0,218,248,0) 50.416%), linear-gradient(90deg, rgba(186,242,255,0.15), rgba(186,242,255,0.15))",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(186,242,255,0)] via-[rgba(186,242,255,0.05)] to-[#101415] opacity-30" />
        <div className="relative z-10 mx-auto flex w-full max-w-[1024px] flex-col items-center justify-center gap-5 px-5 py-10">
          <h1 className="text-center font-[family-name:var(--font-hero)] text-[80px] uppercase leading-[88px] tracking-[-2.4px] text-[#e0e3e4] md:text-[160px] md:leading-[110px] md:tracking-[-4.8px]">
            DEEPFLOW
          </h1>
          <p className="text-center text-[22px] font-bold text-[#bac9cd] md:text-[30px] md:leading-[28px]">
            Unify <span className="text-[#baf2ff]">Liquidity</span> on DeepBook
          </p>
          <LaunchAppLink
            variant="button"
            showArrow={false}
            className={LANDING_LAUNCH_PILL_CLASS}
          />
        </div>
      </div>
    </section>
  );
}
