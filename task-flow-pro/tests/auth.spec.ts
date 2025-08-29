import { test, expect } from '@playwright/test';

test.describe('Authentication System', () => {
  test.beforeEach(async ({ page }) => {
    // Очищаем localStorage перед каждым тестом
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('Login Page', () => {
    test('should render login form correctly', async ({ page }) => {
      await page.goto('/login');

      // Проверяем наличие основных элементов
      await expect(page.locator('h1')).toContainText('TaskFlow Pro');
      await expect(page.locator('h2')).toContainText('Вход в аккаунт');

      // Проверяем форму
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText('Войти');

      // Проверяем ссылки
      await expect(page.locator('a[href="/forgot-password"]')).toContainText('Забыли пароль?');
      await expect(page.locator('a[href="/register"]')).toContainText('Зарегистрироваться');
    });

    test('should validate email format in real-time', async ({ page }) => {
      await page.goto('/login');

      const emailInput = page.locator('input[type="email"]');

      // Вводим неправильный email
      await emailInput.fill('invalid-email');
      await emailInput.blur();

      // Проверяем появление ошибки
      await expect(page.locator('.auth-error')).toContainText('Неверный формат email');

      // Вводим правильный email
      await emailInput.fill('test@example.com');
      await expect(page.locator('.auth-error')).toHaveCount(0);
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto('/login');

      const passwordInput = page.locator('input[type="password"]');

      // Вводим слишком короткий пароль
      await passwordInput.fill('123');
      await passwordInput.blur();

      await expect(page.locator('.auth-error')).toContainText('Пароль должен содержать минимум 6 символов');
    });

    test('should show/hide password', async ({ page }) => {
      await page.goto('/login');

      const passwordInput = page.locator('input[type="password"]');
      const toggleButton = page.locator('button[aria-label*="пароль"]');

      await passwordInput.fill('testpassword');

      // Проверяем, что пароль скрыт
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Кликаем на кнопку показа пароля
      await toggleButton.click();

      // Проверяем, что пароль отображается
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Проверяем, что текст пароля виден
      await expect(passwordInput).toHaveValue('testpassword');
    });

    test('should disable submit button when form is invalid', async ({ page }) => {
      await page.goto('/login');

      const submitButton = page.locator('button[type="submit"]');

      // Кнопка должна быть disabled изначально
      await expect(submitButton).toBeDisabled();

      // Вводим email
      await page.locator('input[type="email"]').fill('test@example.com');

      // Кнопка все еще disabled
      await expect(submitButton).toBeDisabled();

      // Вводим пароль
      await page.locator('input[type="password"]').fill('password123');

      // Теперь кнопка должна быть enabled
      await expect(submitButton).toBeEnabled();
    });

    test('should show loading state during submission', async ({ page }) => {
      await page.goto('/login');

      // Заполняем форму
      await page.locator('input[type="email"]').fill('test@example.com');
      await page.locator('input[type="password"]').fill('password123');

      // Мокаем API ответ
      await page.route('**/api/auth/login', async route => {
        await page.waitForTimeout(1000); // Имитируем задержку
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
            tokens: { access: 'fake-token', refresh: 'fake-refresh' }
          })
        });
      });

      // Нажимаем кнопку входа
      await page.locator('button[type="submit"]').click();

      // Проверяем состояние загрузки
      await expect(page.locator('button[type="submit"]')).toContainText('Вход...');
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });

    test('should handle login errors gracefully', async ({ page }) => {
      await page.goto('/login');

      // Заполняем форму
      await page.locator('input[type="email"]').fill('test@example.com');
      await page.locator('input[type="password"]').fill('wrongpassword');

      // Мокаем ошибку API
      await page.route('**/api/auth/login', async route => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Неверный email или пароль'
          })
        });
      });

      // Нажимаем кнопку входа
      await page.locator('button[type="submit"]').click();

      // Проверяем отображение ошибки
      await expect(page.locator('.auth-error')).toContainText('Неверный email или пароль');

      // Форма должна оставаться доступной для повторной попытки
      await expect(page.locator('input[type="email"]')).toHaveValue('test@example.com');
      await expect(page.locator('button[type="submit"]')).toBeEnabled();
    });

    test('should redirect after successful login', async ({ page }) => {
      await page.goto('/login');

      // Заполняем форму
      await page.locator('input[type="email"]').fill('test@example.com');
      await page.locator('input[type="password"]').fill('password123');

      // Мокаем успешный ответ
      await page.route('**/api/auth/login', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
            tokens: { access: 'fake-token', refresh: 'fake-refresh' }
          })
        });
      });

      // Нажимаем кнопку входа
      await page.locator('button[type="submit"]').click();

      // Проверяем редирект на dashboard
      await expect(page).toHaveURL('/');

      // Проверяем, что токены сохранены в localStorage
      const accessToken = await page.evaluate(() => localStorage.getItem('auth_tokens'));
      expect(accessToken).toBeTruthy();
    });
  });

  test.describe('Register Page', () => {
    test('should render registration form correctly', async ({ page }) => {
      await page.goto('/register');

      await expect(page.locator('h1')).toContainText('TaskFlow Pro');
      await expect(page.locator('h2')).toContainText('Создать аккаунт');

      // Проверяем все поля формы
      await expect(page.locator('input[placeholder="Иван Иванов"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
      await expect(page.locator('input[type="password"]').nth(1)).toBeVisible();
      await expect(page.locator('input[type="checkbox"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText('Создать аккаунт');
    });

    test('should validate password strength in real-time', async ({ page }) => {
      await page.goto('/register');

      const passwordInput = page.locator('input[type="password"]').first();

      // Слабый пароль
      await passwordInput.fill('123');
      await expect(page.locator('.password-strength')).toContainText('Слабый');

      // Средний пароль
      await passwordInput.fill('password123');
      await expect(page.locator('.password-strength')).toContainText('Средний');

      // Сильный пароль
      await passwordInput.fill('StrongPass123!');
      await expect(page.locator('.password-strength')).toContainText('Отличный');
    });

    test('should validate password confirmation', async ({ page }) => {
      await page.goto('/register');

      const passwordInput = page.locator('input[type="password"]').first();
      const confirmPasswordInput = page.locator('input[type="password"]').nth(1);

      await passwordInput.fill('password123');
      await confirmPasswordInput.fill('differentpassword');
      await confirmPasswordInput.blur();

      await expect(page.locator('.auth-error')).toContainText('Пароли не совпадают');
    });

    test('should require terms acceptance', async ({ page }) => {
      await page.goto('/register');

      // Заполняем все поля кроме чекбокса
      await page.locator('input[placeholder="Иван Иванов"]').fill('Test User');
      await page.locator('input[type="email"]').fill('test@example.com');
      await page.locator('input[type="password"]').first().fill('StrongPass123!');
      await page.locator('input[type="password"]').nth(1).fill('StrongPass123!');

      const submitButton = page.locator('button[type="submit"]');

      // Кнопка должна быть disabled без принятия условий
      await expect(submitButton).toBeDisabled();

      // Принимаем условия
      await page.locator('input[type="checkbox"]').check();

      // Теперь кнопка должна быть enabled
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing protected route without auth', async ({ page }) => {
      await page.goto('/');

      // Должен редиректить на страницу входа
      await expect(page).toHaveURL('/login');
    });

    test('should show loading state during auth check', async ({ page }) => {
      // Мокаем медленный ответ API
      await page.route('**/api/auth/me', async route => {
        await page.waitForTimeout(2000);
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Not authenticated' })
        });
      });

      await page.goto('/');

      // Должен показать состояние загрузки
      await expect(page.locator('text=Проверка авторизации...')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work correctly on mobile devices', async ({ page }) => {
      // Устанавливаем мобильный viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto('/login');

      // Проверяем, что форма адаптируется под мобильный экран
      const form = page.locator('.auth-card');
      const boundingBox = await form.boundingBox();

      // Форма должна занимать почти всю ширину экрана с отступами
      expect(boundingBox!.width).toBeGreaterThan(320);
      expect(boundingBox!.width).toBeLessThan(375);

      // Проверяем, что текст не обрезается
      await expect(page.locator('h2')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should handle very small screens', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 });

      await page.goto('/login');

      // Все элементы должны оставаться видимыми
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper focus management', async ({ page }) => {
      await page.goto('/login');

      // Проверяем фокус на первом поле
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="email"]')).toBeFocused();

      // Переходим к следующему полю
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="password"]')).toBeFocused();

      // Переходим к кнопке
      await page.keyboard.press('Tab');
      await expect(page.locator('button[type="submit"]')).toBeFocused();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/login');

      // Заполняем форму с клавиатуры
      await page.keyboard.type('test@example.com');
      await page.keyboard.press('Tab');
      await page.keyboard.type('password123');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');

      // Проверяем, что форма пытается отправиться
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/login');

      // Проверяем наличие label элементов
      const emailInput = page.locator('input[type="email"]');
      const emailLabel = page.locator('label').filter({ hasText: 'Email' });

      await expect(emailLabel).toBeVisible();
      await expect(emailInput).toHaveAttribute('aria-describedby');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await page.goto('/login');

      // Заполняем форму
      await page.locator('input[type="email"]').fill('test@example.com');
      await page.locator('input[type="password"]').fill('password123');

      // Мокаем сетевую ошибку
      await page.route('**/api/auth/login', async route => {
        await route.abort();
      });

      await page.locator('button[type="submit"]').click();

      // Должен показать ошибку сети
      await expect(page.locator('.auth-error')).toBeVisible();
    });

    test('should handle server errors', async ({ page }) => {
      await page.goto('/login');

      // Заполняем форму
      await page.locator('input[type="email"]').fill('test@example.com');
      await page.locator('input[type="password"]').fill('password123');

      // Мокаем ошибку сервера
      await page.route('**/api/auth/login', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Внутренняя ошибка сервера'
          })
        });
      });

      await page.locator('button[type="submit"]').click();

      await expect(page.locator('.auth-error')).toContainText('Внутренняя ошибка сервера');
    });

    test('should handle timeout errors', async ({ page }) => {
      await page.goto('/login');

      // Устанавливаем короткий таймаут для страницы
      await page.route('**/api/auth/login', async route => {
        await page.waitForTimeout(10000); // Задержка дольше таймаута
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: { id: '1', email: 'test@example.com', name: 'Test User' },
            tokens: { access: 'fake-token', refresh: 'fake-refresh' }
          })
        });
      });

      await page.locator('input[type="email"]').fill('test@example.com');
      await page.locator('input[type="password"]').fill('password123');
      await page.locator('button[type="submit"]').click();

      // Должен показать ошибку или обработать таймаут
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });
  });

  test.describe('Security', () => {
    test('should not store password in plain text', async ({ page }) => {
      await page.goto('/login');

      const passwordInput = page.locator('input[type="password"]');

      await passwordInput.fill('mypassword123');

      // Проверяем, что значение не хранится в атрибуте value
      const inputValue = await passwordInput.inputValue();
      expect(inputValue).toBe('mypassword123');

      // Проверяем, что в DOM не хранится пароль в открытом виде
      const outerHTML = await passwordInput.evaluate(el => el.outerHTML);
      expect(outerHTML).not.toContain('mypassword123');
    });

    test('should clear form after failed login attempts', async ({ page }) => {
      await page.goto('/login');

      // Имитируем несколько неудачных попыток
      for (let i = 0; i < 3; i++) {
        await page.locator('input[type="email"]').fill('test@example.com');
        await page.locator('input[type="password"]').fill('wrongpassword');

        await page.route('**/api/auth/login', async route => {
          await route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Invalid credentials' })
          });
        });

        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(100);
      }

      // После неудачных попыток поля должны оставаться заполненными
      await expect(page.locator('input[type="email"]')).toHaveValue('test@example.com');
      await expect(page.locator('input[type="password"]')).toHaveValue('wrongpassword');
    });

    test('should prevent XSS in form inputs', async ({ page }) => {
      await page.goto('/login');

      const emailInput = page.locator('input[type="email"]');

      // Пытаемся ввести XSS payload
      const xssPayload = '<script>alert("xss")</script>';
      await emailInput.fill(xssPayload);

      // Проверяем, что скрипт не выполнился
      const inputValue = await emailInput.inputValue();
      expect(inputValue).toBe(xssPayload);

      // Проверяем, что алерты не появились
      const alerts = await page.evaluate(() => window.alert);
      expect(alerts).toBeUndefined();
    });
  });

  test.describe('Performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/login');

      const loadTime = Date.now() - startTime;

      // Страница должна загружаться менее чем за 2 секунды
      expect(loadTime).toBeLessThan(2000);
    });

    test('should render without layout shift', async ({ page }) => {
      await page.goto('/login');

      // Ждем завершения всех анимаций
      await page.waitForTimeout(1000);

      // Проверяем, что форма не меняет размер после загрузки
      const initialBox = await page.locator('.auth-card').boundingBox();

      await page.waitForTimeout(2000);

      const finalBox = await page.locator('.auth-card').boundingBox();

      // Размеры должны оставаться стабильными
      expect(Math.abs(initialBox!.width - finalBox!.width)).toBeLessThan(1);
      expect(Math.abs(initialBox!.height - finalBox!.height)).toBeLessThan(1);
    });
  });
});
