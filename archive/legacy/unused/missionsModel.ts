export type MissionStatus = "todo" | "in_progress" | "done";

export type Mission = {
    id: string;
    title: string;
    description: string;
    progress: number; // 0..1
    status: MissionStatus;
    ctaLabel?: string;
    ctaTo?: string; // route o "whatsapp"
};

function clamp01(n: number) {
    return Math.max(0, Math.min(1, n));
}

function statusFor(p: number): MissionStatus {
    if (p >= 1) return "done";
    if (p > 0) return "in_progress";
    return "todo";
}

export function buildMissions(i: {
    totalSignals: number;
    profileCompleteness: number; // 0..100
}): Mission[] {
    const totalSignals = Number(i.totalSignals || 0);
    const completeness = Number(i.profileCompleteness || 0);

    const mProfile = clamp01(completeness / 100);
    const mSignals5 = clamp01(totalSignals / 5);
    const mSignals15 = clamp01(totalSignals / 15); // Aproximación a participar en categorías variadas

    const missions: Mission[] = [
        {
            id: "profile",
            title: "Completar perfil",
            description: "Asegúrate de tener un perfil completo para habilitar comparaciones de segmento.",
            progress: mProfile,
            status: statusFor(mProfile),
            ctaLabel: "Completar perfil",
            ctaTo: "/complete-profile"
        },
        {
            id: "versus_5",
            title: "Participar en 5 versus",
            description: "Calienta motores y entra al juego emitiendo tus primeras señales.",
            progress: mSignals5,
            status: statusFor(mSignals5),
            ctaLabel: "Ir a Versus",
            ctaTo: "/experience"
        },
        {
            id: "categories_3",
            title: "Participar en 3 categorías distintas",
            description: "Diversifica tu impacto participando activamente. Desbloquéalo opinando más.",
            progress: mSignals15, // Se asimila a generar volumen para asegurar rotación
            status: statusFor(mSignals15),
            ctaLabel: "Explorar categorías",
            ctaTo: "/experience"
        },
        {
            id: "invite_1",
            title: "Invitar a 1 usuario",
            description: "Trae a alguien de confianza a sumar sus perspectivas en Opina+.",
            progress: 0,
            status: "todo",
            ctaLabel: "Invitar amig@",
            ctaTo: "whatsapp" // Por ahora un link de recomendación por WA
        }
    ];

    // Pendientes primero (done al final)
    const weight = (s: MissionStatus) => (s === "todo" ? 0 : s === "in_progress" ? 1 : 2);
    return missions.sort((a, b) => weight(a.status) - weight(b.status));
}
