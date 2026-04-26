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
    badgeColorClass = 'bg-brand/10 text-brand border-brand/30';
    iconColorClass = 'text-brand';
  } else if (levelName === 'Voz Activa') {
    badgeColorClass = 'bg-accent/10 text-accent border-accent-200';
    iconColorClass = 'text-accent';
  } else if (levelName === 'Voz Nacional') {
    badgeColorClass = 'bg-brand-50 text-brand-700 border-brand-200';
    iconColorClass = 'text-brand-500';
  } else if (levelName === 'Líder de Opinión') {
    badgeColorClass = 'bg-accent-50 text-accent-700 border-accent-200';
    iconColorClass = 'text-accent-500';
  } else if (levelName === 'Ciudadano Ilustre') {
    badgeColorClass = 'bg-gradient-to-br from-brand-50 to-accent-50 text-ink border-brand/30 shadow-sm';
    iconColorClass = 'text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent';
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
