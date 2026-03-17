import { MasterHubSnapshot } from "../../../read-models/b2c/hub-types";
import { HubTab } from "../hooks/useResultsExperience";

import { VersusHubSection } from "./hub/VersusHubSection";
import { TournamentHubSection } from "./hub/TournamentHubSection";
import { ActualidadHubSection } from "./hub/ActualidadHubSection";
import { ProfundidadHubSection } from "./hub/ProfundidadHubSection";

interface ResultsModulePanelsProps {
  activeTab: HubTab;
  snapshot: MasterHubSnapshot;
  loading: boolean;
}

export function ResultsModulePanels({ activeTab, snapshot, loading }: ResultsModulePanelsProps) {
  return (
    <div className="min-h-[250px] mb-12 relative">
      {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 rounded-2xl"></div>}
      {activeTab === 'versus' && <VersusHubSection snapshot={snapshot} loading={loading} />}
      {activeTab === 'torneo' && <TournamentHubSection snapshot={snapshot} loading={loading} />}
      {activeTab === 'actualidad' && <ActualidadHubSection snapshot={snapshot} loading={loading} />}
      {activeTab === 'profundidad' && <ProfundidadHubSection snapshot={snapshot} loading={loading} />}
    </div>
  );
}
