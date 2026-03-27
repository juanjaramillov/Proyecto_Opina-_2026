import { useRef, useCallback } from 'react';

export function useInteractionTimer() {
    const startTimeRef = useRef<number | null>(null);

    const startTimer = useCallback(() => {
        startTimeRef.current = performance.now();
    }, []);

    const getElapsedMs = useCallback(() => {
        if (!startTimeRef.current) return null;
        return Math.floor(performance.now() - startTimeRef.current);
    }, []);

    const resetTimer = useCallback(() => {
        startTimeRef.current = null;
    }, []);

    return {
        startTimer,
        getElapsedMs,
        resetTimer
    };
}
