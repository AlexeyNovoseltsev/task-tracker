import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Search, Filter, Edit, Trash } from "lucide-react";
import { useState, useMemo } from "react";

import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import { TaskCard } from "@/components/task/TaskCard";
import { TaskDetailModal } from "@/components/task/TaskDetailModal";
import { TaskModal } from "@/components/task/TaskModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { Task } from "@/types";

function SortableTaskCard({ task, onEdit, onDelete, onClick }: { task: Task, onEdit: () => void, onDelete: () => void, onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  // For now, we will not implement the modals inside the sortable card
  // to keep it simple.
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard
        task={task}
        isDragging={isDragging}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={listeners}
      />
    </div>
  );
}

export function BacklogPage() {
  const { tasks, selectedProjectId, deleteTask, reorderTasks } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>();
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const projectTasks = selectedProjectId 
    ? tasks.filter(task => task.projectId === selectedProjectId)
    : tasks;

  // Filter tasks for backlog (not in sprints and not done)
  const backlogTasks = projectTasks.filter(task => 
    !task.sprintId && task.status !== "done"
  );

  // Apply search and priority filters
  const filteredTasks = backlogTasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => (a.position || 0) - (b.position || 0));

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

  const handleDeleteRequest = (task: Task) => {
    setTaskToDelete(task);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      setIsConfirmOpen(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderTasks(active.id as string, over.id as string);
    }
  };

  const taskIds = useMemo(() => filteredTasks.map(t => t.id), [filteredTasks]);

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
          <Input
            type="text"
            placeholder="Поиск задач..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Приоритет" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все приоритеты</SelectItem>
              <SelectItem value="high">Высокий</SelectItem>
              <SelectItem value="medium">Средний</SelectItem>
              <SelectItem value="low">Низкий</SelectItem>
            </SelectContent>
          </Select>
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
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {backlogTasks.length === 0
                  ? "Нет задач в бэклоге. Создайте первую задачу!"
                  : "Нет задач, соответствующих фильтрам."}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onClick={() => handleTaskClick(task)}
                  onEdit={() => openEditModal(task.id)}
                  onDelete={() => handleDeleteRequest(task)}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

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

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Удалить задачу "${taskToDelete?.title}"?`}
        description="Это действие нельзя отменить. Задача будет удалена навсегда."
        confirmText="Удалить"
      />
    </div>
  );
} 