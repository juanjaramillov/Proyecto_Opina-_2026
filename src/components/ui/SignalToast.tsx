import { useEffect } from "react";

type Props = {
    message: string;
    points: number;
    onClose: () => void;
};

export default function SignalToast({ message, points, onClose }: Props) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
            <div className="bg-ink text-white px-6 py-3 rounded-full shadow-premium flex items-center gap-3 border border-white/10">
                <span className="text-xl">✅</span>
                <div className="flex flex-col">
                    <span className="font-bold text-sm">{message}</span>
                    {points > 0 && (
                        <span className="text-xs text-primary font-bold">+{points} pts</span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="ml-2 text-white/50 hover:text-white"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
