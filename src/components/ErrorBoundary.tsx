import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 bg-brand-dark flex flex-col items-center justify-center p-8 text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-white text-lg font-bold mb-2">Algo salió mal</h2>
          <p className="text-white/50 text-sm mb-6">{this.state.error.message}</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.hash = '/'; }}
            className="bg-brand-orange text-brand-dark px-6 py-3 rounded-xl font-semibold"
          >
            Volver al inicio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
