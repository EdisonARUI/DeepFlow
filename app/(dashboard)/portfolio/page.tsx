import dynamic from "next/dynamic";

const PortfolioWorkspace = dynamic(
  () => import("./_components/portfolio-workspace").then((module) => module.PortfolioWorkspace),
  { loading: () => null },
);

export default function PortfolioPage() {
  return <PortfolioWorkspace />;
}
