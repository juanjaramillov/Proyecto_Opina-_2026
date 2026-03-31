
import InteractiveHeroSection from "../sections/InteractiveHeroSection";
import LiveTrendsSection from "../sections/LiveTrendsSection";
import GamifiedCTASection from "../sections/GamifiedCTASection";
import WhatIsOpinaSection from "../sections/WhatIsOpinaSection";

export default function Home() {
  return (
    <main className="bg-white text-ink min-h-screen">
      <InteractiveHeroSection />
      <WhatIsOpinaSection />
      <LiveTrendsSection />
      <GamifiedCTASection />
    </main>
  );
}
