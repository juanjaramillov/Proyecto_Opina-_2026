import React from 'react';
import { Target, Sparkles, User, Users2 } from 'lucide-react';
import { DemographicInsight } from '../../metrics/services/metricsService';

interface InsightCardsProps {
  insights: DemographicInsight[];
  loading: boolean;
}

export const InsightCards: React.FC<InsightCardsProps> = ({ insights, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-3xl h-48" />
        ))}
      </div>
    );
  }

  if (insights.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <h3 className="text-xl font-bold text-white">Insights de Inteligencia</h3>
        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
          Nuevo
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((insight, idx) => {
          const isGender = insight.gender !== null;
          const segmentLabel = isGender 
            ? (insight.gender === 'male' ? 'Hombres' : 'Mujeres')
            : 'Usuarios';
            
          return (
            <div 
              key={idx}
              className="group relative p-8 bg-gradient-to-br from-white to-blue-50/30 border border-blue-100 rounded-[2.5rem] overflow-hidden hover:border-blue-400 transition-all duration-500 shadow-sm hover:shadow-xl hover:scale-[1.01]"
            >
              {/* Decorative accent - more subtle for light mode */}
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                {isGender ? <User className="w-16 h-16 text-blue-600" /> : <Target className="w-16 h-16 text-emerald-600" />}
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <Users2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-black text-blue-600/60 uppercase tracking-[0.15em]">{segmentLabel}</span>
                </div>

                <p className="text-xl text-blue-950 leading-relaxed font-medium mb-8">
                  El <span className="text-blue-600 font-black text-3xl tabular-nums tracking-tight">{insight.preference_percentage}%</span> de los {segmentLabel.toLowerCase()} prefiere <span className="text-blue-900 font-black underline decoration-blue-500/30 underline-offset-8 transition-colors group-hover:decoration-blue-600">{insight.entity_name}</span> en la batalla "{insight.battle_title}".
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-100 text-[10px] font-black text-blue-600/70 uppercase tracking-widest transition-all group-hover:bg-blue-50 group-hover:border-blue-200">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Análisis Predictivo
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Real-time
                  </div>
                </div>
              </div>

              {/* Hover Glow - Very soft light glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-blue-500/5 to-emerald-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
