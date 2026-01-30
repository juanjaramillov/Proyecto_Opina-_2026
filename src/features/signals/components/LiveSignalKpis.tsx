import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  windowFilter: '24h' | '7d' | '30d';
  segmentFilter: 'all' | 'rm' | 'valpo' | 'biobio';
  isUser: boolean;
  fmtCL: (n: number) => string;
  data: {
    totalVotes: number;
    youVotes: number | null;
    signals: number;
    vol: number;
  };
};

const LiveSignalKpis: React.FC<Props> = ({ windowFilter, segmentFilter, isUser, fmtCL, data }) => {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

      {/* KPI Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-xs font-bold text-slate-500 mb-1">Respuestas (Total)</div>
        <div className="text-3xl font-black text-slate-900">{fmtCL(data.totalVotes)}</div>
        <div className="text-xs font-medium text-slate-400 mt-2">
          {windowFilter === '24h' ? 'últimas 24h' : windowFilter === '7d' ? 'últimos 7 días' : 'últimos 30 días'} ·{' '}
          {segmentFilter === 'all' ? 'Total Chile' : segmentFilter === 'rm' ? 'RM' : segmentFilter === 'valpo' ? 'Valparaíso' : 'Biobío'}
        </div>
      </div>

      {/* KPI Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-xs font-bold text-slate-500 mb-1">Tus respuestas</div>
        <div className="text-3xl font-black text-emerald-600">
          {isUser ? fmtCL(data.youVotes ?? 0) : '—'}
        </div>
        <div className="mt-2 text-xs font-bold">
          {isUser ? (
            <Link to="/mi-senal" className="text-emerald-600 hover:underline">
              Conectado
            </Link>
          ) : (
            <Link to="/verificacion" className="text-slate-900 bg-slate-100 px-2 py-1 rounded hover:bg-slate-200 transition-colors">
              Conéctate para ver “Tú”
            </Link>
          )}
        </div>
      </div>

      {/* KPI Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-xs font-bold text-slate-500 mb-1">Señales activas</div>
        <div className="text-3xl font-black text-slate-900">{fmtCL(data.signals)}</div>
        <div className="text-xs font-medium text-slate-400 mt-2">cambios detectados</div>
      </div>

      {/* KPI Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-xs font-bold text-slate-500 mb-1">Volatilidad</div>
        <div className="text-3xl font-black text-slate-900">{data.vol}</div>
        <div className="text-xs font-medium text-slate-400 mt-2">Índice 0–100</div>
      </div>
    </div>
  );
};

export default LiveSignalKpis;
