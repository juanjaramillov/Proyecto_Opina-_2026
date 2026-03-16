import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from '../../../lib/logger';
import { trackPage } from "../../telemetry/track";
import { useAuth } from "../../auth";

import { Activity, AlertCircle, Info, Swords, Trophy, FileText, Target } from 'lucide-react';

// === DATA PROVIDERS ===
import { userMasterResultsReadModel } from "../../../read-models/b2c/userMasterResultsReadModel";
import { MasterHubSnapshot, HubFilters } from "../../../read-models/b2c/hub-types";

import { FilterBar } from "../components/hub/FilterBar";
import { VersusHubSection } from "../components/hub/VersusHubSection";
import { TournamentHubSection } from "../components/hub/TournamentHubSection";
// Nuevos Hubs de Demo
import { ActualidadHubSection } from "../components/hub/ActualidadHubSection";
import { ProfundidadHubSection } from "../components/hub/ProfundidadHubSection";

import { MySignalsSummary } from "../components/MySignalsSummary";
import { TransversalComparator } from "../components/hub/TransversalComparator";
import { RealTimelineChart } from "../components/RealTimelineChart";
import { NextActionRecommendation } from "../../../components/ui/NextActionRecommendation";

type HubTab = 'versus' | 'tournament' | 'actualidad' | 'profundidad';

