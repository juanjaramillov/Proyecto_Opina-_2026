import { useActiveBattles } from "../../../hooks/useActiveBattles";

export function useSignals() {
    const { battles, loading, error } = useActiveBattles();

    // Adapt Active Battles to "Signal" shape expected by Signals.tsx
    const signals = battles.map((b) => ({
        id: b.slug || b.id, // Prefer slug for URL friendly & loader resolution
        question: b.title,
        category_name: b.category?.name,
        scale_type: "versus", // Battles are versus by definition
    }));

    return {
        signals,
        isLoading: loading,
        error
    };
}
