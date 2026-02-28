

type Props = {
    title?: string;
    subtitle?: string;
    imageUrl?: string;
};

export default function ChampionLane({ title = "Campeón", subtitle, imageUrl }: Props) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    {imageUrl ? (
                        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">★</div>
                    )}
                </div>

                <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900">{title}</div>
                    {subtitle ? <div className="text-xs text-gray-500">{subtitle}</div> : null}
                </div>
            </div>
        </div>
    );
}
