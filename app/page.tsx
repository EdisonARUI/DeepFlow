import { LandingFooter } from "./_components/landing-footer";
import { LandingHero } from "./_components/landing-hero";
import { LandingPartners } from "./_components/landing-partners";
import { LandingProducts } from "./_components/landing-products";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617]">
      <LandingHero />
      <LandingProducts />
      <LandingPartners />
      <LandingFooter />
    </main>
  );
}
