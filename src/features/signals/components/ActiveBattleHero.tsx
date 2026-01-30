// ActiveBattle type not used here yet (visual component only)

type ActiveBattleHeroProps = {
    onOpenVersus: () => void;
    onOpenPro: () => void;
};

export default function ActiveBattleHero({ onOpenVersus, onOpenPro }: ActiveBattleHeroProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <button onClick={onOpenVersus} className="group relative h-40 rounded-3xl overflow-hidden border border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all text-left">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white opacity-50" />
                <div className="relative z-10 p-8 flex flex-col justify-center h-full">
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">🔥 Versus</h3>
                    <p className="text-gray-500 font-medium mt-1">Comparaciones directas.</p>
                </div>
            </button>
            <button onClick={onOpenPro} className="group relative h-40 rounded-3xl overflow-hidden border border-gray-100 hover:border-yellow-500 hover:shadow-xl transition-all text-left">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-white opacity-50" />
                <div className="relative z-10 p-8 flex flex-col justify-center h-full">
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-yellow-600 transition-colors">👑 Versus Progresivo</h3>
                    <p className="text-gray-500 font-medium mt-1">El que va ganando sigue.</p>
                </div>
            </button>
        </div>
    );
}
