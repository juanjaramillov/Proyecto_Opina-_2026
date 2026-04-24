import { useEffect, useState } from 'react';
import { SESSION_GUARD_EVENT } from '../hooks/useSessionGuard';

/**
 * Banner modal que aparece cuando `useSessionGuard` detecta que la sesión
 * fue revocada por otro dispositivo (o por un admin).
 *
 * Se monta una única vez — ideal dentro del AuthProvider. Es puramente
 * informativo: el signOut ya fue hecho por el hook. Este componente solo
 * notifica al usuario por qué fue expulsado y le da un CTA para volver al
 * login.
 */
export function SessionSupersededBanner() {
    const [show, setShow] = useState(false);
    const [reason, setReason] = useState<string | null>(null);

    useEffect(() => {
        const handler = (e: Event) => {
            const custom = e as CustomEvent<{ reason?: string }>;
            setReason(custom.detail?.reason ?? null);
            setShow(true);
        };
        window.addEventListener(SESSION_GUARD_EVENT, handler as EventListener);
        return () => {
            window.removeEventListener(SESSION_GUARD_EVENT, handler as EventListener);
        };
    }, []);

    if (!show) return null;

    const message = (() => {
        switch (reason) {
            case 'superseded_by_new_login':
                return 'Tu sesión se cerró porque iniciaste sesión en otro dispositivo. Si no fuiste vos, cambiá tu contraseña.';
            case 'manual_admin':
                return 'Tu sesión fue cerrada por un administrador. Volvé a iniciar sesión para continuar.';
            case 'expired_idle':
                return 'Tu sesión expiró por inactividad. Iniciá sesión de nuevo para continuar.';
            case 'manual_user':
                return 'Cerraste esta sesión desde otro dispositivo. Iniciá sesión si querés volver a entrar.';
            default:
                return 'Tu sesión ya no es válida. Iniciá sesión nuevamente.';
        }
    })();

    const handleClose = () => {
        setShow(false);
        // Redirect suave al login
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
    };

    return (
        <div
            role="alertdialog"
            aria-live="assertive"
            aria-labelledby="session-superseded-title"
            aria-describedby="session-superseded-body"
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4"
        >
            <div className="max-w-md w-full rounded-2xl bg-white shadow-2xl border border-danger-100 p-6 space-y-4">
                <h2
                    id="session-superseded-title"
                    className="text-lg font-bold text-danger-600"
                >
                    Sesión cerrada
                </h2>
                <p
                    id="session-superseded-body"
                    className="text-sm text-slate-600 leading-relaxed"
                >
                    {message}
                </p>
                <button
                    type="button"
                    onClick={handleClose}
                    className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 transition-colors"
                >
                    Ir al login
                </button>
            </div>
        </div>
    );
}
