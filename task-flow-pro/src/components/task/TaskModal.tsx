import { X, Calendar, User, Tag, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { useToast } from "@/hooks/useToast";
import { ApiError } from "@/lib/api";
import { createTaskInApi, isApiMode, isUuid, updateTaskInApi } from "@/lib/dataSync";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import type { Task, TaskType, Status, Priority } from "@/types";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string;
}

interface TaskFormData {
  title: string;
  description: string;
  type: TaskType;
  status: Status;
  priority: Priority;
  storyPoints?: number;
  labels: string;
  dueDate?: string;
  assigneeId?: string;
  color?: string;
}

export function TaskModal({ isOpen, onClose, taskId }: TaskModalProps) {
  const { tasks, addTask, updateTask, deleteTask, importTask, selectedProjectId, users } = useAppStore();
  const { user } = useAuth();
  const { success, error } = useToast();
  const projectIdForTask = selectedProjectId && isUuid(selectedProjectId) ? selectedProjectId : undefined;
  
  const existingTask = taskId ? tasks.find(t => t.id === taskId) : null;
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
    watch
  } = useForm<TaskFormData>({
    defaultValues: {
      title: "",
      description: "",
      type: "story",
      status: "todo",
      priority: "medium",
      storyPoints: 1,
      labels: "",
      dueDate: "",
      assigneeId: "user-1",
      color: "#3b82f6", // Синий цвет по умолчанию
    }
  });

  useEffect(() => {
    if (existingTask) {
      reset({
        title: existingTask.title,
        description: existingTask.description || "",
        type: existingTask.type,
        status: existingTask.status,
        priority: existingTask.priority,
        storyPoints: existingTask.storyPoints || 1,
        labels: existingTask.labels?.join(", ") || "",
        dueDate: existingTask.dueDate ? new Date(existingTask.dueDate).toISOString().split('T')[0] : "",
        assigneeId: existingTask.assigneeId || "user-1",
        color: existingTask.color || "#3b82f6",
      });
    } else {
      reset({
        title: "",
        description: "",
        type: "story",
        status: "todo",
        priority: "medium",
        storyPoints: 1,
        labels: "",
        dueDate: "",
        assigneeId: "user-1",
        color: "#3b82f6",
      });
    }
  }, [existingTask, reset, isOpen]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: data.title.trim(),
        description: data.description.trim() || undefined,
        type: data.type,
        status: data.status,
        priority: data.priority,
        storyPoints: data.storyPoints,
        projectId: projectIdForTask,
        assigneeId: isUuid(data.assigneeId) ? data.assigneeId : undefined,
        reporterId: user?.id,
        labels: data.labels.split(",").map(l => l.trim()).filter(Boolean),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        color: data.color,
        watchers: [],
        attachments: [],
        linkedTasks: [],
      };

      const canSync = isApiMode();

      if (taskId) {
        if (canSync && isUuid(taskId)) {
          const saved = await updateTaskInApi(taskId, taskData);
          importTask(saved);
        } else {
          updateTask(taskId, taskData);
        }
        success("✅ Задача успешно обновлена!");
      } else {
        if (canSync) {
          const saved = await createTaskInApi(taskData, projectIdForTask);
          importTask(saved);
        } else {
          addTask(taskData);
        }
        success("🎉 Задача успешно создана!");
      }
      
      onClose();
    } catch (err) {
      const message = err instanceof ApiError
        ? err.message
        : "Не удалось сохранить задачу. Попробуйте еще раз.";
      error(message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(onSubmit)();
    }
  };

  const handleDeleteTask = () => {
    if (!taskId) return;
    
    const confirmed = window.confirm('Вы уверены, что хотите удалить эту задачу? Это действие нельзя отменить.');
    if (confirmed) {
      try {
        deleteTask(taskId);
        success("🗑️ Задача успешно удалена!");
        onClose();
      } catch (err) {
        error("Не удалось удалить задачу. Попробуйте еще раз.");
      }
    }
  };

  if (!isOpen) return null;

  const typeIcons: Record<TaskType, string> = {
    story: "📖",
    task: "✅", 
    bug: "🐛",
    epic: "🎯"
  };

  const priorityColors: Record<Priority, string> = {
    low: "text-green-600 bg-green-100 dark:bg-green-900/30",
    medium: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
    high: "text-red-600 bg-red-100 dark:bg-red-900/30",
    urgent: "text-red-800 bg-red-200 dark:bg-red-800/30"
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div 
        className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-modalIn"
        onKeyDown={handleKeyDown}
      >
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{typeIcons[watch("type") || "story"]}</span>
            <h2 className="text-xl font-semibold">
              {taskId ? "Редактировать задачу" : "Создать новую задачу"}
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {!projectIdForTask && (
            <div className="flex items-center space-x-2 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Личная задача — без проекта. Выберите проект в сайдбаре, чтобы привязать к нему.
              </span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              {...register("title", { 
                required: "Название обязательно",
                minLength: { value: 3, message: "Название должно содержать минимум 3 символа" },
                maxLength: { value: 100, message: "Название не может превышать 100 символов" }
              })}
              className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Введите название задачи..."
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Описание</label>
            <textarea
              {...register("description")}
              className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring h-24 resize-none"
              placeholder="Опишите задачу подробно..."
            />
          </div>

          {/* Type, Priority, Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Тип</label>
              <select
                {...register("type", { required: "Тип обязателен" })}
                className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="story">📖 Пользовательская история</option>
                <option value="task">✅ Задача</option>
                <option value="bug">🐛 Ошибка</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Приоритет</label>
              <select
                {...register("priority", { required: "Приоритет обязателен" })}
                className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="low">🟢 Низкий</option>
                <option value="medium">🟡 Средний</option>
                <option value="high">🔴 Высокий</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Статус</label>
              <select
                {...register("status", { required: "Статус обязателен" })}
                className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="todo">📝 К выполнению</option>
                <option value="in-progress">⚡ В работе</option>
                <option value="in-review">👀 На проверке</option>
                <option value="done">✅ Готово</option>
              </select>
            </div>
          </div>

          {/* Story Points and Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-1">
                <span>Очки истории</span>
                <span className="text-xs text-muted-foreground">(Фибоначчи: 1,2,3,5,8,13,21)</span>
              </label>
              <select
                {...register("storyPoints", { 
                  valueAsNumber: true,
                  min: { value: 1, message: "Должно быть минимум 1" }
                })}
                className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value={1}>1 - Очень маленькая</option>
                <option value={2}>2 - Маленькая</option>
                <option value={3}>3 - Средняя</option>
                <option value={5}>5 - Большая</option>
                <option value={8}>8 - Очень большая</option>
                <option value={13}>13 - Огромная</option>
                <option value={21}>21 - Эпик</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>Исполнитель</span>
              </label>
              <select
                {...register("assigneeId")}
                className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date and Labels */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Дата выполнения</span>
              </label>
              <input
                type="date"
                {...register("dueDate")}
                className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-1">
                <Tag className="h-4 w-4" />
                <span>Метки</span>
              </label>
              <input
                {...register("labels")}
                className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="фронтенд, бэкенд, срочно"
              />
              <p className="text-xs text-muted-foreground mt-1">Метки через запятую</p>
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center space-x-1">
              <span>🎨</span>
              <span>Цвет карточки</span>
            </label>
            <ColorPicker
              value={watch("color") || "#667eea"}
              onChange={(color) => setValue("color", color)}
              className="w-full"
            />
          </div>

          {/* Preview */}
          {watch("title") && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Предпросмотр:</h4>
              <div className="flex items-start space-x-3">
                <span className="text-lg">{typeIcons[watch("type") || "story"]}</span>
                <div className="flex-1">
                  <h5 className="font-medium">{watch("title")}</h5>
                  {watch("description") && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {watch("description")}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[watch("priority") || "medium"]}`}>
                      {watch("priority")?.toUpperCase()}
                    </span>
                    {watch("storyPoints") && (
                      <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium">
                        {watch("storyPoints")} pts
                      </span>
                    )}
                    {watch("labels") && (
                      <div className="flex space-x-1">
                        {watch("labels").split(",").map((label, i) => (
                          label.trim() && (
                            <span key={i} className="px-2 py-1 bg-secondary rounded text-xs">
                              {label.trim()}
                            </span>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Предпросмотр в календаре */}
              <div className="mt-3 pt-3 border-t border-border/50">
                <h5 className="text-sm font-medium mb-2">В календаре:</h5>
                <div 
                  className="p-2 rounded text-xs text-white font-medium truncate"
                  style={{ 
                    backgroundColor: watch("color") || '#3b82f6',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  {watch("title")}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <div className="text-xs text-muted-foreground">
              💡 Совет: Используйте Ctrl+Enter для быстрого сохранения
            </div>
            <div className="flex space-x-2">
              {taskId && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDeleteTask}
                  className="min-w-[100px]"
                >
                  Удалить
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[100px] bg-[#2c5545] hover:bg-[#2c5545]/90 text-white"
              >
                {isSubmitting ? "Сохранение..." : (taskId ? "Обновить задачу" : "Создать задачу")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}