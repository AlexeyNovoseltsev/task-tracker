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
  CREATE_TASK: { key: 'n', ctrlKey: true, description: 'Create new task' },
  CREATE_PROJECT: { key: 'p', ctrlKey: true, shiftKey: true, description: 'Create new project' },
  CREATE_SPRINT: { key: 's', ctrlKey: true, shiftKey: true, description: 'Create new sprint' },
  TOGGLE_THEME: { key: 't', ctrlKey: true, description: 'Toggle theme' },
  SEARCH: { key: 'k', ctrlKey: true, description: 'Search' },
  DASHBOARD: { key: '1', ctrlKey: true, description: 'Go to Dashboard' },
  PROJECTS: { key: '2', ctrlKey: true, description: 'Go to Projects' },
  BACKLOG: { key: '3', ctrlKey: true, description: 'Go to Backlog' },
  SPRINTS: { key: '4', ctrlKey: true, description: 'Go to Sprints' },
  KANBAN: { key: '5', ctrlKey: true, description: 'Go to Kanban' },
  ANALYTICS: { key: '6', ctrlKey: true, description: 'Go to Analytics' },
  SETTINGS: { key: '7', ctrlKey: true, description: 'Go to Settings' },
} as const;