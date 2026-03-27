import { ExperienceMode, TRACKS } from "./tracks/hubSecondaryData";
import { HubTrackCardView } from "./tracks/HubTrackCard";

interface HubSecondaryTracksProps {
    setMode: (mode: ExperienceMode) => void;
}

export function HubSecondaryTracks({ setMode }: HubSecondaryTracksProps) {
    return (
        <div className="relative w-full bg-slate-50/60 pb-20">
            <div className="mx-auto w-full max-w-[1280px] px-4 pb-12 pt-8 md:px-6 md:pt-12">
                <div className="mb-5 flex flex-col justify-between gap-4 md:mb-7 md:flex-row md:items-end">
                    <div>
                        <h2 className="flex items-center gap-3 text-2xl font-black tracking-tighter md:text-3xl lg:text-4xl">
                            <div className="relative flex h-3 w-3 items-center justify-center md:h-4 md:w-4">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 md:h-2.5 md:w-2.5"></span>
                            </div>
                            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-500 bg-clip-text text-transparent">
                                Radar de Señales
                            </span>
                        </h2>
                        <p className="mt-2 text-sm font-medium text-slate-500 md:text-base">
                            Explora otras dinámicas activas en la comunidad.
                        </p>
                    </div>

                    <div className="self-start rounded-full border border-slate-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur md:self-auto">
                        <div className="flex items-center gap-2 text-slate-500">
                            <span className="text-[10px] font-bold uppercase tracking-[0.22em] md:text-[11px]">Desliza</span>
                            <span className="material-symbols-outlined text-[18px]">trending_flat</span>
                        </div>
                    </div>
                </div>

                <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 pt-3 hide-scrollbar md:-mx-6 md:px-6">
                    {TRACKS.map((card) => (
                        <HubTrackCardView key={card.key} card={card} setMode={setMode} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HubSecondaryTracks;
