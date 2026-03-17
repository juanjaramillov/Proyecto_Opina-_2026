// b2bCuratedSnapshot.ts
// Este snapshot provee un dataset coherente, predecible y estático para las Demos B2B.
// Evita los saltos lógicos generados por Math.random() y permite narrar una historia 
// ejecutiva completa, demostrando el verdadero valor de la plataforma.

export const b2bCuratedSnapshot = {
    overview: {
        executiveSummary: "Durante octubre, 'Vitalidad' consolidó su liderazgo en la categoría de Bebidas Energéticas, capturando el 62.4% de la preferencia frente a 'Letargo'. Sin embargo, se detecta un riesgo emergente en el segmento Z (18-24), donde 'Letargo' presenta un crecimiento inusual impulsado por su reciente tracción digital.",
        keyFindings: [
            {
                title: "Dominio Estable",
                description: "Vitalidad mantiene +24 puntos de brecha competitiva en el target principal (25-34 años).",
                trend: "positive",
                icon: "trending-up"
            },
            {
                title: "Riesgo en Gen Z",
                description: "Letargo creció un 14.2% en preferencia de compra en los últimos 15 días entre jóvenes de 18-24.",
                trend: "negative",
                icon: "trending-down"
            },
            {
                title: "Oportunidad de Formato",
                description: "El formato 'Shot' presenta un 85% de asociación a innovación, terreno inexplorado por el líder.",
                trend: "neutral",
                icon: "zap"
            }
        ],
        alerts: [
            {
                type: "risk",
                title: "Fuga de Lealtad Juvenil",
                description: "La tracción de 'Letargo' en Gen Z amenaza con erosionar la cuota de mercado futura si no se responde activamente en 30 días."
            },
            {
                type: "opportunity",
                title: "Campaña de Retención",
                description: "Los usuarios entre 25-34 años muestran altísima receptividad (78%) a programas de lealtad basados en gamificación."
            }
        ]
    },
    deepDive: {
        winner: {
            name: "Vitalidad",
            id: "vitalidad-01",
            winRate: 0.624,
            comparisons: 15420,
            delta: -1.2
        },
        challenger: {
            name: "Letargo",
            id: "letargo-01",
            winRate: 0.376,
            comparisons: 15420,  // Mismo volumen para la confrontación cara a cara
            delta: 4.8
        },
        executiveInsight: {
            intelligenceText: "Aunque Vitalidad gana cómodamente el global, Letargo aplica una estrategia de flanqueo clásico. Están ignorando a los consumidores maduros leales al líder y concentrando todo su capital conversacional en los nuevos entrantes (18-24). Esta brecha segmentada no es ruido estadístico: es una tendencia consistente durante 3 semanas seguidas que demanda acción táctica.",
            confidence: "Alta (94%)",
            category: "Estrategia Competitiva"
        }
    },
    reports: {
        title: "Brief Ejecutivo: Dinámica Competitiva Q4 (Energy Drinks)",
        dateRange: "Últimos 30 días",
        universe: "15,420 señales validadas (Mercado Nacional, Usuarios Verificados)",
        summary: "El mercado muestra una madurez engañosa. El líder histórico retiene el volumen actual, pero el retador dominante está ganando la narrativa en el segmento demográfico que dicta el crecimiento del próximo año.",
        findings: [
            "Vitalidad lidera con 62.4% de Share of Preference global.",
            "Letargo crece a un ritmo acelerado (+4.8%) en el segmento 18-24.",
            "El formato 'Shot' es percibido como innovador y está completamente desatendido por el líder."
        ],
        strategicRecommendation: "Lanzar inmediatamente una táctica de blindaje (campaña hiper-enfocada o formato compacto tipo Shot) dirigida exclusivamente a Gen Z para frenar la adopción de Letargo, preservando el posicionamiento premium en adultos.",
        criticalAlert: "Inacción por 60 días en retención juvenil resultará en la pérdida irreversible del top of mind entre nuevos consumidores (18-24)."
    }
};
