import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  fallbackPath?: string;
  roles?: string[];
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  fallbackPath = '/login',
  roles = []
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Быстрая проверка localStorage, чтобы не ждать инициализации хука
  let hasStoredAuth = false;
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('auth_tokens') : null;

    if (raw && raw !== 'undefined' && raw !== 'null') {
      const tokens = JSON.parse(raw);
      const access = tokens?.access as string | undefined;
      if (access && access.includes('.')) {
        const payload = JSON.parse(atob(access.split('.')[1]));
        if (!payload.exp || payload.exp * 1000 > Date.now()) {
          hasStoredAuth = true;
        }
      }
    }
  } catch {}

  // Показываем загрузку пока проверяем авторизацию
  if (isLoading && !hasStoredAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="relative">
            <motion.div
              className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-primary/50 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mt-4 text-muted-foreground"
          >
            Проверка авторизации...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Проверяем авторизацию
  if (requireAuth && !(isAuthenticated || hasStoredAuth)) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Проверяем роли если указаны
  if (requireAuth && roles.length > 0 && user) {
    const hasRequiredRole = roles.some(role => user.role === role);
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-md"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Доступ запрещен</h2>
            <p className="text-muted-foreground mb-4">
              У вас нет необходимых прав для доступа к этой странице.
            </p>
            <p className="text-sm text-muted-foreground">
              Требуемые роли: {roles.join(', ')}
            </p>
          </motion.div>
        </div>
      );
    }
  }

  // Если пользователь авторизован но пытается зайти на страницу входа/регистрации
  if (!requireAuth && (isAuthenticated || hasStoredAuth)) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

// Компонент для публичных маршрутов (доступных только неавторизованным пользователям)
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false} fallbackPath="/">
      {children}
    </ProtectedRoute>
  );
}

// Компонент для защищенных маршрутов (требуют авторизацию)
export function PrivateRoute({
  children,
  roles
}: {
  children: ReactNode;
  roles?: string[]
}) {
  return (
    <ProtectedRoute requireAuth={true} roles={roles}>
      {children}
    </ProtectedRoute>
  );
}

// Компонент для административных маршрутов
export function AdminRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute
      requireAuth={true}
      roles={['admin', 'super_admin']}
      fallbackPath="/unauthorized"
    >
      {children}
    </ProtectedRoute>
  );
}
