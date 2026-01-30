import React from 'react';
import { ResultsData } from './types';

interface ResultsTableProps {
    data: ResultsData;
    onCopy: () => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ data, onCopy }) => {
    return (
        <div className="rounded-r2 border border-stroke bg-card-gradient shadow-home-2 p-3.5 relative overflow-hidden mt-3">
            <div className="absolute inset-[-1px] pointer-events-none opacity-90 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(560px_260px_at_18%_10%,rgba(20,184,166,.14),transparent_55%)]"></div>
            </div>

            <div className="relative z-10 flex justify-between gap-2.5 flex-wrap items-end">
                <div>
                    <div className="font-black text-[15px] tracking-tight text-ink">Top señales</div>
                    <div className="text-muted font-semibold text-xs mt-1.5">Resumen para lectura rápida (accionable).</div>
                </div>
                <button
                    className="border border-white/14 bg-white/5 text-ink rounded-xl px-3 py-2.5 font-extrabold text-[13px] cursor-pointer transition hover:-translate-y-px hover:bg-white/8"
                    type="button"
                    onClick={onCopy}
                >
                    Copiar tabla
                </button>
            </div>

            <div className="relative z-10 mt-2.5 overflow-auto">
                <table className="w-full border-separate border-spacing-y-2.5">
                    <thead>
                        <tr>
                            <th className="text-left text-muted2 text-xs font-extrabold px-2.5">Tema</th>
                            <th className="text-left text-muted2 text-xs font-extrabold px-2.5">Segmento</th>
                            <th className="text-left text-muted2 text-xs font-extrabold px-2.5">Índice</th>
                            <th className="text-left text-muted2 text-xs font-extrabold px-2.5">Δ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((r, i) => {
                            const cls = r.delta > 0.2 ? "text-[rgba(92,255,176,.95)] font-black" : r.delta < -0.2 ? "text-[rgba(255,107,107,.95)] font-black" : "text-[rgba(255,204,102,.95)] font-black";
                            const sign = r.delta > 0 ? "+" : "";
                            return (
                                <tr key={i}>
                                    <td className="p-3 bg-bg2/45 border-t border-b border-white/10 text-ink font-semibold text-[13px] first:border-l first:rounded-l-2xl">{r.topic}</td>
                                    <td className="p-3 bg-bg2/45 border-t border-b border-white/10 text-muted font-semibold text-[13px]">{r.seg}</td>
                                    <td className="p-3 bg-bg2/45 border-t border-b border-white/10 text-ink font-semibold text-[13px]">{r.idx}</td>
                                    <td className={`p-3 bg-bg2/45 border-t border-b border-white/10 text-[13px] last:border-r last:rounded-r-2xl text-right whitespace-nowrap ${cls}`}>{sign}{r.delta}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResultsTable;
