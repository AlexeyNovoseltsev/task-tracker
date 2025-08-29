import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
  last_active_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

// Vite: env переменные доступны через import.meta.env с префиксом VITE_
const API_BASE_URL = (import.meta as { env?: Record<string, string> }).env?.VITE_API_URL || 'http://localhost:3001/api';

export function useAuth() {
  const navigate = useNavigate();
  const wasAuthenticatedRef = useRef(false);

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Загрузка состояния из localStorage при инициализации
  useEffect(() => {
    const loadStoredAuth = () => {
      try {
        const storedUserRaw = localStorage.getItem('auth_user');
        const storedTokensRaw = localStorage.getItem('auth_tokens');

        // Защита от мусора в localStorage
        const isBad = (v: string | null) => v === null || v === '' || v === 'undefined' || v === 'null';
        if (isBad(storedUserRaw) || isBad(storedTokensRaw)) {
          clearStoredAuth();
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const storedUser = storedUserRaw as string;
        const storedTokens = storedTokensRaw as string;

        if (storedUser && storedTokens) {
          let user: User;
          let tokens: AuthTokens;
          try {
            user = JSON.parse(storedUser);
            tokens = JSON.parse(storedTokens);
          } catch {
            clearStoredAuth();
            setAuthState(prev => ({ ...prev, isLoading: false }));
            return;
          }

          // Проверяем валидность токена
          const tokenValid = isTokenValid(tokens.access);

          if (tokenValid) {
            setAuthState({
              user,
              tokens,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // Попытка обновить токен
            refreshToken(tokens.refresh).catch(() => {
              clearStoredAuth();
              setAuthState(prev => ({ ...prev, isLoading: false }));
            });
          }
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
        clearStoredAuth();
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadStoredAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Supabase auth state listener
  useEffect(() => {
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            const user: User = {
              id: session.user.id,
              email: session.user.email!,
              name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
              role: session.user.user_metadata?.role || 'user',
              avatar_url: session.user.user_metadata?.avatar_url,
              last_active_at: new Date().toISOString(),
              created_at: session.user.created_at,
              updated_at: session.user.updated_at,
            };

            const tokens: AuthTokens = {
              access: session.access_token,
              refresh: session.refresh_token || '',
            };

            saveAuthToStorage(user, tokens);
            setAuthState({ user, tokens, isAuthenticated: true, isLoading: false, error: null });
          } else if (event === 'SIGNED_OUT') {
            clearStoredAuth();
            setAuthState({
              user: null,
              tokens: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Автоматический редирект после успешной авторизации
  useEffect(() => {
    // Проверяем изменение состояния авторизации
    const justAuthenticated = authState.isAuthenticated && !wasAuthenticatedRef.current;
    wasAuthenticatedRef.current = authState.isAuthenticated;

    // Редиректим только если пользователь только что авторизовался
    if (justAuthenticated && !authState.isLoading) {
      const currentPath = window.location.pathname;
      if (currentPath === '/login' || currentPath === '/register') {
        navigate('/', { replace: true });
      }
    }
  }, [authState.isAuthenticated, authState.isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Проверка валидности токена
  const isTokenValid = useCallback((token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }, []);

  // Сохранение авторизации в localStorage
  const saveAuthToStorage = useCallback((user: User, tokens: AuthTokens) => {
    try {
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Error saving auth to storage:', error);
    }
  }, []);

  // Очистка хранилища авторизации
  const clearStoredAuth = useCallback(() => {
    try {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_tokens');
    } catch (error) {
      console.error('Error clearing auth storage:', error);
    }
  }, []);

  // Обновление токена
  const refreshToken = useCallback(async (refreshToken: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data: { tokens: AuthTokens } = await response.json();
      const storedUser = localStorage.getItem('auth_user');

      if (storedUser) {
        const user = JSON.parse(storedUser);
        saveAuthToStorage(user, data.tokens);

        setAuthState(prev => ({
          ...prev,
          tokens: data.tokens,
          isAuthenticated: true,
          error: null,
        }));
      }
    } catch (error) {
      throw new Error('Session expired. Please login again.');
    }
  }, [saveAuthToStorage]);

  // Вход в систему
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Проверяем DEMO login ПЕРЕД запросом к серверу
      const isDemoEmail = email.toLowerCase() === 'demo@taskflow.pro';

      if (isDemoEmail) {
        // Demo авторизация
        const fakeTokens: AuthTokens = {
          access: btoa(JSON.stringify({alg:'none'}))+'.'+btoa(JSON.stringify({sub:'demo-user-id',email,role:'admin',exp:Math.floor(Date.now()/1000)+24*3600}))+'.',
          refresh: 'demo-refresh-token'
        };
        const demoUser: User = { id: 'demo-user-id', email, name: 'Demo User', role: 'admin' };

        saveAuthToStorage(demoUser, fakeTokens);
        setAuthState({ user: demoUser, tokens: fakeTokens, isAuthenticated: true, isLoading: false, error: null });
        return;
      }

      // Если Supabase настроен - используем Supabase
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          const msg = (error.message || '').toLowerCase();
          if (msg.includes('confirm')) {
            setAuthState(prev => ({ ...prev, isLoading: false, error: 'Почта не подтверждена. Проверьте почту и перейдите по ссылке подтверждения.' }));
            throw new Error('Почта не подтверждена. Проверьте почту и перейдите по ссылке подтверждения.');
          }
          throw error;
        }

        // Преобразуем Supabase user в наш формат
        const user: User = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || data.user.email!.split('@')[0],
          role: data.user.user_metadata?.role || 'user',
          avatar_url: data.user.user_metadata?.avatar_url,
          last_active_at: new Date().toISOString(),
          created_at: data.user.created_at,
          updated_at: data.user.updated_at,
        };

        const tokens: AuthTokens = {
          access: data.session?.access_token || '',
          refresh: data.session?.refresh_token || '',
        };

        saveAuthToStorage(user, tokens);
        setAuthState({ user, tokens, isAuthenticated: true, isLoading: false, error: null });
        return;
      }

      // Если Supabase не настроен - используем обычный API
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || 'Login failed');
      }

      const data: LoginResponse = await response.json();

      saveAuthToStorage(data.user, data.tokens);

      setAuthState(prev => ({
        ...prev,
        user: data.user,
        tokens: data.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [saveAuthToStorage]);

  // Регистрация
  const register = useCallback(async (email: string, password: string, name: string): Promise<'verified' | 'pending'> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Если Supabase настроен - используем Supabase
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
            data: {
              name,
              role: 'user',
            }
          }
        });

        if (error) throw error;

        // Для Supabase обычно требуется подтверждение email
        if (data.user && !data.session) {
          // Требуется подтверждение email
          setAuthState(prev => ({ ...prev, isLoading: false, error: 'Почта не подтверждена. Мы отправили письмо с подтверждением.' }));
          return 'pending';
        }

        // Преобразуем Supabase user в наш формат
        const user: User = {
          id: data.user!.id,
          email: data.user!.email!,
          name: data.user!.user_metadata?.name || name,
          role: data.user!.user_metadata?.role || 'user',
          avatar_url: data.user!.user_metadata?.avatar_url,
          last_active_at: new Date().toISOString(),
          created_at: data.user!.created_at,
          updated_at: data.user!.updated_at,
        };

        const tokens: AuthTokens = {
          access: data.session?.access_token || '',
          refresh: data.session?.refresh_token || '',
        };

        saveAuthToStorage(user, tokens);
        setAuthState({ user, tokens, isAuthenticated: true, isLoading: false, error: null });
        return 'verified';
      }

      // Если Supabase не настроен - используем обычный API
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data: RegisterResponse = await response.json();

      saveAuthToStorage(data.user, data.tokens);

      setAuthState(prev => ({
        ...prev,
        user: data.user,
        tokens: data.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
      return 'verified';

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [saveAuthToStorage]);

  // Выход из системы
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Если Supabase настроен - используем Supabase logout
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Supabase logout error:', error);
        }
      } else if (authState.tokens?.access) {
        // Если обычный API - делаем запрос на logout
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authState.tokens.access}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearStoredAuth();
      setAuthState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      navigate('/login');
    }
  }, [authState.tokens, clearStoredAuth, navigate]);

  // Обновление профиля пользователя
  const updateProfile = useCallback(async (updates: Partial<User>): Promise<void> => {
    if (!authState.tokens?.access || !authState.user) {
      throw new Error('Not authenticated');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.tokens.access}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Update failed');
      }

      const updatedUser: User = await response.json();
      saveAuthToStorage(updatedUser, authState.tokens);

      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [authState.tokens, authState.user, saveAuthToStorage]);

  // Получение текущего пользователя
  const getCurrentUser = useCallback(async (): Promise<void> => {
    if (!authState.tokens?.access) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authState.tokens.access}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get user');
      }

      const user: User = await response.json();
      setAuthState(prev => ({
        ...prev,
        user,
      }));

    } catch (error) {
      console.error('Error getting current user:', error);
      // Если токен истек, попробуем обновить
      if (authState.tokens?.refresh) {
        try {
          await refreshToken(authState.tokens.refresh);
        } catch {
          logout();
        }
      }
    }
  }, [authState.tokens, refreshToken, logout]);

  // Повторная отправка письма подтверждения email (Supabase)
  const resendVerification = useCallback(async (email: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
      throw new Error('Email подтверждение недоступно: Supabase не сконфигурирован');
    }
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  }, []);

  // Очистка ошибки
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // Состояние
    user: authState.user,
    tokens: authState.tokens,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,

    // Методы
    login,
    register,
    logout,
    updateProfile,
    getCurrentUser,
    clearError,
    resendVerification,

    // Утилиты
    isTokenValid,
    refreshToken,
  };
}
