import { useEffect } from "react";
import { motion } from "framer-motion";
import { Github, Chrome } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

interface OAuthButtonsProps {
  mode: 'login' | 'register';
  disabled?: boolean;
}

export function OAuthButtons({ mode, disabled = false }: OAuthButtonsProps) {
  const { error: showError } = useToast();

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      // В production здесь будет реальный OAuth flow
      // Для демо просто имитируем процесс

      const env = (import.meta as any).env;
      const authUrl = provider === 'google'
        ? `https://accounts.google.com/oauth/authorize?client_id=${env?.VITE_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin)}/auth/callback&scope=email profile&response_type=code`
        : `https://github.com/login/oauth/authorize?client_id=${env?.VITE_GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin)}/auth/callback&scope=user:email`;

      // Открываем popup для OAuth
      const popup = window.open(
        authUrl,
        'oauth-popup',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        showError("OAuth Error", "Не удалось открыть окно авторизации. Проверьте настройки popup blocker.");
        return;
      }

      // Слушаем сообщения от popup
      const handleMessage = (event: MessageEvent) => {
        // Проверяем origin для безопасности
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'OAUTH_SUCCESS') {
          popup.close();
          window.removeEventListener('message', handleMessage);
          // Обработка успешной авторизации
          console.log('OAuth successful:', event.data);
        } else if (event.data.type === 'OAUTH_ERROR') {
          popup.close();
          window.removeEventListener('message', handleMessage);
          showError("OAuth Error", event.data.error || "Ошибка авторизации");
        }
      };

      window.addEventListener('message', handleMessage);

      // Таймаут на случай если пользователь закроет popup
      const timeout = setTimeout(() => {
        popup.close();
        window.removeEventListener('message', handleMessage);
        showError("OAuth Timeout", "Время авторизации истекло");
      }, 5 * 60 * 1000); // 5 минут

    } catch (error) {
      console.error('OAuth error:', error);
      showError("OAuth Error", "Произошла ошибка при авторизации");
    }
  };

  const buttonVariants = {
    login: "secondary",
    register: "outline"
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9, duration: 0.3 }}
      className="space-y-3"
    >
      {/* Разделитель */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Или {mode === 'login' ? 'войти' : 'зарегистрироваться'} через
          </span>
        </div>
      </div>

      {/* OAuth кнопки */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant={buttonVariants[mode]}
          onClick={() => handleOAuthLogin('google')}
          disabled={disabled}
          className="w-full h-11 text-sm font-medium"
        >
          <Chrome className="w-4 h-4 mr-2" />
          Google
        </Button>

        <Button
          type="button"
          variant={buttonVariants[mode]}
          onClick={() => handleOAuthLogin('github')}
          disabled={disabled}
          className="w-full h-11 text-sm font-medium"
        >
          <Github className="w-4 h-4 mr-2" />
          GitHub
        </Button>
      </div>

      {/* Предупреждение для демо */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.3 }}
        className="text-xs text-muted-foreground text-center bg-muted/50 rounded-lg p-3 border border-border/50"
      >
        <div className="font-medium mb-1">Демо-режим</div>
        <div>
          OAuth интеграция требует настройки на сервере.
          В production это будет работать с реальными провайдерами.
        </div>
      </motion.div>
    </motion.div>
  );
}

// Компонент для обработки OAuth callback
export function OAuthCallback() {
  const { login } = useAuth();
  const { success, error: showError } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        showError("OAuth Error", error);
        window.close();
        return;
      }

      if (code) {
        try {
          // Здесь будет вызов API для обмена кода на токены
          // const response = await fetch(`/api/auth/oauth/callback?code=${code}&provider=${provider}`);

          // Имитация успешного ответа
          const mockUser = {
            id: 'oauth-user',
            email: 'oauth@example.com',
            name: 'OAuth User',
            role: 'user'
          };

          const mockTokens = {
            access: 'oauth-access-token',
            refresh: 'oauth-refresh-token'
          };

          // Отправляем результат родительскому окну
          if (window.opener) {
            window.opener.postMessage({
              type: 'OAUTH_SUCCESS',
              user: mockUser,
              tokens: mockTokens
            }, window.location.origin);
          }

          success("Успешная авторизация!", "Добро пожаловать!");
          window.close();

        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'OAuth callback failed';

          if (window.opener) {
            window.opener.postMessage({
              type: 'OAUTH_ERROR',
              error: errorMessage
            }, window.location.origin);
          }

          showError("OAuth Error", errorMessage);
          window.close();
        }
      }
    };

    handleCallback();
  }, [login, success, showError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          <motion.div
            className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <h2 className="text-xl font-semibold mb-2">Завершение авторизации</h2>
        <p className="text-muted-foreground">Пожалуйста, подождите...</p>
      </motion.div>
    </div>
  );
}
