import { test, expect } from '@playwright/test';

// Проверяем, что текст на кнопках не переносится и есть достаточный горизонтальный зазор
const pages = ['/', '/projects', '/tasks', '/sprints', '/settings', '/login', '/register'];

test.describe('UI Buttons nowrap & spacing', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  for (const path of pages) {
    test(`no wrap on buttons: ${path}`, async ({ page }) => {
      try {
        await page.goto(path, { waitUntil: 'domcontentloaded' });
      } catch (e) {
        test.skip(true, `Пропускаем: не удалось открыть ${path} (возможно, dev-сервер не запущен)`);
      }
      // Дождёмся основной загрузки
      await page.waitForTimeout(200);

      const buttons = page.locator('button');
      const count = await buttons.count();

      for (let i = 0; i < count; i++) {
        const btn = buttons.nth(i);
        // Проверяем, что white-space вычисляется как nowrap
        const whiteSpace = await btn.evaluate((el) => getComputedStyle(el).whiteSpace);
        expect.soft(whiteSpace).toBe('nowrap');

        // Если в кнопке есть иконка и текст, проверим наличие горизонтального gap/отступа
        const hasIconAndText = await btn.evaluate((el) => {
          const svg = el.querySelector('svg');
          const textSpan = Array.from(el.childNodes).some(n => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
          const hasSpanChild = el.querySelector('span');
          return !!svg && (textSpan || !!hasSpanChild);
        });
        if (hasIconAndText) {
          const gap = await btn.evaluate((el) => getComputedStyle(el).gap);
          // допускаем минимум 6px (≈ gap-1.5), по факту у нас gap-2 => 0.5rem
          const gapPx = parseFloat(gap);
          expect.soft(gapPx).toBeGreaterThanOrEqual(6);
        }
      }
    });
  }
});


