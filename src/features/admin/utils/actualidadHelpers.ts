import { Topic } from '../../signals/types/actualidad';

export function generateTopicSlug(title: string): string {
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
    return `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
}

export function extractDomainFromUrl(url?: string): string {
    if (!url) return '';
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return '';
    }
}

export function validateTopicForPublication(topic: Topic): { success: boolean; error?: string } {
    if (!topic.title || topic.title.trim() === '') return { success: false, error: 'El tema requiere un título válido.' };
    if (!topic.summary || topic.summary.trim() === '') return { success: false, error: 'Falta un resumen neutral para su publicación.' };
    if (!topic.category) return { success: false, error: 'Falta configurar una categoría válida.' };
    
    // Validación de preguntas asociadas
    if (!topic.questions || topic.questions.length !== 3) {
        return { success: false, error: 'La arquitectura requiere STRICTAMENTE 3 preguntas para ser operado, no ' + (topic.questions?.length || 0) };
    }
    for (const [idx, q] of topic.questions.entries()) {
        if (!q.text || q.text.trim() === '') return { success: false, error: `La pregunta ${idx + 1} no tiene texto.` };
        if (['single_choice', 'single_choice_polar'].includes(q.type) && (!q.options || q.options.length < 2)) {
            return { success: false, error: `La pregunta ${idx + 1} (${q.type}) requiere al menos 2 alternativas establecidas.` };
        }
    }

    return { success: true };
}
