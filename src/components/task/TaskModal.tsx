import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Trash2, Calendar, User, Tag } from 'lucide-react';
import { Task, TaskType, Priority, Status } from '@/types';
import { useAppStore } from '@/store';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { generateId } from '@/lib/utils';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  defaultStatus?: Status;
}

interface TaskFormData {
  title: string;
  description: string;
  type: TaskType;
  priority: Priority;
  status: Status;
  storyPoints?: number;
  labels?: string;
  dueDate?: string;
  assigneeId?: string;
}

export function TaskModal({ isOpen, onClose, task, defaultStatus = 'todo' }: TaskModalProps) {
  const { addTask, updateTask, deleteTask, selectedProjectId, projects } = useAppStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      type: 'task',
      priority: 'medium',
      status: defaultStatus,
      storyPoints: undefined,
      labels: '',
      dueDate: '',
      assigneeId: '',
    },
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  useEffect(() => {
    if (task) {
      // Edit mode - populate form with task data
      reset({
        title: task.title,
        description: task.description || '',
        type: task.type,
        priority: task.priority,
        status: task.status,
        storyPoints: task.storyPoints,
        labels: task.labels?.join(', ') || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assigneeId: task.assigneeId || '',
      });
    } else {
      // Create mode - use default values
      reset({
        title: '',
        description: '',
        type: 'task',
        priority: 'medium',
        status: defaultStatus,
        storyPoints: undefined,
        labels: '',
        dueDate: '',
        assigneeId: '',
      });
    }
  }, [task, defaultStatus, reset]);

  const onSubmit = async (data: TaskFormData) => {
    if (!selectedProjectId) {
      toast.warning('Please select a project first');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: data.title,
        description: data.description || undefined,
        type: data.type,
        priority: data.priority,
        status: data.status,
        projectId: selectedProjectId,
        storyPoints: data.storyPoints || undefined,
        labels: data.labels ? data.labels.split(',').map(l => l.trim()).filter(l => l) : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        assigneeId: data.assigneeId || undefined,
      };

      if (task) {
        // Update existing task
        updateTask(task.id, taskData);
        toast.taskUpdated(data.title);
      } else {
        // Create new task
        addTask({
          ...taskData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        toast.taskCreated(data.title);
      }

      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(task ? 'Failed to update task' : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!task) return;
    
    const confirmed = confirm('Are you sure you want to delete this task? This action cannot be undone.');
    if (confirmed) {
      try {
        deleteTask(task.id);
        toast.taskDeleted(task.title);
        onClose();
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'Enter':
            event.preventDefault();
            handleSubmit(onSubmit)();
            break;
          case 'Escape':
            event.preventDefault();
            onClose();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleSubmit, onSubmit, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <div className="flex items-center space-x-2">
            {task && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Project Info */}
          {selectedProject && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Project:</strong> {selectedProject.name} ({selectedProject.key})
              </p>
            </div>
          )}

          {!selectedProject && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Warning:</strong> No project selected. Please select a project from the sidebar first.
              </p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title..."
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task description..."
              disabled={isSubmitting}
            />
          </div>

          {/* Type and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="task">Task</option>
                <option value="story">User Story</option>
                <option value="bug">Bug</option>
                <option value="epic">Epic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Status and Story Points Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="in-review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Story Points
              </label>
              <input
                {...register('storyPoints', { 
                  min: { value: 1, message: 'Story points must be at least 1' },
                  max: { value: 100, message: 'Story points cannot exceed 100' }
                })}
                type="number"
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. 3"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Labels
            </label>
            <input
              {...register('labels')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter labels separated by commas..."
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple labels with commas (e.g., frontend, urgent, bug-fix)
            </p>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              {...register('dueDate')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedProjectId}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{task ? 'Update Task' : 'Create Task'}</span>
            </Button>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="text-xs text-gray-500 pt-2 border-t">
            <p>💡 <strong>Shortcuts:</strong> Ctrl+Enter to save, Escape to close</p>
          </div>
        </form>
      </div>
    </div>
  );
} 