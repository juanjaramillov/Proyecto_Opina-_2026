import React from 'react';
import { motion } from 'framer-motion';
import { TemporalMovieRow } from '../../services/kpiService';

interface SampleQualityChip {
  nEff: number | null;
  freshnessHours: number | null;
  qualityLabel: string | null;
}

interface B2CTrendCardProps {
  movieData: TemporalMovieRow[] | null | undefined;
  title?: string;
  /**
   * Metadatos de calidad estadística para contextualizar la película
   * (n_eff + freshness + label de robustez). Opcional; si se pasa,
   * se renderiza como chip al pie de la tarjeta.
   */
  sampleQuality?: SampleQualityChip;
}

export const B2CTrendCard: React.FC<B2CTrendCardProps> = ({ movieData, title = "Tu Tendencia", sampleQuality }) => {
  if (!movieData || movieData.length === 0) return null;

  // Los datos vienen en orden inverso (del más reciente al más antiguo)
  const current = movieData[0];
  const historyAsc = [...movieData].reverse();

  // Calcular viewBox y coordenadas para la línea SVG (Sparkline)
  const width = 200;
  const height = 40;
  const minShare = Math.min(...historyAsc.map(d => d.share_pct)) * 0.9;
  const maxShare = Math.max(...historyAsc.map(d => d.share_pct)) * 1.1;
  const range = maxShare - minShare || 1;

  const points = historyAsc.map((d, i) => {
    const x = (i / (historyAsc.length - 1)) * width;
    const y = height - ((d.share_pct - minShare) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const isPositive = current.tendencia > 0;
  const primaryColor = isPositive ? '#10B981' : '#EF4444'; // Verde si sube, rojo si baja
  const bgGradient = isPositive 
    ? 'from-accent-500/10 to-transparent' 
    : 'from-danger-500/10 to-transparent';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative overflow-hidden rounded-2xl border border-white/20 bg-white/60 backdrop-blur-xl shadow-lg p-6 w-full max-w-sm`}
    >
      {/* Subtle Background Glow */}
      <div className={`absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b ${bgGradient} pointer-events-none`} />

      <div className="relative z-10">
        <header className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
          <span className="text-xs font-medium text-slate-400 bg-white/50 px-2 py-1 rounded-full border border-slate-100">
            {current.option_label}
          </span>
        </header>

        <div className="flex items-end gap-3 mb-6">
          <span className="text-4xl font-bold tracking-tight text-slate-800">
            {current.share_pct}%
          </span>
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`flex items-center text-sm font-medium ${isPositive ? 'text-accent-600' : 'text-danger-500'}`}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(current.tendencia)}%
          </motion.div>
        </div>

        {/* Sparkline Graph */}
        <div className="w-full h-10 mb-6">
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <motion.polyline
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              points={points}
              fill="none"
              stroke={primaryColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/60">
          <div>
            <p className="text-xs text-slate-500 mb-1">Aceleración</p>
            <p className="text-sm font-semibold text-slate-700">
              {current.aceleracion > 0 ? '+' : ''}{current.aceleracion}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Racha (Persistencia)</p>
            <p className="text-sm font-semibold text-slate-700">
              {current.persistencia} semanas
            </p>
          </div>
        </div>

        {/* Hallazgo Editorial (Simulado) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 bg-brand-50/50 rounded-xl p-4 border border-brand-100/50"
        >
          <div className="flex items-start gap-3">
            <span className="text-brand-500 text-lg leading-none">✨</span>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {isPositive ? "Sigue ganando terreno." : "Está perdiendo terreno."}
              {" "}Ha mantenido la dirección durante {current.persistencia || 1} día{(current.persistencia || 1) === 1 ? "" : "s"}
              {current.aceleracion !== 0
                ? `, y su tendencia se está ${current.aceleracion > 0 ? "acelerando" : "desacelerando"}.`
                : "."}
            </p>
          </div>
        </motion.div>

        {/* Calidad estadística (n_eff + freshness) */}
        {sampleQuality && (sampleQuality.nEff || sampleQuality.freshnessHours !== null) && (
          <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-500">
            {sampleQuality.nEff != null && (
              <span className="px-2 py-1 bg-slate-100 rounded-full">
                {sampleQuality.nEff} duelos efectivos
              </span>
            )}
            {sampleQuality.freshnessHours != null && (
              <span className="px-2 py-1 bg-slate-100 rounded-full">
                hace {sampleQuality.freshnessHours}h
              </span>
            )}
            {sampleQuality.qualityLabel && (
              <span className="px-2 py-1 bg-accent-100 text-accent-700 rounded-full">
                {sampleQuality.qualityLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
