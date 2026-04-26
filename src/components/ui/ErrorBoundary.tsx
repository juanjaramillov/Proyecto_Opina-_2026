import { Component, ErrorInfo, ReactNode } from 'react';
import { getErrorReporter } from '../../lib/observability/errorReporter';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  fallbackRender?: (props: { error: Error; resetErrorBoundary: () => void }) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Fase 5.3 — reporter abstracto.
    getErrorReporter().captureException(error, {
        domain: 'unexpected_ui_state',
        origin: 'ErrorBoundary',
        action: 'render',
        state: 'failed',
        componentStack: errorInfo.componentStack,
    });
  }

  public resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null
    });
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallbackRender) {
        return this.props.fallbackRender({
          error: this.state.error,
          resetErrorBoundary: this.resetErrorBoundary
        });
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 text-center">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 max-w-md w-full">
            <h1 className="text-2xl font-black text-slate-900 mb-4">Algo salió mal</h1>
            <p className="text-slate-500 mb-6 font-medium">
              Ocurrió un error inesperado. Nuestro equipo ya fue notificado.
            </p>
            <button
              onClick={this.resetErrorBoundary}
              className="w-full bg-brand text-white font-bold py-3 px-6 rounded-xl hover:bg-brand transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
