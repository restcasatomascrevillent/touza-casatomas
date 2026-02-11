import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * Captures rendering errors in child components and displays a fallback UI
 * instead of crashing the entire application.
 */
class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground text-center">
                    <h1 className="text-4xl font-bold mb-4 font-display text-primary">¡Ups! Algo salió mal.</h1>
                    <p className="text-muted-foreground mb-8 max-w-md">
                        Nuestro equipo de mixólogos ya está investigando el problema. Mientras tanto, por favor intenta recargar la página.
                    </p>
                    <div className="flex gap-4">
                        <Button onClick={this.handleReset} variant="default">
                            Recargar página
                        </Button>
                        <Button variant="outline" asChild>
                            <a href="/">Volver al inicio</a>
                        </Button>
                    </div>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-left w-full max-w-2xl overflow-auto text-xs font-mono border border-border">
                            <p className="text-destructive font-bold mb-2">{this.state.error.message}</p>
                            <pre>{this.state.error.stack}</pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
