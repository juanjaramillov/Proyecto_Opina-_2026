import React from 'react';
import { Activity, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { ResultsKPIs } from '../../metrics/services/metricsService';

interface ResultKPIsProps {
  kpis: ResultsKPIs;
  loading: boolean;
}

export const ResultKPIs: React.FC<ResultKPIsProps> = ({ kpis, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-white/5 border border-white/10 rounded-2xl h-32" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Señales Totales',
      value: kpis.total_signals.toLocaleString(),
      icon: <Activity className="w-5 h-5 text-blue-600" />,
      color: 'from-blue-50 to-indigo-50/10',
      border: 'border-blue-100',
      textColor: 'text-blue-950',
      labelColor: 'text-blue-600/60'
    },
    {
      label: 'Usuarios Activos (24h)',
      value: kpis.active_users_24h.toLocaleString(),
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      color: 'from-emerald-50 to-teal-50/10',
      border: 'border-emerald-100',
      textColor: 'text-emerald-950',
      labelColor: 'text-emerald-600/60'
    },
    {
      label: 'Segmento Líder',
      value: kpis.top_segment,
      icon: <TrendingUp className="w-5 h-5 text-sky-600" />,
      color: 'from-sky-50 to-blue-50/10',
      border: 'border-sky-100',
      textColor: 'text-sky-950',
      labelColor: 'text-sky-600/60'
    },
    {
      label: 'Crecimiento Semanal',
      value: `${kpis.growth_percentage > 0 ? '+' : ''}${kpis.growth_percentage}%`,
      icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
      color: 'from-emerald-50/30 to-blue-50/30',
      border: 'border-blue-100',
      textColor: 'text-blue-900',
      labelColor: 'text-blue-600/60'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className={`relative overflow-hidden p-6 bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl shadow-sm transition-all hover:shadow-md hover:scale-[1.02] duration-300`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${card.labelColor}`}>{card.label}</span>
            <div className="p-2 bg-white/50 rounded-lg border border-white">
              {card.icon}
            </div>
          </div>
          <div className={`text-2xl font-black tracking-tight ${card.textColor}`}>
            {card.value}
          </div>
          
          {/* Subtle background glow */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/20 blur-2xl rounded-full" />
        </div>
      ))}
    </div>
  );
};
