import { useCallback } from 'react';

import { useToast } from '@/hooks/useToast';
import { ApiError } from '@/lib/api';
import { isApiMode, isUuid, updateTaskInApi } from '@/lib/dataSync';
import { useAppStore } from '@/store';
import type { Task } from '@/types';

export function useTaskUpdater(taskId: string | undefined) {
  const updateTask = useAppStore((s) => s.updateTask);
  const { error } = useToast();

  const patch = useCallback(async (updates: Partial<Task>, silent = false) => {
    if (!taskId) return;

    updateTask(taskId, updates);

    if (!isApiMode() || !isUuid(taskId)) return;

    try {
      const latest = useAppStore.getState().tasks.find((t) => t.id === taskId);
      const payload: Partial<import('@/types').Task> = { ...updates };

      if (latest) {
        if (updates.coAssigneeIds !== undefined) {
          payload.coAssigneeIds = latest.coAssigneeIds;
        }
        if (updates.assigneeId !== undefined) {
          payload.assigneeId = latest.assigneeId;
        }
      }

      const saved = await updateTaskInApi(taskId, payload);
      useAppStore.getState().importTask(saved);
    } catch (err) {
      if (!silent) {
        let message = err instanceof ApiError || err instanceof Error
          ? err.message
          : 'Не удалось сохранить изменения';
        if (err instanceof ApiError && err.status === 429) {
          message = 'Слишком много запросов. Подождите несколько секунд и повторите.';
        }
        error('Ошибка сохранения', message);
      }
      throw err;
    }
  }, [taskId, updateTask, error]);

  return { patch };
}
