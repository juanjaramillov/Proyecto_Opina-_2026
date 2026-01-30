import { useEffect } from "react";

type Props = {
    show: boolean;
    xp: number;
    signals: number;
    onDone: () => void;
};

export default function RewardToast({ show, xp, signals, onDone }: Props) {
    useEffect(() => {
        if (!show) return;
        const t = setTimeout(onDone, 1200);
        return () => clearTimeout(t);
    }, [show, onDone]);

    if (!show) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 fade-up">
            <div className="card card-pad shadow-xl flex items-center gap-4">
                <span className="text-2xl">✨</span>
                <div className="text-sm">
                    <div className="font-semibold grad-text">Buena señal</div>
                    <div className="text-text-secondary">
                        Sumaste experiencia. La plataforma también.
                        <br />
                        <span className="text-xs opacity-75">+{xp} XP · +{signals} señal</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
