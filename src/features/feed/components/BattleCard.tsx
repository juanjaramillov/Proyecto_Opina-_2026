import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface BattleCardProps {
  optionA: string;
  optionB: string;
  votesA: number;
  votesB: number;
  title: string;
  category?: string;
  winnerLabel?: string;
  onVote?: (option: 'A' | 'B') => void;
  hasParticipated?: boolean;
}

const BattleCard: React.FC<BattleCardProps> = ({
  optionA,
  optionB,
  votesA,
  votesB,
  title,
  category,
  winnerLabel,
  hasParticipated = false,
}) => {
  const total = votesA + votesB;
  const percentA = total > 0 ? Math.round((votesA / total) * 100) : 50;
  const percentB = 100 - percentA;

  return (
    <div className="w-full max-w-sm text-center text-white relative flex flex-col items-center">
      <div className="mb-6 w-full">
        <div className="flex items-center justify-between w-full mb-4">
          {category ? (
            <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-bold uppercase tracking-wider">
              {category}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              Resultado Final
            </div>
          )}

          <div className="text-xs font-bold text-white/50 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">groups</span>
            {total.toLocaleString()} votos
          </div>
        </div>

        <h2 className="text-2xl font-black tracking-tight leading-tight">{title}</h2>

        {winnerLabel && (
          <p className="mt-2 text-rose-400 font-bold text-lg animate-pulse">
            Ganador: {winnerLabel}
          </p>
        )}
      </div>

      <div className="relative h-72 w-full flex rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl mb-6">
        <div className="relative flex-1 h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-600/80 to-blue-900/80 backdrop-blur-sm">
          <div
            className="absolute inset-0 bg-blue-500/10"
            style={{ height: `${percentA}%`, bottom: 0, top: 'auto', background: 'rgba(255,255,255,0.1)' }}
          />
          <span className="text-4xl mb-2">🔵</span>
          <span className="text-lg font-bold opacity-80">{optionA}</span>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mt-2 text-4xl font-black"
          >
            {percentA}%
          </motion.div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white text-slate-900 rounded-full w-10 h-10 flex items-center justify-center font-black border-4 border-slate-900 shadow-xl text-xs">
          VS
        </div>

        <div className="relative flex-1 h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-red-600/80 to-red-900/80 backdrop-blur-sm">
          <div className="absolute inset-0 bg-white/10" style={{ height: `${percentB}%`, bottom: 0, top: 'auto' }} />
          <span className="text-4xl mb-2">🔴</span>
          <span className="text-lg font-bold opacity-80">{optionB}</span>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="mt-2 text-4xl font-black"
          >
            {percentB}%
          </motion.div>
        </div>
      </div>

      {hasParticipated ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20"
        >
          <span className="material-symbols-outlined text-emerald-400 text-lg">verified</span>
          <span className="text-sm font-bold text-emerald-100">Ya participaste en este versus</span>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="text-xs text-white/60 mb-2 font-medium">¿Aún no participas? Tu opinión nos falta.</div>
          <Link
            to="/senales/versus"
            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-white text-slate-900 rounded-xl font-black tracking-tight shadow-lg hover:bg-slate-100 transition-colors uppercase text-sm"
          >
            Participar Ahora <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default BattleCard;
