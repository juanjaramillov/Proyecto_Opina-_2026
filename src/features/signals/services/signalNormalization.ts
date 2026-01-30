
export interface NormalizedSignal {
    id: string;
    question: string;
    scale_type: 'emoji' | 'numeric' | 'binary' | 'choice' | 'versus';
    options: string[]; // Always defined, no inferring in UI
}

/**
 * Normalizes a raw DB signal into a render-ready object.
 * Enforces business rules for default options if they are missing.
 * This effectively acts as the "Backend" contract filler for implicit types.
 */
export function normalizeSignal(raw: {
    id: string;
    question: string;
    scale_type: string;
    options: any;
}): NormalizedSignal {
    const scale_type = raw.scale_type as NormalizedSignal['scale_type'];
    let labels: string[] = [];

    // 1. Try to read explicit options from DB
    if (Array.isArray(raw.options)) {
        labels = raw.options
            .map((o: any) => String(o?.label ?? '').trim())
            .filter(Boolean);
    }

    // 2. If present, return them
    if (labels.length > 0) {
        return {
            id: raw.id,
            question: raw.question,
            scale_type,
            options: labels
        };
    }

    // 3. Fallback / Implicit Options Logic (Moved from UI to Domain Layer)
    switch (scale_type) {
        case 'binary':
            labels = ['Sí', 'No'];
            break;
        case 'emoji':
            labels = ['😡', '😕', '😐', '🙂', '😍'];
            break;
        case 'numeric':
            labels = ['1', '2', '3', '4', '5'];
            break;
        default:
            labels = ['Opción A', 'Opción B', 'Opción C'];
            break;
    }

    return {
        id: raw.id,
        question: raw.question,
        scale_type,
        options: labels
    };
}
