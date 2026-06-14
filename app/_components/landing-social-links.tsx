const SOCIAL_LINKS = [
  {
    href: "#",
    icon: "/figma/landing/social-discord.svg",
    label: "Discord",
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
] as const;

export function LandingSocialLinks() {
  return (
    <div className="flex items-center gap-1.5">
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.label}
          href={link.href}
          aria-label={link.label}
          className="flex size-9 items-center justify-center rounded-[5px] bg-[rgba(0,218,248,0.2)] transition-opacity hover:opacity-80"
        >
          <img src={link.icon} alt="" width={24} height={24} className="size-6" />
        </a>
      ))}
    </div>
  );
}
