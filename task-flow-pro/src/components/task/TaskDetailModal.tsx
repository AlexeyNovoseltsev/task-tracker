import {
  X,
  Calendar,
  User as UserIcon,
  Flag,
  Tag,
  MessageSquare,
  Activity as ActivityIcon,
  Paperclip,
  Link,
  Timer,
  Play,
  Pause,
  Plus,
  Copy,
  Archive,
  FileText,
  Trash2,
  Save,
  Users,
  ExternalLink,
  File,
  Image,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { TaskActivityFeed } from "@/components/task/TaskActivityFeed";
import { TaskWatchButton } from "@/components/task/TaskWatchButton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OverflowChipList } from "@/components/ui/OverflowChipList";
import { useToast } from "@/hooks/useToast";
import { useTaskUpdater } from "@/hooks/useTaskUpdater";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { createTaskInApi, deleteTaskInApi, isApiMode, isUuid, userFromApi } from "@/lib/dataSync";
import { useAppStore, useShowStoryPoints } from "@/store";
import type { Task, Status, Priority, User } from "@/types";
import { cn } from "@/lib/utils";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'todo', label: 'К выполнению' },
  { value: 'in-progress', label: 'В работе' },
  { value: 'in-review', label: 'На проверке' },
  { value: 'done', label: 'Готово' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'urgent', label: 'Критический' },
  { value: 'high', label: 'Высокий' },
  { value: 'medium', label: 'Средний' },
  { value: 'low', label: 'Низкий' },
];

const fieldSelectClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30';

