import React, { useEffect, useState } from 'react';
import { useApiHealth, useProjects } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Server, Database, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export default function ApiTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [dbTestData, setDbTestData] = useState<any>(null);
  const [dbTestLoading, setDbTestLoading] = useState(false);
  const [dbTestError, setDbTestError] = useState<string | null>(null);
  const { data: healthData, loading: healthLoading, error: healthError, checkHealth } = useApiHealth();
  const { data: projectsData, loading: projectsLoading, error: projectsError, fetchProjects } = useProjects();
  const { success, error, warning, info } = useToast();

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionStatus('checking');
    try {
      await checkHealth();
      setConnectionStatus('connected');
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const testProjects = async () => {
    try {
      await fetchProjects();
    } catch (error) {
      console.error('Ошибка при загрузке проектов:', error);
    }
  };

  const testCreateProject = async () => {
    try {
      const newProject = {
        name: 'Тестовый проект',
        description: 'Создан через API',
        key: 'TEST',
        color: '#3B82F6'
      };
      
      const result = await api.createProject(newProject);
      console.log('Проект создан:', result);
      await fetchProjects(); // Обновляем список
    } catch (error) {
      console.error('Ошибка при создании проекта:', error);
    }
  };

  const testDatabaseConnection = async () => {
    setDbTestLoading(true);
    setDbTestError(null);
    setDbTestData(null);
    
    try {
      const result = await api.testDatabase();
      setDbTestData(result);
      success("База данных", "Подключение к базе данных успешно!", 4000);
    } catch (error) {
      setDbTestError(error instanceof Error ? error.message : 'Неизвестная ошибка');
      error("Ошибка подключения", "Не удалось подключиться к базе данных", 5000);
    } finally {
      setDbTestLoading(false);
    }
  };

  const testNotifications = () => {
    success("Успех!", "Это красивое уведомление об успехе", 3000);
    
    setTimeout(() => {
      info("Информация", "Уведомление с информацией о системе", 4000);
    }, 1000);
    
    setTimeout(() => {
      warning("Предупреждение", "Это уведомление предупреждает о важном событии", 5000);
    }, 2000);
    
    setTimeout(() => {
      error("Ошибка", "Демонстрация уведомления об ошибке", 4000);
    }, 3000);
  };

  const getStatusIcon = (status: typeof connectionStatus) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = (status: typeof connectionStatus) => {
    switch (status) {
      case 'checking':
        return 'Проверка...';
      case 'connected':
        return 'Подключено';
      case 'disconnected':
        return 'Отключено';
    }
  };

  const getStatusColor = (status: typeof connectionStatus) => {
    switch (status) {
      case 'checking':
        return 'secondary';
      case 'connected':
        return 'default';
      case 'disconnected':
        return 'destructive';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Тест API подключения</h1>
        <p className="text-muted-foreground">
          Проверка подключения между frontend и backend API
        </p>
      </div>

      <div className="grid gap-6">
        {/* Статус подключения */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Статус подключения к API
            </CardTitle>
            <CardDescription>
              Проверка доступности backend сервера на localhost:3001
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(connectionStatus)}
                <span className="font-medium">{getStatusText(connectionStatus)}</span>
                <Badge variant={getStatusColor(connectionStatus)}>
                  {connectionStatus === 'connected' ? 'API доступен' : 
                   connectionStatus === 'disconnected' ? 'API недоступен' : 'Проверка...'}
                </Badge>
              </div>
              <Button onClick={testConnection} disabled={healthLoading}>
                {healthLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wifi className="h-4 w-4 mr-2" />}
                Проверить снова
              </Button>
            </div>

            {healthData && (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">✅ Ответ сервера:</h4>
                <pre className="text-sm text-green-700 dark:text-green-300">
                  {JSON.stringify(healthData, null, 2)}
                </pre>
              </div>
            )}

            {healthError && (
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">❌ Ошибка подключения:</h4>
                <p className="text-sm text-red-700 dark:text-red-300">{healthError}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Тест базы данных - Прямое подключение */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Тест базы данных (Прямое подключение)
            </CardTitle>
            <CardDescription>
              Прямая проверка подключения к Supabase без авторизации
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button onClick={testDatabaseConnection} disabled={dbTestLoading}>
                {dbTestLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
                Тест подключения к БД
              </Button>
            </div>

            {dbTestData && (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                  ✅ Результат теста БД: {dbTestData.summary}
                </h4>
                <div className="space-y-2">
                  {dbTestData.tests?.map((test: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{test.name}:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={test.success ? 'default' : 'destructive'}>
                          {test.success ? '✓' : '✗'}
                        </Badge>
                        {test.count !== undefined && <span>({test.count} записей)</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium">Показать полный ответ</summary>
                  <pre className="text-xs text-green-700 dark:text-green-300 mt-2 overflow-auto">
                    {JSON.stringify(dbTestData, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {dbTestError && (
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">❌ Ошибка подключения к БД:</h4>
                <p className="text-sm text-red-700 dark:text-red-300">{dbTestError}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Тест базы данных - Через авторизацию */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Тест API с авторизацией
            </CardTitle>
            <CardDescription>
              Проверка операций с данными через авторизованные API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button onClick={testProjects} disabled={projectsLoading}>
                {projectsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Получить проекты
              </Button>
              <Button onClick={testCreateProject} variant="outline">
                Создать тестовый проект
              </Button>
            </div>

            {projectsData && (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  📊 Найдено проектов: {projectsData.length}
                </h4>
                {projectsData.length > 0 ? (
                  <pre className="text-sm text-blue-700 dark:text-blue-300 overflow-auto">
                    {JSON.stringify(projectsData, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Проектов пока нет. Создайте первый проект для тестирования!
                  </p>
                )}
              </div>
            )}

            {projectsError && (
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">❌ Ошибка базы данных:</h4>
                <p className="text-sm text-red-700 dark:text-red-300">{projectsError}</p>
                <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-xs">
                  <strong>Примечание:</strong> Ошибка HTTP 401 означает, что требуется авторизация. 
                  Используйте тест "Прямое подключение" выше для проверки БД без авторизации.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Тест уведомлений */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Тест новых уведомлений
            </CardTitle>
            <CardDescription>
              Демонстрация красивых уведомлений с пастельными цветами
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-4">
              <Button onClick={testNotifications} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Показать все уведомления
              </Button>
              <Button onClick={() => success("Успех!", "Уведомление об успехе", 3000)} variant="outline" className="gap-2">
                Успех
              </Button>
              <Button onClick={() => info("Информация", "Информационное уведомление", 3000)} variant="outline" className="gap-2">
                Инфо
              </Button>
              <Button onClick={() => warning("Предупреждение", "Предупреждающее уведомление", 3000)} variant="outline" className="gap-2">
                Предупреждение
              </Button>
              <Button onClick={() => error("Ошибка", "Уведомление об ошибке", 3000)} variant="outline" className="gap-2">
                Ошибка
              </Button>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                ✨ Новые функции уведомлений:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Красивые пастельные цвета</li>
                <li>• Полупрозрачный фон с blur эффектом</li>
                <li>• Плавные анимации появления/исчезновения</li>
                <li>• Автозакрытие через заданное время</li>
                <li>• Современный дизайн в левом нижнем углу</li>
                <li>• Поддержка темной темы</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Инструкции */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Инструкции по устранению проблем</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">🔧 Настройка окружения:</h4>
                <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                  <li>Создайте файл <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.env</code> в папке <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">task-flow-api</code></li>
                  <li>Получите Supabase URL и ключи в панели управления Supabase</li>
                  <li>Скопируйте содержимое из <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">env.example</code> и заполните настоящими значениями</li>
                  <li>Запустите backend сервер: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">npm run dev</code></li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">🚨 Если API недоступен:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Убедитесь, что backend сервер запущен (npm run dev в task-flow-api)</li>
                  <li>• Проверьте, что сервер работает на порту 3001</li>
                  <li>• Убедитесь, что .env файл создан и настроен правильно</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">🗄️ Если тест БД не работает:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Проверьте SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY в .env</li>
                  <li>• Выполните миграцию схемы БД: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">schema.sql</code></li>
                  <li>• Убедитесь, что проект Supabase активен и доступен</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">🔐 Ошибка HTTP 401 (авторизация):</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Это нормально для API с авторизацией - используйте "Прямое подключение"</li>
                  <li>• Для полноценной работы нужно настроить систему авторизации</li>
                  <li>• Проверьте RLS политики в Supabase</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}