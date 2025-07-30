import { useState } from "react";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Edit } from "lucide-react";
import { TaskModal } from "@/components/task/TaskModal";

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
                    className={cn(
                      "bg-white dark:bg-gray-900 p-4 rounded-lg border-l-4 shadow-sm cursor-move group hover-lift",
                      "hover:shadow-md transition-all duration-200 animate-slideIn",
                      getPriorityColor(task.priority),
                      draggedTask === task.id && "opacity-50 rotate-2 scale-105 z-50"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg">{getTypeIcon(task.type)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(task.id);
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {task.labels && task.labels.length > 0 && (
                          <div className="flex space-x-1">
                            {task.labels.slice(0, 2).map((label) => (
                              <span
                                key={label}
                                className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {task.storyPoints && (
                        <div className="text-xs font-medium bg-primary text-primary-foreground px-2 py-1 rounded">
                          {task.storyPoints}
                        </div>
                      )}
                    </div>

                    {task.dueDate && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
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
    </div>
  );
} 