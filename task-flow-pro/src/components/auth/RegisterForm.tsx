import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { OAuthButtons } from "./OAuthButtons";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  color: string;
}

export function RegisterForm() {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Проверка силы пароля
  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score += 1;
    else feedback.push("Минимум 8 символов");

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("Строчная буква");

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("Заглавная буква");

    if (/\d/.test(password)) score += 1;
    else feedback.push("Цифра");

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else feedback.push("Спецсимвол");

    let color = "text-destructive";
    if (score >= 4) color = "text-green-600";
    else if (score >= 3) color = "text-yellow-600";
    else if (score >= 2) color = "text-orange-600";

    return { score, feedback, color };
  };

  const passwordStrength = checkPasswordStrength(formData.password);

  // Валидация имени
  const validateName = (name: string): string | undefined => {
    if (!name) return "Имя обязательно";
    if (name.length < 2) return "Имя должно содержать минимум 2 символа";
    if (name.length > 50) return "Имя не должно превышать 50 символов";
    if (!/^[a-zA-Zа-яА-Я\s\-']+$/.test(name)) return "Имя может содержать только буквы, пробелы, дефисы и апострофы";
    return undefined;
  };

  // Валидация email
  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email обязателен";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Неверный формат email";
    return undefined;
  };

  // Валидация пароля
  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Пароль обязателен";
    if (password.length < 8) return "Пароль должен содержать минимум 8 символов";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      return "Пароль должен содержать строчные и заглавные буквы, цифры и спецсимволы";
    }
    return undefined;
  };

  // Валидация подтверждения пароля
  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) return "Подтверждение пароля обязательно";
    if (confirmPassword !== password) return "Пароли не совпадают";
    return undefined;
  };

  // Обработчик изменения полей
  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Очищаем ошибку поля при вводе
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Валидация в реальном времени
    let fieldError: string | undefined;
    switch (field) {
      case 'name':
        fieldError = validateName(value);
        break;
      case 'email':
        fieldError = validateEmail(value);
        break;
      case 'password':
        fieldError = validatePassword(value);
        // Также проверяем подтверждение пароля
        if (formData.confirmPassword) {
          const confirmError = validateConfirmPassword(formData.confirmPassword, value);
          setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
        break;
      case 'confirmPassword':
        fieldError = validateConfirmPassword(value, formData.password);
        break;
    }

    if (fieldError) {
      setErrors(prev => ({ ...prev, [field]: fieldError }));
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      showError("Требуется согласие", "Пожалуйста, примите условия использования");
      return;
    }

    // Валидация всех полей
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

    if (nameError || emailError || passwordError || confirmPasswordError) {
      setErrors({
        name: nameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
      });
      return;
    }

    try {
      const result = await register(formData.email, formData.password, formData.name);
      if (result === 'pending') {
        success("Подтвердите почту", "Мы отправили письмо с подтверждением. Проверьте входящие/спам.");
        navigate(`/check-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        success("Регистрация успешна!", "Добро пожаловать в TaskFlow Pro");
        navigate("/");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Произошла ошибка при регистрации";
      setErrors({ general: errorMessage });
      showError("Ошибка регистрации", errorMessage);
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
        <h2 className="text-2xl font-bold">Создать аккаунт</h2>
        <p className="text-muted-foreground mt-1">
          Присоединяйтесь к тысячам пользователей
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
            <Link to={`/check-email?email=${encodeURIComponent(formData.email)}`} className="ml-2 underline text-primary">
              Открыть страницу подтверждения
            </Link>
          )}
        </motion.div>
      )}

      {/* Имя поле */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        className="space-y-2"
      >
        <label className="text-sm font-medium">
          Полное имя
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Иван Иванов"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            className={`pl-10 transition-all duration-200 ${
              errors.name
                ? 'border-destructive focus-visible:ring-destructive'
                : focusedField === 'name'
                ? 'border-primary focus-visible:ring-primary'
                : ''
            }`}
            disabled={isLoading}
          />
        </div>
        {errors.name && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive"
          >
            {errors.name}
          </motion.p>
        )}
      </motion.div>

      {/* Email поле */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
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
        transition={{ delay: 0.6, duration: 0.3 }}
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

        {/* Индикатор силы пароля */}
        {formData.password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Сила пароля:</span>
              <span className={`text-xs font-medium ${passwordStrength.color}`}>
                {passwordStrength.score >= 4 ? "Отличный" :
                 passwordStrength.score >= 3 ? "Хороший" :
                 passwordStrength.score >= 2 ? "Средний" : "Слабый"}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  passwordStrength.score >= 4 ? "bg-green-600" :
                  passwordStrength.score >= 3 ? "bg-yellow-600" :
                  passwordStrength.score >= 2 ? "bg-orange-600" : "bg-destructive"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {passwordStrength.feedback.length > 0 && (
              <div className="text-xs text-muted-foreground">
                Требуется: {passwordStrength.feedback.join(", ")}
              </div>
            )}
          </motion.div>
        )}

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

      {/* Подтверждение пароля */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        className="space-y-2"
      >
        <label className="text-sm font-medium">
          Подтверждение пароля
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            onFocus={() => setFocusedField('confirmPassword')}
            onBlur={() => setFocusedField(null)}
            className={`pl-10 pr-10 transition-all duration-200 ${
              errors.confirmPassword
                ? 'border-destructive focus-visible:ring-destructive'
                : focusedField === 'confirmPassword'
                ? 'border-primary focus-visible:ring-primary'
                : formData.confirmPassword && formData.password === formData.confirmPassword
                ? 'border-green-600 focus-visible:ring-green-600'
                : ''
            }`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <Check className="absolute right-10 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
          )}
        </div>
        {errors.confirmPassword && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive"
          >
            {errors.confirmPassword}
          </motion.p>
        )}
      </motion.div>

      {/* Условия использования */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        className="flex items-start space-x-3"
      >
        <input
          type="checkbox"
          id="terms"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border border-input text-primary focus:ring-primary"
          disabled={isLoading}
        />
        <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
          Я согласен с{" "}
          <Link to="/terms" className="text-primary hover:underline">
            условиями использования
          </Link>{" "}
          и{" "}
          <Link to="/privacy" className="text-primary hover:underline">
            политикой конфиденциальности
          </Link>
        </label>
      </motion.div>

      {/* Кнопка регистрации */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.3 }}
      >
        <Button
          type="submit"
          className="w-full h-12 text-base font-medium"
          loading={isLoading}
          disabled={
            isLoading ||
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword ||
            !acceptedTerms ||
            !!errors.name ||
            !!errors.email ||
            !!errors.password ||
            !!errors.confirmPassword ||
            passwordStrength.score < 3
          }
        >
          {isLoading ? (
            "Регистрация..."
          ) : (
            <>
              Создать аккаунт
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </motion.div>

      {/* OAuth Buttons */}
      <OAuthButtons mode="register" disabled={isLoading} />

      {/* Вход */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.3 }}
        className="text-center text-sm text-muted-foreground"
      >
        Уже есть аккаунт?{" "}
        <Link
          to="/login"
          className="text-primary hover:underline font-medium transition-colors"
        >
          Войти
        </Link>
      </motion.div>
    </motion.form>
  );
}