export default function ResultsPage() {
  const nav = useNavigate();
  const { profile } = useAuth();
  
  // 1. Estado Local y Filtros Demográficos
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<MasterHubSnapshot | null>(null);
  const [filters, setFilters] = useState<HubFilters>({});
  const [activeTab, setActiveTab] = useState<HubTab>('versus');

  const loadData = useCallback(async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const snap = await userMasterResultsReadModel.getMasterHubSnapshot(profile.id, filters);
      setSnapshot(snap);
    } catch (e) {
      logger.error("Error loading master hub data", { domain: 'network_api', origin: 'Results_Hub_B2C', action: 'load_data', state: 'failed' }, e);
    } finally {
      setLoading(false);
    }
  }, [profile, filters]); 

  useEffect(() => {
    loadData();
    trackPage("results_hub_b2c");
  }, [loadData]);


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

        {/* 1. Hero Hub B2C EDITORIAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 pb-16 border-b border-stroke/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
           
           {/* Columna Izquierda: Copys y micro insights (7/12) */}
           <div className="lg:col-span-7 flex flex-col justify-center">
              {/* Badges de apoyo */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                 <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black text-ink uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${
                    snapshot.sufficiency === 'sufficient_data' 
                      ? 'bg-primary/5 border-primary/20 text-primary' 
                      : snapshot.sufficiency === 'partial_data'
                        ? 'bg-amber-500/5 border-amber-500/20 text-amber-600'
                        : 'bg-red-500/5 border-red-500/20 text-red-600'
                  }`}>
                    {snapshot.sufficiency === 'sufficient_data' && <Activity className="w-3.5 h-3.5" />}
                    {snapshot.sufficiency === 'partial_data' && <Info className="w-3.5 h-3.5" />}
                    {snapshot.sufficiency === 'insufficient_data' && <AlertCircle className="w-3.5 h-3.5" />}
                    {snapshot.sufficiency === 'sufficient_data' ? 'Señal Robusta' : snapshot.sufficiency === 'partial_data' ? 'Señal en Consolidación' : 'Señal Exploratoria'}
                 </span>
                 <span className="px-3 py-1 bg-surface border border-stroke rounded-full text-[10px] font-bold tracking-widest uppercase text-text-muted">
                    Perfil {snapshot.user.profileCompleteness}%
                 </span>
              </div>

              {/* Titular Editorial Fuerte */}
              <h1 className="text-4xl md:text-5xl lg:text-[52px] font-black text-ink leading-[1.05] tracking-tight mb-5 text-balance">
                 {snapshot.sufficiency === 'sufficient_data' 
                     ? <>Tus posiciones frente al consumo, <span className="text-gradient-brand">en un solo lugar.</span></>
                     : <>Tu perfil analítico <span className="text-gradient-brand">comienza a tomar forma</span> en base a tus decisiones.</>
                 }
              </h1>

              {/* Subtítulo Útil */}
              <p className="text-lg text-text-secondary font-medium leading-relaxed max-w-xl text-balance">
                 {snapshot.sufficiency === 'sufficient_data'
                     ? 'Tus patrones muestran una alta estabilidad comparado con tu grupo demográfico en los módulos core.'
                     : 'Sigue participando en Torneos y Actualidad para desbloquear una lectura interpretativa mucho más profunda.'
                 }
              </p>

              {/* Micro-insights secundarios */}
              {snapshot.cohortState.isFiltered && (
                 <div className="mt-8 flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-2xl w-max">
                    <Target className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-ink leading-tight">Lente Demográfico Activo</p>
                      <p className="text-xs text-text-secondary mt-0.5">La lectura actual compara solo contra {snapshot.cohortState.cohortSize} perfiles similares.</p>
                    </div>
                 </div>
              )}
           </div>

           {/* Columna Derecha: Visual Principal (5/12) */}
           <div className="lg:col-span-5 flex items-center justify-end relative mt-8 lg:mt-0">
               <div className="w-full max-w-md bg-surface border border-stroke rounded-[32px] p-8 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none">
                     <Activity className="w-48 h-48 text-primary -mr-12 -mt-12" />
                  </div>

                  <h3 className="text-sm font-black uppercase tracking-widest text-ink mb-8">Huella de Señal</h3>
                  
                  <div className="space-y-6 relative z-10">
                     {[
                        { label: 'Decisiones Rápidas (Versus)', type: 'versus', color: 'bg-primary' },
                        { label: 'Comparación Múltiple (Torneos)', type: 'tournament', color: 'bg-indigo-500' },
                        { label: 'Temas Coyunturales (Actualidad)', type: 'actualidad', color: 'bg-rose-500' }
                     ].map(mod => {
                        const totalSignals = snapshot.overview.totalSignals || 1; // avoid /0
                        const count = snapshot.overview.topModules.find(m => m.moduleType === mod.type)?.count || 0;
                        const pct = (count / totalSignals) * 100;

                        return (
                           <div key={mod.type} className="flex flex-col gap-2">
                              <div className="flex justify-between items-center text-xs font-bold">
                                 <span className="text-text-secondary">{mod.label}</span>
                                 <span className="text-ink">{pct.toFixed(0)}%</span>
                              </div>
                              <div className="h-2 w-full bg-surface2 rounded-full overflow-hidden">
                                 <div className={`h-full ${mod.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                              </div>
                           </div>
                        );
                     })}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-stroke flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Volumen Total</span>
                        <div className="text-2xl font-black text-ink">{snapshot.overview.totalSignals} <span className="text-sm text-text-secondary font-medium">señales</span></div>
                     </div>
                     <div className="flex items-center gap-3">
                        {snapshot.user.profileCompleteness < 100 && (
                           <button 
                             onClick={() => nav('/complete-profile')}
                             className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary-muted transition-colors flex items-center gap-1"
                             disabled={loading}
                           >
                              Completar Perfil
                           </button>
                        )}
                        <div className="w-10 h-10 rounded-full border border-stroke flex items-center justify-center bg-surface2 relative">
                           <div className="absolute inset-0 rounded-full border-[3px] border-primary border-t-transparent animate-spin-slow" style={{ animationDuration: '3s', opacity: 0.3 }} />
                           <Target className="w-4 h-4 text-primary" />
                        </div>
                     </div>
                  </div>
               </div>
           </div>

        </div>

        {/* 2. Resumen Transversal */}
        <div className="mb-16 bg-surface2/20 rounded-[2rem] p-8 border border-stroke/50 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 relative">
          {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 rounded-3xl"></div>}
          <h2 className="text-xl font-black text-ink mb-6 px-2 tracking-tight">Tu Resumen Transversal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MySignalsSummary 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              snapshot={{ signals: snapshot.overview, sufficiency: snapshot.sufficiency } as any} 
              loading={loading} 
            />
            {/* Status Card Rehecha Visualmente (Opina+ Brand Look) */}
            <div className={`card p-6 border shadow-sm flex flex-col justify-start relative overflow-hidden group border-stroke bg-surface2/30`}>
                 <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 group-hover:scale-110 transform origin-top-right">
                   <span className="material-symbols-outlined text-[100px] text-primary">diamond</span>
                 </div>
                 
                 <div className="flex items-center gap-2 mb-4 z-10">
                   <div className="w-8 h-8 rounded-full bg-surface border border-stroke flex items-center justify-center shadow-sm">
                     <span className={`material-symbols-outlined text-[16px] text-text-muted`}>workspace_premium</span>
                   </div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary">Rango Cívico en Opina+</h3>
                 </div>

                 <div className="z-10 mt-2">
                   <h4 className="text-3xl font-black text-ink tracking-tight mb-1">
                      {snapshot.sufficiency !== 'insufficient_data' ? 'Influyente' : 'Recién Llegado'}
                   </h4>
                   <p className="text-sm font-bold text-text-muted mb-6">
                      {snapshot.sufficiency !== 'insufficient_data' ? 'Comienzas a influir' : 'Fase de Calibración'}
                   </p>
                   
                   <div className="space-y-4">
                     <div>
                       <div className="flex justify-between text-xs font-bold text-ink mb-1 uppercase tracking-widest text-[9px]">
                         <span>Progreso al Siguiente Nivel</span>
                         <span className="text-primary">{snapshot.overview?.totalSignals || 0} / 50</span>
                       </div>
                       <div className="h-2 w-full bg-surface2 hover:bg-stroke transition-colors rounded-full overflow-hidden border border-stroke/50">
                         <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min(((snapshot.overview?.totalSignals || 0) / 50) * 100, 100)}%` }}></div>
                       </div>
                     </div>

                     {snapshot.sufficiency !== 'insufficient_data' && (
                       <div className="bg-surface/60 p-3 rounded-xl border border-stroke backdrop-blur-sm">
                         <p className="text-xs font-medium text-text-secondary leading-relaxed">
                           <span className="font-bold text-ink block mb-1">Status Activo:</span> 
                           Sube de nivel para acceder a encuestas exclusivas.
                         </p>
                       </div>
                     )}
                   </div>
                 </div>
            </div>
          </div>
        </div>

        {/* 3. Barra de Filtro Demográfica (Aplica cruzado) - MÁS CERCA DE LA COMPARACIÓN */}
        <div className="mb-4 sticky top-[68px] z-40">
           <FilterBar 
             filters={filters} 
             onChange={setFilters} 
             isFiltered={snapshot.cohortState.isFiltered}
             cohortSize={snapshot.cohortState.cohortSize}
           />
        </div>

        {/* 4. Bloque de Comparaciones Clave (NUEVO COMPARADOR TRANSVERSAL) */}
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 relative">
          <TransversalComparator 
            snapshot={snapshot} 
            loading={loading}
            onClearFilter={() => setFilters({})}
          />
        </div>

        {/* 5. Navegación Intrasitio (Tabs) por Módulos */}
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
               onClick={() => setActiveTab('tournament')}
               className={`pb-3 px-4 text-sm font-black uppercase tracking-widest border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors ${activeTab === 'tournament' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-ink'}`}
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

        {/* Contenedor de Vistas Modulares (Tabs Content) */}
        <div className="min-h-[250px] mb-12 relative">
           {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 rounded-2xl"></div>}
           {activeTab === 'versus' && <VersusHubSection snapshot={snapshot} loading={loading} />}
           {activeTab === 'tournament' && <TournamentHubSection snapshot={snapshot} loading={loading} />}
           {activeTab === 'actualidad' && <ActualidadHubSection snapshot={snapshot} loading={loading} />}
           {activeTab === 'profundidad' && <ProfundidadHubSection snapshot={snapshot} loading={loading} />}
        </div>

        {/* 6. Bloque de Evolución */}
        <div className="mb-16 bg-surface2/30 rounded-[2rem] p-8 border border-stroke/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 relative">
          {loading && <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 rounded-3xl"></div>}
          <h2 className="text-xl font-black text-ink mb-6 px-2 tracking-tight">Ruta de Enganche Activo</h2>
          <RealTimelineChart 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            snapshot={{ signals: snapshot.overview, sufficiency: snapshot.sufficiency } as any} 
            loading={loading} 
          />
        </div>

        {/* 7. Siguiente Acción (Cierre) */}
        {!loading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
             <NextActionRecommendation 
               totalSignals={snapshot.overview?.totalSignals || 0}
               profileCompleteness={snapshot.user?.profileCompleteness || 0}
               onAction={(action) => {
                 if (action === 'profile') nav('/complete-profile');
                 else if (action === 'versus') nav('/versus');
                 else if (action === 'tournament') nav('/tournament');
               }}
             />
          </div>
        )}

      </div>
    </div>
  );
}
