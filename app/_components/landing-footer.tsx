import Link from "next/link";
import { LandingFooterBanner } from "./landing-footer-banner";
import { LandingSocialLinks } from "./landing-social-links";

const NAV_LINKS = [
  { label: "HOME", href: "#landing-hero" },
  { label: "PORTFOLIO", href: "#landing-portfolio" },
  { label: "LIQUIDITY", href: "#landing-liquidity" },
  { label: "TRADING", href: "#landing-trading" },
  { label: "PARTNER", href: "#landing-partners" },
] as const;

const LEGAL_LINKS = [
  { label: "PRIVACY NOTICE", href: "#" },
  { label: "TERMS OF SERVICE", href: "#" },
] as const;

function FooterInfoPanel() {
  return (
    <div
      className="relative min-h-[280px] flex-1 overflow-hidden rounded-[45px] bg-[#101415] md:min-h-[356px]"
      style={{
        backgroundImage:
          "linear-gradient(-79.34deg, rgba(0,0,0,0.2) 0%, rgba(102,102,102,0.2) 100%), linear-gradient(90deg, #101415, #101415)",
      }}
    >
      <div className="relative z-10 flex h-full flex-col justify-between p-5 md:flex-row md:p-0">
        <div className="flex flex-col justify-between gap-8 md:h-[356px] md:w-[419px] md:py-5">
          <div className="px-0 md:px-5">
            <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-white md:text-[45px] md:leading-[52px]">
              Unify <span className="text-[#baf2ff]">Liquidity</span>
            </p>
            <p className="font-[family-name:var(--font-display)] text-3xl font-normal text-white underline md:text-[45px] md:leading-[52px]">
              On DeepBook
            </p>
          </div>
          <div className="flex items-center gap-5 px-0 md:px-5">
            <img
              src="/figma/landing/footer-brand-icon.svg"
              alt=""
              width={34}
              height={24}
              className="h-6 w-auto"
              aria-hidden
            />
            <p className="text-lg text-white md:text-[22px] md:leading-7">
              © 2025 DeepFlow.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-8 md:h-[356px] md:justify-center md:pr-5">
          <nav className="flex flex-col gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-lg text-white transition-opacity hover:opacity-80 md:text-[22px] md:leading-7"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <nav className="flex flex-col gap-2.5">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-semibold tracking-[0.1px] text-white transition-opacity hover:opacity-80 md:text-sm md:leading-5"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[80px] overflow-hidden md:h-[140px]"
        aria-hidden
      >
        <p className="bg-gradient-to-b from-[rgba(255,255,255,0.1)] to-transparent bg-clip-text text-center font-[family-name:var(--font-display)] text-[120px] font-bold leading-none tracking-[-14px] text-transparent md:text-[202px] md:tracking-[-14px]">
          DeepFlow
        </p>
      </div>
    </div>
  );
}

export function LandingFooter() {
  return (
    <footer>
      <LandingFooterBanner />
      <div className="bg-black p-5">
        <div className="mx-auto flex flex-col items-center gap-5 lg:flex-row lg:items-stretch">
          <LandingSocialLinks variant="footer" />
          <FooterInfoPanel />
        </div>
      </div>
    </footer>
  );
}