export function TaskDetailModal({ task: taskProp, isOpen, onClose }: TaskDetailModalProps) {
  const { user } = useAuth();
  const {
    users,
    projects,
    tasks,
    addTask,
    deleteTask,
    updateTask,
    importTask,
    addComment,
    comments,
  } = useAppStore();
  const { success, error } = useToast();
  const showStoryPoints = useShowStoryPoints();

  const task = tasks.find((t) => t.id === taskProp?.id) ?? taskProp;
  const { patch } = useTaskUpdater(task?.id);

  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity' | 'time'>('details');
  const [titleDraft, setTitleDraft] = useState('');
  const [descDraft, setDescDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState<Status>('todo');
  const [priorityDraft, setPriorityDraft] = useState<Priority>('medium');
  const [assigneeDraft, setAssigneeDraft] = useState('');
  const [coAssigneeDraft, setCoAssigneeDraft] = useState<string[]>([]);
  const [dueDateDraft, setDueDateDraft] = useState('');
  const [storyPointsDraft, setStoryPointsDraft] = useState('');
  const [projectDraft, setProjectDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [timeDescription, setTimeDescription] = useState('');
  const [timeHours, setTimeHours] = useState('');
  const [assignableUsers, setAssignableUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!task) return;
    setTitleDraft(task.title);
    setDescDraft(task.description ?? '');
    setStatusDraft(task.status);
    setPriorityDraft(task.priority);
    setAssigneeDraft(task.assigneeId ?? '');
    setCoAssigneeDraft([...(task.coAssigneeIds ?? [])]);
    setDueDateDraft(
      task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ''
    );
    setStoryPointsDraft(
      task.storyPoints !== undefined && task.storyPoints !== null
        ? String(task.storyPoints)
        : ''
    );
    setProjectDraft(task.projectId ?? '');
  }, [task?.id]);

  useEffect(() => {
    if (!isOpen || !task || !isApiMode() || !isUuid(task.id)) return;

    api.getTaskWatchers(task.id)
      .then((data) => {
        const res = data as { watchers: string[] };
        updateTask(task.id, { watchers: res.watchers || [] });
      })
      .catch(() => undefined);
  }, [isOpen, task?.id, updateTask]);

  useEffect(() => {
    if (!isOpen) return;

    if (!isApiMode()) {
      setAssignableUsers(users);
      return;
    }

    const apiUsers = users.filter((u) => isUuid(u.id));

    const loadMembers = async () => {
      if (task?.projectId && isUuid(task.projectId)) {
        try {
          const members = await api.getProjectMembers(task.projectId) as Array<{
            user?: Record<string, unknown>;
          }>;
          const fromProject = (members || [])
            .map((m) => m.user)
            .filter((u): u is Record<string, unknown> => Boolean(u))
            .map((u) => userFromApi(u));

          const merged = new Map(apiUsers.map((u) => [u.id, u]));
          fromProject.forEach((u) => merged.set(u.id, u));
          setAssignableUsers(Array.from(merged.values()));
          return;
        } catch {
          // fallback ниже
        }
      }
      setAssignableUsers(apiUsers);
    };

    void loadMembers();
  }, [isOpen, task?.projectId, users]);

  const pickerUsers = useMemo(() => {
    if (!isApiMode()) return users;
    return assignableUsers.length > 0 ? assignableUsers : users.filter((u) => isUuid(u.id));
  }, [users, assignableUsers]);

  if (!isOpen || !task) return null;

  const watcherIds = task.watchers ?? [];

  const resolveUserName = (id: string) =>
    pickerUsers.find((u) => u.id === id)?.name
    ?? users.find((u) => u.id === id)?.name
    ?? id.slice(0, 6);

  const coAssigneeChips = coAssigneeDraft.map((id) => ({
    id,
    label: resolveUserName(id),
  }));

  const watcherChips = watcherIds.map((id) => {
    const name = resolveUserName(id);
    return {
      id,
      label: name,
      leading: (
        <Avatar className="h-5 w-5 shrink-0">
          <AvatarFallback className="text-[8px] font-semibold">
            {name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ),
    };
  });

  const labelChips = task.labels
    .filter((l) => l !== 'архив')
    .map((label) => ({ id: label, label }));

  const project = projects.find((p) => p.id === (projectDraft || task.projectId));
  const assignee = pickerUsers.find((u) => u.id === (assigneeDraft || task.assigneeId))
    ?? users.find((u) => u.id === (assigneeDraft || task.assigneeId));
  const reporter = pickerUsers.find((u) => u.id === task.reporterId)
    ?? users.find((u) => u.id === task.reporterId);
  const taskComments = comments.filter((c) => c.taskId === task.id);
  const isArchived = task.labels.includes('архив');

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseStoryPoints = (value: string) =>
    value === '' ? undefined : Number(value);

  const taskDueDateStr = task.dueDate
    ? new Date(task.dueDate).toISOString().slice(0, 10)
    : '';

  const coAssigneesChanged = () => {
    const a = [...coAssigneeDraft].sort();
    const b = [...(task.coAssigneeIds ?? [])].sort();
    return a.length !== b.length || a.some((id, i) => id !== b[i]);
  };

  const hasUnsavedChanges =
    titleDraft.trim() !== task.title
    || descDraft.trim() !== (task.description ?? '')
    || statusDraft !== task.status
    || priorityDraft !== task.priority
    || (assigneeDraft || undefined) !== task.assigneeId
    || coAssigneesChanged()
    || dueDateDraft !== taskDueDateStr
    || parseStoryPoints(storyPointsDraft) !== task.storyPoints
    || projectDraft !== (task.projectId ?? '');

  const handleDuplicate = async () => {
    const copy = {
      title: `${task.title} (копия)`,
      description: task.description,
      type: task.type,
      status: 'todo' as Status,
      priority: task.priority,
      storyPoints: task.storyPoints,
      projectId: task.projectId,
      assigneeId: task.assigneeId,
      coAssigneeIds: [...coAssigneeDraft],
      reporterId: user?.id ?? task.reporterId,
      labels: task.labels.filter((l) => l !== 'архив'),
      dueDate: task.dueDate,
      color: task.color,
    };

    try {
      if (isApiMode()) {
        const saved = await createTaskInApi(copy, task.projectId);
        importTask(saved);
      } else {
        addTask({ ...copy, sprintId: task.sprintId, estimatedHours: task.estimatedHours, loggedHours: 0 });
      }
      success('Готово', 'Задача продублирована');
    } catch {
      error('Ошибка', 'Не удалось дублировать задачу');
    }
  };

  const handleArchive = async () => {
    const labels = isArchived
      ? task.labels.filter((l) => l !== 'архив')
      : [...task.labels, 'архив'];
    await patch({ labels });
    success(isArchived ? 'Разархивировано' : 'Архив', isArchived ? 'Задача возвращена из архива' : 'Задача в архиве');
  };

  const handleSave = async () => {
    if (!hasUnsavedChanges) {
      success('Сохранено', 'Нет несохранённых изменений');
      return;
    }

    const trimmedTitle = titleDraft.trim();
    if (trimmedTitle.length < 3) {
      error('Название', 'Минимум 3 символа');
      return;
    }

    if (isApiMode() && assigneeDraft && !isUuid(assigneeDraft)) {
      error('Исполнитель', 'Выберите пользователя из облачного списка');
      return;
    }

    const updates: Partial<Task> = {};
    if (trimmedTitle !== task.title) updates.title = trimmedTitle;
    const desc = descDraft.trim();
    if (desc !== (task.description ?? '')) updates.description = desc || undefined;
    if (statusDraft !== task.status) updates.status = statusDraft;
    if (priorityDraft !== task.priority) updates.priority = priorityDraft;
    if ((assigneeDraft || undefined) !== task.assigneeId) {
      updates.assigneeId = assigneeDraft || undefined;
    }
    if (coAssigneesChanged()) updates.coAssigneeIds = [...coAssigneeDraft];
    if (dueDateDraft !== taskDueDateStr) {
      updates.dueDate = dueDateDraft ? new Date(dueDateDraft) : undefined;
    }
    const nextSp = parseStoryPoints(storyPointsDraft);
    if (nextSp !== task.storyPoints) updates.storyPoints = nextSp;
    if (projectDraft !== (task.projectId ?? '')) {
      updates.projectId = projectDraft || undefined;
    }

    setIsSaving(true);
    try {
      await patch(updates);
      success('Изменения сохранены', `Задача «${trimmedTitle}» обновлена`);
    } catch {
      // ошибки показываются в patch
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить задачу безвозвратно?')) return;
    try {
      if (isApiMode() && isUuid(task.id)) {
        await deleteTaskInApi(task.id);
      }
      deleteTask(task.id);
      success('Удалено', 'Задача удалена');
      onClose();
    } catch {
      error('Ошибка', 'Не удалось удалить задачу');
    }
  };

  const handleAddCoAssignee = (userId: string) => {
    if (!userId) return;
    if (isApiMode() && !isUuid(userId)) {
      error('Соисполнитель', 'Выберите пользователя из облачного списка');
      return;
    }
    const assigneeId = assigneeDraft || task.assigneeId;
    if (userId === assigneeId || coAssigneeDraft.includes(userId)) return;
    setCoAssigneeDraft((prev) => [...prev, userId]);
  };

  const handleAddWatcher = async (userId: string) => {
    if (!task || !userId || watcherIds.includes(userId)) return;

    if (isApiMode() && isUuid(task.id)) {
      try {
        const res = await api.addTaskWatcher(task.id, userId) as { watchers: string[] };
        updateTask(task.id, { watchers: res.watchers || [] });
        success('Наблюдатель добавлен');
      } catch {
        error('Ошибка', 'Не удалось добавить наблюдателя');
      }
      return;
    }

    updateTask(task.id, { watchers: [...watcherIds, userId] });
  };

  const handleRemoveWatcher = async (userId: string) => {
    if (!task) return;

    if (isApiMode() && isUuid(task.id)) {
      try {
        const res = await api.removeTaskWatcher(task.id, userId) as { watchers: string[] };
        updateTask(task.id, { watchers: res.watchers || [] });
      } catch {
        error('Ошибка', 'Не удалось убрать наблюдателя');
      }
      return;
    }

    updateTask(task.id, { watchers: watcherIds.filter((id) => id !== userId) });
  };

  const handleRemoveCoAssignee = (userId: string) => {
    setCoAssigneeDraft((prev) => prev.filter((id) => id !== userId));
  };

  const handleSubmitComment = () => {
    const text = newComment.trim();
    if (!text || !user) return;
    addComment({
      content: text,
      taskId: task.id,
      authorId: user.id,
    });
    setNewComment('');
    success('Комментарий добавлен');
  };

  const tabs = [
    { id: 'details' as const, label: 'Детали', icon: FileText },
    { id: 'comments' as const, label: 'Комментарии', icon: MessageSquare },
    { id: 'activity' as const, label: 'Активность', icon: ActivityIcon },
    { id: 'time' as const, label: 'Время', icon: Timer },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="task-detail-modal">
      <div className="bg-background rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 p-5 border-b border-border">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-sm text-muted-foreground font-mono shrink-0">
              {project?.key ?? 'INBOX'}-{task.id.slice(-4).toUpperCase()}
            </span>
            {isArchived && (
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Архив</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <FavoriteButton itemType="task" itemId={task.id} itemTitle={task.title} variant="pill" />
            <TaskWatchButton taskId={task.id} />
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="task-detail-close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Main */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="p-5 border-b border-border space-y-3">
              <input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && hasUnsavedChanges) void handleSave();
                }}
                className="w-full text-2xl font-bold bg-transparent border-0 border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors pb-1"
                aria-label="Название задачи"
              />
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>Создано {formatDate(task.createdAt)}</span>
                <span>·</span>
                <span>Обновлено {formatDate(task.updatedAt)}</span>
              </div>
            </div>

            <div className="flex border-b border-border overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors',
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-5 overflow-auto">
              {activeTab === 'details' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Описание</label>
                  <textarea
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    placeholder="Добавьте описание и нажмите кнопку сохранения"
                    rows={8}
                    className="w-full rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[140px]"
                  />
                  {labelChips.length > 0 && (
                    <div className="pt-3">
                      <OverflowChipList
                        items={labelChips.map((item) => ({
                          ...item,
                          leading: <Tag className="h-3 w-3 shrink-0 text-primary" />,
                        }))}
                        chipClassName="rounded-md bg-primary/10 text-primary"
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <div className="border border-border rounded-lg p-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Написать комментарий..."
                      className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <Button size="sm" onClick={handleSubmitComment} disabled={!newComment.trim()}>
                        Отправить
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {taskComments.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">Комментариев пока нет</p>
                    ) : (
                      taskComments.map((comment) => {
                        const author = users.find((u) => u.id === comment.authorId);
                        return (
                          <div key={comment.id} className="border border-border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2 text-sm">
                              <span className="font-medium">{author?.name ?? 'Пользователь'}</span>
                              <span className="text-muted-foreground">{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <TaskActivityFeed
                  taskId={task.id}
                  refreshKey={task.updatedAt.getTime()}
                />
              )}

              {activeTab === 'time' && (
                <div className="space-y-4 max-w-md">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Таймер</span>
                    {isTracking ? (
                      <Button variant="outline" size="sm" onClick={() => { setIsTracking(false); success('Таймер остановлен'); }}>
                        <Pause className="h-4 w-4 mr-1" /> Стоп
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => { setIsTracking(true); success('Таймер запущен'); }}>
                        <Play className="h-4 w-4 mr-1" /> Старт
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="rounded-lg border p-3">
                      <div className="text-xl font-bold">{task.estimatedHours ?? 0}ч</div>
                      <div className="text-xs text-muted-foreground">Оценка</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xl font-bold">{task.loggedHours ?? 0}ч</div>
                      <div className="text-xs text-muted-foreground">Затрачено</div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={timeDescription}
                    onChange={(e) => setTimeDescription(e.target.value)}
                    placeholder="Описание работы"
                    className={fieldSelectClass}
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={timeHours}
                      onChange={(e) => setTimeHours(e.target.value)}
                      placeholder="Часы"
                      className={fieldSelectClass}
                    />
                    <Button
                      className="shrink-0"
                      onClick={() => {
                        if (!timeHours || !timeDescription) {
                          error('Заполните поля');
                          return;
                        }
                        void patch({ loggedHours: (task.loggedHours ?? 0) + parseFloat(timeHours) });
                        setTimeHours('');
                        setTimeDescription('');
                        success(`Записано ${timeHours} ч`);
                      }}
                    >
                      Записать
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 shrink-0 border-l border-border bg-muted/20 p-5 overflow-y-auto sm:w-96 lg:w-[26rem]">
            <div className="space-y-5">
              {/* Status — prominent */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Статус
                </label>
                <select
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value as Status)}
                  className={cn(fieldSelectClass, 'font-medium')}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Приоритет
                </label>
                <select
                  value={priorityDraft}
                  onChange={(e) => setPriorityDraft(e.target.value as Priority)}
                  className={fieldSelectClass}
                >
                  {PRIORITY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Исполнитель
                </label>
                <select
                  value={assigneeDraft}
                  onChange={(e) => setAssigneeDraft(e.target.value)}
                  className={fieldSelectClass}
                >
                  <option value="">Не назначен</option>
                  {pickerUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                {assignee && (
                  <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                    <UserIcon className="h-3 w-3" /> {assignee.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Соисполнители
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    handleAddCoAssignee(e.target.value);
                    e.target.value = '';
                  }}
                  className={fieldSelectClass}
                >
                  <option value="">+ Добавить</option>
                  {pickerUsers
                    .filter((u) => u.id !== (assigneeDraft || task.assigneeId) && !coAssigneeDraft.includes(u.id))
                    .map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
                <OverflowChipList
                  items={coAssigneeChips}
                  onRemove={(id) => handleRemoveCoAssignee(id)}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Срок
                </label>
                <input
                  type="date"
                  value={dueDateDraft}
                  onChange={(e) => setDueDateDraft(e.target.value)}
                  className={fieldSelectClass}
                />
              </div>

              {showStoryPoints && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Story Points
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={storyPointsDraft}
                    onChange={(e) => setStoryPointsDraft(e.target.value)}
                    className={fieldSelectClass}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Проект
                </label>
                <div className="relative">
                  {project && (
                    <span
                      className="pointer-events-none absolute left-3 top-1/2 z-10 h-2.5 w-2.5 -translate-y-1/2 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                  )}
                  <select
                    value={projectDraft}
                    onChange={(e) => setProjectDraft(e.target.value)}
                    className={cn(fieldSelectClass, project && 'pl-8')}
                  >
                    <option value="">Без проекта</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Автор
                </label>
                <span className="text-sm">{reporter?.name ?? '—'}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Наблюдатели
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    void handleAddWatcher(e.target.value);
                    e.target.value = '';
                  }}
                  className={fieldSelectClass}
                >
                  <option value="">+ Добавить</option>
                  {pickerUsers
                    .filter((u) => !watcherIds.includes(u.id))
                    .map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
                <OverflowChipList
                  items={watcherChips}
                  onRemove={(id) => void handleRemoveWatcher(id)}
                  className="mt-2"
                  chipClassName="gap-1.5 pl-1"
                  emptyText="Нет наблюдателей"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-border space-y-2.5">
                <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Действия
                </span>
                <div className="grid grid-cols-2 gap-2.5 w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-9 justify-start gap-1.5 px-2.5 text-xs font-normal shadow-none"
                    onClick={() => void handleDuplicate()}
                  >
                    <Copy className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Дублировать</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-9 justify-start gap-1.5 px-2.5 text-xs font-normal shadow-none"
                    onClick={() => void handleArchive()}
                  >
                    <Archive className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{isArchived ? 'Из архива' : 'Архив'}</span>
                  </Button>
                  <div className="col-span-2 flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-9 w-9 shrink-0 border-0 !bg-emerald-600 !text-white shadow-sm shadow-emerald-600/30',
                        'hover:!bg-emerald-700 focus-visible:ring-emerald-500/40',
                        'disabled:!bg-emerald-600 disabled:!text-white disabled:!opacity-50 disabled:shadow-none',
                        hasUnsavedChanges && 'ring-2 ring-emerald-400/80 ring-offset-2 ring-offset-background'
                      )}
                      onClick={() => void handleSave()}
                      disabled={!hasUnsavedChanges || isSaving}
                      title={hasUnsavedChanges ? 'Сохранить изменения' : 'Нет изменений'}
                      aria-label="Сохранить"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0 border-border bg-muted/60 text-muted-foreground shadow-none hover:bg-muted hover:text-foreground"
                      onClick={() => void handleDelete()}
                      title="Удалить"
                      aria-label="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
