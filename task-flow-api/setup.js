#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Данные Supabase
const SUPABASE_URL = 'https://vsnxgpaocjuasvbjcudv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzbnhncGFvY2p1YXN2YmpjdWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMDM3NTMsImV4cCI6MjA5NjU3OTc1M30.CUm436GgO-8XDeq1iV_hizRWJd4jDU8cPTQgWm7w8ko';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

console.log('🚀 Настройка TaskFlow Pro...\n');

// Создаем .env файл
const envContent = `# Конфигурация сервера
NODE_ENV=development
PORT=3001
HOST=localhost
CORS_ORIGIN=http://localhost:1420

# Конфигурация Supabase
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}

# Конфигурация JWT
JWT_SECRET=taskflow-pro-super-secret-jwt-key-2025
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Конфигурация файлового хранилища
SUPABASE_STORAGE_BUCKET=taskflow-attachments
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/*,application/pdf,text/*,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

# Ограничение скорости запросов
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Конфигурация WebSocket
SOCKET_IO_CORS_ORIGIN=http://localhost:1420

# Конфигурация логирования
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log

# Конфигурация мониторинга
ENABLE_MONITORING=true
HEALTH_CHECK_INTERVAL=30000
`;

try {
  fs.writeFileSync('.env', envContent);
  console.log('✅ Файл .env успешно создан');
} catch (error) {
  console.error('❌ Ошибка при создании .env файла:', error.message);
  process.exit(1);
}

console.log('\n📋 Следующие шаги:');
console.log('1. Перейдите в Supabase Dashboard: https://supabase.com/dashboard');
console.log('2. Откройте SQL Editor');
console.log('3. Вставьте SUPABASE_SERVICE_KEY из Dashboard → Settings → API');
console.log('4. Миграция уже в Supabase (src/scripts/schema.sql) или через MCP');
console.log('5. Создайте админа: npm run db:seed-admin');
console.log('6. Запустите сервер: npm run dev');
console.log('\n🎉 Настройка завершена!');