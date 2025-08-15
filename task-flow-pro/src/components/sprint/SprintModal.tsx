import { X, Calendar, Target, Users, AlertCircle, Clock } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { useAppStore } from "@/store";
import type { Sprint } from "@/types";

interface SprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprintId?: string;
}

interface SprintFormData {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  capacity?: number;
}

export function SprintModal({ isOpen, onClose, sprintId }: SprintModalProps) {
  const { sprints, addSprint, updateSprint, selectedProjectId, tasks } = useAppStore();
  const { success, error } = useToast();
  
  const existingSprint = sprintId ? sprints.find(s => s.id === sprintId) : null;
  const backlogTasks = tasks.filter(t => t.projectId === selectedProjectId && !t.sprintId);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch
  } = useForm<SprintFormData>({
    defaultValues: {
      name: "",
      goal: "",
      startDate: "",
      endDate: "",
      capacity: 40,
    }
  });

  useEffect(() => {
    if (existingSprint) {
      reset({
        name: existingSprint.name,
        goal: existingSprint.goal || "",
        startDate: new Date(existingSprint.startDate).toISOString().split('T')[0],
        endDate: new Date(existingSprint.endDate).toISOString().split('T')[0],
        capacity: existingSprint.capacity || 40,
      });
    } else {
      // Auto-generate sprint name based on existing sprints
      const sprintNumber = sprints.filter(s => s.projectId === selectedProjectId).length + 1;
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 14);
      
      reset({
        name: `Sprint ${sprintNumber}`,
        goal: "",
        startDate: today.toISOString().split('T')[0],
        endDate: nextWeek.toISOString().split('T')[0],
        capacity: 40,
      });
    }
  }, [existingSprint, reset, isOpen, sprints, selectedProjectId]);

  const onSubmit = async (data: SprintFormData) => {
    if (!selectedProjectId) {
      error("Please select a project first");
      return;
    }

    try {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      // Validation
      if (endDate <= startDate) {
        error("End date must be after start date");
        return;
      }

      const sprintData: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'> = {
        name: data.name.trim(),
        goal: data.goal.trim() || undefined,
        projectId: selectedProjectId,
        startDate,
        endDate,
        capacity: data.capacity,
        status: existingSprint?.status || "planned",
      };

      if (sprintId) {
        updateSprint(sprintId, sprintData);
        success("✅ Спринт успешно обновлен!");
      } else {
        addSprint(sprintData);
        success("🎉 Спринт успешно создан!");
      }
      
      onClose();
    } catch (err) {
      error("Не удалось сохранить спринт. Попробуйте еще раз.");
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

  // Calculate sprint duration
  const calculateDuration = () => {
    const start = watch("startDate");
    const end = watch("endDate");
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  };

  const duration = calculateDuration();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div 
        className="bg-card rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-modalIn"
        onKeyDown={handleKeyDown}
      >
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <Target className="h-3 w-3 text-white" />
            </div>
            <h2 className="text-xl font-semibold">
              {sprintId ? "Редактировать спринт" : "Создать новый спринт"}
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {!selectedProjectId && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                Please select a project before creating sprints
              </span>
            </div>
          )}

          {/* Sprint Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Sprint Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("name", { 
                required: "Sprint name is required",
                minLength: { value: 3, message: "Name must be at least 3 characters" },
                maxLength: { value: 50, message: "Name must be less than 50 characters" }
              })}
              className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Sprint 1, Alpha Release, etc."
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Sprint Goal */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center space-x-1">
              <Target className="h-4 w-4" />
              <span>Цель спринта</span>
            </label>
            <textarea
              {...register("goal")}
              className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring h-20 resize-none"
              placeholder="What do you want to accomplish in this sprint?"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Дата начала <span className="text-red-500">*</span></span>
              </label>
              <input
                type="date"
                {...register("startDate", { required: "Start date is required" })}
                className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Дата окончания <span className="text-red-500">*</span></span>
              </label>
              <input
                type="date"
                {...register("endDate", { required: "End date is required" })}
                className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                min={watch("startDate") || new Date().toISOString().split('T')[0]}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Duration Display */}
          {duration > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Sprint Duration: {duration} days
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                {duration < 7 && "⚠️ Very short sprint (< 1 week)"}
                {duration >= 7 && duration <= 14 && "✅ Standard sprint length (1-2 weeks)"}
                {duration > 14 && duration <= 21 && "⚠️ Long sprint (2-3 weeks)"}
                {duration > 21 && "🚨 Very long sprint (> 3 weeks)"}
              </p>
            </div>
          )}

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Емкость команды (Очки истории)</span>
            </label>
            <input
              type="number"
              {...register("capacity", { 
                valueAsNumber: true,
                min: { value: 1, message: "Capacity must be at least 1" },
                max: { value: 200, message: "Capacity must be less than 200" }
              })}
              className="w-full p-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              min="1"
              max="200"
              placeholder="40"
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Estimated story points your team can complete
            </p>
          </div>

          {/* Backlog Info */}
          {backlogTasks.length > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">📋 Available for Planning:</h4>
              <p className="text-sm text-muted-foreground">
                {backlogTasks.length} task(s) in backlog • 
                {backlogTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0)} total story points
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tasks can be assigned to this sprint from the Backlog page
              </p>
            </div>
          )}

          {/* Preview */}
          {watch("name") && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Предварительный просмотр:</h4>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium">{watch("name")}</h5>
                  {watch("goal") && (
                    <p className="text-sm text-muted-foreground mt-1">
                      🎯 {watch("goal")}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    {watch("startDate") && watch("endDate") && (
                      <span>📅 {new Date(watch("startDate")).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })} - {new Date(watch("endDate")).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}</span>
                    )}
                    {watch("capacity") && (
                      <span>🎯 {watch("capacity")} pts capacity</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <div className="text-xs text-muted-foreground">
              💡 Совет: используйте Ctrl+Enter для быстрого сохранения
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !selectedProjectId}
                className="min-w-[120px]"
                data-testid="sprint-submit"
              >
                {isSubmitting ? "Сохранение..." : (sprintId ? "Обновить спринт" : "Создать спринт")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}