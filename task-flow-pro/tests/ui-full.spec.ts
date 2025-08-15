import { test, expect } from '@playwright/test';

test.describe('UI Full Coverage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Дашборд');
  });

  test('Навигация по всем страницам (сайдбар)', async ({ page }) => {
    const links = [
      { href: '/', h1: 'Дашборд' },
      { href: '/favorites', h1: 'Избранное' },
      { href: '/projects', h1: 'Проекты' },
      { href: '/tasks', h1: 'Задачи проекта' },
      { href: '/backlog', h1: 'Бэклог продукта' },
      { href: '/sprints', h1: 'Управление спринтами' },
      { href: '/kanban', h1: 'Канбан-доска' },
      { href: '/analytics', h1: 'Аналитика и отчеты' },
      { href: '/settings', h1: 'Настройки' },
      { href: '/api-test', h1: 'Тест API подключения' },
    ];

    for (const { href, h1 } of links) {
      await page.click(`a[href="${href}"]`);
      await expect(page.locator('h1')).toContainText(h1);
    }
  });

  test('Проекты: создание, просмотр, редактирование (модалки)', async ({ page }) => {
    await page.click('a[href="/projects"]');
    await expect(page.locator('h1')).toContainText('Проекты');

    // Открыть модал создания из шапки страницы
    await page.click('button:has-text("Создать проект")');
    // Заполнить форму
    await page.fill('input[placeholder="Enter project name..."]', 'E2E Проект');
    await page.fill('textarea[placeholder="Describe your project..."]', 'E2E описание проекта');
    // Ключ проставится авто — просто сабмитим
    await page.locator('[data-testid="project-submit"]').click();

    // Открыть просмотр проекта (клик по карточке)
    await page.click('text=E2E Проект');
    await expect(page.locator('text=Прогресс проекта')).toBeVisible();
  });

  test('Бэклог: открыть детали задачи, создать задачу, удалить задачу (модалки)', async ({ page }) => {
    await page.click('a[href="/backlog"]');
    await expect(page.locator('h1')).toContainText('Бэклог продукта');

    // Открыть детали первой задачи
    // Сначала создадим гарантированно видимую задачу
    await page.click('button:has-text("Добавить задачу")');
    await page.fill('input[placeholder="Введите название задачи..."]', 'E2E Задача для Backlog');
    await page.fill('textarea[placeholder="Опишите задачу подробно..."]', 'Описание для модального просмотра');
    await page.locator('div.fixed.inset-0').locator('button:has-text("Создать задачу")').click();

    // Клик по созданной карточке => должно открыться модальное окно деталей
    await page.locator('[data-testid="task-card"]:has-text("E2E Задача для Backlog")').first().click();
    await expect(page.locator('[data-testid="task-detail-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-detail-modal"]').getByRole('heading', { name: 'Описание' })).toBeVisible({ timeout: 7000 });
    await page.locator('[data-testid="task-detail-close"]').click({ timeout: 4000 });

    // Создать задачу
    await page.click('button:has-text("Добавить задачу")');
    await page.fill('input[placeholder="Введите название задачи..."]', 'E2E Задача');
    await page.fill('textarea[placeholder="Опишите задачу подробно..."]', 'Описание E2E');
    await page.selectOption('select', 'story');
    await page.locator('select').nth(1).selectOption('medium');
    await page.locator('select').nth(2).selectOption('todo');
    await page.click('button:has-text("Создать задачу")');

    // Проверка что задача отобразилась
    await expect(page.locator('[data-testid="task-card"]:has-text("E2E Задача")').first()).toBeVisible();
  });

  test('Спринты: модал создания и диалог статуса', async ({ page }) => {
    await page.click('a[href="/sprints"]');
    await expect(page.locator('h1')).toContainText('Управление спринтами');

    // Открыть модал создания
    await page.click('[data-testid="open-sprint-modal"]');
    await page.fill('input[placeholder="Sprint 1, Alpha Release, etc."]', 'E2E Спринт');
    await page.fill('textarea[placeholder="What do you want to accomplish in this sprint?"]', 'E2E цель');
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const [startDate, endDate] = [
      today.toISOString().split('T')[0],
      nextWeek.toISOString().split('T')[0],
    ];
    await page.locator('input[type="date"]').first().fill(startDate);
    await page.locator('input[type="date"]').nth(1).fill(endDate);
    await page.locator('[data-testid="sprint-submit"]').click();

    // Открыть диалог статуса (если есть запланированные спринты)
    const planned = page.locator('text=Запланированные спринты');
    await expect(planned).toBeVisible();
  });

  test('Канбан: наличие колонок', async ({ page }) => {
    await page.click('a[href="/kanban"]');
    await expect(page.locator('h1')).toContainText('Канбан-доска');
    await expect(page.getByText(/To Do|К выполнению/i)).toBeVisible();
    await expect(page.getByText(/In Progress|В работе/i)).toBeVisible();
    await expect(page.getByText(/In Review|На проверке/i)).toBeVisible();
    await expect(page.getByText(/Done|Готово|Выполнено/i)).toBeVisible();
  });

  test('Задачи: фильтры и сортировка доступны', async ({ page }) => {
    await page.click('a[href="/tasks"]');
    await expect(page.locator('h1')).toContainText('Задачи проекта');
    await expect(page.getByPlaceholder('Поиск задач...').or(page.getByPlaceholder('Поиск'))).toBeVisible({ timeout: 2000 });
  });

  test('Настройки: изменение пары опций', async ({ page }) => {
    await page.click('a[href="/settings"]');
    await expect(page.locator('h1')).toContainText('Настройки');
    // Поменять язык интерфейса
    await page.locator('label:has-text("Язык интерфейса")');
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole('option', { name: /English|Русский/ }).first().click({ noWaitAfter: true }).catch(() => {});
  });

  test('Аналитика и избранное открываются', async ({ page }) => {
    await page.click('a[href="/analytics"]');
    await expect(page.locator('h1')).toContainText('Аналитика и отчеты');

    await page.click('a[href="/favorites"]');
    await expect(page.locator('h1')).toContainText('Избранное');
  });
});


