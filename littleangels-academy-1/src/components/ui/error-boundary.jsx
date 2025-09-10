import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { BeautifulButton } from './beautiful-button';
import { BeautifulCard, BeautifulCardHeader, BeautifulCardTitle, BeautifulCardContent } from './beautiful-card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-500 to-purple-500 flex items-center justify-center p-4">
          <BeautifulCard gradient="danger" className="max-w-2xl w-full p-8">
            <BeautifulCardHeader className="text-center">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
              <BeautifulCardTitle className="text-3xl mb-2">
                Oops! Something went wrong
              </BeautifulCardTitle>
              <p className="text-white/80 text-lg">
                We're sorry, but something unexpected happened. Don't worry, our team has been notified.
              </p>
            </BeautifulCardHeader>
            
            <BeautifulCardContent className="space-y-6">
              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2 flex items-center">
                    <Bug className="h-4 w-4 mr-2" />
                    Error Details (Development)
                  </h3>
                  <pre className="text-white/70 text-sm overflow-auto max-h-32">
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <BeautifulButton
                  onClick={() => window.location.reload()}
                  variant="success"
                  className="flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </BeautifulButton>
                
                <BeautifulButton
                  onClick={() => window.location.href = '/'}
                  variant="info"
                  className="flex items-center"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </BeautifulButton>
              </div>

              {/* Help Text */}
              <div className="text-center text-white/70 text-sm">
                <p>If this problem persists, please contact our support team.</p>
                <p className="mt-2">
                  Error ID: {Date.now().toString(36).toUpperCase()}
                </p>
              </div>
            </BeautifulCardContent>
          </BeautifulCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
