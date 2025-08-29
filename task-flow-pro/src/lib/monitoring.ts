import * as Sentry from '@sentry/react';
import { useEffect } from 'react';

// Initialize Sentry for error tracking and performance monitoring
export const initSentry = () => {
  const env = (import.meta as any).env;
  if (env?.MODE === 'production') {
    Sentry.init({
      dsn: env?.VITE_SENTRY_DSN,
      environment: env?.MODE,
      integrations: [
        // Note: Modern Sentry integrations will be added automatically
      ],
      // Performance monitoring - capture 10% of transactions
      tracesSampleRate: 0.1,
      // Release tracking
      release: env?.VITE_APP_VERSION || '1.0.0',
      // User context
      beforeSend(event) {
        // Filter out non-critical errors
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.type === 'ChunkLoadError') {
            // Don't send chunk load errors (common with deployments)
            return null;
          }
        }
        return event;
      },
    });
  }
};

// Custom error tracking utilities
export const trackError = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope(scope => {
    if (context) {
      scope.setContext('additional', context);
    }
    Sentry.captureException(error);
  });
};

export const trackEvent = (eventName: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message: eventName,
    level: 'info',
    data,
  });
};

// Performance monitoring utilities
export const startTransaction = (name: string, op: string) => {
  // Use modern Sentry API
  return Sentry.startSpan({ name, op }, () => {});
};

export const setUserContext = (user: { id: string; email?: string; name?: string }) => {
  Sentry.setUser(user);
};

export const clearUserContext = () => {
  Sentry.setUser(null);
};

// Custom hooks for React components
export const useSentryUser = (user: any) => {
  useEffect(() => {
    if (user) {
      setUserContext({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    } else {
      clearUserContext();
    }
    
    return () => clearUserContext();
  }, [user]);
};

// Error boundary component
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// HOC for profiling components
export const withSentryProfiling = Sentry.withProfiler;
