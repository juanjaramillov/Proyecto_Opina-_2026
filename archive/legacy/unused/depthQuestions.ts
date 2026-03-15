interface DepthQuestion {
    id: string;
    type: 'choice' | 'scale' | 'text';
    question: string;
    options?: string[];
}

export const DEPTH_QUESTIONS: DepthQuestion[] = [
    {
        id: 'frecuencia',
        type: 'choice',
        question: '¿Con qué frecuencia eliges esta opción?',
        options: ['Diariamente', 'Semanalmente', 'Mensualmente', 'Ocasionalmente']
    },
    {
        id: 'lealtad',
        type: 'choice',
        question: '¿Es tu primera opción siempre o depende de la ocasión?',
        options: ['Siempre es mi primera opción', 'Depende del precio', 'Depende de la disponibilidad', 'Es una alternativa secundaria']
    },
    {
        id: 'valor',
        type: 'scale',
        question: '¿Cómo calificas la relación calidad-precio? (1: Mala, 5: Excelente)',
    },
    {
        id: 'atributo_clave',
        type: 'choice',
        question: '¿Cuál es el factor determinante de tu elección?',
        options: ['Calidad', 'Precio', 'Estatus / Marca', 'Comodidad / Accesibilidad']
    },
    {
        id: 'recomendacion',
        type: 'scale',
        question: '¿Qué tan probable es que recomiendes esta opción a un amigo o colega? (0-10)',
    },
    {
        id: 'alternativa',
        type: 'choice',
        question: 'Si esta opción no estuviera disponible, ¿qué harías?',
        options: ['Buscaría la competencia directa', 'Esperaría a que esté disponible', 'Elegiría una categoría distinta', 'No compraría/consumiría nada']
    },
    {
        id: 'confianza',
        type: 'scale',
        question: '¿Qué tanta confianza te inspira esta marca/entidad? (1: Ninguna, 5: Total)',
    },
    {
        id: 'innovacion',
        type: 'scale',
        question: '¿Qué tan innovadora consideras que es esta opción?',
    },
    {
        id: 'proposito',
        type: 'choice',
        question: '¿Sientes que esta marca aporta un valor real a la sociedad?',
        options: ['Sí, totalmente', 'Parcialmente', 'Es indiferente', 'No, es puramente comercial']
    }
];
