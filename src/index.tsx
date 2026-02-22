import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';
import { logger } from './lib/logger';
import { ToastProvider } from './components/ui/ToastProvider';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h1>Algo salió mal.</h1>
                    <p>{this.state.error?.message}</p>
                    <button onClick={() => window.location.reload()}>Recargar página</button>
                </div>
            );
        }
        return this.props.children;
    }
}

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
    root.render(
        <React.StrictMode>
            <BrowserRouter>
                <ErrorBoundary>
                    <HelmetProvider>
                        <ToastProvider>
                            <App />
                        </ToastProvider>
                    </HelmetProvider>
                </ErrorBoundary>
            </BrowserRouter>
        </React.StrictMode>
    );
}
