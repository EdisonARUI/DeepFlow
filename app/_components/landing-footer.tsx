import { LandingSocialLinks } from "./landing-social-links";

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#101415] pb-10 pt-10">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-20 px-5 md:px-20">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <img
            src="/figma/landing/footer-logo.png"
            alt="DeepFlow"
            width={90}
            height={64}
            className="h-16 w-auto"
          />
          <div className="flex flex-col items-center gap-2 md:items-end">
            <LandingSocialLinks />
            <p className="text-right text-lg text-white md:text-[22px]">
              ©2025 DeepFlow. All rights reserved.
            </p>
          </div>
        </div>
      </div>
      <div className="pointer-events-none mt-8 flex justify-center overflow-hidden px-8">
        <p className="bg-gradient-to-b from-[rgba(255,255,255,0.1)] to-transparent bg-clip-text font-[family-name:var(--font-display)] text-[120px] font-bold leading-none tracking-[-14px] text-transparent md:text-[281px] md:tracking-[-14px]">
          DeepFlow
        </p>
      </div>
    </footer>
  );
}
