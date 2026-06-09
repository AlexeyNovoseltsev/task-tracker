import { Eye, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { ApiError } from '@/lib/api';
import { isApiMode, isUuid } from '@/lib/dataSync';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

interface TaskWatchButtonProps {
  taskId: string;
  className?: string;
}

export function TaskWatchButton({ taskId, className }: TaskWatchButtonProps) {
  const { user } = useAuth();
  const { success, error } = useToast();
  const updateTask = useAppStore((s) => s.updateTask);
  const task = useAppStore((s) => s.tasks.find((t) => t.id === taskId));

  const [watching, setWatching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(false);

  const canWatch = Boolean(user) && (isApiMode() ? isUuid(taskId) : true);

  const syncFromTask = useCallback(() => {
    if (user && task?.watchers) {
      setWatching(task.watchers.includes(user.id));
    }
  }, [task?.watchers, user]);

  useEffect(() => {
    syncFromTask();
  }, [syncFromTask]);

  useEffect(() => {
    if (!isApiMode() || !isUuid(taskId) || !user) return;

    api.getTaskWatchers(taskId)
      .then((data) => {
        const res = data as { watching: boolean; watchers: string[] };
        setWatching(Boolean(res.watching));
        updateTask(taskId, { watchers: res.watchers || [] });
      })
      .catch(() => undefined);
  }, [taskId, user, updateTask]);

  const toggle = async () => {
    if (!user || !canWatch || loading) return;

    const next = !watching;
    const prevWatchers = task?.watchers || [];
    const optimisticWatchers = next
      ? [...new Set([...prevWatchers, user.id])]
      : prevWatchers.filter((id) => id !== user.id);

    setLoading(true);
    setWatching(next);
    setPulse(true);
    setTimeout(() => setPulse(false), 650);
    updateTask(taskId, { watchers: optimisticWatchers });

    try {
      if (isApiMode() && isUuid(taskId)) {
        const res = next
          ? await api.watchTask(taskId) as { watchers?: string[] }
          : await api.unwatchTask(taskId) as { watchers?: string[] };

        if (res.watchers) {
          updateTask(taskId, { watchers: res.watchers });
        } else {
          api.getTaskWatchers(taskId)
            .then((data) => {
              const fresh = data as { watchers: string[] };
              updateTask(taskId, { watchers: fresh.watchers || [] });
            })
            .catch(() => undefined);
        }
      }

      success(
        next ? 'Вы следите за задачей' : 'Слежение отключено',
        next ? 'Уведомления по этой задаче включены' : 'Вы больше не получаете обновления'
      );
    } catch (err) {
      setWatching(!next);
      updateTask(taskId, { watchers: prevWatchers });
      const message = err instanceof ApiError ? err.message : 'Не удалось изменить слежение';
      error('Ошибка', message);
    } finally {
      setLoading(false);
    }
  };

  if (!canWatch) return null;

  return (
    <Button
      type="button"
      variant={watching ? 'secondary' : 'ghost'}
      size="sm"
      onClick={() => void toggle()}
      disabled={loading}
      className={cn(
        'relative gap-2 overflow-hidden transition-colors',
        watching && 'bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300',
        className
      )}
    >
      <span className="relative flex h-5 w-5 items-center justify-center">
        <AnimatePresence>
          {pulse && (
            <>
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-sky-400/70"
                initial={{ scale: 0.6, opacity: 0.9 }}
                animate={{ scale: 2.2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
              />
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-full bg-sky-400/25"
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
              />
            </>
          )}
        </AnimatePresence>

        <motion.span
          key={watching ? 'on' : 'off'}
          initial={{ scale: 0.7, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Eye
              className={cn(
                'h-4 w-4 transition-colors',
                watching
                  ? 'fill-sky-500 text-sky-600 dark:fill-sky-400 dark:text-sky-300'
                  : 'text-muted-foreground'
              )}
            />
          )}
        </motion.span>
      </span>
      {watching ? 'Слежу' : 'Следить'}
    </Button>
  );
}
