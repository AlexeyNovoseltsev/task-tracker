import { useState } from "react";
import { useAppStore } from "@/store";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Search, Filter, Edit, Trash } from "lucide-react";
import { TaskModal } from "@/components/task/TaskModal";
import { TaskDetailModal } from "@/components/task/TaskDetailModal";
import { TaskCard } from "@/components/task/TaskCard";

export function BacklogPage() {
  const { tasks, selectedProjectId, deleteTask } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>();
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const projectTasks = selectedProjectId 
    ? tasks.filter(task => task.projectId === selectedProjectId)
    : tasks;

  // Filter tasks for backlog (not in sprints and not done)
  const backlogTasks = projectTasks.filter(task => 
    !task.sprintId && task.status !== "done"
  );

  // Apply search and priority filters
  const filteredTasks = backlogTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100 dark:bg-red-900/30";
      case "medium": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "low": return "text-green-600 bg-green-100 dark:bg-green-900/30";
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug": return "🐛";
      case "story": return "📖";
      case "task": return "✅";
      default: return "📝";
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

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    if (confirm(`Вы уверены, что хотите удалить "${taskTitle}"?`)) {
      deleteTask(taskId);
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Бэклог продукта</h1>
        <div className="text-center text-muted-foreground">
          Выберите проект для просмотра бэклога.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Бэклог продукта</h1>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить задачу
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Поиск задач..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Все приоритеты</option>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>
        </div>
      </div>

      {/* Priority Guide */}
      <div className="mb-6 bg-card p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2">Руководство по приоритетам</h3>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Высокий - критичные проблемы, блокирующие функции</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Средний - важные функции, запланированная работа</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Низкий - желательные функции, будущие улучшения</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {backlogTasks.length === 0 
              ? "Нет задач в бэклоге. Создайте первую задачу!" 
              : "Нет задач, соответствующих фильтрам."}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
              onEdit={() => openEditModal(task.id)}
              onDelete={() => handleDeleteTask(task.id, task.title)}
              showProject={!selectedProjectId}
            />
          ))
        )}
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-primary">{backlogTasks.length}</div>
          <div className="text-sm text-muted-foreground">Всего в бэклоге</div>
        </div>
        <div className="bg-card p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-red-500">
            {backlogTasks.filter(t => t.priority === "high").length}
          </div>
          <div className="text-sm text-muted-foreground">Высокий приоритет</div>
        </div>
        <div className="bg-card p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-primary">
            {backlogTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0)}
          </div>
          <div className="text-sm text-muted-foreground">Всего очков</div>
        </div>
        <div className="bg-card p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-green-500">
            {backlogTasks.filter(t => t.type === "story").length}
          </div>
          <div className="text-sm text-muted-foreground">Пользов. истории</div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={closeModal}
        taskId={editingTaskId}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={taskDetailModalOpen}
        onClose={closeTaskDetailModal}
      />
    </div>
  );
} 