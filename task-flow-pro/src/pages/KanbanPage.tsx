import {
  DndContext,
  closestCorners,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  UniqueIdentifier,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  MeasuringStrategy,
  AutoScrollActivator,
  TraversalOrder,
} from "@dnd-kit/core";
import { 
  SortableContext, 
  useSortable, 
  arrayMove,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { 
  Plus, 
  Edit, 
  Filter,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Users,
  Calendar,
  Target,
  TrendingUp,
  BarChart3,
  Zap,
  Sparkles,
  Palette,
  Layout,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

import { TaskCard } from "@/components/task/TaskCard";
import { TaskDetailModal } from "@/components/task/TaskDetailModal";
import { TaskModal } from "@/components/task/TaskModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { FilterPanel } from "@/components/ui/filter-panel";
import { KanbanStats } from "@/components/ui/kanban-stats";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { Task, Status, User } from "@/types";

// Современные цвета для колонок с градиентами
const statusColumns: { 
  id: Status; 
  title: string; 
  description: string;
  bgGradient: string; 
  borderColor: string;
  icon: React.ReactNode;
  stats?: { label: string; value: string; color: string }[];
}[] = [
  { 
    id: "todo", 
    title: "К выполнению", 
    description: "Задачи ожидающие начала работы",
    bgGradient: "from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50", 
    borderColor: "border-slate-200 dark:border-slate-700",
    icon: <Target className="h-4 w-4 text-slate-500" />,
    stats: [
      { label: "Всего", value: "0", color: "text-slate-600" },
      { label: "Срочные", value: "0", color: "text-red-500" }
    ]
  },
  { 
    id: "in-progress", 
    title: "В работе", 
    description: "Активно выполняемые задачи",
    bgGradient: "from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30", 
    borderColor: "border-blue-200 dark:border-blue-700",
    icon: <Zap className="h-4 w-4 text-blue-500" />,
    stats: [
      { label: "Всего", value: "0", color: "text-blue-600" },
      { label: "Блокированы", value: "0", color: "text-orange-500" }
    ]
  },
  { 
    id: "in-review", 
    title: "На проверке", 
    description: "Задачи на стадии проверки",
    bgGradient: "from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30", 
    borderColor: "border-amber-200 dark:border-amber-700",
    icon: <Eye className="h-4 w-4 text-amber-500" />,
    stats: [
      { label: "Всего", value: "0", color: "text-amber-600" },
      { label: "Критичные", value: "0", color: "text-red-500" }
    ]
  },
  { 
    id: "done", 
    title: "Готово", 
    description: "Завершенные задачи",
    bgGradient: "from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30", 
    borderColor: "border-emerald-200 dark:border-emerald-700",
    icon: <Sparkles className="h-4 w-4 text-emerald-500" />,
    stats: [
      { label: "Всего", value: "0", color: "text-emerald-600" },
      { label: "За неделю", value: "0", color: "text-emerald-500" }
    ]
  },
];

// Анимации для карточек
const cardVariants = {
  initial: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95,
    rotateX: -5,
  },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    rotateX: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      mass: 0.8,
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.95,
    transition: {
      duration: 0.2,
    }
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    }
  },
  dragging: {
    scale: 1.05,
    rotateZ: 2,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    }
  }
};

// Анимации для колонок
const columnVariants = {
  initial: { 
    opacity: 0, 
    x: -20,
    scale: 0.95,
  },
  animate: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      staggerChildren: 0.1,
    }
  },
  hover: {
    scale: 1.01,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    }
  }
};

