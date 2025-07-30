import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { Calendar, User, Tag, MessageSquare } from 'lucide-react';
import { Task, Priority } from '@/types';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityColors = {
  low: 'border-l-green-500 bg-green-50',
  medium: 'border-l-yellow-500 bg-yellow-50',
  high: 'border-l-orange-500 bg-orange-50',
  urgent: 'border-l-red-500 bg-red-50',
};

const priorityTextColors = {
  low: 'text-green-700',
  medium: 'text-yellow-700',
  high: 'text-orange-700',
  urgent: 'text-red-700',
};

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-white border-l-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 mb-3",
        priorityColors[task.priority],
        isDragging && "opacity-50"
      )}
      onClick={() => onEdit(task)}
    >
      {/* Task Type Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-medium",
          task.type === 'story' && "bg-blue-100 text-blue-800",
          task.type === 'bug' && "bg-red-100 text-red-800",
          task.type === 'epic' && "bg-purple-100 text-purple-800",
          task.type === 'task' && "bg-gray-100 text-gray-800"
        )}>
          {task.type.toUpperCase()}
        </span>
        
        {task.storyPoints && (
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {task.storyPoints} SP
          </span>
        )}
      </div>

      {/* Task Title */}
      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h3>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center text-xs px-2 py-1 rounded bg-blue-100 text-blue-800"
            >
              <Tag className="w-3 h-3 mr-1" />
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Task Meta Info */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-3">
          {task.assigneeId && (
            <div className="flex items-center">
              <User className="w-3 h-3 mr-1" />
              <span>Assigned</span>
            </div>
          )}
          
          {task.dueDate && (
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{format(new Date(task.dueDate), 'MMM dd')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {task.commentsCount && task.commentsCount > 0 && (
            <div className="flex items-center">
              <MessageSquare className="w-3 h-3 mr-1" />
              <span>{task.commentsCount}</span>
            </div>
          )}
          
          <span className={cn("font-medium", priorityTextColors[task.priority])}>
            {task.priority.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
} 