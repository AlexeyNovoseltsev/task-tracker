import { useState } from "react";
import { useAppStore } from "@/store";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Edit } from "lucide-react";
import { TaskModal } from "@/components/task/TaskModal";
import { TaskDetailModal } from "@/components/task/TaskDetailModal";
import { TaskCard } from "@/components/task/TaskCard";

type Status = "todo" | "in-progress" | "in-review" | "done";

const statusColumns: { id: Status; title: string; bgColor: string }[] = [
  { id: "todo", title: "К выполнению", bgColor: "bg-slate-100 dark:bg-slate-800" },
  { id: "in-progress", title: "В работе", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "in-review", title: "На проверке", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" },
  { id: "done", title: "Готово", bgColor: "bg-green-100 dark:bg-green-900/30" },
];

export function KanbanPage() {
  const { tasks, updateTask, selectedProjectId } = useAppStore();
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<Status | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>();
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const projectTasks = selectedProjectId 
    ? tasks.filter(task => task.projectId === selectedProjectId)
    : tasks;

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (status: Status) => {
    setDraggedOverColumn(status);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the column area completely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX, clientY } = e;
    
    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      setDraggedOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    if (draggedTask) {
      const task = tasks.find(t => t.id === draggedTask);
      if (task && task.status !== status) {
        updateTask(draggedTask, { status });
        // Можно добавить тост-уведомление
      }
      setDraggedTask(null);
      setDraggedOverColumn(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-red-500";
      case "medium": return "border-l-yellow-500";
      case "low": return "border-l-green-500";
      default: return "border-l-gray-500";
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

  if (!selectedProjectId) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Канбан-доска</h1>
        <div className="text-center text-muted-foreground">
          Выберите проект для отображения канбан-доски.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Канбан-доска</h1>
        <div className="text-sm text-muted-foreground">
          Всего задач: {projectTasks.length}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {statusColumns.map((column) => {
          const columnTasks = projectTasks.filter(task => task.status === column.id);
          
          return (
            <div
              key={column.id}
              className={cn(
                "rounded-lg p-4 flex flex-col transition-all duration-200",
                column.bgColor,
                draggedOverColumn === column.id && draggedTask 
                  ? "ring-2 ring-primary bg-primary/10 scale-[1.02]" 
                  : ""
              )}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{column.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {columnTasks.length}
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0"
                    onClick={openCreateModal}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <TaskCard
                      task={task}
                      onClick={() => handleTaskClick(task)}
                      onEdit={() => openEditModal(task.id)}
                      isDragging={draggedTask === task.id}
                      compact={true}
                    />
                  </div>
                ))}

                {columnTasks.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    Перетащите задачи сюда
                  </div>
                )}
              </div>
            </div>
          );
        })}
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