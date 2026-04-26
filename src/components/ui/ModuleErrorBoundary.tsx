import { Component, ErrorInfo, ReactNode } from 'react';
import { getErrorReporter } from '../../lib/observability/errorReporter';

interface Props {
  children: ReactNode;
  moduleName: string;
}

interface State {
  hasError: boolean;
}

/**
 * A lightweight Error Boundary to isolate failures within specific modules (e.g. Versus, Torneo)
 * ensuring that one failing module doesn't crash the entire Hub.
 */
export class ModuleErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Fase 5.3 — reporter abstracto (ver `errorReporter.ts`).
    getErrorReporter().captureException(error, {
        domain: 'unexpected_ui_state',
        origin: 'ModuleErrorBoundary',
        action: 'render',
        state: 'failed',
        module: this.props.moduleName,
        componentStack: errorInfo.componentStack,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full p-8 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4 text-slate-400">
                <span className="material-symbols-outlined text-[24px]">extension_off</span>
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1">Módulo no disponible</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs">Hubo un problema cargando {this.props.moduleName}. Prueba recargar la página.</p>
            <button 
                onClick={() => this.setState({ hasError: false })}
                className="h-10 px-6 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-sm active:scale-95"
            >
                Reintentar módulo
            </button>
        </div>
      );
    }

    return this.props.children;
  }
}
