import { ActiveBattle } from '../../../services/signalService';

type BattleCardProps = {
    battle: ActiveBattle;
    onClick: (battle: ActiveBattle) => void;
    span?: number;
    highlight?: boolean;
};

export default function BattleCard({ battle, onClick, span = 12, highlight = false }: BattleCardProps) {
    const brandA = battle.options[0];
    const brandB = battle.options[1];

    if (!brandA || !brandB) return null; // Should have at least 2 options

    return (
        <div
            onClick={() => onClick(battle)}
            className={`
                group relative bg-white rounded-3xl overflow-hidden border transition-all cursor-pointer flex flex-col justify-between
                ${highlight ? 'shadow-xl border-gray-900 ring-1 ring-gray-900' : 'shadow-sm border-gray-200 hover:shadow-md hover:border-gray-300'}
            `}
            style={{ gridColumn: `span ${span}` }}
        >
            {/* Header: Category */}
            <div className="absolute top-4 left-4 z-10">
                <div className="bg-white/90 backdrop-blur-sm border border-gray-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 shadow-sm flex items-center gap-2">
                    <span>{battle.category?.emoji || '📊'}</span> {battle.category?.name || 'General'}
                </div>
            </div>

            {/* Duel Visual */}
            <div className="h-40 bg-gray-50/50 flex items-center justify-center relative">
                {/* VS Badge */}
                <div className="absolute z-10 bg-black text-white text-[10px] font-black p-2 rounded-full border-4 border-white">VS</div>

                {/* SIDES */}
                <div className="w-1/2 h-full flex items-center justify-center bg-blue-50/30 group-hover:bg-blue-50 transition-colors bg-cover bg-center"
                    style={brandA.image_url ? { backgroundImage: `url(${brandA.image_url})` } : {}}
                >
                    {!brandA.image_url && <div className="text-5xl drop-shadow-sm transform group-hover:-translate-x-2 transition-transform duration-300">🔸</div>}
                </div>
                <div className="w-1/2 h-full flex items-center justify-center bg-red-50/30 group-hover:bg-red-50 transition-colors bg-cover bg-center"
                    style={brandB.image_url ? { backgroundImage: `url(${brandB.image_url})` } : {}}
                >
                    {!brandB.image_url && <div className="text-5xl drop-shadow-sm transform group-hover:translate-x-2 transition-transform duration-300">🔹</div>}
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">
                    {brandA.label} <span className="text-gray-400 font-normal">vs</span> {brandB.label}
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                    {/* Mock stats for now until we join with counts */}
                    Tendencia Activa
                </p>

                {/* Result Bar (Simulated or hidden if no stats) */}
                <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-blue-500 w-1/2 opacity-50"></div>
                </div>
            </div>
        </div>
    );
}
