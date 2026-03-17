import { Swords, Trophy, FileText, Target } from "lucide-react";
import { HubTab } from "../hooks/useResultsExperience";

interface ResultsTabNavigationProps {
  activeTab: HubTab;
  setActiveTab: (tab: HubTab) => void;
}

export function ResultsTabNavigation({ activeTab, setActiveTab }: ResultsTabNavigationProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-black text-ink mb-4 px-2 tracking-tight">Análisis Modular de Decisiones</h2>
      <div className="flex items-center gap-2 border-b border-stroke pb-0 overflow-x-auto no-scrollbar relative">
        <button 
          onClick={() => setActiveTab('versus')}
          className={`pb-3 px-4 text-sm font-black uppercase tracking-widest border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'versus' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-ink'}`}
        >
          <Swords className="w-4 h-4" /> Versus
        </button>
        <button 
          onClick={() => setActiveTab('torneo')}
          className={`pb-3 px-4 text-sm font-black uppercase tracking-widest border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'torneo' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-ink'}`}
        >
          <Trophy className="w-4 h-4" /> Torneos
        </button>
        <button 
          onClick={() => setActiveTab('actualidad')}
          className={`pb-3 px-4 text-sm font-black uppercase tracking-widest border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'actualidad' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-ink'}`}
        >
          <FileText className="w-4 h-4" /> Actualidad
        </button>
        <button 
          onClick={() => setActiveTab('profundidad')}
          className={`pb-3 px-4 text-sm font-black uppercase tracking-widest border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'profundidad' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-ink'}`}
        >
          <Target className="w-4 h-4" /> Profundidad
        </button>
      </div>
    </div>
  );
}
