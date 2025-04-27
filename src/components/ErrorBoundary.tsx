import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ errorInfo });

        // Report error to error tracking service or parent component
        this.props.onError?.(error, errorInfo);

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Uncaught error:', error);
            console.error('Component stack:', errorInfo.componentStack);
        }
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
        window.location.reload();
    };

    private handleReportError = () => {
        // Here you could implement error reporting to your backend or error tracking service
        const errorReport = {
            error: this.state.error?.toString(),
            errorInfo: this.state.errorInfo?.componentStack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        console.log('Error report:', errorReport);
        // You could send this to your error tracking service
        // await fetch('/api/error-report', { method: 'POST', body: JSON.stringify(errorReport) });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6 text-center">
                            <AlertTriangle className="w-12 h-12 mx-auto text-destructive mb-4" />
                            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                <Button 
                                    variant="outline" 
                                    onClick={this.handleReportError}
                                >
                                    Report Error
                                </Button>
                                <Button onClick={this.handleRetry}>
                                    Try Again
                                </Button>
                            </div>
                            {process.env.NODE_ENV === 'development' && (
                                <pre className="mt-6 text-left text-xs bg-muted p-4 rounded-md overflow-auto max-h-[200px]">
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            )}
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}