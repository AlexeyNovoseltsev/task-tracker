# Page snapshot

```yaml
- heading "TaskFlow Pro" [level=1]
- paragraph: Современное управление задачами
- heading "Вход в аккаунт" [level=2]
- paragraph: Введите ваши данные для продолжения
- text: Email
- img
- textbox "your@email.com": invalid-email
- paragraph: Неверный формат email
- text: Пароль
- img
- textbox "••••••••"
- button:
  - img
- link "Забыли пароль?":
  - /url: /forgot-password
- button "Войти" [disabled]:
  - text: Войти
  - img
- text: Или войти через
- button "Google":
  - img
  - text: Google
- button "GitHub":
  - img
  - text: GitHub
- text: Демо-режим OAuth интеграция требует настройки на сервере. В production это будет работать с реальными провайдерами. Нет аккаунта?
- link "Зарегистрироваться":
  - /url: /register
- text: © 2024 TaskFlow Pro. Все права защищены.
```