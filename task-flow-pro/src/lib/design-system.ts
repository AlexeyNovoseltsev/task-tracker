// Цветовая палитра из Figma
export const COLORS = {
  // Основные цвета из Figma
  primary: {
    50: '#eaf8ff',   // Светло-голубой фон
    100: '#d1f2ff',  // Голубой фон
    200: '#b3e5ff',  // Средний голубой
    300: '#85d4ff',  // Яркий голубой
    400: '#4dc4ff',  // Основной голубой
    500: '#2cb5ff',  // Темный голубой
    600: '#1a9eff',  // Очень темный голубой
    700: '#0d8cff',  // Насыщенный голубой
    800: '#0077e6',  // Глубокий голубой
    900: '#005bb3',  // Очень глубокий голубой
  },
  // Акцентные цвета из Figma
  accent: {
    purple: '#9c27b0',    // Фиолетовый
    pink: '#e91e63',      // Розовый
    orange: '#ff9800',    // Оранжевый
    yellow: '#ffc107',    // Желтый
    green: '#4caf50',     // Зеленый
    teal: '#009688',      // Бирюзовый
    cyan: '#00bcd4',      // Циан
    blue: '#2196f3',      // Синий
    indigo: '#3f51b5',    // Индиго
    red: '#f44336',       // Красный
  },
  // Градиентные цвета
  gradients: {
    blue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    purple: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    green: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    orange: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    pink: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    sunset: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    ocean: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    forest: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
  },
  // Семантические цвета
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  // Нейтральные цвета из Figma
  neutral: {
    50: '#fafbfc',   // Очень светлый серый
    100: '#f1f3f4',  // Светлый серый
    200: '#e8eaed',  // Средний светлый серый
    300: '#dadce0',  // Средний серый
    400: '#bdc1c6',  // Серый
    500: '#9aa0a6',  // Средний темный серый
    600: '#80868b',  // Темный серый
    700: '#5f6368',  // Очень темный серый
    800: '#3c4043',  // Почти черный
    900: '#202124',  // Черный
  },
} as const;

// Размеры и отступы
export const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
} as const;

// Радиусы скругления
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',   // 2px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  full: '9999px',
} as const;

// Тени
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// Типографика
export const TYPOGRAPHY = {
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// Анимации
export const ANIMATIONS = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// Z-индексы
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Статусы задач
export const TASK_STATUSES = {
  todo: {
    label: 'К выполнению',
    color: 'gray',
    icon: 'circle',
  },
  in_progress: {
    label: 'В работе',
    color: 'blue',
    icon: 'play',
  },
  completed: {
    label: 'Завершено',
    color: 'green',
    icon: 'check',
  },
  blocked: {
    label: 'Заблокировано',
    color: 'red',
    icon: 'alert',
  },
} as const;

// Приоритеты задач
export const TASK_PRIORITIES = {
  low: {
    label: 'Низкий',
    color: 'green',
  },
  medium: {
    label: 'Средний',
    color: 'yellow',
  },
  high: {
    label: 'Высокий',
    color: 'red',
  },
} as const;

// Размеры экранов
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;