// Компонент колонки с улучшенным дизайном
function KanbanColumn({
  id,
  title,
  description,
  tasks,
  bgGradient,
  borderColor,
  icon,
  stats,
  onTaskClick,
  isOver,
}: {
  id: Status;
  title: string;
  description: string;
  tasks: Task[];
  bgGradient: string;
  borderColor: string;
  icon: React.ReactNode;
  stats?: { label: string; value: string; color: string }[];
  onTaskClick: (task: Task) => void;
  isOver: boolean;
}) {
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
  const { setNodeRef } = useDroppable({ 
    id,
    data: {
      type: 'column',
      status: id
    }
  });

  // Подсчет статистики
  const columnStats = useMemo(() => {
    if (!stats) return [];
    
    const urgentCount = tasks.filter(t => t.priority === 'urgent').length;
    const blockedCount = tasks.filter(t => t.labels.includes('blocked')).length;
    const criticalCount = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCount = tasks.filter(t => new Date(t.updatedAt) > weekAgo).length;

    return stats.map(stat => ({
      ...stat,
      value: stat.label === "Срочные" ? urgentCount.toString() :
             stat.label === "Блокированы" ? blockedCount.toString() :
             stat.label === "Критичные" ? criticalCount.toString() :
             stat.label === "За неделю" ? weekCount.toString() :
             tasks.length.toString()
    }));
  }, [tasks, stats]);

  return (
    <motion.div
      variants={columnVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={cn(
        "rounded-xl border-2 transition-all duration-300 relative overflow-hidden",
        bgGradient,
        borderColor,
        isOver && "ring-2 ring-blue-400 ring-opacity-50 scale-[1.02] shadow-lg"
      )}
      style={{ 
        background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
        minHeight: "calc(100vh - 300px)"
      }}
    >
      {/* Градиентный фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-black/10" />
      
      {/* Заголовок колонки */}
      <div className="relative p-3 sm:p-4 border-b border-white/20 dark:border-gray-700/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 truncate">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {description}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 font-semibold self-start sm:self-auto">
            {tasks.length}
          </Badge>
        </div>

        {/* Статистика */}
        {columnStats.length > 0 && (
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {columnStats.map((stat, index) => (
              <div key={index} className="flex items-center space-x-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.label}:
                </span>
                <span className={cn("text-xs font-semibold", stat.color)}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Контейнер для задач */}
      <div 
        ref={setNodeRef}
        className={cn(
          "flex-1 p-2 sm:p-3 transition-all duration-300 relative",
          isOver && "bg-blue-50/50 dark:bg-blue-900/20"
        )}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <LayoutGroup>
            <AnimatePresence>
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <SortableTaskItem 
                    key={task.id} 
                    task={task} 
                    index={index}
                    onClick={() => onTaskClick(task)} 
                  />
                ))}
                {tasks.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="p-4 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <div className="text-gray-400 dark:text-gray-500 mb-2">
                        <Plus className="h-8 w-8 mx-auto" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Перетащите задачи сюда
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        или создайте новую
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </AnimatePresence>
          </LayoutGroup>
        </SortableContext>
      </div>
    </motion.div>
  );
}

// Улучшенный компонент сортируемой задачи
function SortableTaskItem({ 
  task, 
  index,
  onClick 
}: { 
  task: Task; 
  index: number;
  onClick: () => void; 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id, 
    data: { ...task },
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 9999 : undefined,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      variants={cardVariants}
      initial="initial"
      animate={isDragging ? "dragging" : "animate"}
      whileHover="hover"
      exit="exit"
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 0.8,
        delay: index * 0.05,
      }}
      className={cn(
        "relative",
        isDragging && "z-50"
      )}
      {...attributes}
    >
      <TaskCard 
        task={task} 
        onClick={onClick} 
        isDragging={isDragging} 
        compact 
        dragHandleProps={listeners}
      />
    </motion.div>
  );
}

// Компонент оверлея для перетаскивания
function DragOverlayContent({ task }: { task: Task | null }) {
  if (!task) return null;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
      }}
      className="transform rotate-3"
    >
      <TaskCard 
        task={task} 
        isDragging={true}
        compact
        className="shadow-2xl border-2 border-blue-400"
      />
    </motion.div>
  );
}

