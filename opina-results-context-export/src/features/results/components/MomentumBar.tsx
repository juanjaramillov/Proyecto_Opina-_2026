import { useEffect, useState } from 'react';

interface MomentumBarProps {
    entityAName: string;
    entityBName: string;
    scoreA: number; // Porcentaje 0-100
    scoreB: number; // Porcentaje 0-100
    trendA?: 'up' | 'down' | 'neutral';
    trendB?: 'up' | 'down' | 'neutral';
}

export function MomentumBar({ 
    entityAName, 
    entityBName, 
    scoreA, 
    scoreB,
    trendA = 'neutral',
    trendB = 'neutral'
}: MomentumBarProps) {
    const [animatedScore, setAnimatedScore] = useState(50); // Empieza en el medio

    useEffect(() => {
        const timeout = setTimeout(() => {
            // Normalizando en caso de que no sumen 100
            const total = scoreA + scoreB;
            const normalizedA = total === 0 ? 50 : (scoreA / total) * 100;
            setAnimatedScore(normalizedA);
        }, 100);
        return () => clearTimeout(timeout);
    }, [scoreA, scoreB]);

    return (
        <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-stroke/40 group hover:shadow-md transition-all">
            <div className="flex justify-between items-end mb-2 px-1">
                <div className="flex flex-col">
                    <span className="text-sm font-black text-ink flex items-center gap-1.5">
                        {entityAName}
                        {trendA === 'up' && <span className="material-symbols-outlined text-[14px] text-emerald-500">trending_up</span>}
                        {trendA === 'down' && <span className="material-symbols-outlined text-[14px] text-rose-500">trending_down</span>}
                    </span>
                    <span className="text-xl font-black tracking-tighter text-blue-600">{Math.round(scoreA)}%</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-ink flex items-center gap-1.5">
                        {trendB === 'down' && <span className="material-symbols-outlined text-[14px] text-rose-500">trending_down</span>}
                        {trendB === 'up' && <span className="material-symbols-outlined text-[14px] text-emerald-500">trending_up</span>}
                        {entityBName}
                    </span>
                    <span className="text-xl font-black tracking-tighter text-emerald-600">{Math.round(scoreB)}%</span>
                </div>
            </div>
            
            <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                    style={{ width: `${animatedScore}%` }}
                />
                <div 
                    className="h-full bg-gradient-to-l from-emerald-500 to-emerald-400 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
                    style={{ width: `${100 - animatedScore}%` }}
                />
                {/* Separador Central */}
                <div className="absolute top-0 bottom-0 w-1 bg-white left-1/2 -translate-x-1/2 rounded-full z-10 opacity-80 shadow-sm" />
            </div>
        </div>
    );
}
