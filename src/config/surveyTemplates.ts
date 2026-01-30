export type QuestionOption = {
    id: string;
    label: string;
};

export type Question = {
    id: string;
    text: string;
    options: QuestionOption[];
};

export const TEMPLATE_BY_CATEGORY: Record<string, Question[]> = {
    'place': [
        { id: 'recommend', text: '¿Lo recomiendas?', options: [{ id: 'yes', label: 'Sí' }, { id: 'no', label: 'No' }] },
        { id: 'service', text: 'Atención', options: [{ id: '5', label: 'Excelente' }, { id: '4', label: 'Buena' }, { id: '3', label: 'Regular' }, { id: '2', label: 'Mala' }] },
        { id: 'clean', text: 'Limpieza', options: [{ id: '5', label: 'Impecable' }, { id: '4', label: 'Bien' }, { id: '3', label: 'Regular' }, { id: '2', label: 'Mal' }] },
    ],
    'service': [
        { id: 'recommend', text: '¿Lo recomiendas?', options: [{ id: 'yes', label: 'Sí' }, { id: 'no', label: 'No' }] },
        { id: 'time', text: 'Puntualidad', options: [{ id: '5', label: 'A tiempo' }, { id: '4', label: 'Aceptable' }, { id: '3', label: 'Tarde' }, { id: '2', label: 'Muy tarde' }] },
        { id: 'result', text: 'Resultado', options: [{ id: '5', label: 'Excelente' }, { id: '4', label: 'Bueno' }, { id: '3', label: 'Regular' }, { id: '2', label: 'Malo' }] },
    ]
};
