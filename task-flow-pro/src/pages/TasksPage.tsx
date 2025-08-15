import { 
  Grid3X3, 
  List,
  AlertCircle,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { useState, useMemo } from 'react';


import { TaskCard } from '@/components/task/TaskCard';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import { TaskModal } from '@/components/task/TaskModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterButton } from '@/components/ui/filter-button';
import { SearchInput } from '@/components/ui/search-input';
import { StatCard } from '@/components/ui/stat-card';
import { useToast } from '@/hooks/useToast';
import { useAppStore } from '@/store';
import type { Task } from '@/types';

type ViewMode = 'list' | 'grid';
type SortField = 'title' | 'status' | 'priority' | 'createdAt' | 'dueDate' | 'storyPoints';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'todo' | 'in-progress' | 'in-review' | 'done';
type PriorityFilter = 'all' | 'low' | 'medium' | 'high';



export function TasksPage() {
  const { tasks, projects, selectedProjectId } = useAppStore();
  const { success } = useToast();

  // State for filters and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [isTaskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const openCreateTaskModal = () => {
    setEditingTaskId(null);
    setTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setEditingTaskId(null);
  };
  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    const filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      // Project filtering logic
      let matchesProject = true;
      if (selectedProjectId) {
        // If a project is selected, filter by selected project
        matchesProject = task.projectId === selectedProjectId;
      } else if (projectFilter !== 'all') {
        // If manual project filter is set, use it
        matchesProject = task.projectId === projectFilter;
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProject;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority': {
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1, 'urgent': 4 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        }
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        case 'storyPoints':
          aValue = a.storyPoints || 0;
          bValue = b.storyPoints || 0;
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tasks, searchQuery, statusFilter, priorityFilter, projectFilter, sortField, sortOrder]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    success("Задача", `Открываем детали задачи "${task.title}"`, 2000);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setProjectFilter('all');
    setSortField('createdAt');
    setSortOrder('desc');

    success("Фильтры", "Все фильтры сброшены", 2000);
  };

  // Stats - calculate based on current filter
  const currentTasks = useMemo(() => {
    if (selectedProjectId) {
      return tasks.filter(task => task.projectId === selectedProjectId);
    }
    return tasks;
  }, [tasks, selectedProjectId]);

  const totalTasks = currentTasks.length;
  const completedTasks = currentTasks.filter(t => t.status === 'done').length;
  const inProgressTasks = currentTasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = currentTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;

  const stats = [
    {
      title: "Всего задач",
      value: totalTasks,
      description: "в системе",
      icon: CheckCircle2,
      variant: "default" as const,
    },
    {
      title: "В работе",
      value: inProgressTasks,
      description: "активных",
      icon: CheckCircle2,
      variant: "info" as const,
    },
    {
      title: "Выполнено",
      value: completedTasks,
      description: "завершенных",
      icon: CheckCircle2,
      variant: "success" as const,
    },
    {
      title: "Просрочено",
      value: overdueTasks,
      description: "требуют внимания",
      icon: AlertCircle,
      variant: "warning" as const,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {selectedProjectId ? 'Задачи проекта' : 'Все задачи'}
          </h1>
          <p className="text-muted-foreground">
            {selectedProjectId 
              ? `Проект "${projects.find(p => p.id === selectedProjectId)?.name || 'Неизвестный проект'}"`
              : 'Управление задачами по всем проектам'
            }
          </p>
        </div>
        <Button 
          onClick={openCreateTaskModal}
          className="gap-2 ml-4 flex-shrink-0 bg-[#2c5545] text-white hover:bg-[#2c5545]/90"
        >
          <Plus className="h-4 w-4" />
          Создать задачу
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            variant={stat.variant}
          />
        ))}
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 max-w-md">
                <SearchInput
                  placeholder="Поиск задач..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                />
              </div>
              
              <FilterButton
                isActive={showFilters}
                onClick={() => setShowFilters(!showFilters)}
                count={
                  (statusFilter !== 'all' ? 1 : 0) +
                  (priorityFilter !== 'all' ? 1 : 0) +
                  (projectFilter !== 'all' ? 1 : 0)
                }
                onClear={clearFilters}
              >
                Фильтры
              </FilterButton>

              <div className="flex border border-input rounded-modern">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm border-l transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Статус</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                      className="w-full p-2 border border-input rounded-modern focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="all">Все статусы</option>
                      <option value="todo">К выполнению</option>
                      <option value="in-progress">В работе</option>
                      <option value="in-review">На проверке</option>
                      <option value="done">Выполнено</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Приоритет</label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
                      className="w-full p-2 border border-input rounded-modern focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="all">Все приоритеты</option>
                      <option value="high">Высокий</option>
                      <option value="medium">Средний</option>
                      <option value="low">Низкий</option>
                    </select>
                  </div>

                  {/* Project Filter */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Проект</label>
                    <select
                      value={projectFilter}
                      onChange={(e) => setProjectFilter(e.target.value)}
                      className="w-full p-2 border border-input rounded-modern focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="all">Все проекты</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Сортировка</label>
                    <select
                      value={`${sortField}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-');
                        setSortField(field as SortField);
                        setSortOrder(order as SortOrder);
                      }}
                      className="w-full p-2 border border-input rounded-modern focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="createdAt-desc">Дата создания (новые)</option>
                      <option value="createdAt-asc">Дата создания (старые)</option>
                      <option value="title-asc">Название (А-Я)</option>
                      <option value="title-desc">Название (Я-А)</option>
                      <option value="priority-desc">Приоритет (высокий)</option>
                      <option value="priority-asc">Приоритет (низкий)</option>
                      <option value="status-asc">Статус</option>
                      <option value="dueDate-asc">Срок выполнения</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Найдено: {filteredTasks.length} из {totalTasks} задач
                  </div>
                  <Button variant="outline" onClick={clearFilters}>
                    Сбросить фильтры
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks */}
      {filteredTasks.length === 0 ? (
                         <EmptyState
          icon={CheckCircle2}
          title="Задачи не найдены"
          description={
            searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all'
              ? 'Попробуйте изменить фильтры поиска'
              : 'В системе пока нет задач. Создайте первую задачу для начала работы.'
          }
          action={
            searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all'
              ? {
                  label: 'Сбросить фильтры',
                  onClick: clearFilters,
                  variant: 'outline'
                }
              : {
                  label: 'Создать задачу',
                  onClick: openCreateTaskModal,
                }
          }
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'}>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
              compact={viewMode === 'list'}
              showProject={true}
            />
          ))}
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        taskId={editingTaskId ?? undefined}
      />
    </div>
  );
}