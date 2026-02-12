import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('CRITICAL_RENDER_ERROR:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-6 text-center">
                    <div className="glass-card p-12 rounded-2xl border border-red-500/20 max-w-md w-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-neon"></div>
                        <div className="mb-6 inline-flex p-4 bg-red-500/10 rounded-full">
                            <span className="text-3xl">⚠️</span>
                        </div>
                        <h1 className="text-white text-2xl font-black uppercase tracking-tighter mb-4">
                            System_Decoupled
                        </h1>
                        <p className="text-red-500/60 font-mono text-[10px] uppercase tracking-widest mb-8 leading-relaxed">
                            Anomaly detected in the render pipeline. <br />
                            {this.state.error?.message || 'Kernel Execution Failure'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-4 bg-red-500/20 border border-red-500/40 text-red-500 font-black uppercase tracking-[0.2em] text-xs hover:bg-red-500/30 transition-all cursor-pointer shadow-lg"
                        >
                            Reinitialize_Module
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
