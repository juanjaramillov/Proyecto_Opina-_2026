import { useLoyalty } from '../hooks/useLoyalty';
import { Shield } from 'lucide-react';

export function UserLevelBadge({ hideSignalCount = false }: { hideSignalCount?: boolean }) {
  const { stats, isLoading } = useLoyalty();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 animate-pulse bg-slate-800 rounded-full px-3 py-1">
        <div className="w-4 h-4 rounded-full bg-slate-700"></div>
        <div className="w-16 h-4 rounded bg-slate-700"></div>
      </div>
    );
  }

  // If no stats, assume new user or observing
  const levelName = stats?.loyalty_levels?.level_name || 'Observador';
  const signalsCount = stats?.total_historical_signals || 0;

  // Options: Observador, Participante, Voz Activa, Voz Nacional, Líder de Opinión, Ciudadano Ilustre
  let badgeColorClass = 'bg-slate-50 text-slate-700 border-slate-200'; // Default
  let iconColorClass = 'text-slate-500';

  if (levelName === 'Participante') {
    badgeColorClass = 'bg-primary-50 text-primary-700 border-primary-200';
    iconColorClass = 'text-primary-500';
  } else if (levelName === 'Voz Activa') {
    badgeColorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    iconColorClass = 'text-emerald-500';
  } else if (levelName === 'Voz Nacional') {
    badgeColorClass = 'bg-purple-50 text-purple-700 border-purple-200';
    iconColorClass = 'text-purple-500';
  } else if (levelName === 'Líder de Opinión') {
    badgeColorClass = 'bg-orange-50 text-orange-700 border-orange-200';
    iconColorClass = 'text-orange-500';
  } else if (levelName === 'Ciudadano Ilustre') {
    badgeColorClass = 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border-amber-300 shadow-sm';
    iconColorClass = 'text-amber-500';
  }

  return (
    <div className={`flex flex-col items-start gap-1`}>
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${badgeColorClass}`}>
        <Shield className={`w-3 h-3 ${iconColorClass}`} />
        {levelName}
      </div>
      {!hideSignalCount && (
        <span className="text-[10px] text-slate-500 pl-2 font-mono">
          {signalsCount.toLocaleString()} Señales
        </span>
      )}
    </div>
  );
}
