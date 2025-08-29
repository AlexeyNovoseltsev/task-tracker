import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { OAuthButtons } from "./OAuthButtons";

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginForm() {
  const navigate = useNavigate();
  const { success, error: showError, info } = useToast() as any;
  const { login, isLoading, resendVerification } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Валидация email в реальном времени
  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email обязателен";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Неверный формат email";
    return undefined;
  };

  // Валидация пароля
  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Пароль обязателен";
    if (password.length < 6) return "Пароль должен содержать минимум 6 символов";
    return undefined;
  };

  // Обработчик изменения полей
  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Очищаем ошибку поля при вводе
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Валидация в реальном времени
    if (field === 'email') {
      const emailError = validateEmail(value);
      if (emailError) {
        setErrors(prev => ({ ...prev, email: emailError }));
      }
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация всех полей
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    try {
      await login(formData.email, formData.password);
      success("Добро пожаловать!", "Вы успешно вошли в систему");

      // Редирект обрабатывается через ProtectedRoute автоматически
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Произошла ошибка при входе";
      setErrors({ general: errorMessage });
      if (errorMessage.toLowerCase().includes('подтвержд')) {
        (info || showError)("Подтвердите почту", "Почта не подтверждена. Проверьте письмо от Supabase или запросите повторно.");
      } else {
        showError("Ошибка входа", errorMessage);
      }
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-center"
      >
        <h2 className="text-2xl font-bold">Вход в аккаунт</h2>
        <p className="text-muted-foreground mt-1">
          Введите ваши данные для продолжения
        </p>
      </motion.div>

      {/* Общая ошибка */}
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
        >
          {errors.general}
          {errors.general.toLowerCase().includes('подтвержд') && formData.email && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await resendVerification(formData.email);
                  success('Письмо отправлено', 'Проверьте входящие/спам');
                } catch (e) {
                  const m = e instanceof Error ? e.message : 'Не удалось отправить письмо';
                  showError('Ошибка', m);
                }
              }}
              className="ml-2 underline text-primary"
            >
              Отправить письмо повторно
            </button>
          )}
        </motion.div>
      )}

      {/* Email поле */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="space-y-2"
      >
        <label className="text-sm font-medium">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            className={`pl-10 transition-all duration-200 ${
              errors.email
                ? 'border-destructive focus-visible:ring-destructive'
                : focusedField === 'email'
                ? 'border-primary focus-visible:ring-primary'
                : ''
            }`}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive"
          >
            {errors.email}
          </motion.p>
        )}
      </motion.div>

      {/* Пароль поле */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        className="space-y-2"
      >
        <label className="text-sm font-medium">
          Пароль
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            className={`pl-10 pr-10 transition-all duration-200 ${
              errors.password
                ? 'border-destructive focus-visible:ring-destructive'
                : focusedField === 'password'
                ? 'border-primary focus-visible:ring-primary'
                : ''
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive"
          >
            {errors.password}
          </motion.p>
        )}
      </motion.div>

      {/* Забыли пароль */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="flex justify-end"
      >
        <Link
          to="/forgot-password"
          className="text-sm text-primary hover:underline transition-colors"
        >
          Забыли пароль?
        </Link>
      </motion.div>

      {/* Кнопка входа */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        className="space-y-3"
      >
        <Button
          type="submit"
          className="w-full h-12 text-base font-medium"
          loading={isLoading}
          disabled={isLoading || !formData.email || !formData.password || !!errors.email || !!errors.password}
        >
          {isLoading ? (
            "Вход..."
          ) : (
            <>
              Войти
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </motion.div>

      {/* OAuth Buttons */}
      <OAuthButtons mode="login" disabled={isLoading} />

      {/* Регистрация */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.3 }}
        className="text-center text-sm text-muted-foreground"
      >
        Нет аккаунта?{" "}
        <Link
          to="/register"
          className="text-primary hover:underline font-medium transition-colors"
        >
          Зарегистрироваться
        </Link>
      </motion.div>
    </motion.form>
  );
}
