# Система Авторизации TaskFlow Pro

## 🎯 Обзор

Современная система авторизации TaskFlow Pro с превосходным UX/UI, созданная с использованием самых передовых практик безопасности и дизайна.

## ✨ Ключевые Особенности

### 🔐 Безопасность

- **JWT Authentication** с refresh tokens
- **bcrypt** хеширование паролей (12 salt rounds)
- **OAuth 2.0** интеграция (Google, GitHub)
- **Rate limiting** и защита от brute force
- **Input validation** и sanitization
- **XSS и CSRF** защита

### 🎨 UX/UI

- **Framer Motion** анимации
- **Real-time validation** с визуальной обратной связью
- **Responsive design** для всех устройств
- **Accessibility** (WCAG compliant)
- **Modern design** с glass morphism эффектами

### 🚀 Производительность

- **Lazy loading** компонентов
- **Optimized animations** с hardware acceleration
- **Efficient state management** с Zustand
- **Minimal bundle size** через tree shaking

## 📁 Архитектура

```text
src/
├── components/
│   ├── auth/
│   │   ├── AuthLayout.tsx          # Основной layout авторизации
│   │   ├── LoginForm.tsx           # Форма входа
│   │   ├── RegisterForm.tsx        # Форма регистрации
│   │   ├── OAuthButtons.tsx        # OAuth интеграция
│   │   └── ProtectedRoute.tsx      # Защищенные роуты
│   └── ui/                        # UI компоненты
├── hooks/
│   └── useAuth.ts                 # Хук авторизации
├── pages/
│   ├── LoginPage.tsx              # Страница входа
│   └── RegisterPage.tsx           # Страница регистрации
├── styles/
│   └── auth.css                   # Специфичные стили авторизации
└── types/
    └── auth.ts                    # TypeScript типы
```

## 🛠 Установка и Настройка

### 1. Environment Variables

Создайте `.env` файл:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_refresh_token_secret
```

### 2. Backend Dependencies

```bash
npm install bcryptjs jsonwebtoken express-validator helmet cors rate-limit
```

### 3. Frontend Dependencies

```bash
npm install framer-motion lucide-react zustand react-router-dom
```

## 🔧 Использование

### Basic Authentication Flow

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { login, register, logout, user, isAuthenticated } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      // Успешный вход - пользователь перенаправлен
    } catch (error) {
      // Обработка ошибки
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Добро пожаловать, {user?.name}!</p>
          <button onClick={logout}>Выйти</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Войти</button>
      )}
    </div>
  );
}
```

### Protected Routes

```typescript
import { PrivateRoute, AdminRoute } from '@/components/auth/ProtectedRoute';

// Защищенный роут для авторизованных пользователей
<PrivateRoute>
  <DashboardPage />
</PrivateRoute>

// Роут только для администраторов
<AdminRoute>
  <AdminPanel />
</AdminRoute>
```

### Form Validation

```typescript
import { LoginForm } from '@/components/auth/LoginForm';

// Полностью функциональная форма с валидацией
<AuthLayout>
  <LoginForm />
</AuthLayout>
```

## 🎨 Кастомизация

### Темы и Стили

Система поддерживает светлую и темную темы:

```css
/* Кастомные CSS переменные */
:root {
  --auth-primary: hsl(240 6% 10%);
  --auth-accent: hsl(240 5% 96%);
  --auth-border: hsl(240 6% 96%);
}

/* Темная тема */
.dark {
  --auth-primary: hsl(0 0% 98%);
  --auth-accent: hsl(240 6% 16%);
  --auth-border: hsl(240 6% 16%);
}
```

### Анимации

Все анимации настраиваемы через Framer Motion:

```typescript
// Кастомная анимация входа
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.3,
    ease: [0.25, 0.46, 0.45, 0.94] // Custom easing
  }}
>
  Content
</motion.div>
```

## 🧪 Тестирование

### Playwright Tests

Запуск тестов:

```bash
# Установка Playwright
npm install -D @playwright/test

# Запуск тестов
npx playwright test

# Запуск с UI
npx playwright test --ui
```

### Test Coverage

Тесты покрывают:

- ✅ **Form Validation**: Email, password, real-time feedback
- ✅ **Authentication Flow**: Login, register, logout
- ✅ **Protected Routes**: Access control, redirects
- ✅ **OAuth Integration**: Google, GitHub flows
- ✅ **Responsive Design**: Mobile, tablet, desktop
- ✅ **Accessibility**: Keyboard navigation, screen readers
- ✅ **Error Handling**: Network errors, validation errors
- ✅ **Security**: XSS prevention, CSRF protection
- ✅ **Performance**: Loading states, animations

## 🔒 Безопасность

### Authentication Security

