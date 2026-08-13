import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("SwarmOS ErrorBoundary caught an error:", error, errorInfo);
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-zinc-900/90 p-8 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-950 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto text-2xl">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                {this.props.fallbackTitle || "SwarmOS Build encountered an error."}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-3 font-mono">
                {this.state.error?.message || "An unexpected rendering error occurred."}
              </p>
            </div>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-xs font-bold text-white shadow-lg hover:brightness-110 transition"
            >
              <RefreshCw size={15} /> Retry Build
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
