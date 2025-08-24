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
import { motion, AnimatePresence } from 'framer-motion';

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
  index?: number;
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
  index = 0,
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500/20 bg-red-50/50 dark:bg-red-900/10';
      case 'high': return 'border-orange-500/20 bg-orange-50/50 dark:bg-orange-900/10';
      case 'medium': return 'border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-900/10';
      case 'low': return 'border-green-500/20 bg-green-50/50 dark:bg-green-900/10';
      default: return 'border-border bg-muted/30';
    }
  };

  const getPriorityIcon = (priority: string, compact: boolean = false) => {
    const size = compact ? "h-3 w-3" : "h-4 w-4";
    switch (priority) {
      case 'urgent': return <AlertCircle className={`${size} text-red-500`} />;
      case 'high': return <Flag className={`${size} text-orange-500`} />;
      case 'medium': return <Flag className={`${size} text-yellow-500`} />;
      case 'low': return <Flag className={`${size} text-green-500`} />;
      default: return <Flag className={`${size} text-muted-foreground`} />;
    }
  };

  const getTypeIcon = (type: string, compact: boolean = false) => {
    const size = compact ? "h-3 w-3" : "h-4 w-4";
    switch (type) {
      case 'bug': return <AlertCircle className={`${size} text-red-500`} />;
      case 'story': return <CheckSquare className={`${size} text-blue-500`} />;
      case 'epic': return <Flag className={`${size} text-purple-500`} />;
      default: return <CheckSquare className={`${size} text-muted-foreground`} />;
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
    <motion.div
      data-testid="task-card"
      data-task-id={task.id}
      ref={ref}
      {...props}
      className={cn(
        "bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden task-card",
        "hover:border-gray-300 dark:hover:border-gray-600",
        isDragging && "task-card-dragging",
        compact ? "p-3" : "p-4",
        className
      )}
      data-dragging={isDragging}
      onClick={onClick}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        delay: index * 0.1,
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 24,
      }}
      whileHover={{
        y: -4,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Priority indicator - left border */}
      <motion.div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          task.priority === 'urgent' && "bg-red-500",
          task.priority === 'high' && "bg-orange-500", 
          task.priority === 'medium' && "bg-yellow-500",
          task.priority === 'low' && "bg-green-500"
        )}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
      />

      {/* Drag Handle */}
      {dragHandleProps && (
        <motion.div 
          className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 drag-handle"
          {...dragHandleProps}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <GripVertical className="h-4 w-4" />
        </motion.div>
      )}

      {/* Status indicator */}
      <motion.div 
        className={cn(
          "absolute top-4 right-4 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 shadow-sm",
          getStatusColor(task.status)
        )}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 500 }}
      />

      {/* Header - Compact Layout */}
      <div className={cn("flex items-center justify-between", compact ? "mb-2" : "mb-3")}>
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.1, duration: 0.3 }}
          >
            {getTypeIcon(task.type, compact)}
          </motion.div>
          <span className={cn("font-medium text-gray-600 dark:text-gray-400 font-mono", compact ? "text-xs" : "text-sm")}>
            {project?.key}-{task.id.slice(-4).toUpperCase()}
          </span>
          {showProject && project && (
            <>
              <motion.div 
                className={cn("rounded-full", compact ? "w-2 h-2" : "w-3 h-3")}
                style={{ backgroundColor: project.color }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
              />
              <span className={cn("text-gray-600 dark:text-gray-400 font-medium truncate", compact ? "text-xs" : "text-sm")}>
                {project.name}
              </span>
            </>
          )}
        </div>
        
        <motion.div 
          className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ opacity: 0, x: 20 }}
          whileHover={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            disabled={isLoadingFavorite}
            className={cn("hover:bg-gray-100 dark:hover:bg-gray-800", compact ? "p-1 h-6 w-6" : "p-2 h-8 w-8")}
          >
            <motion.div
              animate={isLoadingFavorite ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Star className={cn(
                compact ? "h-3 w-3" : "h-4 w-4",
                isFavorited ? "fill-yellow-400 text-yellow-500" : "text-gray-400 hover:text-yellow-500"
              )} />
            </motion.div>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className={cn("hover:bg-gray-100 dark:hover:bg-gray-800", compact ? "p-1 h-6 w-6" : "p-2 h-8 w-8")} onClick={(e) => e.stopPropagation()}>
                <MoreVertical className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Редактировать</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Удалить</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>

      {/* Title */}
      <motion.h3 
        className={cn(
          "font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 break-words leading-tight",
          compact ? "text-sm mb-2" : "text-base mb-3"
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
      >
        {task.title}
      </motion.h3>

      {/* Description - Only show in non-compact mode */}
      {task.description && !compact && (
        <motion.p 
          className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 break-words leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.3 }}
        >
          {task.description}
        </motion.p>
      )}

      {/* Labels - Compact Layout */}
      {task.labels.length > 0 && (
        <motion.div 
          className={cn("flex flex-wrap gap-1", compact ? "mb-2" : "mb-3")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.4, duration: 0.3 }}
        >
          {task.labels.slice(0, compact ? 2 : 3).map((label, labelIndex) => (
            <motion.div
              key={labelIndex}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.4 + labelIndex * 0.1, type: "spring" }}
            >
              <Badge variant="secondary" className={cn("bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0", compact ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1")}>
                {label}
              </Badge>
            </motion.div>
          ))}
          {task.labels.length > (compact ? 2 : 3) && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
            >
              <Badge variant="outline" className={cn("border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400", compact ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1")}>
                +{task.labels.length - (compact ? 2 : 3)}
              </Badge>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Progress & Time - Compact Layout */}
      {(task.estimatedHours || task.loggedHours) && (
        <motion.div 
          className={cn(compact ? "mb-2" : "mb-3")}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
        >
          <div className={cn("flex items-center justify-between text-gray-600 dark:text-gray-400", compact ? "text-xs mb-1" : "text-sm mb-2")}>
            <span className="font-medium">Прогресс</span>
            <span className="font-mono">
              {task.loggedHours || 0}ч / {task.estimatedHours || 0}ч
            </span>
          </div>
          <Progress 
            value={Math.min(100, ((task.loggedHours || 0) / (task.estimatedHours || 1)) * 100)}
            variant="default"
            size="sm"
            className={cn("bg-gray-200 dark:bg-gray-700", compact ? "h-1.5" : "h-2")}
          />
        </motion.div>
      )}

      {/* Footer - Compact Layout */}
      <motion.div 
        className={cn("flex items-center justify-between", compact ? "text-xs" : "text-sm", "text-gray-600 dark:text-gray-400")}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 + 0.6, duration: 0.3 }}
      >
        <div className={cn("flex items-center", compact ? "space-x-1.5" : "space-x-3")}>
          {/* Due Date */}
          {task.dueDate && (
            <motion.div 
              className={cn(
                "flex items-center font-medium",
                compact ? "space-x-1" : "space-x-1.5",
                isOverdue && "text-red-500",
                isDueSoon && !isOverdue && "text-orange-500"
              )}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <CalendarDays className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
              <span className={cn(compact ? "text-xs" : "text-sm")}>{formatDate(task.dueDate)}</span>
            </motion.div>
          )}
          
          {/* Story Points */}
          {showStoryPoints && task.storyPoints && (
            <motion.div 
              className="flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Badge variant="outline" className={cn("border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300", compact ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1")}>
                {task.storyPoints} pts
              </Badge>
            </motion.div>
          )}

          {/* Priority */}
          <motion.div 
            className={cn("flex items-center", compact ? "space-x-1" : "space-x-1")}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            {getPriorityIcon(task.priority, compact)}
            <span className={cn("font-medium capitalize", compact ? "text-xs" : "text-xs")}>
              {task.priority === 'urgent' && 'Срочно'}
              {task.priority === 'high' && 'Высокий'}
              {task.priority === 'medium' && 'Средний'}
              {task.priority === 'low' && 'Низкий'}
            </span>
          </motion.div>
        </div>
        
        <div className={cn("flex items-center", compact ? "space-x-1.5" : "space-x-2")}>
          {/* Activity indicators */}
          {mockCommentCount > 0 && (
            <motion.div 
              className={cn("flex items-center", compact ? "space-x-1" : "space-x-1.5")}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <MessageSquare className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
              <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>{mockCommentCount}</span>
            </motion.div>
          )}
          
          {mockAttachmentCount > 0 && (
            <motion.div 
              className={cn("flex items-center", compact ? "space-x-1" : "space-x-1.5")}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Paperclip className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
              <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>{mockAttachmentCount}</span>
            </motion.div>
          )}

          {mockWatcherCount > 0 && (
            <motion.div 
              className={cn("flex items-center", compact ? "space-x-1" : "space-x-1.5")}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Eye className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
              <span className={cn("font-medium", compact ? "text-xs" : "text-sm")}>{mockWatcherCount}</span>
            </motion.div>
          )}

          {/* Assignee */}
          {assignee ? (
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Avatar className={cn("border-2 border-white dark:border-gray-800 shadow-sm", compact ? "w-6 h-6" : "w-8 h-8")}>
                <AvatarFallback className={cn("font-semibold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300", compact ? "text-xs" : "text-sm")}>
                  {assignee.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Avatar className={cn("border-2 border-white dark:border-gray-800 shadow-sm", compact ? "w-6 h-6" : "w-8 h-8")}>
                <AvatarFallback className={cn("bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400", compact ? "text-xs" : "text-sm")}>
                  <User className={cn(compact ? "h-3 w-3" : "h-4 w-4")} />
                </AvatarFallback>
              </Avatar>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Hover effect */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
});
(TaskCard as any).displayName = 'TaskCard'