- **JWT Tokens**: Access (15min) + Refresh (7 days)
- **Password Policy**: 8+ chars, mixed case, numbers, symbols
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Session Management**: Automatic token refresh

### Data Protection

- **Encryption**: bcrypt for passwords, HTTPS required
- **Input Sanitization**: express-validator + client-side validation
- **XSS Prevention**: React's built-in protection + CSP headers
- **CSRF Protection**: SameSite cookies + origin validation

### OAuth Security

- **State Parameter**: CSRF protection
- **PKCE**: Enhanced security for public clients
- **Secure Redirects**: Whitelisted domains only
- **Token Handling**: Secure storage and automatic cleanup

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First */
.auth-card {
  padding: 1.5rem;
  max-width: 100%;
}

/* Tablet */
@media (min-width: 640px) {
  .auth-card {
    padding: 2rem 1.5rem;
    max-width: 28rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .auth-card {
    padding: 2.5rem;
    max-width: 32rem;
  }
}
```

### Touch-Friendly

- **Button Sizes**: Minimum 44px touch targets
- **Form Fields**: Adequate spacing and sizing
- **Gestures**: Swipe-friendly interactions

## ♿ Accessibility

### WCAG 2.1 AA Compliance

- ✅ **Keyboard Navigation**: Full keyboard support
- ✅ **Screen Readers**: Proper ARIA labels and roles
- ✅ **Color Contrast**: WCAG AA compliant colors
- ✅ **Focus Management**: Visible focus indicators
- ✅ **Error Handling**: Accessible error messages

### Implementation

```typescript
// Accessible form fields
<Input
  aria-describedby="email-error"
  aria-invalid={!!errors.email}
/>

// Screen reader announcements
<div role="alert" aria-live="polite">
  {errors.email}
</div>
```

## 🚀 Production Deployment

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
API_URL=<https://api.taskflow.pro>
JWT_SECRET=<strong-random-secret>
DATABASE_URL=<production-db-url>
```

### Security Headers

```typescript
// Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### Monitoring

```typescript
// Error tracking
import * as Sentry from "@sentry/react";

// Performance monitoring
import { datadogRum } from '@datadog/browser-rum';
```

## 📊 Metrics & Analytics

### User Experience Metrics

- **Time to Interactive**: < 2 seconds
- **Form Completion Rate**: > 95%
- **Error Rate**: < 1%
- **Mobile Conversion**: > 90% of desktop

### Security Metrics

- **Failed Login Attempts**: Monitored and alerted
- **Rate Limit Hits**: Tracked for abuse detection
- **Session Duration**: Average and distribution
- **OAuth Success Rate**: > 98%

## 🔄 API Integration

### Backend API Endpoints

```typescript
// Authentication endpoints
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
PATCH /api/auth/me

// OAuth endpoints
GET  /api/auth/google
GET  /api/auth/github
GET  /api/auth/callback
```

### Request/Response Format

```typescript
// Login request
{
  "email": "user@example.com",
  "password": "securepassword"
}

// Success response
{
  "success": true,
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "user"
    },
    "tokens": {
      "access": "jwt-access-token",
      "refresh": "jwt-refresh-token"
    }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Token Expiration

```typescript
// Automatic token refresh
const { refreshToken } = useAuth();

try {
  await refreshToken();
} catch (error) {
  // Redirect to login
  navigate('/login');
}
```

#### 2. Network Errors

```typescript
// Retry logic with exponential backoff
const retryRequest = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000));
    }
  }
};
```

#### 3. OAuth Popup Blocked

```typescript
// Check if popup was blocked
const popup = window.open(url, 'oauth', 'width=500,height=600');

if (!popup) {
  // Show message to user
  alert('Please allow popups for this site');
}
```

## 📚 Дополнительные Ресурсы

### Documentation

- [React Router Documentation](https://reactrouter.com/)
- [Framer Motion Guide](https://www.framer.com/motion/)
- [JWT.io](https://jwt.io/)
- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)

### Tools & Libraries

- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Testing**: Playwright
- **Backend**: Express + Supabase

### Best Practices

- [OWASP Cheat Sheet](https://cheatsheetseries.owasp.org/)
- [Web.dev Security](https://web.dev/security/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

## 🤝 Contributing

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb config with React rules
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality

### Testing

- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **Visual Tests**: Storybook + Chromatic

### Security Reviews

- **Code Reviews**: Required for auth-related changes
- **Security Audits**: Quarterly external audits
- **Dependency Updates**: Automated with Dependabot

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/taskflow/auth/issues)
- **Discussions**: [GitHub Discussions](https://github.com/taskflow/auth/discussions)
- **Email**: <support@taskflow.pro>

---

## Создано с ❤️ для TaskFlow Pro

### Современная авторизация без компромиссов в безопасности и UX
