import React, { useEffect, useState } from 'react';

interface TensionRingProps {
    valueA: number; // Porcentaje de 0 a 100
    valueB: number; // Porcentaje de 0 a 100
    colorA?: string;
    colorB?: string;
    labelA: string;
    labelB: string;
    size?: number;
    strokeWidth?: number;
}

export function TensionRing({ 
    valueA, 
    valueB, 
    colorA = "#3b82f6", // tailwind blue-500
    colorB = "#10b981", // tailwind emerald-500
    labelA,
    labelB,
    size = 160,
    strokeWidth = 12
}: TensionRingProps) {
    const [animatedValueA, setAnimatedValueA] = useState(0);
    const [animatedValueB, setAnimatedValueB] = useState(0);

    useEffect(() => {
        // Trigger animation after mount
        const timeout = setTimeout(() => {
            setAnimatedValueA(valueA);
            setAnimatedValueB(valueB);
        }, 100);
        return () => clearTimeout(timeout);
    }, [valueA, valueB]);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    // Anillo Exterior (A)
    const strokeDasharrayA = `${(animatedValueA / 100) * circumference} ${circumference}`;
    
    // Anillo Interior (B)
    const innerRadius = radius - strokeWidth - 4; // Gap de 4px
    const innerCircumference = innerRadius * 2 * Math.PI;
    const strokeDasharrayB = `${(animatedValueB / 100) * innerCircumference} ${innerCircumference}`;

    return (
        <div className="relative flex flex-col items-center justify-center p-4 bg-white rounded-3xl shadow-sm border border-stroke/50 group hover:border-primary/20 transition-all">
            <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tensión</div>
            <div className="relative mt-4">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 transform drop-shadow-sm">
                    {/* Background A */}
                    <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth={strokeWidth} />
                    {/* Background B */}
                    <circle cx={size/2} cy={size/2} r={innerRadius} fill="transparent" stroke="#f1f5f9" strokeWidth={strokeWidth} />
                    
                    {/* Ring A */}
                    <circle 
                        cx={size/2} cy={size/2} r={radius} 
                        fill="transparent" 
                        stroke={colorA} 
                        strokeWidth={strokeWidth} 
                        strokeLinecap="round"
                        strokeDasharray={strokeDasharrayA}
                        className="transition-all duration-1000 ease-out"
                    />
                    
                    {/* Ring B */}
                    <circle 
                        cx={size/2} cy={size/2} r={innerRadius} 
                        fill="transparent" 
                        stroke={colorB} 
                        strokeWidth={strokeWidth} 
                        strokeLinecap="round"
                        strokeDasharray={strokeDasharrayB}
                        className="transition-all duration-1000 ease-out delay-150"
                    />
                </svg>
                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                    <span className="text-2xl font-black text-ink tracking-tighter mix-blend-multiply">
                       {Math.round(Math.abs(valueA - valueB))}%
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mt-0.5">GAP</span>
                </div>
            </div>

            <div className="flex w-full justify-between mt-6 px-2">
                <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorA }} />
                        <span className="text-xs font-bold text-ink">{labelA}</span>
                    </div>
                    <span className="text-lg font-black text-ink">{Math.round(valueA)}%</span>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-bold text-ink">{labelB}</span>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colorB }} />
                    </div>
                    <span className="text-lg font-black text-ink">{Math.round(valueB)}%</span>
                </div>
            </div>
        </div>
    );
}
