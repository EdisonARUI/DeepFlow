import { Anton } from "next/font/google";
import { LaunchAppLink } from "./launch-app-link";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-product",
});

const headlineClassName =
  "flex items-center font-[family-name:var(--font-product)] text-[48px] uppercase leading-none tracking-[1.2px] text-[#e0e3e4] md:text-[80px]";

type LandingProductSectionProps = {
  id?: string;
  headline: [string, string];
  description: string;
  previewSrc: string;
  previewAlt: string;
  href: string;
  reversed?: boolean;
};

export function LandingProductSection({
  id,
  headline,
  description,
  previewSrc,
  previewAlt,
  href,
  reversed = false,
}: LandingProductSectionProps) {
  const preview = (
    <div className="mx-auto aspect-square w-full max-w-[500px] overflow-hidden rounded-[45px] border border-white">
      <img
        src={previewSrc}
        alt={previewAlt}
        className="size-full object-cover object-center"
      />
    </div>
  );

  const content = (
    <div className="flex w-full max-w-[515px] flex-col gap-10 lg:justify-center">
      <div className="flex flex-col gap-2.5">
        <h2 className={`${headlineClassName} min-h-[56px] md:min-h-[80px]`}>
          {headline[0]}
        </h2>
        <h2 className={`${headlineClassName} min-h-[64px] md:min-h-[90px]`}>
          {headline[1]}
        </h2>
      </div>
      <p className="max-w-[458px] font-mono text-[10px] uppercase leading-8 tracking-[1.2px] text-white">
        {description}
      </p>
      <LaunchAppLink variant="start-now" href={href} />
    </div>
  );

  return (
    <section
      id={id}
      className={`${anton.variable} px-5 pb-[10px] pt-5`}
    >
      <div className="mx-auto rounded-[45px] bg-[#003d7a] p-10 md:p-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-[65px]">
          {reversed ? (
            <>
              {content}
              {preview}
            </>
          ) : (
            <>
              {preview}
              {content}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
