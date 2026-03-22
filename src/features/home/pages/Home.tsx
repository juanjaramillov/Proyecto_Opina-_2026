
import InteractiveHeroSection from "../sections/InteractiveHeroSection";
import LiveTrendsSection from "../sections/LiveTrendsSection";
import ChallengesMenuSection from "../sections/ChallengesMenuSection";
{/* Import removido para auditoría UX */}
import GamifiedCTASection from "../sections/GamifiedCTASection";
import WhatIsOpinaSection from "../sections/WhatIsOpinaSection";

import RewardsValuePropsSection from "../sections/RewardsValuePropsSection";

export default function Home() {
  return (
    <main className="bg-white text-ink min-h-screen">
      <InteractiveHeroSection />
      <WhatIsOpinaSection />
      <LiveTrendsSection />
      <ChallengesMenuSection />
      <RewardsValuePropsSection />
      {/* <CommunityPulseSection /> - Oculto temporalmente (Auditoría UX) para evitar redundancia con LiveTrends */}
      <GamifiedCTASection /> 
    </main>
  );
}
