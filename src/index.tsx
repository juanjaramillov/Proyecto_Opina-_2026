import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';
import { logger } from './lib/logger';
import { installWindowErrorBridge } from './lib/observability/windowErrorBridge';
import { ToastProvider } from './components/ui/ToastProvider';
import { Toaster } from 'react-hot-toast';
import { QueryClientProvider } from '@tanstack/react-query';
import { startSignalOutbox } from './features/signals/services/signalOutbox';
import { queryClient } from './lib/queryClient';

import { ErrorBoundary } from './components/ui/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if ((!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') && import.meta.env.MODE !== 'test') {
    logger.error("Supabase environment variables are missing or invalid.", { supabaseUrl, supabaseAnonKey });
    root.render(
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: '#f8fafc',
            color: '#1e293b',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '1.5rem',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                maxWidth: '480px'
            }}>
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#ef4444',
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>!</span>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1rem' }}>Faltan Variables de Entorno</h1>
                <p style={{ color: '#64748b', lineHeight: '1.5', marginBottom: '2rem' }}>
                    Para que la aplicación funcione, necesitas configurar <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> en tu archivo <code>.env</code>.
                </p>
                <div style={{ textAlign: 'left', backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '0.75rem', fontSize: '0.875rem' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#475569' }}>Próximos pasos:</p>
                    <ol style={{ margin: 0, paddingLeft: '1.25rem', color: '#64748b' }}>
                        <li>Crea un archivo <code>.env</code> en la raíz.</li>
                        <li>Copia los valores desde tu dashboard de Supabase.</li>
                        <li>Reinicia el servidor de desarrollo.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
} else {
    // Fase 5.3 — observabilidad baseline: puente de `window.onerror` y
    // `unhandledrejection` al `ErrorReporter` activo. Reemplaza el listener
    // ad-hoc previo; se monta una sola vez gracias a la guarda interna.
    installWindowErrorBridge();

    if (import.meta.env.VITE_SENTRY_DSN) {
        import('@sentry/react').then((Sentry) => {
            Sentry.init({
                dsn: import.meta.env.VITE_SENTRY_DSN,
                environment: import.meta.env.MODE,
                tracesSampleRate: 1.0, // In production this should be adjusted
            });
            import('./lib/observability/errorReporter').then(({ setErrorReporter }) => {
                import('./lib/observability/SentryReporter').then(({ SentryReporter }) => {
                    setErrorReporter(new SentryReporter());
                });
            });
        }).catch(err => logger.error("Failed to load Sentry", err));
    }

    if (import.meta.env.VITE_NARRATIVE_PROVIDER === 'llm') {
        import('./features/b2b/engine/LLMNarrativeProvider').then(({ LLMNarrativeProvider }) => {
            import('./features/b2b/engine/narrativeProvider').then(({ setNarrativeProvider }) => {
                setNarrativeProvider(new LLMNarrativeProvider());
            });
        }).catch(err => logger.error("Failed to load LLMNarrativeProvider", err));
    }

    startSignalOutbox();

    // FASE 1 React Query — Devtools solo en DEV (lazy import para que no
    // entren al bundle de producción).
    const ReactQueryDevtoolsLazy = import.meta.env.DEV
        ? React.lazy(() =>
            import('@tanstack/react-query-devtools').then((m) => ({
                default: m.ReactQueryDevtools,
            }))
        )
        : null;

    root.render(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <ErrorBoundary>
                        <HelmetProvider>
                            <ToastProvider>
                                <App />
                                <Toaster position="bottom-center" toastOptions={{ className: 'text-sm font-bold', style: { zIndex: 9999 } }} />
                                {ReactQueryDevtoolsLazy && (
                                    <React.Suspense fallback={null}>
                                        <ReactQueryDevtoolsLazy initialIsOpen={false} buttonPosition="bottom-left" />
                                    </React.Suspense>
                                )}
                            </ToastProvider>
                        </HelmetProvider>
                    </ErrorBoundary>
                </BrowserRouter>
            </QueryClientProvider>
        </React.StrictMode>
    );
}
