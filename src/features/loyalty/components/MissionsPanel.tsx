import { useLoyalty } from '../hooks/useLoyalty';
import { CheckCircle2, Target, CalendarDays, Zap, TrendingUp } from 'lucide-react';

export function MissionsPanel() {
  const { missions, isLoading } = useLoyalty();

  if (isLoading) {
    return <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 animate-pulse h-64"></div>;
  }

  if (!missions || missions.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400">
        No hay misiones activas en este momento.
      </div>
    );
  }

  // Helper to choose an icon based on mission type
  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'versus': return <Zap className="w-5 h-5 text-brand-400" />;
      case 'torneo': return <Target className="w-5 h-5 text-danger-400" />;
      case 'actualidad': return <TrendingUp className="w-5 h-5 text-brand-400" />;
      case 'active_days': return <CalendarDays className="w-5 h-5 text-accent-400" />;
      default: return <Target className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="p-5 border-b border-slate-800 bg-slate-900/50">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          Misiones de la Semana
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          Completa las 4 misiones cada semana durante un mes para ganar $5.000 CLP.
        </p>
      </div>
      
      <div className="p-5 space-y-6">
        {missions.map((mission) => {
          const progressPercentage = Math.min(100, Math.round((mission.current_count / mission.target_count) * 100));
          const isCompleted = mission.is_completed;

          return (
            <div key={mission.id} className="relative">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-slate-800 p-2 rounded-lg">
                    {getMissionIcon(mission.mission_type)}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${isCompleted ? 'text-accent-400' : 'text-slate-200'}`}>
                      {mission.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{mission.description}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-sm font-bold text-slate-300">
                    {mission.current_count} / {mission.target_count}
                  </span>
                  {isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-accent-500 mt-1" />
                  )}
                </div>
              </div>
              
              {/* Custom simple progress bar if no shadcn ui progress */}
              <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${isCompleted ? 'bg-accent-500' : 'bg-brand-500'}`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
