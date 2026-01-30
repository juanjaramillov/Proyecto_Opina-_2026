import { ActiveBattle } from '../../../services/signalService';
import BattleCard from './BattleCard';

type TrendGridProps = {
    battles: ActiveBattle[];
    loading: boolean;
    onBattleClick: (battle: ActiveBattle) => void;
};

export default function TrendGrid({ battles, loading, onBattleClick }: TrendGridProps) {
    if (loading) {
        return <div className="col-span-12 text-center text-gray-400 py-10 font-bold">Cargando señales activas...</div>;
    }

    if (battles.length === 0) {
        return <div className="col-span-12 text-center text-gray-400 py-10 font-bold">No hay batallas activas.</div>;
    }

    return (
        <div className="grid grid-cols-12 gap-4">
            {battles.map((b, i) => (
                <BattleCard
                    key={b.id}
                    battle={b}
                    onClick={onBattleClick}
                    span={i < 2 ? 6 : 3}
                />
            ))}
        </div>
    );
}
