import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  actualTheme: 'light' | 'dark';
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'system',
      actualTheme: getSystemTheme(),
      setTheme: (theme: Theme) => {
        set({ theme });
        
        // Update actual theme
        const actualTheme = theme === 'system' ? getSystemTheme() : theme;
        set({ actualTheme });
        
        // Update DOM
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(actualTheme);
      },
      toggleTheme: () => {
        const currentTheme = useThemeStore.getState().theme;
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        useThemeStore.getState().setTheme(nextTheme);
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const store = useThemeStore.getState();
    if (store.theme === 'system') {
      const actualTheme = e.matches ? 'dark' : 'light';
      useThemeStore.setState({ actualTheme });
      
      // Update DOM
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(actualTheme);
    }
  });
}

export const useTheme = () => {
  const { theme, setTheme, toggleTheme, actualTheme } = useThemeStore();
  
  return {
    theme: actualTheme,
    setTheme,
    toggleTheme,
    currentTheme: theme,
  };
}; 