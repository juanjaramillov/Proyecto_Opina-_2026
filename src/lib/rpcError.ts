type Normalized = {
    code: string;
    title: string;
    description: string;
    ctaLabel?: string;
    ctaPath?: string;
};

export function normalizeRpcError(err: any): Normalized {
    const rawMessage =
        err?.message ||
        err?.error_description ||
        err?.details ||
        "No se pudo guardar tu respuesta.";

    const rawCode =
        err?.code ||
        err?.error?.code ||
        (typeof rawMessage === "string" ? rawMessage : "");

    const msg = String(rawMessage);

    // Ajusta estos matchers a tus mensajes reales (los afinamos con 1 screenshot si hace falta)
    if (msg.includes("INVITE") || msg.includes("invite") || msg.includes("invitation")) {
        return {
            code: "INVITE_REQUIRED",
            title: "Acceso por invitación",
            description: "Necesitas un código de invitación válido para seguir participando.",
            ctaLabel: "Ir a Perfil",
            ctaPath: "/profile",
        };
    }

    if (msg.includes("PROFILE") || msg.includes("perfil") || msg.includes("complete profile")) {
        return {
            code: "PROFILE_INCOMPLETE",
            title: "Completa tu perfil",
            description: "Para que tu señal tenga valor y quede registrada, primero completa tu perfil.",
            ctaLabel: "Completar perfil",
            ctaPath: "/profile",
        };
    }

    if (msg.includes("SIGNAL_LIMIT") || msg.includes("limit") || msg.includes("límite")) {
        return {
            code: "SIGNAL_LIMIT_REACHED",
            title: "Límite alcanzado",
            description: "Ya usaste tus señales por hoy. Vuelve mañana o sube de nivel para más capacidad.",
            ctaLabel: "Volver a Participa",
            ctaPath: "/experience",
        };
    }

    return {
        code: String(rawCode || "UNKNOWN"),
        title: "No se pudo guardar",
        description: msg,
        ctaLabel: "Volver a Participa",
        ctaPath: "/experience",
    };
}
