type Props = {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    emoji?: string;
};

export default function EmptyState({
    title = "Nada por aquí… todavía",
    description = "Cuando alguien opine, esto se va a mover. Spoiler: podrías ser tú.",
    actionLabel = "Opinar ahora",
    onAction,
    emoji = "🫥",
}: Props) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stroke bg-surface p-10 text-center shadow-card">
            <div className="mb-3 text-4xl">{emoji}</div>

            <h3 className="text-base font-semibold text-ink">
                {title}
            </h3>

            <p className="mt-2 max-w-sm text-sm text-text-secondary">
                {description}
            </p>

            {onAction && (
                <button
                    onClick={onAction}
                    className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-lift transition hover:scale-[1.02]"
                >
                    {actionLabel}
                </button>
            )}

            <div className="mt-3 text-xs text-text-muted">
                Una opinión = una señal. Varias… bueno, ya sabes.
            </div>
        </div>
    );
}
