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
          <div key={i} className="animate-pulse bg-slate-100 border border-stroke rounded-2xl h-48" />
        ))}
      </div>
    );
  }

  if (insights.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((insight, idx) => {
          const isGender = insight.gender !== null;
          const segmentLabel = isGender 
            ? (insight.gender === 'male' ? 'Hombres' : 'Mujeres')
            : 'Usuarios';
            
          return (
            <div 
              key={idx}
              className="group relative p-6 bg-white border border-stroke rounded-2xl overflow-hidden hover:border-primary/50 transition-colors duration-500 shadow-sm hover:shadow-md"
            >
              {/* Decorative accent - watermark */}
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] group-hover:scale-110 transition-all duration-500 transform origin-top-right">
                {isGender ? <User className="w-24 h-24 text-primary" /> : <Target className="w-24 h-24 text-secondary" />}
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-surface2 flex items-center justify-center border border-stroke shadow-sm">
                    <Users2 className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{segmentLabel}</span>
                </div>

                <p className="text-xl text-ink leading-snug font-medium mb-8">
                  El <span className="text-primary font-black text-3xl tabular-nums tracking-tighter">{insight.preference_percentage}%</span> de {segmentLabel.toLowerCase()} prefiere <span className="text-ink font-black border-b-[3px] border-primary/30 pb-0.5 group-hover:border-primary transition-colors">{insight.entity_name}</span> en "{insight.battle_title}".
                </p>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-4 border-t border-stroke">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface2 border border-stroke text-[9px] font-black text-text-secondary uppercase tracking-widest transition-colors group-hover:bg-primary/5 group-hover:border-primary/20 group-hover:text-primary">
                    <Sparkles className="w-3 h-3" />
                    Predictivo
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-black text-text-muted uppercase tracking-widest ml-auto">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    En vivo
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
