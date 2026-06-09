#!/usr/bin/env node

// Простой тест подключения к Supabase
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔍 Тестирование подключения к Supabase...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Ошибка: Не найдены переменные окружения SUPABASE_URL или SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('📡 Проверяем подключение к базе данных...');
    
    // Тест 1: Проверка подключения
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Ошибка подключения:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Подключение к базе данных успешно!');
    console.log(`📊 Найдено пользователей: ${data || 0}`);
    
    // Тест 2: Проверка таблиц
    console.log('\n🔍 Проверяем структуру базы данных...');
    
    const tables = ['users', 'projects', 'tasks', 'sprints', 'comments'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Таблица ${table}: ${error.message}`);
        } else {
          console.log(`✅ Таблица ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Таблица ${table}: Ошибка подключения`);
      }
    }
    
    console.log('\n🎉 Тест подключения завершен!');
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
    process.exit(1);
  }
}

testConnection();