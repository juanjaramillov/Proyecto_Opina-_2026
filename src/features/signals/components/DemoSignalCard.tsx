import { DemoDuel, demoCategories } from '../utils/demoData';

type DemoSignalCardProps = {
    signal: DemoDuel;
    onClick: (signal: DemoDuel) => void;
    span?: number;
    highlight?: boolean;
};

export default function DemoSignalCard({ signal, onClick, span = 12, highlight = false }: DemoSignalCardProps) {
    const duel = signal;
    const cat = demoCategories.find(c => c.slug === duel.categorySlug);

    return (
        <div
            onClick={() => onClick(duel)}
            className={`
                group relative bg-white rounded-3xl overflow-hidden border transition-all cursor-pointer flex flex-col justify-between
                ${highlight ? 'shadow-xl border-gray-900 ring-1 ring-gray-900' : 'shadow-sm border-gray-200 hover:shadow-md hover:border-gray-300'}
            `}
            style={{ gridColumn: `span ${span}` }}
        >
            {/* Header: Category */}
            <div className="absolute top-4 left-4 z-10">
                <div className="bg-white/90 backdrop-blur-sm border border-gray-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 shadow-sm flex items-center gap-2">
                    <span>{cat?.emoji}</span> {cat?.name}
                </div>
            </div>

            {/* Duel Visual */}
            <div className="h-40 bg-gray-50/50 flex items-center justify-center relative">
                {/* VS Badge */}
                <div className="absolute z-10 bg-black text-white text-[10px] font-black p-2 rounded-full border-4 border-white">VS</div>

                {/* SIDES */}
                <div className="w-1/2 h-full flex items-center justify-center bg-blue-50/30 group-hover:bg-blue-50 transition-colors">
                    <div className="text-5xl drop-shadow-sm transform group-hover:-translate-x-2 transition-transform duration-300">{duel.brandA.emoji}</div>
                </div>
                <div className="w-1/2 h-full flex items-center justify-center bg-red-50/30 group-hover:bg-red-50 transition-colors">
                    <div className="text-5xl drop-shadow-sm transform group-hover:translate-x-2 transition-transform duration-300">{duel.brandB.emoji}</div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">
                    {duel.brandA.name} <span className="text-gray-400 font-normal">vs</span> {duel.brandB.name}
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    {duel.stats.totalVotes.toLocaleString()} Votos
                </p>

                {/* Result Bar (Simulated) */}
                <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
                    <div
                        className="h-full bg-blue-500 transition-all duration-1000"
                        style={{ width: `${duel.stats.percentA}%` }}
                    />
                    <div
                        className="h-full bg-red-500 transition-all duration-1000"
                        style={{ width: `${100 - duel.stats.percentA}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
