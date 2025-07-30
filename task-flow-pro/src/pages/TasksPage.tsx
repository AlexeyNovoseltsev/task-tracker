import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore, useShowStoryPoints } from '@/store';
import { useToast } from '@/hooks/useToast';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Grid3X3, 
  List,
  CheckSquare,
  Circle,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  Tag,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Plus,
  ArrowUpDown
} from 'lucide-react';
import type { Task } from '@/types';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';

type ViewMode = 'list' | 'grid';
type SortField = 'title' | 'status' | 'priority' | 'createdAt' | 'dueDate' | 'storyPoints';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'todo' | 'in-progress' | 'in-review' | 'done';
type PriorityFilter = 'all' | 'low' | 'medium' | 'high';

const statusConfig = {
  'todo': { icon: Circle, label: 'К выполнению', color: 'text-muted-foreground', bg: 'bg-muted' },
  'in-progress': { icon: Clock, label: 'В работе', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
  'in-review': { icon: AlertCircle, label: 'На проверке', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
  'done': { icon: CheckCircle2, label: 'Выполнено', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
};

const priorityConfig = {
  'low': { label: 'Низкий', color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-900' },
  'medium': { label: 'Средний', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
  'high': { label: 'Высокий', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950' },
};

export function TasksPage() {
  const { tasks, projects } = useAppStore();
  const { success, info } = useToast();
  const showStoryPoints = useShowStoryPoints();

  // State for filters and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesProject = projectFilter === 'all' || task.projectId === projectFilter;
      
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
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
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

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Неизвестный проект';
  };

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    success("Задача", `Открываем детали задачи "${task.title}"`, 2000);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
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

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;

  return (
    <div className="p-4 md:p-6 h-full max-w-7xl mx-auto">
      {/* Compact Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Все задачи</h1>
          <p className="text-sm text-muted-foreground">
            Управление задачами по всем проектам
          </p>
        </div>
        <Button className="gap-2 ml-4 flex-shrink-0" size="sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Создать задачу</span>
          <span className="sm:hidden">Создать</span>
        </Button>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        <div className="bg-card p-4 md:p-5 rounded-xl border shadow-sm hover-lift transition-all duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <CheckSquare className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Всего задач</p>
            <p className="text-2xl md:text-3xl font-bold text-foreground leading-none">{totalTasks}</p>
          </div>
        </div>
        <div className="bg-card p-4 md:p-5 rounded-xl border shadow-sm hover-lift transition-all duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center mb-3">
              <Clock className="h-5 w-5 text-info" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">В работе</p>
            <p className="text-2xl md:text-3xl font-bold text-info leading-none">{inProgressTasks}</p>
          </div>
        </div>
        <div className="bg-card p-4 md:p-5 rounded-xl border shadow-sm hover-lift transition-all duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Выполнено</p>
            <p className="text-2xl md:text-3xl font-bold text-success leading-none">{completedTasks}</p>
          </div>
        </div>
        <div className="bg-card p-4 md:p-5 rounded-xl border shadow-sm hover-lift transition-all duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center mb-3">
              <AlertCircle className="h-5 w-5 text-error" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Просрочено</p>
            <p className="text-2xl md:text-3xl font-bold text-error leading-none">{overdueTasks}</p>
          </div>
        </div>
      </div>

      {/* Compact Controls */}
      <div className="space-y-3 mb-5">
        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск задач..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Фильтры
          </Button>

          <div className="flex border border-input rounded-lg">
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
          <div className="bg-card p-4 rounded-xl border shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Статус</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full p-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
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
                  className="w-full p-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
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
                  className="w-full p-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
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
                  className="w-full p-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
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

      {/* Tasks */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Задачи не найдены</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all'
              ? 'Попробуйте изменить фильтры поиска'
              : 'В системе пока нет задач'
            }
          </p>
          {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all') && (
            <Button variant="outline" onClick={clearFilters}>
              Сбросить фильтры
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
          {filteredTasks.map((task) => {
            const StatusIcon = statusConfig[task.status].icon;
            const project = projects.find(p => p.id === task.projectId);
            
            if (viewMode === 'grid') {
              return (
                <div
                  key={task.id}
                  className="bg-card p-6 rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group hover-lift"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-5 w-5 ${statusConfig[task.status].color}`} />
                      <Badge 
                        className={`text-xs ${statusConfig[task.status].bg} ${statusConfig[task.status].color} border-0`}
                      >
                        {statusConfig[task.status].label}
                      </Badge>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-base mb-2 group-hover:text-primary transition-colors">
                    {task.title}
                  </h3>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{project?.name}</span>
                    {showStoryPoints && task.storyPoints && <span>{task.storyPoints} ОИ</span>}
                  </div>
                </div>
              );
            }

            // List view
            return (
              <div
                key={task.id}
                className="bg-card p-4 rounded-xl border border-border/50 hover:shadow-md transition-all duration-200 cursor-pointer group flex items-center gap-4 hover-lift"
                onClick={() => handleTaskClick(task)}
              >
                <StatusIcon className={`h-5 w-5 ${statusConfig[task.status].color} flex-shrink-0`} />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {project?.name}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge 
                    className={`text-xs ${statusConfig[task.status].bg} ${statusConfig[task.status].color} border-0`}
                  >
                    {statusConfig[task.status].label}
                  </Badge>
                  
                  <Badge 
                    className={`text-xs ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].color} border-0`}
                  >
                    {priorityConfig[task.priority].label}
                  </Badge>

                  {showStoryPoints && task.storyPoints && (
                    <Badge variant="outline" className="text-xs">
                      {task.storyPoints} ОИ
                    </Badge>
                  )}

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
      />
    </div>
  );
}