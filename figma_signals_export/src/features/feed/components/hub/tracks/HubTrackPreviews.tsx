import { toneClasses, TrackCard } from "./hubSecondaryData";

export function TorneoPreview({ tone }: { tone: ReturnType<typeof toneClasses> }) {
    return (
        <div className={`relative rounded-[26px] border ${tone.previewRing} bg-gradient-to-b ${tone.previewBg} p-4 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] transition-all duration-500 group-hover:-translate-y-1.5`}>
            <div className={`absolute inset-x-6 top-0 h-10 rounded-b-[24px] ${tone.softBlob} blur-2xl opacity-70`} />
            <div className="relative flex items-center justify-between gap-4">
                <div className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-[conic-gradient(from_120deg,#60a5fa,#22d3ee,#f59e0b,#60a5fa)] opacity-80" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-700">Marca A</span>
                </div>

                <div className="flex w-24 flex-col items-center gap-2 pt-1">
                    <span className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">vs</span>
                    <div className={`h-2.5 w-full rounded-full ${tone.previewLineSoft} overflow-hidden`}>
                        <div className={`h-full w-[62%] rounded-full ${tone.previewLine}`} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${tone.accentText}`}>Final viva</span>
                </div>

                <div className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-[conic-gradient(from_40deg,#f472b6,#f59e0b,#38bdf8,#f472b6)] opacity-80" />
                    </div>
                    <span className="text-[12px] font-bold text-slate-700">Marca B</span>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-sm">
                <span className="text-[11px] font-semibold text-slate-500">Siguiente fase</span>
                <span className={`text-[11px] font-bold ${tone.accentText}`}>Llave 2</span>
            </div>
        </div>
    );
}

export function ActualidadPreview({ tone }: { tone: ReturnType<typeof toneClasses> }) {
    return (
        <div className={`relative rounded-[26px] border ${tone.previewRing} bg-gradient-to-b ${tone.previewBg} p-4 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] transition-all duration-500 group-hover:-translate-y-1.5`}>
            <div className={`absolute inset-x-6 bottom-2 h-8 rounded-full ${tone.softBlob} blur-2xl opacity-60`} />
            <div className="relative space-y-3">
                {[
                    ["Crisis dólar", "53%"],
                    ["Baja tasas", "47%"],
                ].map(([label, value], idx) => (
                    <div key={label} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3">
                            <span className="text-[12px] font-bold text-slate-700">{label}</span>
                            <span className={`text-[12px] font-black ${tone.accentText}`}>{value}</span>
                        </div>
                        <div className={`h-2.5 rounded-full ${tone.previewLineSoft} overflow-hidden`}>
                            <div
                                className={`h-full rounded-full ${tone.previewLine}`}
                                style={{ width: idx === 0 ? "53%" : "47%" }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-sm">
                <span className={`h-2 w-2 rounded-full ${tone.accentSoft} animate-pulse`} />
                <span className="text-[11px] font-semibold text-slate-600">La conversación cambia minuto a minuto</span>
            </div>
        </div>
    );
}

export function LugaresPreview({ tone }: { tone: ReturnType<typeof toneClasses> }) {
    return (
        <div className={`relative rounded-[26px] border ${tone.previewRing} bg-gradient-to-b ${tone.previewBg} p-4 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] transition-all duration-500 group-hover:-translate-y-1.5`}>
            <div className={`absolute inset-x-6 bottom-2 h-8 rounded-full ${tone.softBlob} blur-2xl opacity-60`} />
            <div className="relative space-y-3">
                {[
                    ["Café Central", "8.6"],
                    ["Tienda Moderna", "6.9"],
                ].map(([name, score], idx) => (
                    <div key={name} className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/90 px-3 py-2 shadow-sm">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
                                <span className={`material-symbols-outlined text-[18px] ${tone.accentText}`}>
                                    {idx === 0 ? "local_cafe" : "storefront"}
                                </span>
                            </div>
                            <div className="min-w-0">
                                <div className="truncate text-[12px] font-bold text-slate-700">{name}</div>
                                <div className="text-[10px] text-slate-500">{idx === 0 ? "237 reseñas" : "149 reseñas"}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-[18px] font-black leading-none ${tone.accentText}`}>{score}</div>
                            <div className="text-[10px] text-slate-400">/10</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ProfundidadPreview({ tone }: { tone: ReturnType<typeof toneClasses> }) {
    return (
        <div className={`relative rounded-[26px] border ${tone.previewRing} bg-gradient-to-b ${tone.previewBg} p-4 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] transition-all duration-500 group-hover:-translate-y-1.5`}>
            <div className={`absolute inset-x-6 bottom-2 h-8 rounded-full ${tone.softBlob} blur-2xl opacity-60`} />
            <div className="relative">
                <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-bold text-slate-700">¿Qué tan recomendable te parece?</span>
                    <span className={`text-[12px] font-black ${tone.accentText}`}>9.1</span>
                </div>

                <div className="mt-3 flex items-center gap-1">
                    {Array.from({ length: 10 }).map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-8 flex-1 rounded-xl border ${
                                idx < 9 ? `${tone.previewLineSoft} border-transparent` : "bg-white border-slate-200"
                            }`}
                        />
                    ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {["Confianza", "Valor", "Experiencia"].map((chip) => (
                        <span
                            key={chip}
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${tone.badge}`}
                        >
                            {chip}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function LockedPreview({ tone }: { tone: ReturnType<typeof toneClasses> }) {
    return (
        <div className={`relative rounded-[26px] border ${tone.previewRing} bg-gradient-to-b ${tone.previewBg} p-4 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.22)]`}>
            <div className={`absolute inset-x-6 bottom-2 h-8 rounded-full ${tone.softBlob} blur-2xl opacity-50`} />
            <div className="relative flex h-[124px] flex-col items-center justify-center gap-2 rounded-[22px] border border-dashed border-slate-200 bg-white/85">
                <span className={`material-symbols-outlined text-[34px] ${tone.accentText}`}>lock</span>
                <div className="text-center">
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Disponible más adelante</div>
                    <div className="mt-1 text-[12px] text-slate-500">Se activará por etapa</div>
                </div>
            </div>
        </div>
    );
}

export function PreviewByType({ preview, tone }: { preview: TrackCard["preview"]; tone: ReturnType<typeof toneClasses> }) {
    switch (preview) {
        case "torneo":
            return <TorneoPreview tone={tone} />;
        case "actualidad":
            return <ActualidadPreview tone={tone} />;
        case "lugares":
            return <LugaresPreview tone={tone} />;
        case "profundidad":
            return <ProfundidadPreview tone={tone} />;
        default:
            return <LockedPreview tone={tone} />;
    }
}
