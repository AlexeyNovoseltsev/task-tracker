# TaskFlow Pro API

🚀 **Enterprise-grade backend API** для TaskFlow Pro - современного таск-трекера для продакт-менеджеров.

## 🏗️ **Архитектура**

- **Express.js + TypeScript** - основной API сервер
- **Supabase (PostgreSQL)** - основная база данных
- **Socket.IO** - WebSocket для real-time обновлений
- **Supabase Storage** - хранение файлов и вложений
- **JWT Authentication** - безопасная авторизация
- **Winston** - логирование
- **Express Rate Limiting** - защита от атак

## 📁 **Структура проекта**

```
task-flow-api/
├── src/
│   ├── config/          # Конфигурация приложения
│   │   ├── index.ts     # Основная конфигурация
│   │   └── supabase.ts  # Настройка Supabase клиента
│   ├── middleware/      # Middleware функции
│   │   ├── auth.ts      # Аутентификация и авторизация
│   │   ├── errorHandler.ts # Обработка ошибок
│   │   ├── logger.ts    # Логирование запросов
│   │   └── validation.ts # Валидация входных данных
│   ├── routes/          # API маршруты
│   │   ├── auth.ts      # Авторизация
│   │   ├── projects.ts  # Проекты
│   │   ├── tasks.ts     # Задачи
│   │   ├── sprints.ts   # Спринты
│   │   ├── comments.ts  # Комментарии
│   │   ├── attachments.ts # Вложения
│   │   ├── users.ts     # Пользователи
│   │   ├── analytics.ts # Аналитика
│   │   └── health.ts    # Health check
│   ├── services/        # Бизнес-логика
│   │   └── websocket.ts # WebSocket сервис
│   ├── types/           # TypeScript типы
│   │   └── index.ts     # Общие типы
│   ├── utils/           # Утилиты
│   ├── scripts/         # Скрипты для развертывания
│   │   └── schema.sql   # SQL схема БД
│   └── index.ts         # Точка входа приложения
├── logs/                # Логи приложения
├── package.json         # Зависимости Node.js
├── tsconfig.json        # Конфигурация TypeScript
├── env.example          # Пример переменных окружения
└── README.md           # Этот файл
```

## 🛠️ **Настройка окружения**

### 1. **Клонирование и установка зависимостей**

```bash
# Перейти в папку API
cd task-flow-api

# Установить зависимости
npm install
```

### 2. **Настройка Supabase**

