import { format, differenceInDays, isAfter, isBefore } from 'date-fns';
import { Calendar, Target, Users, PlayCircle, PauseCircle, CheckCircle, Clock } from 'lucide-react';
import { Sprint } from '@/types';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SprintCardProps {
  sprint: Sprint;
  onEdit: (sprint: Sprint) => void;
  onStart?: (sprintId: string) => void;
  onComplete?: (sprintId: string) => void;
}

const statusConfig = {
  planned: {
    label: 'Planned',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
  },
  active: {
    label: 'Active',
    color: 'bg-blue-100 text-blue-800',
    icon: PlayCircle,
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
};

export function SprintCard({ sprint, onEdit, onStart, onComplete }: SprintCardProps) {
  const { tasks } = useAppStore();
  
  const sprintTasks = tasks.filter(task => sprint.taskIds.includes(task.id));
  const completedTasks = sprintTasks.filter(task => task.status === 'done');
  const totalStoryPoints = sprintTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
  const completedStoryPoints = completedTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
  
  const now = new Date();
  const isOverdue = isAfter(now, sprint.endDate) && sprint.status !== 'completed';
  const daysRemaining = differenceInDays(sprint.endDate, now);
  const progress = totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0;
  
  const StatusIcon = statusConfig[sprint.status].icon;
  
  const getDateStatus = () => {
    if (sprint.status === 'completed') return 'Completed';
    if (isOverdue) return 'Overdue';
    if (isBefore(now, sprint.startDate)) return `Starts in ${differenceInDays(sprint.startDate, now)} days`;
    if (daysRemaining === 0) return 'Last day';
    if (daysRemaining > 0) return `${daysRemaining} days left`;
    return 'In progress';
  };

  const handleAction = () => {
    if (sprint.status === 'planned' && onStart) {
      onStart(sprint.id);
    } else if (sprint.status === 'active' && onComplete) {
      onComplete(sprint.id);
    }
  };

  return (
    <div 
      className={cn(
        "bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer",
        isOverdue && "border-red-300 bg-red-50"
      )}
      onClick={() => onEdit(sprint)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {sprint.name}
          </h3>
          {sprint.goal && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Target className="h-4 w-4 mr-1" />
              <span>{sprint.goal}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
            statusConfig[sprint.status].color
          )}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusConfig[sprint.status].label}
          </span>
        </div>
      </div>

      {/* Sprint Info */}
      <div className="space-y-3 mb-4">
        {/* Dates */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              {format(sprint.startDate, 'MMM dd')} - {format(sprint.endDate, 'MMM dd')}
            </span>
          </div>
          <span className={cn(
            "font-medium",
            isOverdue ? "text-red-600" : "text-gray-900"
          )}>
            {getDateStatus()}
          </span>
        </div>

        {/* Capacity */}
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-1" />
          <span>Capacity: {sprint.capacity} hours</span>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              progress >= 100 ? "bg-green-500" :
              progress >= 70 ? "bg-blue-500" :
              progress >= 30 ? "bg-yellow-500" : "bg-gray-400"
            )}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{sprintTasks.length}</p>
          <p className="text-xs text-gray-600">Tasks</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{completedTasks.length}</p>
          <p className="text-xs text-gray-600">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900">{totalStoryPoints}</p>
          <p className="text-xs text-gray-600">Story Points</p>
        </div>
      </div>

      {/* Actions */}
      {(sprint.status === 'planned' || sprint.status === 'active') && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
            className="flex items-center space-x-1"
          >
            {sprint.status === 'planned' ? (
              <>
                <PlayCircle className="h-4 w-4" />
                <span>Start Sprint</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Complete Sprint</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 