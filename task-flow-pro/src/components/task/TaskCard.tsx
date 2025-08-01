import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { useAppStore, useShowStoryPoints } from '@/store';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useState, useEffect } from 'react';
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
  Tag,
  ArrowUpRight,
  CalendarDays,
  UserCheck,
  Zap,
  Star
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
  const { success, error } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  
  const assignee = users.find(u => u.id === task.assigneeId);
  const project = projects.find(p => p.id === task.projectId);

  // Check if task is favorited on mount
  useEffect(() => {
    checkFavoriteStatus();
  }, [task.id]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await api.checkIfFavorited('task', task.id);
      if (response.success) {
        setIsFavorited(response.data.is_favorited);
        setFavoriteId(response.data.favorite?.id || null);
      }
    } catch (err) {
      // Silent fail for favorite check
    }
  };

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500/20 bg-red-50/50 dark:bg-red-900/10';
      case 'high': return 'border-orange-500/20 bg-orange-50/50 dark:bg-orange-900/10';
      case 'medium': return 'border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-900/10';
      case 'low': return 'border-green-500/20 bg-green-50/50 dark:bg-green-900/10';
      default: return 'border-border bg-muted/30';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'high': return <Flag className="h-3 w-3 text-orange-500" />;
      case 'medium': return <Flag className="h-3 w-3 text-yellow-500" />;
      case 'low': return <Flag className="h-3 w-3 text-green-500" />;
      default: return <Flag className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <AlertCircle className="h-3 w-3 text-red-500" />;
      case 'story': return <CheckSquare className="h-3 w-3 text-blue-500" />;
      case 'epic': return <Flag className="h-3 w-3 text-purple-500" />;
      default: return <CheckSquare className="h-3 w-3 text-muted-foreground" />;
    }
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
        "bg-card rounded-modern border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden",
        "border-l-4",
        getPriorityColor(task.priority),
        isDragging && "opacity-50 rotate-2 scale-105",
        compact ? "p-3" : "p-4",
        className
      )}
      onClick={onClick}
    >
      {/* Status indicator */}
      <div className={cn(
        "absolute top-3 right-3 w-2 h-2 rounded-full",
        getStatusColor(task.status)
      )} />

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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            disabled={isLoadingFavorite}
            className="p-1 h-6 w-6"
          >
            <Star className={cn(
              "h-3 w-3",
              isFavorited ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground"
            )} />
          </Button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-1 hover:bg-muted rounded-modern transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className={cn(
        "font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 break-words",
        compact ? "text-sm" : "text-base"
      )}>
        {task.title}
      </h3>

      {/* Description */}
      {task.description && !compact && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 break-words">
          {task.description}
        </p>
      )}

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.slice(0, 3).map((label, index) => (
            <Badge key={index} variant="subtle" size="sm">
              {label}
            </Badge>
          ))}
          {task.labels.length > 3 && (
            <Badge variant="outline" size="sm">
              +{task.labels.length - 3}
            </Badge>
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
          <Progress 
            value={Math.min(100, ((task.loggedHours || 0) / (task.estimatedHours || 1)) * 100)}
            variant="default"
            size="sm"
            className="h-1.5"
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center space-x-3">
          {/* Due Date */}
          {task.dueDate && (
            <div className={cn(
              "flex items-center space-x-1",
              isOverdue && "text-red-500",
              isDueSoon && !isOverdue && "text-orange-500"
            )}>
              <CalendarDays className="h-3 w-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
          
          {/* Story Points */}
          {showStoryPoints && task.storyPoints && (
            <div className="flex items-center space-x-1">
              <Badge variant="outline" size="sm">
                {task.storyPoints} pts
              </Badge>
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
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-xs">
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  );
}