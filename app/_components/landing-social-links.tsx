import { cn } from "@/lib/utils";

type SocialLink = {
  href: string;
  icon: string;
  label: string;
  iconClassName?: string;
  footerIcon?: string;
  standalone?: boolean;
};

const SOCIAL_LINKS: SocialLink[] = [
  {
    href: "#",
    icon: "/figma/landing/social-discord.svg",
    label: "Discord",
    iconClassName: "h-auto w-6",
  },
  {
    href: "#",
    icon: "/figma/landing/social-telegram.svg",
    label: "Telegram",
  },
  {
    href: "#",
    icon: "/figma/landing/social-x.svg",
    label: "X",
  },
  {
    href: "#",
    icon: "/figma/landing/social-mail.svg",
    footerIcon: "/figma/landing/social-mail-icon.svg",
    label: "Email",
    standalone: true,
  },
];

type LandingSocialLinksProps = {
  variant?: "default" | "header" | "footer";
};

export function LandingSocialLinks({ variant = "default" }: LandingSocialLinksProps) {
  const isHeader = variant === "header";
  const isFooter = variant === "footer";

  if (isFooter) {
    return (
      <div className="grid size-[280px] shrink-0 grid-cols-2 gap-2.5 md:size-[356px] md:gap-[10px]">
        {SOCIAL_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            aria-label={link.label}
            className="flex size-[135px] shrink-0 items-center justify-center overflow-hidden rounded-[45px] bg-white transition-opacity hover:opacity-80 md:size-[173px]"
          >
            <img
              src={link.footerIcon ?? link.icon}
              alt=""
              className={
                link.label === "Discord"
                  ? "h-auto w-16"
                  : link.label === "Email"
                    ? "h-auto w-20"
                    : (link.iconClassName ?? "size-20")
              }
            />
          </a>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center",
        isHeader ? "gap-[5px]" : "gap-1.5",
      )}
    >
      {SOCIAL_LINKS.map((link) => {
        if (isHeader && link.standalone) {
          return (
            <a
              key={link.label}
              href={link.href}
              aria-label={link.label}
              className="size-10 shrink-0 transition-opacity hover:opacity-80 sm:size-12 md:size-16"
            >
              <img
                src={link.icon}
                alt=""
                className="size-full"
              />
            </a>
          );
        }

        const defaultIconClass =
          link.label === "Discord" ? "h-auto w-6" : "size-6";

        return (
          <a
            key={link.label}
            href={link.href}
            aria-label={link.label}
            className={cn(
              "flex shrink-0 items-center justify-center transition-opacity hover:opacity-80",
              isHeader
                ? "size-10 rounded-full border border-black bg-white sm:size-12 md:size-16"
                : "size-9 rounded-[5px] bg-[rgba(0,218,248,0.1)]",
            )}
          >
            <img
              src={link.icon}
              alt=""
              className={link.iconClassName ?? defaultIconClass}
            />
          </a>
        );
      })}
    </div>
  );
}
