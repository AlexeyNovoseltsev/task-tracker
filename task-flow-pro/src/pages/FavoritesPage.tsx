import {
  Star,
  FolderOpen,
  Target,
  Calendar,
  Search,
  RefreshCw,
  LayoutGrid,
  List,
  ArrowUpRight,
  Sparkles,
  Clock,
  TrendingUp,
  StarOff,
  ExternalLink,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { ProjectViewModal } from '@/components/project/ProjectViewModal';
import { SprintModal } from '@/components/sprint/SprintModal';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { AnimatedPage, FadeInContent, StaggeredList } from '@/components/ui/PageTransition';
import { toast, useToast } from '@/hooks/useToast';
import { api } from '@/lib/api';
import { isApiMode } from '@/lib/dataSync';
import {
  fetchFavoritesList,
  invalidateFavoritesList,
  setFavoriteInCache,
} from '@/lib/favoritesCache';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import type { FavoriteWithDetails, Project, Sprint, Task } from '@/types';

type TabFilter = 'all' | 'project' | 'task' | 'sprint';
type SortMode = 'recent' | 'name';
type ViewMode = 'grid' | 'list';

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

const SPRINT_STATUS_LABELS: Record<string, string> = {
  planning: 'Планирование',
  active: 'Активный',
  completed: 'Завершён',
};

const TABS: { id: TabFilter; label: string; icon: typeof Star }[] = [
  { id: 'all', label: 'Все', icon: Sparkles },
  { id: 'project', label: 'Проекты', icon: FolderOpen },
  { id: 'task', label: 'Задачи', icon: Target },
  { id: 'sprint', label: 'Спринты', icon: Calendar },
];

function resolveFavorite(
  fav: FavoriteWithDetails,
  store: { tasks: Task[]; projects: Project[]; sprints: Sprint[] }
): FavoriteWithDetails {
  const base = fav;
  if (base.itemType === 'project') {
    return {
      ...base,
      project: base.project ?? store.projects.find((p) => p.id === base.itemId),
    };
  }
  if (base.itemType === 'task') {
    return {
      ...base,
      task: base.task ?? store.tasks.find((t) => t.id === base.itemId),
    };
  }
  if (base.itemType === 'sprint') {
    return {
      ...base,
      sprint: base.sprint ?? store.sprints.find((s) => s.id === base.itemId),
    };
  }
  return base;
}

function FavoriteSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-44 rounded-2xl border border-border/60 bg-muted/30 animate-pulse"
        />
      ))}
    </div>
  );
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const {
    tasks: storeTasks,
    projects: storeProjects,
    sprints: storeSprints,
    setSelectedProject: selectProjectInStore,
  } = useAppStore();

  const [favorites, setFavorites] = useState<FavoriteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

  const loadFavorites = useCallback(async (force = false, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setLoadError(false);

    try {
      if (!isApiMode()) {
        setFavorites([]);
        return;
      }

      const list = await fetchFavoritesList(force);
      setFavorites(list);
    } catch {
      setLoadError(true);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить избранное',
        variant: 'error',
      });
      if (force) setFavorites([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        if (!isApiMode()) {
          if (!cancelled) setFavorites([]);
          return;
        }
        const list = await fetchFavoritesList();
        if (!cancelled) setFavorites(list);
      } catch {
        if (!cancelled) {
          setLoadError(true);
          setFavorites([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => ({
    all: favorites.length,
    project: favorites.filter((f) => f.itemType === 'project').length,
    task: favorites.filter((f) => f.itemType === 'task').length,
    sprint: favorites.filter((f) => f.itemType === 'sprint').length,
  }), [favorites]);

  const enrichTask = useCallback((task: Task): Task => {
    const fromStore = storeTasks.find((t) => t.id === task.id);
    return fromStore ? { ...task, ...fromStore } : task;
  }, [storeTasks]);

  const enrichProject = useCallback((project: Project): Project => {
    const fromStore = storeProjects.find((p) => p.id === project.id);
    return fromStore ? { ...project, ...fromStore } : project;
  }, [storeProjects]);

  const resolvedFavorites = useMemo(
    () => favorites.map((fav) => resolveFavorite(fav, {
      tasks: storeTasks,
      projects: storeProjects,
      sprints: storeSprints,
    })),
    [favorites, storeTasks, storeProjects, storeSprints]
  );

  const filteredFavorites = useMemo(() => {
    const q = search.trim().toLowerCase();

    let items = resolvedFavorites.filter((fav) => {
      if (activeTab !== 'all' && fav.itemType !== activeTab) return false;
      if (!q) return true;

      if (fav.itemType === 'project') {
        const name = fav.project?.name ?? fav.itemId;
        const key = fav.project?.key ?? '';
        const desc = fav.project?.description ?? '';
        return name.toLowerCase().includes(q)
          || key.toLowerCase().includes(q)
          || desc.toLowerCase().includes(q);
      }
      if (fav.itemType === 'task') {
        const title = fav.task?.title ?? fav.itemId;
        const desc = fav.task?.description ?? '';
        return title.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
      }
      if (fav.itemType === 'sprint') {
        const name = fav.sprint?.name ?? fav.itemId;
        const goal = fav.sprint?.goal ?? '';
        return name.toLowerCase().includes(q) || goal.toLowerCase().includes(q);
      }
      return false;
    });

    items = [...items].sort((a, b) => {
      if (sortMode === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      const nameA = a.project?.name ?? a.task?.title ?? a.sprint?.name ?? '';
      const nameB = b.project?.name ?? b.task?.title ?? b.sprint?.name ?? '';
      return nameA.localeCompare(nameB, 'ru');
    });

    return items;
  }, [resolvedFavorites, activeTab, search, sortMode]);

  const handleRemoveFavorite = async (favorite: FavoriteWithDetails) => {
    try {
      await api.removeFromFavorites(favorite.id);
      setFavorites((prev) => prev.filter((f) => f.id !== favorite.id));
      setFavoriteInCache(favorite.itemType, favorite.itemId, {
        isFavorited: false,
        favoriteId: null,
      });
      success('Убрано из избранного');
    } catch {
      error('Ошибка', 'Не удалось убрать из избранного');
    }
  };

  const handleRetry = () => {
    invalidateFavoritesList();
    void loadFavorites(true);
  };

  const openProject = (project: Project) => {
    setViewingProject(enrichProject(project));
    selectProjectInStore(project.id);
    setShowProjectModal(true);
  };

  const openTask = (task: Task) => {
    setSelectedTask(enrichTask(task));
    setShowTaskModal(true);
  };

  const openSprint = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setShowSprintModal(true);
  };

  const renderOrphanCard = (favorite: FavoriteWithDetails, label: string) => (
    <motion.article
      key={favorite.id}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label} недоступен</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground/80">{favorite.itemId}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => void handleRemoveFavorite(favorite)}
          title="Убрать из избранного"
        >
          <StarOff className="h-4 w-4" />
        </Button>
      </div>
    </motion.article>
  );

  const renderProjectCard = (favorite: FavoriteWithDetails) => {
    const projectSource = favorite.project ?? storeProjects.find((p) => p.id === favorite.itemId);
    if (!projectSource) return renderOrphanCard(favorite, 'Проект');
    const project = enrichProject(projectSource);

    return (
      <motion.article
        key={favorite.id}
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm',
          'transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
          viewMode === 'list' && 'flex items-stretch'
        )}
      >
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ backgroundColor: project.color }}
        />
        <div className={cn('p-5 flex-1', viewMode === 'list' && 'flex items-center gap-5')}>
          <div className={cn('flex-1 min-w-0', viewMode === 'list' && 'flex items-center gap-4')}>
            <div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md"
              style={{ backgroundColor: project.color }}
            >
              <FolderOpen className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="truncate text-lg font-semibold">{project.name}</h3>
                <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                  {project.key}
                </Badge>
              </div>
              {project.description && (
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(favorite.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          </div>
          <div className={cn(
            'flex gap-2',
            viewMode === 'grid' ? 'mt-4' : 'shrink-0 pr-2'
          )}>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => openProject(project)}
            >
              Открыть
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-amber-600"
              onClick={() => void handleRemoveFavorite(favorite)}
              title="Убрать из избранного"
            >
              <StarOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.article>
    );
  };

  const renderSprintCard = (favorite: FavoriteWithDetails) => {
    const sprint = favorite.sprint ?? storeSprints.find((s) => s.id === favorite.itemId);
    if (!sprint) return renderOrphanCard(favorite, 'Спринт');
    const statusLabel = SPRINT_STATUS_LABELS[sprint.status] ?? sprint.status;

    return (
      <motion.article
        key={favorite.id}
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm',
          'transition-all duration-200 hover:border-violet-400/30 hover:shadow-lg',
          viewMode === 'list' && 'flex items-stretch'
        )}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500" />
        <div className={cn('p-5 flex-1', viewMode === 'list' && 'flex items-center gap-5')}>
          <div className="flex-1 min-w-0">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-lg font-semibold leading-tight">{sprint.name}</h3>
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                {statusLabel}
              </Badge>
            </div>
            {sprint.goal && (
              <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{sprint.goal}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
                <Calendar className="h-3 w-3" />
                {new Date(sprint.startDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                {' — '}
                {new Date(sprint.endDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {sprint.capacity != null && (
                <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1">
                  <TrendingUp className="h-3 w-3" />
                  {sprint.capacity} SP
                </span>
              )}
            </div>
          </div>
          <div className={cn('flex gap-2', viewMode === 'grid' ? 'mt-4' : 'shrink-0')}>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => openSprint(sprint)}
            >
              Открыть
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-amber-600"
              onClick={() => void handleRemoveFavorite(favorite)}
              title="Убрать из избранного"
            >
              <StarOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.article>
    );
  };

  const renderTaskItem = (favorite: FavoriteWithDetails) => {
    const taskSource = favorite.task ?? storeTasks.find((t) => t.id === favorite.itemId);
    if (!taskSource) return renderOrphanCard(favorite, 'Задача');
    const task = enrichTask(taskSource);

    if (viewMode === 'grid') {
      return (
        <motion.div
          key={favorite.id}
          layout
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="relative group"
        >
          <TaskCard
            task={task}
            showProject
            onClick={() => openTask(task)}
            className="h-full border-amber-200/30 dark:border-amber-900/20"
          />
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-3 top-3 h-8 w-8 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              void handleRemoveFavorite(favorite);
            }}
            title="Убрать из избранного"
          >
            <StarOff className="h-3.5 w-3.5" />
          </Button>
        </motion.div>
      );
    }

    return (
      <motion.div
        key={favorite.id}
        layout
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 hover:bg-muted/30 transition-colors cursor-pointer group"
        onClick={() => openTask(task)}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
          <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{task.title}</p>
          <div className="mt-0.5 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px]">
              {STATUS_LABELS[task.status] ?? task.status}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {PRIORITY_LABELS[task.priority] ?? task.priority}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            void handleRemoveFavorite(favorite);
          }}
        >
          <StarOff className="h-4 w-4" />
        </Button>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
      </motion.div>
    );
  };

  const isEmpty = !loading && !loadError && favorites.length === 0;
  const isFilteredEmpty = !loading && !loadError && favorites.length > 0 && filteredFavorites.length === 0;

  return (
    <AnimatedPage className="space-y-6 pb-8">
      {/* Hero */}
      <FadeInContent>
        <div className="relative overflow-hidden rounded-2xl border border-amber-200/40 bg-gradient-to-br from-amber-50 via-background to-orange-50/30 p-6 dark:from-amber-950/20 dark:via-background dark:to-orange-950/10 dark:border-amber-900/30">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 shadow-inner">
                <Star className="h-7 w-7 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Избранное</h1>
                <p className="mt-1 text-sm text-muted-foreground max-w-md">
                  Быстрый доступ к проектам, задачам и спринтам — всё важное в одном месте
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {[
                { label: 'Всего', value: counts.all, color: 'text-foreground' },
                { label: 'Проекты', value: counts.project, color: 'text-blue-600' },
                { label: 'Задачи', value: counts.task, color: 'text-amber-600' },
                { label: 'Спринты', value: counts.sprint, color: 'text-violet-600' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border/60 bg-background/80 px-4 py-2.5 text-center backdrop-blur-sm min-w-[72px]"
                >
                  <div className={cn('text-xl font-bold tabular-nums', stat.color)}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FadeInContent>

      {/* Toolbar */}
      <FadeInContent delay={0.05}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-border/60 bg-muted/30 p-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const count = counts[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                  <span className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                    activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] lg:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск в избранном…"
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="recent">Сначала новые</option>
              <option value="name">По имени</option>
            </select>
            <div className="flex rounded-lg border border-border p-0.5">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('grid')}
                title="Сетка"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode('list')}
                title="Список"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => void loadFavorites(true, true)}
              disabled={refreshing || loading}
              title="Обновить"
            >
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </FadeInContent>

      {/* Content */}
      <FadeInContent delay={0.1}>
        {loading ? (
          <FavoriteSkeleton />
        ) : loadError ? (
          <div className="rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 py-4">
            <EmptyState
              icon={RefreshCw}
              title="Не удалось загрузить"
              description="Проверьте соединение и попробуйте снова"
              action={{
                label: 'Повторить',
                onClick: handleRetry,
              }}
            />
          </div>
        ) : isEmpty ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 py-4">
            <EmptyState
              icon={Star}
              title="Избранное пусто"
              description="Добавляйте звёздочку на проектах, задачах и спринтах — они появятся здесь"
              action={{
                label: 'Перейти к проектам',
                onClick: () => navigate('/projects'),
              }}
            />
          </div>
        ) : isFilteredEmpty ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 py-4">
            <EmptyState
              icon={Search}
              title="Ничего не найдено"
              description="Попробуйте другой запрос или смените фильтр"
              action={{
                label: 'Сбросить поиск',
                onClick: () => setSearch(''),
                variant: 'outline',
              }}
            />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <StaggeredList
              className={cn(
                viewMode === 'grid'
                  ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
                  : 'flex flex-col gap-2'
              )}
            >
              {filteredFavorites.map((favorite) => {
                if (favorite.itemType === 'project') return renderProjectCard(favorite);
                if (favorite.itemType === 'sprint') return renderSprintCard(favorite);
                return renderTaskItem(favorite);
              })}
            </StaggeredList>
          </AnimatePresence>
        )}
      </FadeInContent>

      {showProjectModal && viewingProject && (
        <ProjectViewModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          project={viewingProject}
        />
      )}

      {showTaskModal && selectedTask && (
        <TaskDetailModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          task={selectedTask}
        />
      )}

      {showSprintModal && selectedSprint && (
        <SprintModal
          isOpen={showSprintModal}
          onClose={() => setShowSprintModal(false)}
          sprint={selectedSprint}
          mode="view"
        />
      )}
    </AnimatedPage>
  );
}
