import React from 'react';

const LiveSignalLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse"></span>
        <span className="text-xs font-bold text-slate-600">Alta Actividad</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-slate-300"></span>
        <span className="text-xs font-bold text-slate-500">Normal</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-amber-400"></span>
        <span className="text-xs font-bold text-slate-500">Tendencia</span>
      </div>
    </div>
  );
};

export default LiveSignalLegend;
