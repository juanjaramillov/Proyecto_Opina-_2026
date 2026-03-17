
import InteractiveHeroSection from "../sections/InteractiveHeroSection";
import LiveTrendsSection from "../sections/LiveTrendsSection";
import ChallengesMenuSection from "../sections/ChallengesMenuSection";
import CommunityPulseSection from "../sections/CommunityPulseSection";
import GamifiedCTASection from "../sections/GamifiedCTASection";

import RewardsValuePropsSection from "../sections/RewardsValuePropsSection";

export default function Home() {
  return (
    <main className="bg-white text-ink min-h-screen">
      <InteractiveHeroSection />
      <LiveTrendsSection />
      <ChallengesMenuSection />
      <RewardsValuePropsSection />
      <CommunityPulseSection />
      <GamifiedCTASection /> 
    </main>
  );
}
