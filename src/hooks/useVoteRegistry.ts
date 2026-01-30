import { useState, useEffect, useCallback } from 'react';

const VOTE_TIMEOUT_MS = 12 * 60 * 60 * 1000; // 12 hours

export function useVoteRegistry(targetId: string | undefined) {
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        if (!targetId) return;

        const lastVote = localStorage.getItem(`opina_last_review_${targetId}`);
        if (lastVote) {
            const timeDiff = Date.now() - parseInt(lastVote);
            if (timeDiff < VOTE_TIMEOUT_MS) {
                setHasVoted(true);
            }
        }
    }, [targetId]);

    const registerVote = useCallback(() => {
        if (!targetId) return;
        localStorage.setItem(`opina_last_review_${targetId}`, Date.now().toString());
        setHasVoted(true);
    }, [targetId]);

    return { hasVoted, registerVote };
}
