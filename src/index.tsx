import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
                    <h1>Algo salió mal.</h1>
                    <pre style={{ color: 'red', background: '#fff0f0', padding: 10, borderRadius: 5 }}>
                        {this.state.error?.toString()}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

import { BrowserRouter } from 'react-router-dom';


import { ToastProvider } from './components/ui/ToastProvider';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if ((!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') && import.meta.env.MODE !== 'test') {
    const root = document.getElementById('root');
    if (root) {
        root.innerHTML = `
            <div style="font-family: sans-serif; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background-color: #FEF2F2; color: #DC2626;">
                <h1 style="font-size: 2rem; margin-bottom: 1rem; font-weight: 700;">🛑 Error de Configuración</h1>
                <p style="font-size: 1.25rem; margin-bottom: 1.5rem;">Faltan las variables de entorno de Supabase o son inválidas.</p>
                <div style="background: white; padding: 1.5rem; border-radius: 0.5rem; border: 1px solid #FECACA; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <code style="background: #F3F4F6; padding: 0.2rem 0.4rem; border-radius: 0.25rem;">VITE_SUPABASE_URL</code> y 
                    <code style="background: #F3F4F6; padding: 0.2rem 0.4rem; border-radius: 0.25rem;">VITE_SUPABASE_ANON_KEY</code> 
                    <br/>no están definidas correctamente.
                    <br/><br/>
                    <span style="font-size: 0.9rem; color: #666;">Asegúrate de reemplazar los valores por defecto en .env</span>
                </div>
                <p style="margin-top: 2rem; color: #4B5563;">
                    Revisa tu archivo <code style="font-weight: bold;">.env</code> o renombra <code style="font-weight: bold;">.env.example</code>
                </p>
                <div style="margin-top: 2rem">
                    <button onclick="window.location.reload()" style="padding: 0.75rem 1.5rem; background-color: #DC2626; color: white; border: none; border-radius: 0.5rem; font-weight: bold; cursor: pointer; transition: background-color 0.2s;">
                        Recargar página
                    </button>
                </div>
            </div>
        `;
    }
} else {
    import('./App')
        .then(({ default: App }) => {
            ReactDOM.createRoot(document.getElementById('root')!).render(
                <React.StrictMode>
                    <ErrorBoundary>
                        <ToastProvider>
                            <BrowserRouter>
                                <HelmetProvider>
                                    <App />
                                </HelmetProvider>
                            </BrowserRouter>
                        </ToastProvider>
                    </ErrorBoundary>
                </React.StrictMode>
            );
        })
        .catch((error) => {
            console.error("Failed to load App:", error);
            const root = document.getElementById('root');
            if (root) {
                root.innerHTML = `
                    <div style="padding: 20px; font-family: sans-serif; color: #DC2626;">
                        <h1>Error Fatal al Iniciar</h1>
                        <p>La aplicación no pudo cargarse debido a un error crítico:</p>
                        <pre style="background: #f0f0f0; padding: 10px; overflow: auto; max-width: 100%; border-radius: 4px;">${error?.message || String(error)}</pre>
                        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">Recargar</button>
                    </div>
                `;
            }
        });
}
