import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { BrandLogo } from '../../../components/ui/BrandLogo';
import { logger } from '../../../lib/logger';
import { SkeletonRankingRow } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";
import { trackPage } from "../../telemetry/track";
import { useAuth } from "../../auth";
import { useSignalStore } from "../../../store/signalStore";
import { NextActionRecommendation, ActionType } from "../../../components/ui/NextActionRecommendation";

// Import custom B2C services
import { metricsService, LeaderboardEntry, TrendSummary, TrendEntry, ComparisonSummary, ModuleHighlight } from "../../../features/metrics/services/metricsService";
import { PremiumGate } from "../../../components/ui/PremiumGate";

// Trend Chart Visual Component
function BasicTrendChart({ isUp }: { isUp: boolean }) {
  const colorVariant = isUp ? 'primary' : 'danger';
  const strokeColor = `var(--color-${colorVariant})`;
  const fillColor = `var(--color-${colorVariant}-muted)`;
  
  // Fake smooth curve
  const pts = isUp === true
    ? "0,80 20,70 40,40 60,60 80,30 100,10" 
    : isUp === false 
      ? "0,20 20,30 40,60 60,50 80,70 100,90"
      : "0,50 20,45 40,55 60,45 80,55 100,50"; // Stable

  return (
    <div className="relative w-full h-12 mt-4 opacity-80">
      <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${colorVariant}-trend`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline fill={`url(#grad-${colorVariant}-trend)`} points={`0,100 ${pts} 100,100`} />
        <polyline fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={pts} />
        <circle cx="100" cy={isUp === true ? 10 : isUp === false ? 90 : 50} r="4" fill={strokeColor} className="animate-pulse" />
      </svg>
    </div>
  );
}

function TrendCard({ title, items, isUp }: { title: string, items: TrendEntry[], isUp: boolean | null }) {
  if (items.length === 0) return null;
  const colorLabel = isUp === true ? "text-primary" : isUp === false ? "text-danger" : "text-secondary";
  const iconName = isUp === true ? 'trending_up' : isUp === false ? 'trending_down' : 'trending_flat';

  return (
    <div className="card p-6 border border-stroke bg-white shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center gap-2 mb-4 border-b border-stroke pb-2">
        <span className={`material-symbols-outlined ${colorLabel} text-[20px]`}>
          {iconName}
        </span>
        <h3 className="text-sm font-black uppercase tracking-widest text-ink">{title}</h3>
      </div>
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.entity_id} className="flex items-center justify-between">
            <p className="font-bold text-ink text-lg line-clamp-1 flex-1 relative z-10">{item.entity_name}</p>
            <span className="text-xs font-black text-text-muted bg-surface2 px-2 py-0.5 rounded-md shrink-0">
              {item.signal_count} señales
            </span>
          </div>
        ))}
        <BasicTrendChart isUp={isUp !== null ? isUp : true} />
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const nav = useNavigate();
  const { profile } = useAuth();
  const { signals } = useSignalStore();

  const [loading, setLoading] = useState(true);
  const [locked] = useState(false);

  // B2C Data states
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [trends, setTrends] = useState<TrendSummary>({ trendingUp: [], trendingDown: [], stable: [] });
  const [comparison, setComparison] = useState<ComparisonSummary | null>(null);
  const [highlights, setHighlights] = useState<ModuleHighlight[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [lb, tr, cmp, hl] = await Promise.all([
        metricsService.getGlobalLeaderboard(10),
        metricsService.getTrendSummary(),
        metricsService.getComparisonSummary(), // Mock personal comp
        metricsService.getModuleHighlights()
      ]);
      setLeaderboard(lb);
      setTrends(tr);
      setComparison(cmp);
      setHighlights(hl);
    } catch (e) {
      logger.error("Error loading results data", { domain: 'network_api', origin: 'Results', action: 'load_data', state: 'failed' }, e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
    trackPage("results_b2c");
  }, [loadAll]);

  return (
    <div className="min-h-screen bg-transparent relative z-10 w-full mb-12">
      <div className="max-w-6xl mx-auto px-4 py-8 relative text-ink">

        {/* Hero corto */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 border-b border-stroke pb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-ink tracking-tight animate-in fade-in slide-in-from-left-4 duration-500">
              Resultados <span className="text-gradient-brand">Colectivos</span>
            </h1>
            <p className="text-sm text-text-secondary font-medium mt-2 max-w-xl animate-in fade-in slide-in-from-left-6 duration-700">
              Conoce las tendencias y el pulso principal de la comunidad basados en interacciones reales.
              <br/>
              <span className="text-[10px] font-black uppercase text-primary tracking-widest mt-2 inline-block bg-primary/10 px-2 py-1 rounded-md">
                Lectura Parcial - Analysis B2C
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => nav("/signals")}
            className="btn-primary shrink-0 shadow-md text-sm px-6"
          >
            Seguir señalando →
          </button>
        </div>

        {/* Content */}
        <div className={locked ? "pointer-events-none select-none blur-sm opacity-60 transition-all duration-500" : "transition-all duration-500"}>
          
          {loading ? (
            <div className="space-y-6">
              <SkeletonRankingRow />
              <SkeletonRankingRow />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Leaderboard Principal (Columna Izquierda 2x) */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* 1. Comparison & Intro Card */}
                {comparison && (
                  <div className={`card p-6 border-l-4 ${comparison.isMajority ? 'border-l-primary bg-primary/5' : 'border-l-secondary bg-secondary/5'} shadow-sm flex items-center gap-4`}>
                    <div className="w-12 h-12 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <span className={`material-symbols-outlined text-[24px] ${comparison.isMajority ? 'text-primary' : 'text-secondary'}`}>
                        {comparison.isMajority ? 'group' : 'psychology'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-ink mb-1">Cruce de Preferencias</h3>
                      <p className="text-sm font-medium text-text-secondary">{comparison.message}</p>
                    </div>
                  </div>
                )}

                {/* 2. Top Leaderboard */}
                <div className="card shadow-md flex-1 min-h-[400px]">
                  <div className="p-6 border-b border-stroke flex justify-between items-center bg-surface2/30">
                    <div className="flex items-center gap-2">
                       <span className="material-symbols-outlined text-primary">trophy</span>
                       <h2 className="text-xl font-black text-ink">Global Leaderboard</h2>
                    </div>
                    <span className="text-[10px] text-text-muted font-bold tracking-widest uppercase bg-surface2 px-2 py-1 rounded">
                      Top 10 Net Win Rate
                    </span>
                  </div>
                  
                  {leaderboard.length === 0 ? (
                    <EmptyState title="No hay suficiente data" description="Aún no hay interacciones procesadas en la vista." icon="data_alert" />
                  ) : (
                    <div className="p-2 space-y-1">
                      {leaderboard.map((r, idx) => (
                        <div key={r.entity_id} className="flex items-center justify-between p-4 hover:bg-surface2/50 transition-colors rounded-xl group relative overflow-hidden">
                          {/* Fondo de progreso de Share */}
                          <div className="absolute top-0 bottom-0 left-0 bg-primary/5 -z-10 group-hover:bg-primary/10 transition-colors" style={{ width: `${Math.round(r.win_rate * 100)}%` }} />
                          
                          <div className="flex items-center gap-4 z-10 w-full">
                            <div className={`w-8 font-black text-lg ${idx < 3 ? 'text-primary' : 'text-text-muted'}`}>
                              {idx + 1}
                            </div>
                            <BrandLogo name={r.entity_name} className="w-10 h-10 rounded-lg shadow-sm" fallbackClassName="w-10 h-10 rounded-lg flex items-center text-[10px] uppercase font-bold justify-center bg-white border border-stroke text-text-muted" />
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-ink text-base truncate">{r.entity_name}</p>
                              <div className="flex gap-3 text-[10px] font-bold uppercase tracking-widest text-text-muted mt-0.5">
                                <span>{r.wins_count} Wins</span>
                                <span>{r.total_comparisons} Votos</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-black text-ink">{Math.round(r.win_rate * 100)}%</p>
                              <p className="text-[10px] uppercase tracking-widest font-black text-text-muted">Win Rate</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Derecho (Highlights & Trends) */}
              <div className="space-y-6 flex flex-col">
                <PremiumGate featureName="Tendencias de Mercado" isLocked={true}>
                  <div className="space-y-6">
                    {/* 3. Trends Generales */}
                    {trends.trendingUp.length > 0 && (
                      <TrendCard title="Mayor Tracción (WoW)" items={trends.trendingUp} isUp={true} />
                    )}
                    {trends.stable.length > 0 && (
                      <TrendCard title="Tracción Estable (WoW)" items={trends.stable} isUp={null} />
                    )}
                    {trends.trendingDown.length > 0 && (
                      <TrendCard title="Pérdida de Tracción (WoW)" items={trends.trendingDown} isUp={false} />
                    )}

                    {/* 4. Highlights por Módulo */}
                    <div className="card shadow-md flex-1 bg-gradient-to-b from-white to-surface2/50 relative z-0">
                      <div className="p-5 border-b border-stroke">
                        <h2 className="text-sm font-black text-ink uppercase tracking-widest flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary">star_half</span>
                          Módulos Destacados
                        </h2>
                      </div>
                      <div className="p-5 space-y-5">
                        {highlights.length === 0 ? (
                          <p className="text-xs text-text-muted text-center py-4">No hay highlights actuales</p>
                        ) : (
                          highlights.map((h, i) => (
                            <div key={i} className="border-l-2 border-stroke pl-3 hover:border-primary transition-colors">
                              <p className="text-[10px] uppercase tracking-widest font-black text-primary mb-1">{h.module}</p>
                              <h4 className="font-bold text-ink text-sm mb-1">{h.title}</h4>
                              <p className="text-xs font-medium text-text-secondary leading-snug">{h.description}</p>
                              {h.value && (
                                <span className="inline-block mt-2 bg-surface2 px-2 py-0.5 rounded text-[10px] font-black text-ink uppercase tracking-wider border border-stroke/50 shadow-sm">{h.value}</span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </PremiumGate>
              </div>
            </div>
          )}
          
          <div className="mt-12 mb-8">
            <NextActionRecommendation
              totalSignals={signals}
              profileCompleteness={(profile as { profileCompleteness?: number })?.profileCompleteness || 0}
              onAction={(action: ActionType) => {
                if (action === 'profile') nav('/complete-profile');
                if (action === 'versus') nav('/signals');
                if (action === 'results') window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              customTitle="Profundiza con nosotros"
              showSecondaryOption={false}
            />
            
            <p className="text-center text-xs font-medium text-text-muted mt-6 max-w-sm mx-auto">
              Esta es una vista parcial. Los reportes corporativos multidimensionales se acceden exclusivamente desde Intelligence B2B.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
