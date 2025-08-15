import { useEffect } from 'react';

import { useToast } from './useToast';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
        const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
        const altMatches = !!shortcut.altKey === event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          event.preventDefault();
          event.stopPropagation();
          shortcut.action();
          
          // Show toast notification for the shortcut
          toast({
            title: "Shortcut activated",
            description: shortcut.description,
          });
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled, toast]);
}

// Global shortcuts configuration
export const GLOBAL_SHORTCUTS = {
  CREATE_TASK: { key: 'n', ctrlKey: true, description: 'Создать новую задачу' },
  CREATE_PROJECT: { key: 'p', ctrlKey: true, shiftKey: true, description: 'Создать новый проект' },
  CREATE_SPRINT: { key: 's', ctrlKey: true, shiftKey: true, description: 'Создать новый спринт' },
  TOGGLE_THEME: { key: 't', ctrlKey: true, description: 'Переключить тему' },
  SEARCH: { key: 'k', ctrlKey: true, description: 'Поиск' },
  DASHBOARD: { key: '1', ctrlKey: true, description: 'Перейти к Дашборду' },
  PROJECTS: { key: '2', ctrlKey: true, description: 'Перейти к Проектам' },
  TASKS: { key: '3', ctrlKey: true, description: 'Перейти к Задачам' },
  BACKLOG: { key: '4', ctrlKey: true, description: 'Перейти к Бэклогу' },
  SPRINTS: { key: '5', ctrlKey: true, description: 'Перейти к Спринтам' },
  KANBAN: { key: '6', ctrlKey: true, description: 'Перейти к Канбану' },
  CALENDAR: { key: '7', ctrlKey: true, description: 'Перейти к Календарю' },
  ANALYTICS: { key: '8', ctrlKey: true, description: 'Перейти к Аналитике' },
  SETTINGS: { key: '9', ctrlKey: true, description: 'Перейти к Настройкам' },
} as const;