# Настройка Supabase для TaskFlow Pro

## 🚀 Быстрый старт

### 1. Создайте проект Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Дождитесь завершения настройки

### 2. Получите ключи API

В настройках проекта найдите:

- **Project URL**: `https://your-project-id.supabase.co`
- **anon/public key**: `your-anon-key-here`

### 3. Настройте переменные окружения

Создайте файл `.env` в папке `task-flow-pro` (фронтенд):

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration (для обычного API)
VITE_API_URL=http://localhost:3001/api

# Development
VITE_APP_ENV=development
```

> Важно: переменные Vite должны начинаться с префикса `VITE_`.

### 4. URL/Redirect в Supabase

В Supabase → Authentication → URL Configuration:

- Site URL: укажите фактический адрес фронта (например, `http://localhost:1420`)
- Allowed Redirect URLs: добавьте тот же URL и другие используемые (например, порт, на котором поднялся Vite)

### 5. Запустите приложение

```bash
npm run dev
```

## 🔐 Как работает авторизация

### Автоматическое определение типа авторизации

1. **Supabase настроен** → Используется Supabase Auth
2. **Supabase НЕ настроен** → Используется обычный API
3. **Demo email** → Локальная авторизация без сервера

### Режимы авторизации

#### 🎭 Demo Mode (всегда доступен)

- Email: `demo@taskflow.pro`
- Пароль: любой
- Работает без сервера

#### 🗄️ Supabase Mode

- Настоящая авторизация через Supabase
- Поддержка регистрации, входа, выхода
- Автоматическое обновление токенов

#### 🌐 API Mode

- Обычный REST API
- Требует запущенного backend сервера

## 🧪 Тестирование

### Проверка текущего режима

Откройте консоль браузера на странице логина - вы увидите:

- `🗄️ Using Supabase authentication` - Supabase активен
- `🌐 Making login request` - используется API
- `🎭 Demo login detected` - демо режим

### Создание профилей и триггеров (если нужно)

```sql
-- Таблица профилей
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text default 'user',
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Функция upsert профиля на создание пользователя
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'role','user'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    name = excluded.name,
    role = excluded.role,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

-- Триггер на insert в auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
```

## ⚙️ Настройка аутентификации в Supabase

### 1. Включите Email аутентификацию

1. Перейдите в Authentication → Settings
2. В разделе "Auth Providers" включите Email
3. Настройте параметры (опционально)

### 2. Политики (RLS) для profiles

```sql
alter table public.profiles enable row level security;

create policy if not exists profiles_select_own on public.profiles
  for select using (auth.uid() = id);

create policy if not exists profiles_update_own on public.profiles
  for update using (auth.uid() = id);
```

### 3. Настройка метаданных пользователя

В коде регистрации автоматически устанавливаются:

- `name` - имя пользователя
- `role` - роль (user/admin)

## 🔧 Устранение неполадок

### "Supabase credentials not found"

- Проверьте правильность переменных в `.env`
- Перезапустите dev сервер

### "Auth session missing"

- Проверьте настройки RLS/политик
- Убедитесь, что пользователь подтвердил email

### Бесконечные редиректы

- Очистите localStorage: `localStorage.clear()`
- Проверьте логи в консоли браузера

## 📱 Использование в коде

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { login, register, logout, user, isAuthenticated } = useAuth();

  // Авторизация
  await login('user@example.com', 'password');

  // Регистрация
  await register('user@example.com', 'password', 'User Name');

  // Выход
  await logout();
}
```

## 🎯 Что настроено автоматически

✅ **Demo авторизация** - работает сразу
✅ **Supabase интеграция** - после настройки переменных
✅ **API интеграция** - для обычного backend
✅ **Автоматические редиректы**
✅ **Обновление токенов**
✅ **Обработка ошибок**

Теперь авторизация работает на 100% во всех режимах! 🚀
