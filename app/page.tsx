import { LandingFooter } from "./_components/landing-footer";
import { LandingHeader } from "./_components/landing-header";
import { LandingHero } from "./_components/landing-hero";
import { LandingPartners } from "./_components/landing-partners";
import { LandingProducts } from "./_components/landing-products";
import { LandingRoadmap } from "./_components/landing-roadmap";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617]">
      <LandingHeader />
      <LandingHero />
      <LandingProducts />
      <LandingRoadmap />
      <LandingPartners />
      <LandingFooter />
    </main>
  );
}
