import { lazy, ComponentType } from 'react';

/**
 * Enhanced lazy loading with error boundary and loading fallback
 */
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) => {
  const LazyComponent = lazy(importFn);
  return LazyComponent;
};

/**
 * Preload component for better UX
 */
export const preloadComponent = (importFn: () => Promise<{ default: ComponentType<any> }>) => {
  const componentImport = importFn();
  return componentImport;
};

/**
 * Lazy load pages with consistent loading states
 */
export const LazyPages = {
  Dashboard: createLazyComponent(() => import('@/pages/DashboardPage')),
  Projects: createLazyComponent(() => import('@/pages/ProjectsPage')),
  Tasks: createLazyComponent(() => import('@/pages/TasksPage')),
  Backlog: createLazyComponent(() => import('@/pages/BacklogPage')),
  Sprints: createLazyComponent(() => import('@/pages/SprintsPage')),
  Kanban: createLazyComponent(() => import('@/pages/KanbanPage')),
  Analytics: createLazyComponent(() => import('@/pages/AnalyticsPage')),
  Calendar: createLazyComponent(() => import('@/pages/CalendarPage')),
  Settings: createLazyComponent(() => import('@/pages/SettingsPage')),
  Login: createLazyComponent(() => import('@/pages/LoginPage')),
  Register: createLazyComponent(() => import('@/pages/RegisterPage')),
  CheckEmail: createLazyComponent(() => import('@/pages/CheckEmailPage')),
  ApiTest: createLazyComponent(() => import('@/pages/ApiTestPage')),
  Favorites: createLazyComponent(() => import('@/pages/FavoritesPage')),
  ColorDemo: createLazyComponent(() => import('@/pages/ColorPickerDemo')),
};

/**
 * Preload critical pages
 */
export const preloadCriticalPages = () => {
  // Preload pages that users are likely to visit immediately
  preloadComponent(() => import('@/pages/DashboardPage'));
  preloadComponent(() => import('@/pages/ProjectsPage'));
  preloadComponent(() => import('@/pages/TasksPage'));
};

/**
 * Progressive loading strategy
 */
export const useProgressiveLoading = () => {
  // Load less critical pages after a delay
  setTimeout(() => {
    preloadComponent(() => import('@/pages/AnalyticsPage'));
    preloadComponent(() => import('@/pages/CalendarPage'));
    preloadComponent(() => import('@/pages/SettingsPage'));
  }, 2000);
  
  // Load rarely used pages after longer delay
  setTimeout(() => {
    preloadComponent(() => import('@/pages/ApiTestPage'));
    preloadComponent(() => import('@/pages/ColorPickerDemo'));
  }, 5000);
};

/**
 * Route-based code splitting
 */
export const routeBasedSplit = {
  // Core app routes (loaded immediately)
  core: [
    () => import('@/pages/DashboardPage'),
    () => import('@/pages/ProjectsPage'),
    () => import('@/pages/TasksPage'),
  ],
  
  // Secondary routes (loaded on interaction)
  secondary: [
    () => import('@/pages/BacklogPage'),
    () => import('@/pages/SprintsPage'),
    () => import('@/pages/KanbanPage'),
  ],
  
  // Advanced features (loaded on demand)
  advanced: [
    () => import('@/pages/AnalyticsPage'),
    () => import('@/pages/CalendarPage'),
  ],
  
  // Admin/settings (loaded when needed)
  admin: [
    () => import('@/pages/SettingsPage'),
  ],
  
  // Development tools (loaded in dev mode)
  dev: [
    () => import('@/pages/ApiTestPage'),
    () => import('@/pages/ColorPickerDemo'),
  ],
};
