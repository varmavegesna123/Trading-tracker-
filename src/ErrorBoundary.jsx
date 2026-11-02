import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TRADETRACKER Error Boundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-[#111726] border border-rose-500/30 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 text-rose-400 border-b border-[#1E2638] pb-4">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <h2 className="text-xl font-bold font-jakarta text-white">Application Exception Intercepted</h2>
                <p className="text-xs text-slate-400">A runtime error occurred during rendering.</p>
              </div>
            </div>

            <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#1E2638] space-y-2 font-mono text-xs text-rose-300 overflow-x-auto max-h-48">
              <p className="font-bold">{this.state.error?.toString()}</p>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-[10px] text-slate-500 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-[#38BDF8] hover:bg-sky-400 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center space-x-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
