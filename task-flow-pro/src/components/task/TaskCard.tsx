import { 
  User, 
  Flag, 
  MoreVertical, 
  MessageSquare,
  Paperclip,
  CheckSquare,
  AlertCircle,
  Eye,
  CalendarDays,
  Star,
  GripVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { useState, useEffect, useCallback, forwardRef, useMemo } from 'react';
import type { HTMLAttributes } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAppStore, useSettings } from '@/store';
import { useToast } from '@/hooks/useToast';
import { Task } from '@/types';

interface TaskCardProps extends HTMLAttributes<HTMLDivElement> {
  task: Task;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  isDragging?: boolean;
  showProject?: boolean;
  compact?: boolean;
  dragHandleProps?: any;
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(({ 
  task, 
  onClick, 
  onEdit, 
  onDelete, 
  className, 
  isDragging,
  showProject = false,
  compact = false,
  dragHandleProps,
  ...props
}, ref) => {
  const { users, projects } = useAppStore();
  const { showStoryPoints } = useSettings();
  const { success, error } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  
  const assignee = useMemo(() => users.find(u => u.id === task.assigneeId), [users, task.assigneeId]);
  const project = useMemo(() => projects.find(p => p.id === task.projectId), [projects, task.projectId]);

  const checkFavoriteStatus = useCallback(async () => {
    try {
      const response = await api.checkIfFavorited('task', task.id);
      if (response.success) {
        setIsFavorited(response.data.is_favorited);
        setFavoriteId(response.data.favorite?.id || null);
      }
    } catch (err) {
      // Silent fail for favorite check
    }
  }, [task.id]);

  // Check if task is favorited on mount
  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoadingFavorite(true);
    
    try {
      if (isFavorited && favoriteId) {
        await api.removeFromFavorites(favoriteId);
        setIsFavorited(false);
        setFavoriteId(null);
        success('Удалено из избранного', 'Задача удалена из избранного');
      } else {
        const response = await api.addToFavorites({
          itemType: 'task',
          itemId: task.id
        });
        if (response.success) {
          setIsFavorited(true);
          setFavoriteId(response.data.id);
          success('Добавлено в избранное', 'Задача добавлена в избранное');
        }
      }
    } catch (err) {
      error('Ошибка', 'Не удалось обновить избранное');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const PriorityIcon = ({ priority, className }: { priority: Task['priority'], className?: string }) => {
    const priorityMap = {
      urgent: { icon: AlertCircle, className: "text-destructive" },
      high: { icon: Flag, className: "text-warning" },
      medium: { icon: Flag, className: "text-primary" },
      low: { icon: Flag, className: "text-muted-foreground" },
    };
    const { icon: Icon, className: colorClass } = priorityMap[priority] || priorityMap.low;
    return <Icon className={cn("h-4 w-4", colorClass, className)} />;
  };

  const TypeIcon = ({ type, className }: { type: Task['type'], className?: string }) => {
    const typeMap = {
      bug: { icon: AlertCircle, className: "text-destructive" },
      story: { icon: CheckSquare, className: "text-primary" },
      epic: { icon: Flag, className: "text-purple-500" }, // Keep one non-theme color for variety example
    };
    const { icon: Icon, className: colorClass } = typeMap[type] || typeMap.story;
    return <Icon className={cn("h-4 w-4", colorClass, className)} />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'in-review': return 'bg-yellow-500';
      case 'todo': return 'bg-gray-400';
      default: return 'bg-gray-400';
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
    
    const months = [
      'янв', 'фев', 'мар', 'апр', 'май', 'июн',
      'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
    ];
    const month = months[taskDate.getMonth()];
    const day = taskDate.getDate();
    return `${day} ${month}`;
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const isDueSoon = task.dueDate && new Date(task.dueDate).getTime() - new Date().getTime() < 2 * 24 * 60 * 60 * 1000;

  // Mock data for demonstration
  // Use stable values based on task ID to prevent flickering during drag
  const mockCommentCount = useMemo(() => task.id.charCodeAt(0) % 5, [task.id]);
  const mockAttachmentCount = useMemo(() => task.id.charCodeAt(1) % 3, [task.id]);
  const mockWatcherCount = useMemo(() => task.watchers?.length || (task.id.charCodeAt(2) % 4), [task.id, task.watchers]);

  return (
    <div
      data-testid="task-card"
      data-task-id={task.id}
      ref={ref}
      {...props}
      className={cn(
        "group relative cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md",
        isDragging && "z-50 scale-105 shadow-xl",
        compact ? "p-sm" : "p-md space-y-sm", // Use theme spacing
        className
      )}
      onClick={onClick}
    >
      {/* Priority indicator - left border */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-lg",
          task.priority === 'urgent' && "bg-destructive",
          task.priority === 'high' && "bg-warning",
          task.priority === 'medium' && "bg-primary",
          task.priority === 'low' && "bg-muted"
        )}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-sm">
        <div className="flex min-w-0 items-center gap-sm">
          <TypeIcon type={task.type} />
          <span className="truncate font-mono text-sm text-muted-foreground">
            {project?.key}-{task.id.slice(-4).toUpperCase()}
          </span>
        </div>

        <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            disabled={isLoadingFavorite}
            className="h-8 w-8"
          >
            <Star
              className={cn(
                "h-4 w-4",
                isFavorited ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground"
              )}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={(e) => e.stopPropagation()} align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Title */}
      <h3
        className={cn(
          "font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary",
          compact ? "text-base" : "text-lg"
        )}
      >
        {task.title}
      </h3>

      {/* Description */}
      {task.description && !compact && (
        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-xs">
          {task.labels.slice(0, 3).map((label) => (
            <Badge key={label} variant="secondary">
              {label}
            </Badge>
          ))}
          {task.labels.length > 3 && (
            <Badge variant="outline">+{task.labels.length - 3}</Badge>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-sm text-sm text-muted-foreground">
        <div className="flex items-center gap-md">
          {/* Assignee */}
          {assignee ? (
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs font-semibold">
                {assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          )}

          <div className="flex items-center gap-xs">
            <PriorityIcon priority={task.priority} />
            <span className="font-medium capitalize">
              {task.priority}
            </span>
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div
              className={cn(
                "flex items-center gap-xs font-medium",
                isOverdue && "text-destructive",
                isDueSoon && !isOverdue && "text-warning"
              )}
            >
              <CalendarDays className="h-4 w-4" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-sm">
          {/* Story Points */}
          {showStoryPoints && task.storyPoints && (
            <Badge variant="outline" className="px-sm py-xs">
              {task.storyPoints} pts
            </Badge>
          )}

          {/* Activity */}
          <div className="flex items-center gap-xs">
            {mockCommentCount > 0 && (
              <div className="flex items-center gap-xs">
                <MessageSquare className="h-4 w-4" />
                <span>{mockCommentCount}</span>
              </div>
            )}
            {mockAttachmentCount > 0 && (
              <div className="flex items-center gap-xs">
                <Paperclip className="h-4 w-4" />
                <span>{mockAttachmentCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
(TaskCard as any).displayName = 'TaskCard';