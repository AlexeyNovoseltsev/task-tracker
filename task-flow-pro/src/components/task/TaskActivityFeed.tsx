import {
  Activity,
  ArrowRight,
  Calendar,
  Flag,
  Link2,
  MessageSquare,
  Paperclip,
  PlusCircle,
  UserPlus,
  Eye,
  Pencil,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { isApiMode, isUuid } from '@/lib/dataSync';
import { useAppStore } from '@/store';
import type { Activity as ActivityItem } from '@/types';
import { cn } from '@/lib/utils';

interface ApiActivityRow {
  id: string;
  type: ActivityItem['type'];
  description: string;
  task_id: string;
  project_id?: string | null;
  user_id: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  user?: { id: string; name: string; avatar_url?: string };
}

interface TaskActivityFeedProps {
  taskId: string;
  refreshKey?: number;
  className?: string;
}

const TYPE_CONFIG: Record<
  ActivityItem['type'],
  { icon: typeof Activity; color: string; label: string }
> = {
  created: { icon: PlusCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', label: 'Создание' },
  updated: { icon: Pencil, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800/60', label: 'Изменение' },
  commented: { icon: MessageSquare, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40', label: 'Комментарий' },
  assigned: { icon: UserPlus, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40', label: 'Назначение' },
  status_changed: { icon: ArrowRight, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40', label: 'Статус' },
  priority_changed: { icon: Flag, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40', label: 'Приоритет' },
  due_date_changed: { icon: Calendar, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40', label: 'Срок' },
  attachment_added: { icon: Paperclip, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40', label: 'Вложение' },
  link_added: { icon: Link2, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40', label: 'Связь' },
  watcher_added: { icon: Eye, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40', label: 'Наблюдатель' },
};

function mapApiActivity(row: ApiActivityRow): ActivityItem {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    taskId: row.task_id,
    projectId: row.project_id || undefined,
    userId: row.user_id,
    metadata: {
      ...row.metadata,
      userName: row.user?.name,
    },
    createdAt: new Date(row.created_at),
  };
}

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин. назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} дн. назад`;
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function dayLabel(date: Date): string {
  const today = new Date();
  const d = new Date(date);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return 'Сегодня';
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (sameDay(d, yesterday)) return 'Вчера';
  return d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function TaskActivityFeed({ taskId, refreshKey, className }: TaskActivityFeedProps) {
  const users = useAppStore((s) => s.users);
  const localActivities = useAppStore((s) => s.activities);
  const [remoteActivities, setRemoteActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isApiMode() || !isUuid(taskId)) {
      setRemoteActivities([]);
      return;
    }

    setLoading(true);
    api.getTaskActivities(taskId)
      .then((rows) => {
        const list = Array.isArray(rows) ? rows as ApiActivityRow[] : [];
        setRemoteActivities(list.map(mapApiActivity));
      })
      .catch(() => setRemoteActivities([]))
      .finally(() => setLoading(false));
  }, [taskId, refreshKey]);

  const activities = useMemo(() => {
    const local = localActivities.filter((a) => a.taskId === taskId);
    const merged = new Map<string, ActivityItem>();

    for (const item of [...local, ...remoteActivities]) {
      merged.set(item.id, item);
    }

    return Array.from(merged.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }, [localActivities, remoteActivities, taskId]);

  const grouped = useMemo(() => {
    const groups: { label: string; items: ActivityItem[] }[] = [];
    for (const item of activities) {
      const label = dayLabel(item.createdAt);
      const last = groups[groups.length - 1];
      if (last?.label === label) {
        last.items.push(item);
      } else {
        groups.push({ label, items: [item] });
      }
    }
    return groups;
  }, [activities]);

  if (loading && activities.length === 0) {
    return (
      <div className={cn('space-y-4 py-4', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-9 w-9 rounded-full bg-muted" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 w-2/3 rounded bg-muted" />
              <div className="h-3 w-1/3 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-14 text-center', className)}>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
          <Activity className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Пока нет активности</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Здесь появятся изменения статуса, назначения, комментарии и другие события по задаче
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {grouped.map((group) => (
        <section key={group.label}>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </h4>
          <ol className="relative space-y-0 border-l border-border/80 ml-4 pl-6">
            {group.items.map((item, index) => {
              const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.updated;
              const Icon = config.icon;
              const userName =
                (item.metadata?.userName as string | undefined) ||
                users.find((u) => u.id === item.userId)?.name ||
                'Пользователь';

              return (
                <li
                  key={item.id}
                  className={cn('relative pb-5', index === group.items.length - 1 && 'pb-0')}
                >
                  <span
                    className={cn(
                      'absolute -left-[1.9rem] top-0.5 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-background',
                      config.color
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>

                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-[10px] font-semibold">
                        {initials(userName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-sm leading-snug text-foreground">
                        <span className="font-semibold">{userName}</span>{' '}
                        <span className="text-muted-foreground">{item.description}</span>
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <time
                          className="text-xs text-muted-foreground"
                          dateTime={item.createdAt.toISOString()}
                          title={item.createdAt.toLocaleString('ru-RU')}
                        >
                          {relativeTime(item.createdAt)}
                        </time>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
