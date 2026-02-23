import { toast } from 'react-hot-toast';

/**
 * Servicio centralizado para notificaciones (toasts/alerts)
 * Reutiliza la librería react-hot-toast que ya está instalada en el proyecto.
 */

export const notifyService = {
    success: (message: string) => {
        toast.success(message);
        console.log('[Notify:Success]', message);
    },

    error: (message: string) => {
        toast.error(message);
        console.error('[Notify:Error]', message);
    },

    info: (message: string) => {
        toast(message, { icon: 'ℹ️' });
        console.log('[Notify:Info]', message);
    }
};

/**
 * Formatea errores conocidos del backend/Supabase a mensajes legibles para el usuario.
 */
export function formatKnownError(err: unknown): string | null {
    if (!err) return null;

    const msg = typeof err === 'string' ? err : (err as Error).message || JSON.stringify(err);
    const upperMsg = msg.toUpperCase();

    if (upperMsg.includes('INVITE_REQUIRED')) {
        return 'Necesitas un código de invitación para participar.';
    }
    if (upperMsg.includes('INVITE_INVALID') || upperMsg.includes('NOT_FOUND') && upperMsg.includes('INVITE')) {
        return 'Código inválido o expirado.';
    }
    if (upperMsg.includes('RATE_LIMITED') || upperMsg.includes('RATE LIMIT')) {
        return 'Demasiados intentos. Espera 10 minutos y prueba de nuevo.';
    }
    if (upperMsg.includes('COOLDOWN_ACTIVE')) {
        return 'Espera un momento antes de volver a votar en este versus.';
    }
    if (upperMsg.includes('DEVICE_BANNED')) {
        return 'Tu acceso ha sido restringido por comportamiento sospechoso.';
    }
    if (upperMsg.includes('THROTTLED')) {
        return 'Demasiadas acciones seguidas. Espera unos minutos y prueba de nuevo.';
    }
    if (upperMsg.includes('PROFILE_MISSING') || upperMsg.includes('PROFILE_INCOMPLETE')) {
        return 'Completa tu perfil para emitir señales.';
    }
    if (upperMsg.includes('SIGNAL_LIMIT_REACHED')) {
        return 'Límite diario alcanzado. Vuelve mañana.';
    }
    if (upperMsg.includes('BATTLE_NOT_ACTIVE')) {
        return 'Este versus ya no está activo.';
    }
    if (upperMsg.includes('INVALID SIGNAL PAYLOAD')) {
        return 'Opción inválida. Actualiza la página e intenta otra vez.';
    }
    if (upperMsg.includes('DEMOGRAPHICS CAN ONLY BE UPDATED EVERY 30 DAYS') || msg.includes('30_days')) {
        return 'Solo puedes cambiar tu perfil cada 30 días.';
    }
    if (upperMsg.includes('UNAUTHORIZED') || upperMsg.includes('JWT')) {
        return 'Tu sesión expiró. Vuelve a iniciar.';
    }

    return null;
}