1. Создайте проект на [supabase.com](https://supabase.com)
2. Перейдите в Settings → API и скопируйте:
   - **Project URL**
   - **anon public key**
   - **service_role key**

### 3. **Создание базы данных**

1. В Supabase Dashboard перейдите в **SQL Editor**
2. Выполните скрипт из `src/scripts/schema.sql`
3. Это создаст все необходимые таблицы, индексы и RLS политики

### 4. **Настройка переменных окружения**

```bash
# Скопировать пример файла
cp env.example .env

# Отредактировать .env файл
```

Заполните следующие переменные:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=localhost
CORS_ORIGIN=http://localhost:1420

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# File Storage
SUPABASE_STORAGE_BUCKET=taskflow-attachments
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. **Настройка Storage Bucket**

1. В Supabase Dashboard перейдите в **Storage**
2. Создайте bucket с именем `taskflow-attachments`
3. Настройте политики доступа (или используйте политики из schema.sql)

## 🚀 **Запуск приложения**

### Development режим:
```bash
npm run dev
```

### Production сборка:
```bash
npm run build
npm start
```

### Проверка здоровья:
```bash
# Базовая проверка
curl http://localhost:3001/health

# Детальная проверка
curl http://localhost:3001/health/detailed
```

## 📡 **API Endpoints**

### 🔐 **Аутентификация**
```
POST /api/auth/register     - Регистрация пользователя
POST /api/auth/login        - Вход в систему
POST /api/auth/refresh      - Обновление токена
GET  /api/auth/me          - Профиль пользователя
PATCH /api/auth/me         - Обновление профиля
POST /api/auth/logout      - Выход из системы
```

### 📁 **Проекты**
```
GET    /api/projects        - Список проектов
POST   /api/projects        - Создание проекта
GET    /api/projects/:id    - Детали проекта
PATCH  /api/projects/:id    - Обновление проекта
DELETE /api/projects/:id    - Архивирование проекта

GET    /api/projects/:id/members     - Участники проекта
POST   /api/projects/:id/members     - Добавить участника
PATCH  /api/projects/:id/members/:id - Изменить роль
DELETE /api/projects/:id/members/:id - Удалить участника
```

### 📋 **Задачи, Спринты, Комментарии**
```
# Задачи
GET    /api/tasks          - Список задач
POST   /api/tasks          - Создание задачи
GET    /api/tasks/:id      - Детали задачи
PATCH  /api/tasks/:id      - Обновление задачи
DELETE /api/tasks/:id      - Удаление задачи

# Спринты
GET    /api/sprints        - Список спринтов
POST   /api/sprints        - Создание спринта
# ... аналогично

# Комментарии
GET    /api/comments       - Список комментариев
POST   /api/comments       - Создание комментария
# ... аналогично
```

### 📊 **Аналитика**
```
GET /api/analytics/projects/:id - Аналитика проекта
GET /api/analytics/dashboard    - Дашборд аналитики
```

### 🏥 **Health Check**
```
GET /health          - Базовая проверка
GET /health/detailed - Детальная диагностика
GET /health/ready    - Readiness probe (K8s)
GET /health/live     - Liveness probe (K8s)
```

## 🔌 **WebSocket Events**

### Подключение:
```javascript
const socket = io('ws://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### События:
```javascript
// Присоединение к проекту
socket.emit('join:project', 'project-id');

// Подписка на задачу
socket.emit('subscribe:task', 'task-id');

// Обновления задач в реальном времени
socket.on('task:updated', (event) => {
  console.log('Task updated:', event.payload);
});

// Новые комментарии
socket.on('comment:added', (event) => {
  console.log('New comment:', event.payload);
});
```

## 🛡️ **Безопасность**

### Реализованные меры:
- **JWT Authentication** с refresh токенами
- **Row Level Security (RLS)** в Supabase
- **Rate Limiting** (100 запросов за 15 минут)
- **CORS** настроен для фронтенда
- **Helmet.js** для HTTP заголовков безопасности
- **Input validation** через express-validator
- **SQL Injection** защита через Supabase ORM

### Авторизация:
- **Project-based access control**
- **Role-based permissions** (owner, admin, member, viewer)
- **Resource ownership** проверки

## 📈 **Мониторинг**

### Логирование:
- **Winston** для структурированных логов
- **Security events** логирование
- **Performance monitoring** медленных запросов
- **Database operations** логирование

### Health Checks:
- **Database connectivity**
- **Storage availability**
- **WebSocket status**
- **Memory usage**
- **System uptime**

## 🔄 **Development**

### Полезные команды:
```bash
# Разработка с hot reload
npm run dev

# Линтинг кода
npm run lint

# Тестирование
npm test

# Сборка для продакшена
npm run build

# Миграции БД
npm run db:migrate

# Seed данные
npm run db:seed
```

### TypeScript:
- Строгий режим включен
- Path mapping настроен (@/* алиасы)
- Полная типизация API и БД

## 🚢 **Production Deployment**

### Docker:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["npm", "start"]
```

### Environment Variables:
```env
NODE_ENV=production
JWT_SECRET=your-production-secret
SUPABASE_URL=your-production-url
# ... остальные переменные
```

### Kubernetes:
- Настройте **readiness** и **liveness** probes
- Используйте **secrets** для чувствительных данных
- Настройте **horizontal pod autoscaling**

## 📚 **Дополнительно**

### Полезные ссылки:
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Winston Logging](https://github.com/winstonjs/winston)

### Troubleshooting:
1. **Проблемы с подключением к БД**: Проверьте SUPABASE_URL и ключи
2. **CORS ошибки**: Настройте CORS_ORIGIN в .env
3. **WebSocket не работает**: Проверьте SOCKET_IO_CORS_ORIGIN
4. **Rate limiting**: Увеличьте лимиты в конфигурации

---

## 🎯 **Статус проекта**

✅ **Завершено:**
- Express.js API с TypeScript
- Supabase интеграция и схема БД
- WebSocket real-time обновления
- JWT аутентификация и авторизация
- Система логирования и мониторинга
- Health checks и безопасность

🔄 **В разработке:**
- Полная реализация всех API endpoints
- Интеграция с frontend
- Unit и integration тесты
- Docker контейнеризация

📋 **Планы:**
- GraphQL endpoint (опционально)
- Redis для кеширования
- Elasticsearch для поиска
- Микросервисная архитектура