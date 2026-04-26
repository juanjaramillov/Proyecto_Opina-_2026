import { Activity, Users, Target, TrendingUp } from "lucide-react";
import { PlatformOverviewSnapshot } from "../../../read-models/types";

interface OverviewB2BMetricGridProps {
  snapshot: PlatformOverviewSnapshot | null;
}

export function OverviewB2BMetricGrid({ snapshot }: OverviewB2BMetricGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className="p-3 bg-brand-50 rounded-2xl">
            <Activity className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Atención Capturada</p>
            <h3 className="text-2xl font-black text-slate-900">
              {snapshot?.globalStats.totalSignalsProcessed ? snapshot.globalStats.totalSignalsProcessed.toLocaleString() : "---"}
            </h3>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className="p-3 bg-accent/10 rounded-2xl">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Activos (24h)</p>
            <h3 className="text-2xl font-black text-slate-900">
              {snapshot?.globalStats.activeUsers24h ? snapshot.globalStats.activeUsers24h.toLocaleString() : "---"}
            </h3>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className="p-3 bg-brand-50 rounded-2xl">
            <Target className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Entidades en Radar</p>
            <h3 className="text-2xl font-black text-slate-900">
              {((snapshot?.trendSummary.trendingUp.length || 0) + (snapshot?.trendSummary.trendingDown.length || 0) + (snapshot?.trendSummary.stable.length || 0)).toLocaleString()}
            </h3>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className="p-3 bg-accent/10 rounded-2xl">
            <TrendingUp className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Acelerando</p>
            <h3 className="text-2xl font-black text-slate-900">
              {snapshot?.trendSummary.trendingUp.length || 0}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
