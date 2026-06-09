import { supabaseAdmin } from '@/config/supabase';

export async function fetchWatchersMap(taskIds: string[]): Promise<Record<string, string[]>> {
  if (!taskIds.length) return {};

  const { data, error } = await supabaseAdmin
    .from('task_watchers')
    .select('task_id, user_id')
    .in('task_id', taskIds);

  if (error) throw error;

  const map: Record<string, string[]> = {};
  for (const row of data || []) {
    if (!map[row.task_id]) map[row.task_id] = [];
    map[row.task_id].push(row.user_id);
  }
  return map;
}

export async function fetchWatchersForTask(taskId: string): Promise<string[]> {
  const map = await fetchWatchersMap([taskId]);
  return map[taskId] || [];
}

export function attachWatchers<T extends { id: string }>(
  tasks: T[],
  watchersMap: Record<string, string[]>
): Array<T & { watcher_ids: string[] }> {
  return tasks.map((task) => ({
    ...task,
    watcher_ids: watchersMap[task.id] || [],
  }));
}

export async function enrichTaskWithWatchers<T extends { id: string }>(
  task: T
): Promise<T & { watcher_ids: string[] }> {
  const watchers = await fetchWatchersForTask(task.id);
  return { ...task, watcher_ids: watchers };
}
