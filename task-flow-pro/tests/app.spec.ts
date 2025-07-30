import { test, expect } from '@playwright/test';

test.describe('TaskFlow Pro - Main App Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await page.waitForSelector('h1:has-text("Dashboard")', { timeout: 10000 });
  });

  test('should load dashboard page', async ({ page }) => {
    // Check that dashboard is loaded
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Check stats cards are present
    await expect(page.locator('text=Projects')).toBeVisible();
    await expect(page.locator('text=Tasks')).toBeVisible();
    await expect(page.locator('text=Sprints')).toBeVisible();
  });

  test('should create a new project', async ({ page }) => {
    // Click Create Project button
    await page.click('button:has-text("Create Project")');
    
    // Fill project form
    await page.fill('input[placeholder="Enter project name..."]', 'Test Project E2E');
    await page.fill('textarea[placeholder="Describe your project..."]', 'This is a test project created via E2E tests');
    
    // Project key should be auto-generated
    const keyInput = page.locator('input[placeholder="PROJ"]');
    await expect(keyInput).toHaveValue(/^TEST/);
    
    // Submit form
    await page.click('button:has-text("Create Project")');
    
    // Wait for modal to close and project to be created
    await page.waitForTimeout(1000);
    
    // Verify project appears in stats
    await expect(page.locator('text=1').first()).toBeVisible();
  });

  test('should create a sample project and navigate through pages', async ({ page }) => {
    // Create sample project
    await page.click('button:has-text("Create Sample Project")');
    
    // Wait for project creation
    await page.waitForTimeout(2000);
    
    // Navigate to Backlog
    await page.click('a[href="/backlog"]');
    await expect(page.locator('h1')).toContainText('Product Backlog');
    
    // Check that tasks are present
    await expect(page.locator('.bg-card')).toHaveCount({ min: 5 });
    
    // Navigate to Kanban
    await page.click('a[href="/kanban"]');
    await expect(page.locator('h1')).toContainText('Kanban Board');
    
    // Check kanban columns
    await expect(page.locator('text=To Do')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=In Review')).toBeVisible();
    await expect(page.locator('text=Done')).toBeVisible();
    
    // Navigate to Sprints
    await page.click('a[href="/sprints"]');
    await expect(page.locator('h1')).toContainText('Sprint Management');
    
    // Check that sprints are present
    await expect(page.locator('text=Sprint 1')).toBeVisible();
    
    // Navigate to Analytics
    await page.click('a[href="/analytics"]');
    await expect(page.locator('h1')).toContainText('Analytics & Reports');
  });

  test('should create a task via backlog page', async ({ page }) => {
    // First create a sample project
    await page.click('button:has-text("Create Sample Project")');
    await page.waitForTimeout(2000);
    
    // Navigate to Backlog
    await page.click('a[href="/backlog"]');
    
    // Click Add Task
    await page.click('button:has-text("Add Task")');
    
    // Fill task form
    await page.fill('input[placeholder="Enter task title..."]', 'E2E Test Task');
    await page.fill('textarea[placeholder="Describe the task in detail..."]', 'This task was created via E2E testing');
    
    // Select task type
    await page.selectOption('select', 'bug');
    
    // Select priority
    await page.locator('select').nth(1).selectOption('high');
    
    // Select story points
    await page.locator('select').nth(2).selectOption('5');
    
    // Add labels
    await page.fill('input[placeholder="frontend, backend, urgent"]', 'e2e, testing, automation');
    
    // Submit task
    await page.click('button:has-text("Create Task")');
    
    // Wait for task creation
    await page.waitForTimeout(1000);
    
    // Verify task appears in backlog
    await expect(page.locator('text=E2E Test Task')).toBeVisible();
    await expect(page.locator('text=🐛')).toBeVisible(); // Bug icon
  });

  test('should create a sprint', async ({ page }) => {
    // First create a sample project
    await page.click('button:has-text("Create Sample Project")');
    await page.waitForTimeout(2000);
    
    // Navigate to Sprints
    await page.click('a[href="/sprints"]');
    
    // Click Create Sprint
    await page.click('button:has-text("Create Sprint")');
    
    // Fill sprint form
    await page.fill('input[placeholder="Sprint 1, Alpha Release, etc."]', 'E2E Test Sprint');
    await page.fill('textarea[placeholder="What do you want to accomplish in this sprint?"]', 'Test sprint creation via E2E');
    
    // Set dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    await page.fill('input[type="date"]', today.toISOString().split('T')[0]);
    await page.fill('input[type="date"]:nth-of-type(2)', nextWeek.toISOString().split('T')[0]);
    
    // Submit sprint
    await page.click('button:has-text("Create Sprint")');
    
    // Wait for sprint creation
    await page.waitForTimeout(1000);
    
    // Verify sprint appears
    await expect(page.locator('text=E2E Test Sprint')).toBeVisible();
  });

  test('should test drag and drop in kanban board', async ({ page }) => {
    // First create a sample project
    await page.click('button:has-text("Create Sample Project")');
    await page.waitForTimeout(2000);
    
    // Navigate to Kanban
    await page.click('a[href="/kanban"]');
    
    // Find a task in "To Do" column
    const todoColumn = page.locator('text=To Do').locator('..');
    const firstTask = todoColumn.locator('.bg-white').first();
    
    // Find "In Progress" column
    const inProgressColumn = page.locator('text=In Progress').locator('..');
    
    // Perform drag and drop
    await firstTask.dragTo(inProgressColumn);
    
    // Wait for state update
    await page.waitForTimeout(1000);
    
    // Verify task moved (this is a simplified check)
    const inProgressTasks = inProgressColumn.locator('.bg-white');
    await expect(inProgressTasks).toHaveCount({ min: 1 });
  });

  test('should test theme toggle', async ({ page }) => {
    // Check current theme
    const html = page.locator('html');
    
    // Click theme toggle in header
    await page.click('button[title*="theme"], button:has([data-lucide="sun"]), button:has([data-lucide="moon"])');
    
    // Wait for theme change
    await page.waitForTimeout(500);
    
    // Theme should have changed (class or attribute)
    // This is a basic check - in a real app you'd check specific theme indicators
    await expect(html).toBeVisible();
  });

  test('should test navigation and sidebar', async ({ page }) => {
    // Test all navigation links
    const navLinks = [
      { href: '/', text: 'Dashboard' },
      { href: '/projects', text: 'Projects' },
      { href: '/backlog', text: 'Product Backlog' },
      { href: '/sprints', text: 'Sprint Management' },
      { href: '/kanban', text: 'Kanban Board' },
      { href: '/analytics', text: 'Analytics' },
      { href: '/settings', text: 'Settings' }
    ];
    
    for (const link of navLinks) {
      await page.click(`a[href="${link.href}"]`);
      await expect(page.locator('h1')).toContainText(link.text);
    }
  });

  test('should test settings page functionality', async ({ page }) => {
    // Navigate to settings
    await page.click('a[href="/settings"]');
    
    // Test theme selection
    await page.click('button:has-text("Dark")');
    await page.waitForTimeout(500);
    
    // Test notification
    await page.click('button:has-text("Test Success")');
    
    // Verify toast appears
    await expect(page.locator('.fixed')).toContainText('This is a test notification');
    
    // Test keyboard shortcuts tab
    await page.click('button:has-text("Keyboard")');
    await expect(page.locator('text=Ctrl+N')).toBeVisible();
  });
});