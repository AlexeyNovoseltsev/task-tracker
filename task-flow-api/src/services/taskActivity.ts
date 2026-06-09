import { supabaseAdmin } from '@/config/supabase';

type ActivityType =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'assigned'
  | 'priority_changed'
  | 'due_date_changed'
  | 'attachment_added'
  | 'link_added'
  | 'watcher_added'
  | 'commented';

interface LogActivityInput {
  type: ActivityType;
  description: string;
  taskId: string;
  projectId?: string | null;
  userId: string;
  metadata?: Record<string, unknown>;
}

export async function logTaskActivity(input: LogActivityInput): Promise<void> {
  const { error } = await supabaseAdmin.from('activities').insert({
    type: input.type,
    description: input.description,
    task_id: input.taskId,
    project_id: input.projectId || null,
    user_id: input.userId,
    metadata: input.metadata || {},
  });

  if (error) {
    console.error('Failed to log task activity:', error.message);
  }
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'К выполнению',
  'in-progress': 'В работе',
  'in-review': 'На проверке',
  done: 'Готово',
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'Критический',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

export async function logTaskFieldChanges(
  task: { id: string; project_id?: string | null },
  userId: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>
): Promise<void> {
  const projectId = task.project_id || null;
  const logs: LogActivityInput[] = [];

  if (after.status !== undefined && after.status !== before.status) {
    logs.push({
      type: 'status_changed',
      description: `изменил статус на «${STATUS_LABELS[String(after.status)] || after.status}»`,
      taskId: task.id,
      projectId,
      userId,
      metadata: { from: before.status, to: after.status },
    });
  }

  if (after.priority !== undefined && after.priority !== before.priority) {
    logs.push({
      type: 'priority_changed',
      description: `изменил приоритет на «${PRIORITY_LABELS[String(after.priority)] || after.priority}»`,
      taskId: task.id,
      projectId,
      userId,
      metadata: { from: before.priority, to: after.priority },
    });
  }

  if (after.assignee_id !== undefined && after.assignee_id !== before.assignee_id) {
    logs.push({
      type: 'assigned',
      description: after.assignee_id ? 'назначил исполнителя' : 'снял исполнителя',
      taskId: task.id,
      projectId,
      userId,
      metadata: { from: before.assignee_id, to: after.assignee_id },
    });
  }

  if (after.due_date !== undefined && after.due_date !== before.due_date) {
    logs.push({
      type: 'due_date_changed',
      description: after.due_date ? 'изменил срок выполнения' : 'убрал срок выполнения',
      taskId: task.id,
      projectId,
      userId,
      metadata: { from: before.due_date, to: after.due_date },
    });
  }

  const tracked = ['status', 'priority', 'assignee_id', 'due_date'];
  const otherChanged = Object.keys(after).some(
    (key) => !tracked.includes(key) && after[key] !== before[key]
  );

  if (otherChanged && logs.length === 0) {
    logs.push({
      type: 'updated',
      description: 'обновил задачу',
      taskId: task.id,
      projectId,
      userId,
      metadata: { fields: Object.keys(after) },
    });
  }

  await Promise.all(logs.map((entry) => logTaskActivity(entry)));
}
