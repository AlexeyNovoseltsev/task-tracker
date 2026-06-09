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
  GripVertical,
  Edit,
  Trash2
} from 'lucide-react';
import { forwardRef, useMemo, type HTMLAttributes, type PointerEvent } from 'react';
import { motion } from 'framer-motion';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { OverflowChipList } from '@/components/ui/OverflowChipList';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAppStore, useSettings } from '@/store';
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
  
  const assignee = useMemo(() => users.find(u => u.id === task.assigneeId), [users, task.assigneeId]);
  const project = useMemo(() => projects.find(p => p.id === task.projectId), [projects, task.projectId]);

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

  const isKanbanDraggable = Boolean(dragHandleProps);
  const blockDragStart = (e: PointerEvent) => e.stopPropagation();

  return (
    <motion.div
      data-testid="task-card"
      data-task-id={task.id}
      ref={ref}
      {...props}
      {...(isKanbanDraggable ? dragHandleProps : {})}
      className={cn(
        "group relative rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md",
        isKanbanDraggable
          ? "cursor-grab touch-none active:cursor-grabbing select-none"
          : "cursor-pointer",
        isDragging && "z-50 scale-[1.03] shadow-2xl ring-2 ring-primary/25",
        compact ? "px-4 py-3.5 space-y-2.5" : "p-4 space-y-3",
        className
      )}
      onClick={onClick}
      initial={isKanbanDraggable ? false : { opacity: 0, y: 20, scale: 0.95 }}
      animate={isKanbanDraggable ? undefined : { opacity: 1, y: 0, scale: 1 }}
      exit={isKanbanDraggable ? undefined : { opacity: 0, y: -20, scale: 0.95 }}
      transition={
        isKanbanDraggable
          ? { duration: 0.15 }
          : {
              delay: index * 0.1,
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 24,
            }
      }
      whileHover={
        isDragging
          ? undefined
          : compact
            ? {
                y: -2,
                boxShadow: "0 8px 24px -6px rgb(0 0 0 / 0.12)",
                transition: { type: "spring", stiffness: 400, damping: 28 },
              }
            : {
                y: -4,
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                transition: { duration: 0.2 },
              }
      }
      whileTap={isKanbanDraggable ? undefined : { scale: 0.98 }}
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
          {isKanbanDraggable && (
            <GripVertical
              className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/70"
              aria-hidden
            />
          )}
          <TypeIcon type={task.type} />
          <span className="truncate font-mono text-sm text-muted-foreground">
            {project?.key}-{task.id.slice(-4).toUpperCase()}
          </span>
        </div>

        <div
          className="flex items-center gap-0.5"
          onPointerDown={blockDragStart}
        >
          <FavoriteButton
            itemType="task"
            itemId={task.id}
            itemTitle={task.title}
            revealOnHover
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
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
        <OverflowChipList
          items={task.labels.map((label) => ({ id: label, label }))}
          chipClassName="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium"
          overflowClassName="h-6 min-w-6 border-solid"
        />
      )}

      {/* Footer */}
      <div className={cn(
        "flex items-center justify-between text-sm text-muted-foreground",
        compact ? "pt-0.5" : "pt-1"
      )}>
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
    </motion.div>
  );
});
(TaskCard as any).displayName = 'TaskCard';