// Основной компонент Канбан-страницы
export function KanbanPage() {
  const { tasks, updateTask, reorderTasks, selectedProjectId, users } = useAppStore();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>();
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showStats, setShowStats] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filters, setFilters] = useState({
    assignee: '',
    priority: '',
    type: '',
    search: '',
    dueDate: '',
    labels: [],
  });

  // Настройка сенсоров для drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const projectTasks = useMemo(() => {
    let filtered = selectedProjectId
      ? tasks.filter(task => task.projectId === selectedProjectId)
      : tasks;

    // Применяем поиск
    if (filters.search) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.labels.some(label => label.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Применяем фильтры
    if (filters.assignee) {
      filtered = filtered.filter(task => task.assigneeId === filters.assignee);
    }
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }
    if (filters.type) {
      filtered = filtered.filter(task => task.type === filters.type);
    }
    if (filters.dueDate) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const nextWeekStart = new Date(weekStart);
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);

      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        
        switch (filters.dueDate) {
          case 'today':
            return dueDate >= today && dueDate < tomorrow;
          case 'tomorrow':
            return dueDate >= tomorrow && dueDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);
          case 'this-week':
            return dueDate >= weekStart && dueDate <= weekEnd;
          case 'next-week':
            return dueDate >= nextWeekStart && dueDate <= nextWeekEnd;
          case 'overdue':
            return dueDate < today;
          default:
            return true;
        }
      });
    }
    if (filters.labels.length > 0) {
      filtered = filtered.filter(task => 
        filters.labels.some(label => task.labels.includes(label))
      );
    }

    return filtered;
  }, [tasks, selectedProjectId, filters]);

  const tasksByStatus = useMemo(() => {
    return statusColumns.reduce((acc, column) => {
      acc[column.id] = projectTasks
        .filter((task) => task.status === column.id)
        .sort((a, b) => (a.position || 0) - (b.position || 0));
      return acc;
    }, {} as Record<Status, Task[]>);
  }, [projectTasks]);

  // Статистика проекта
  const projectStats = useMemo(() => {
    const total = projectTasks.length;
    const completed = projectTasks.filter(t => t.status === 'done').length;
    const inProgress = projectTasks.filter(t => t.status === 'in-progress').length;
    const urgent = projectTasks.filter(t => t.priority === 'urgent').length;
    const overdue = projectTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date()
    ).length;

    return {
      total,
      completed,
      inProgress,
      urgent,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [projectTasks]);

  const findContainer = (id: UniqueIdentifier) => {
    for (const status of Object.keys(tasksByStatus) as Status[]) {
      if (tasksByStatus[status].some(task => task.id === id)) {
        return status;
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = projectTasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeContainer = findContainer(active.id);

    // Проверяем, если сбрасываем на колонку
    if (over.data.current?.type === 'column') {
      const targetStatus = over.data.current.status as Status;
      if (activeContainer !== targetStatus) {
        updateTask(active.id as string, { status: targetStatus });
      }
      return;
    }

    // Проверяем, если сбрасываем на другую задачу
    const overTaskContainer = findContainer(over.id);
    if (!activeContainer || !overTaskContainer) return;

    if (activeContainer !== overTaskContainer) {
      // Задача перемещена в новую колонку - обновляем статус
      updateTask(active.id as string, { status: overTaskContainer as Status });
    } else {
      // Та же колонка - обрабатываем переупорядочивание
      const activeIndex = tasksByStatus[activeContainer].findIndex(t => t.id === active.id);
      const overIndex = tasksByStatus[overTaskContainer].findIndex(t => t.id === over.id);

      if (activeIndex !== overIndex) {
        reorderTasks(active.id as string, over.id as string);
      }
    }
  };

  const openCreateModal = () => {
    setEditingTaskId(undefined);
    setTaskModalOpen(true);
  };

  const openEditModal = (taskId: string) => {
    setEditingTaskId(taskId);
    setTaskModalOpen(true);
  };

  const closeModal = () => {
    setTaskModalOpen(false);
    setEditingTaskId(undefined);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailModalOpen(true);
  };

  const closeTaskDetailModal = () => {
    setTaskDetailModalOpen(false);
    setSelectedTask(null);
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      assignee: '',
      priority: '',
      type: '',
      search: '',
      dueDate: '',
      labels: [],
    });
  };

  // Получаем доступные метки
  const availableLabels = useMemo(() => {
    const labels = new Set<string>();
    projectTasks.forEach(task => {
      task.labels.forEach(label => labels.add(label));
    });
    return Array.from(labels);
  }, [projectTasks]);

  if (!selectedProjectId) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6"
      >
        <h1 className="text-3xl font-bold mb-6">Канбан-доска</h1>
        <div className="text-center text-muted-foreground">
          Выберите проект для отображения канбан-доски.
        </div>
      </motion.div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      autoScroll={{
        thresholds: {
          x: 0.1,
          y: 0.25,
        },
        acceleration: 5,
        interval: 10,
        activator: AutoScrollActivator.DraggableRect,
        order: TraversalOrder.ReversedTreeOrder,
      }}
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "h-full flex flex-col transition-all duration-300",
          isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-gray-900" : "p-3 sm:p-4 lg:p-6"
        )}
      >
        {/* Заголовок с контролами */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent"
            >
              Канбан-доска
            </motion.h1>
            
            {/* Статистика */}
            {showStats && (
              <KanbanStats tasks={projectTasks} compact={true} />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Фильтры */}
            <FilterPanel
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              users={users}
              availableLabels={availableLabels}
            />

            {/* Переключение режимов */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="flex items-center space-x-1"
              >
                <Grid3X3 className="h-4 w-4" />
                <span>Канбан</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center space-x-1"
              >
                <List className="h-4 w-4" />
                <span>Список</span>
              </Button>
            </div>

            {/* Дополнительные действия */}
            <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
              {showStats ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>

            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>

            <Button onClick={openCreateModal} className="bg-[#2c5545] hover:bg-[#2c5545]/90 text-white shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Создать задачу
            </Button>
          </div>
        </div>

        {/* Основной контент */}
        <div className="flex-1 relative">
          {viewMode === 'kanban' ? (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 h-full"
            >
              {statusColumns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  description={column.description}
                  tasks={tasksByStatus[column.id] || []}
                  bgGradient={column.bgGradient}
                  borderColor={column.borderColor}
                  icon={column.icon}
                  stats={column.stats}
                  onTaskClick={handleTaskClick}
                  isOver={false}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Списочный вид */}
              {projectTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TaskCard 
                    task={task} 
                    onClick={() => handleTaskClick(task)}
                    className="hover:shadow-lg"
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? <DragOverlayContent task={activeTask} /> : null}
        </DragOverlay>

        {/* Модальные окна */}
        <TaskModal
          isOpen={taskModalOpen}
          onClose={closeModal}
          taskId={editingTaskId}
        />

        <TaskDetailModal
          task={selectedTask}
          isOpen={taskDetailModalOpen}
          onClose={closeTaskDetailModal}
        />
      </motion.div>
    </DndContext>
  );
} 