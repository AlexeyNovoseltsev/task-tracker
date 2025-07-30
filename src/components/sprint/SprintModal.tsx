import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, Calendar, Target, Users } from 'lucide-react';
import { Sprint } from '@/types';
import { useAppStore } from '@/store';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { generateId } from '@/lib/utils';

interface SprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprint?: Sprint | null;
}

interface SprintFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  goal: string;
}

export function SprintModal({ isOpen, onClose, sprint }: SprintModalProps) {
  const { addSprint, updateSprint, selectedProjectId } = useAppStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<SprintFormData>({
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      capacity: 40,
      goal: '',
    },
  });

  const startDate = watch('startDate');

  useEffect(() => {
    if (sprint) {
      // Edit mode - populate form with sprint data
      reset({
        name: sprint.name,
        description: sprint.description || '',
        startDate: sprint.startDate.toISOString().split('T')[0],
        endDate: sprint.endDate.toISOString().split('T')[0],
        capacity: sprint.capacity || 40,
        goal: sprint.goal || '',
      });
    } else {
      // Create mode - calculate default dates
      const today = new Date();
      const twoWeeksLater = new Date(today);
      twoWeeksLater.setDate(today.getDate() + 14);
      
      reset({
        name: `Sprint ${Date.now().toString().slice(-4)}`,
        description: '',
        startDate: today.toISOString().split('T')[0],
        endDate: twoWeeksLater.toISOString().split('T')[0],
        capacity: 40,
        goal: '',
      });
    }
  }, [sprint, reset]);

  const onSubmit = async (data: SprintFormData) => {
    if (!selectedProjectId) {
      toast.warning('Please select a project first');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const sprintData: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'> = {
        name: data.name,
        description: data.description || undefined,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        capacity: data.capacity,
        goal: data.goal || undefined,
        projectId: selectedProjectId,
        status: sprint?.status || 'planned',
        taskIds: sprint?.taskIds || [],
      };

      if (sprint) {
        // Update existing sprint
        updateSprint(sprint.id, sprintData);
        toast.success(`Sprint "${data.name}" has been updated successfully`);
      } else {
        // Create new sprint
        addSprint(sprintData);
        toast.sprintCreated(data.name);
      }

      onClose();
    } catch (error) {
      console.error('Error saving sprint:', error);
      toast.error(sprint ? 'Failed to update sprint' : 'Failed to create sprint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateSprintDuration = () => {
    if (!startDate || !watch('endDate')) return 0;
    const start = new Date(startDate);
    const end = new Date(watch('endDate'));
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
            {sprint ? 'Edit Sprint' : 'Create New Sprint'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {!selectedProjectId && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Warning:</strong> No project selected. Please select a project from the sidebar first.
              </p>
            </div>
          )}

          {/* Sprint Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sprint Name *
            </label>
            <input
              {...register('name', { required: 'Sprint name is required' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter sprint name..."
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Sprint Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sprint Goal
            </label>
            <input
              {...register('goal')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What is the main objective of this sprint?"
              disabled={isSubmitting}
            />
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
              placeholder="Additional details about this sprint..."
              disabled={isSubmitting}
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                {...register('startDate', { required: 'Start date is required' })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                {...register('endDate', { 
                  required: 'End date is required',
                  validate: (value) => {
                    if (startDate && new Date(value) <= new Date(startDate)) {
                      return 'End date must be after start date';
                    }
                    return true;
                  }
                })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Sprint Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-4 text-sm text-blue-800">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Duration: {calculateSprintDuration()} days</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Capacity: {watch('capacity')} hours</span>
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Capacity (hours)
            </label>
            <input
              {...register('capacity', { 
                required: 'Capacity is required',
                min: { value: 1, message: 'Capacity must be at least 1 hour' },
                max: { value: 200, message: 'Capacity cannot exceed 200 hours' }
              })}
              type="number"
              min="1"
              max="200"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. 40"
              disabled={isSubmitting}
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Total hours the team can commit during this sprint
            </p>
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
              <span>{sprint ? 'Update Sprint' : 'Create Sprint'}</span>
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