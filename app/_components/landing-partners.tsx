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

export function LandingPartners() {
  return (
    <section className="bg-[#101415] py-16 md:py-20">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-5 md:px-10">
        <h2 className="text-center font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.8px] text-[#e0e3e5] md:text-[40px] md:leading-[48px]">
          Our Partners
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PARTNERS.map((partner) => (
            <div
              key={partner.name}
              className="flex h-[90px] items-center justify-center gap-2.5 rounded border border-[#363a3b] bg-[#191c1e] px-4"
            >
              <img
                src={partner.icon}
                alt=""
                className={partner.iconClass}
              />
              <span className="font-[family-name:var(--font-display)] text-xl font-bold text-white md:text-2xl">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
