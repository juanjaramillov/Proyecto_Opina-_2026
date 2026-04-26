import { Component, ErrorInfo, ReactNode } from 'react';
import { getErrorReporter } from '../../lib/observability/errorReporter';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Fase 5.3 — pasa por el `ErrorReporter` activo en lugar de `logger`
    // directamente. Swap a Sentry/Datadog mañana es 1 archivo.
    getErrorReporter().captureException(error, {
        domain: 'unexpected_ui_state',
        origin: 'GlobalErrorBoundary',
        action: 'render',
        state: 'failed',
        componentStack: errorInfo.componentStack,
    });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
          return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
            <div className="w-16 h-16 bg-danger-100 text-danger-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Algo no salió como esperábamos</h2>
            <p className="text-slate-500 mb-6 text-sm max-w-sm mx-auto">Ocurrió un error inesperado mostrando esta pantalla. Lo hemos registrado para solucionarlo.</p>
            <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
            >
                Volver a intentar
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}
