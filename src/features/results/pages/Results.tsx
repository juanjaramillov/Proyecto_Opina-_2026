import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "../../../services/analytics/trackEvent";
import { FilterBar } from "../components/hub/FilterBar";
import { TransversalComparator } from "../components/hub/TransversalComparator";
import { RealTimelineChart } from "../components/RealTimelineChart";
import { NextActionRecommendation } from "../../../components/ui/NextActionRecommendation";

import { useResultsExperience } from "../hooks/useResultsExperience";
import { ResultsHero } from "../components/ResultsHero";
import { ResultsCrossSummary } from "../components/ResultsCrossSummary";
import { ResultsTabNavigation } from "../components/ResultsTabNavigation";
import { ResultsModulePanels } from "../components/ResultsModulePanels";

export default function ResultsPage() {
  const nav = useNavigate();

  useEffect(() => {
    trackEvent('user_opened_results');
  }, []);

  const {
    loading,
    snapshot,
    filters,
    setFilters,
    activeTab,
    setActiveTab
  } = useResultsExperience();

  if (!snapshot) {
     return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
           <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-transparent relative z-10 w-full mb-12">
      <div className="max-w-6xl mx-auto px-4 py-4 relative text-ink">
        
        <ResultsHero snapshot={snapshot} loading={loading} />
        
        <ResultsCrossSummary snapshot={snapshot} loading={loading} />

        <div className="mb-4 sticky top-[68px] z-40">
           <FilterBar 
             filters={filters} 
             onChange={setFilters} 
             isFiltered={snapshot.cohortState.isFiltered}
             cohortSize={snapshot.cohortState.cohortSize}
             privacyBlocked={snapshot.cohortState.privacyState === 'insufficient_cohort'}
           />
        </div>

        <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 relative">
          <TransversalComparator 
            snapshot={snapshot} 
            loading={loading}
            onClearFilter={() => setFilters({})}
          />
        </div>

        <ResultsTabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <ResultsModulePanels activeTab={activeTab} snapshot={snapshot} loading={loading} />

        <div className="mb-16 bg-surface2/30 rounded-[2rem] p-8 border border-stroke/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 relative">
          {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 rounded-3xl"></div>}
          <h2 className="text-xl font-black text-ink mb-6 px-2 tracking-tight">Ruta de Enganche Activo</h2>
          <RealTimelineChart 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            snapshot={{ signals: snapshot.overview, sufficiency: snapshot.sufficiency } as any} 
            loading={loading} 
          />
        </div>

        {!loading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
             <NextActionRecommendation 
               totalSignals={snapshot.overview?.totalSignals || 0}
               profileCompleteness={snapshot.user?.profileCompleteness || 0}
               onAction={(action) => {
                 trackEvent('user_clicked_next_action', { target_action: action });
                 if (action === 'profile') nav('/complete-profile');
                 else if (action === 'versus') nav('/signals', { state: { mode: 'versus' } });
                 else if (action === 'torneo') nav('/signals', { state: { mode: 'torneo' } });
                 else if (action === 'actualidad') nav('/signals', { state: { mode: 'actualidad' } });
               }}
             />
          </div>
        )}

        {/* CTA FINAL DE CONSTRUCCIÓN */}
        <div className="mt-24 mb-12">
            <div className="card p-10 lg:p-14 bg-gradient-to-br from-surface to-surface2/50 border border-stroke rounded-[32px] text-center max-w-4xl mx-auto shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
               <div className="relative z-10 flex flex-col items-center">
                   <div className="w-16 h-16 rounded-full bg-white border border-stroke flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
                       <span className="material-symbols-outlined text-3xl text-primary">bolt</span>
                   </div>
                   <h2 className="text-3xl lg:text-4xl font-black text-ink tracking-tight mb-4">La red necesita tu postura</h2>
                   <p className="text-base text-text-secondary font-medium max-w-lg mb-8 leading-relaxed text-balance">
                       El valor de tus resultados crece con cada señal. Participa en Versus rápidos, defiende a tus marcas en Torneos o toma postura en Actualidad.
                   </p>
                   <button 
                       onClick={() => nav('/signals')}
                       className="btn-primary text-base px-10 py-4 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5"
                   >
                       Aportar Nuevas Señales
                   </button>
               </div>
            </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-4 mb-8 font-medium px-4">
            Opina+ refleja las preferencias declaradas de sus usuarios activos y no constituye una muestra estadística representativa de la población general.
        </p>
      </div>
    </div>
  );
}
