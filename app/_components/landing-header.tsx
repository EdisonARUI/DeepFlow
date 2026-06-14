import { LaunchAppLink } from "./launch-app-link";
import { LandingSocialLinks } from "./landing-social-links";

export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 md:px-10">
        <div className="flex items-center gap-3">
          <img
            src="/figma/icons/logo.svg"
            alt="DeepFlow"
            width={45}
            height={32}
            className="h-8 w-auto"
          />
          <span className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-white md:text-4xl">
            DEEPFLOW
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <LandingSocialLinks />
          <LaunchAppLink variant="button" className="hidden h-8 px-8 py-0 sm:inline-flex" showArrow={false} />
        </div>
      </div>
    </header>
  );
}
