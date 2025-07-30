import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { useAppStore, useShowStoryPoints } from '@/store';
import { 
  Calendar, 
  Clock, 
  User, 
  Flag, 
  MoreVertical, 
  MessageSquare,
  Paperclip,
  Timer,
  CheckSquare,
  AlertCircle,
  Eye,
  Tag
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  isDragging?: boolean;
  showProject?: boolean;
  compact?: boolean;
}

export function TaskCard({ 
  task, 
  onClick, 
  onEdit, 
  onDelete, 
  className, 
  isDragging,
  showProject = false,
  compact = false
}: TaskCardProps) {
  const { users, projects } = useAppStore();
  const showStoryPoints = useShowStoryPoints();
  
  const assignee = users.find(u => u.id === task.assigneeId);
  const project = projects.find(p => p.id === task.projectId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50 dark:bg-red-900/10';
      case 'high': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/10';
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low': return 'border-green-500 bg-green-50 dark:bg-green-900/10';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'high': return <Flag className="h-3 w-3 text-orange-500" />;
      case 'medium': return <Flag className="h-3 w-3 text-yellow-500" />;
      case 'low': return <Flag className="h-3 w-3 text-green-500" />;
      default: return <Flag className="h-3 w-3 text-gray-400" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'story': return <CheckSquare className="h-3 w-3 text-blue-500" />;
      case 'epic': return <Flag className="h-3 w-3 text-purple-500" />;
      default: return <CheckSquare className="h-3 w-3 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const taskDate = new Date(date);
    const diffTime = taskDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Завтра';
    if (diffDays === -1) return 'Вчера';
    if (diffDays < 0) return `${Math.abs(diffDays)} дн. назад`;
    if (diffDays <= 7) return `${diffDays} дн.`;
    
    return new Intl.DateTimeFormat('ru-RU', {
      month: 'short',
      day: 'numeric'
    }).format(taskDate);
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const isDueSoon = task.dueDate && new Date(task.dueDate).getTime() - new Date().getTime() < 2 * 24 * 60 * 60 * 1000;

  // Mock data for demonstration
  const mockCommentCount = Math.floor(Math.random() * 5);
  const mockAttachmentCount = Math.floor(Math.random() * 3);
  const mockWatcherCount = task.watchers?.length || Math.floor(Math.random() * 4);

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative",
        "border-l-4",
        getPriorityColor(task.priority),
        isDragging && "opacity-50 rotate-2 scale-105",
        compact ? "p-3" : "p-4",
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {getTypeIcon(task.type)}
          <span className="text-xs text-muted-foreground font-mono">
            {project?.key}-{task.id.slice(-4).toUpperCase()}
          </span>
          {showProject && project && (
            <div className="flex items-center space-x-1">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <span className="text-xs text-muted-foreground truncate">
                {project.name}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className={cn(
        "font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 mb-2 break-words hyphens-auto",
        compact ? "text-sm" : "text-base"
      )}>
        {task.title}
      </h3>

      {/* Description */}
      {task.description && !compact && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 break-words hyphens-auto">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.slice(0, 3).map((label, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
            >
              {label}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Progress & Time */}
      {(task.estimatedHours || task.loggedHours) && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Прогресс</span>
            <span>
              {task.loggedHours || 0}ч / {task.estimatedHours || 0}ч
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(100, ((task.loggedHours || 0) / (task.estimatedHours || 1)) * 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-3">
          {/* Due Date */}
          {task.dueDate && (
            <div className={cn(
              "flex items-center space-x-1",
              isOverdue && "text-red-500",
              isDueSoon && !isOverdue && "text-orange-500"
            )}>
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
          
          {/* Story Points */}
          {showStoryPoints && task.storyPoints && (
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                {task.storyPoints}
              </div>
            </div>
          )}

          {/* Priority */}
          <div className="flex items-center space-x-1">
            {getPriorityIcon(task.priority)}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Activity indicators */}
          {mockCommentCount > 0 && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-3 w-3" />
              <span>{mockCommentCount}</span>
            </div>
          )}
          
          {mockAttachmentCount > 0 && (
            <div className="flex items-center space-x-1">
              <Paperclip className="h-3 w-3" />
              <span>{mockAttachmentCount}</span>
            </div>
          )}

          {mockWatcherCount > 0 && (
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{mockWatcherCount}</span>
            </div>
          )}

          {/* Assignee */}
          {assignee ? (
            <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
              {assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          ) : (
            <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className={cn(
        "absolute top-2 right-2 w-2 h-2 rounded-full",
        task.status === 'done' && "bg-green-500",
        task.status === 'in-progress' && "bg-blue-500",
        task.status === 'in-review' && "bg-yellow-500",
        task.status === 'todo' && "bg-gray-400"
      )} />
    </div>
  );
}