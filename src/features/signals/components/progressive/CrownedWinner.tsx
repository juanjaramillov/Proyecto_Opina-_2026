

type Props = {
    title?: string;
    subtitle?: string;
};

export default function CrownedWinner({ title = "Ganador coronado", subtitle }: Props) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm font-semibold text-slate-900">{title}</div>
                    {subtitle ? <div className="text-xs text-slate-500">{subtitle}</div> : null}
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                    🏆
                </div>
            </div>
        </div>
    );
}
