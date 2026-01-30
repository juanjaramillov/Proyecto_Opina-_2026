import React from 'react';
import { ResultsData } from './types';

interface ResultsKPIsProps {
    data: ResultsData;
}

const ResultsKPIs: React.FC<ResultsKPIsProps> = ({ data }) => {
    const fmtNum = (n: number) => Number(n).toLocaleString("es-CL");

    const getQualityBadge = (consensus: number) => {
        if (consensus >= 75) return <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-ok/25 bg-white/5 font-extrabold text-xs text-ok/95 mt-2.5">● Calidad: Alta</div>;
        if (consensus >= 62) return <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-warn/25 bg-white/5 font-extrabold text-xs text-warn/95 mt-2.5">● Calidad: Media</div>;
        return <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-danger/25 bg-white/5 font-extrabold text-xs text-danger/95 mt-2.5">● Calidad: Baja</div>;
    };

    const getVolatilityBadge = (shift: number) => {
        const a = Math.abs(shift);
        if (a < 1.0) return <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-ok/25 bg-white/5 font-extrabold text-xs text-ok/95 mt-2.5">● Volatilidad: Baja</div>;
        if (a < 2.5) return <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-warn/25 bg-white/5 font-extrabold text-xs text-warn/95 mt-2.5">● Volatilidad: Media</div>;
        return <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-danger/25 bg-white/5 font-extrabold text-xs text-danger/95 mt-2.5">● Volatilidad: Alta</div>;
    };

    const getAlertBadge = (shift: number) => {
        const a = Math.abs(shift);
        if (a >= 3.0) return <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-danger/25 bg-white/5 font-extrabold text-xs text-danger/95 mt-2.5">● Alerta: Quiebre</div>;
        return <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-white/14 bg-white/5 font-extrabold text-xs text-muted mt-2.5">● Sin alerta</div>;
    };

    return (
        <div className="rounded-r2 border border-stroke bg-card-gradient shadow-home-2 p-3.5 relative overflow-hidden mt-3">
            <div className="absolute inset-[-1px] pointer-events-none opacity-90 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(560px_260px_at_18%_10%,rgba(20,184,166,.14),transparent_55%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(520px_240px_at_88%_15%,rgba(124,255,234,.10),transparent_58%)]"></div>
            </div>
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <div className="rounded-2xl border border-white/12 bg-white/5 p-3">
                    <div className="font-black text-xl tracking-tight text-ink">{fmtNum(data.responses)}</div>
                    <div className="mt-1 text-muted2 text-xs font-semibold">Respuestas en ventana</div>
                    {getQualityBadge(data.consensus)}
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/5 p-3">
                    <div className="font-black text-xl tracking-tight text-ink">{data.consensus}%</div>
                    <div className="mt-1 text-muted2 text-xs font-semibold">Consenso estimado</div>
                    {getVolatilityBadge(data.shift)}
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/5 p-3">
                    <div className="font-black text-xl tracking-tight text-ink">{data.shift > 0 ? "+" : ""}{data.shift} pts</div>
                    <div className="mt-1 text-muted2 text-xs font-semibold">Cambio de tendencia</div>
                    {getAlertBadge(data.shift)}
                </div>
            </div>
        </div>
    );
};

export default ResultsKPIs;
