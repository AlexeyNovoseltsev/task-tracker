import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar, Clock, User, Tag, CheckCircle, Circle, AlertCircle } from 'lucide-react';

import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';
import { Task, Project } from '@/types';

interface TaskCardProps {
  task: Task;
  project?: Project;
  variant?: 'default' | 'compact' | 'calendar';
  onStatusChange?: (taskId: string, status: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  className?: string;
}

export function TaskCard({
  task,
  project,
  variant = 'default',
  onStatusChange,
  onEdit,
  onDelete,
  className
}: TaskCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Circle className="h-4 w-4 text-blue-500" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          "p-3 border border-border/50 rounded-modern hover:bg-accent/50 transition-all duration-200",
          className
        )}
      >
                 <div className="flex items-start justify-between mb-2">
           <h4 
             className="font-medium text-sm line-clamp-2 cursor-pointer flex-1 hover:text-blue-600 transition-colors"
             onClick={() => onEdit?.(task)}
             title="Кликните для просмотра подробностей"
           >
             {task.title}
           </h4>
          <div className="flex items-center gap-1">
            {getStatusIcon(task.status)}
            <Badge
              variant={task.priority === "high" ? "destructive" : "secondary"}
              className="text-xs"
            >
              {task.priority === "high" ? "Высокий" : "Обычный"}
            </Badge>
          </div>
        </div>
        
        {project && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            {project.name}
          </div>
        )}
        
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Calendar className="h-3 w-3" />
            {format(new Date(task.dueDate), "d MMM", { locale: ru })}
          </div>
        )}

                 <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
           {onEdit && (
             <Button
               size="sm"
               variant="outline"
               onClick={(e) => {
                 e.stopPropagation();
                 onEdit(task);
               }}
               className="text-xs px-2 py-1 h-7"
             >
               Редактировать
             </Button>
           )}
           
           {onDelete && (
             <Button
               size="sm"
               variant="destructive"
               onClick={(e) => {
                 e.stopPropagation();
                 onDelete(task.id);
               }}
               className="text-xs px-2 py-1 h-7"
             >
               Удалить
             </Button>
           )}
         </div>
      </div>
    );
  }

  if (variant === 'calendar') {
    return (
      <div
        className={cn(
          "p-2 border border-border/50 rounded-modern hover:bg-accent/50 transition-all duration-200 cursor-pointer hover:shadow-sm",
          className
        )}
        onClick={() => onEdit?.(task)}
        title="Кликните для просмотра подробностей"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium line-clamp-1">{task.title}</span>
          {getStatusIcon(task.status)}
        </div>
        
        {project && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            {project.name}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("hover:shadow-md transition-all duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-medium line-clamp-2">
            {task.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusIcon(task.status)}
            <Badge
              variant={task.priority === "high" ? "destructive" : "secondary"}
              className="text-xs"
            >
              {task.priority === "high" ? "Высокий" : "Обычный"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {project && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <span>{project.name}</span>
              </div>
            )}
            
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.dueDate), "d MMM yyyy", { locale: ru })}</span>
              </div>
            )}
            
            {task.assignee && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{task.assignee}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Badge className={cn("text-xs", getStatusColor(task.status))}>
            {task.status === 'completed' && 'Завершено'}
            {task.status === 'in_progress' && 'В работе'}
            {task.status === 'blocked' && 'Заблокировано'}
            {task.status === 'todo' && 'К выполнению'}
          </Badge>
          
                     <div className="flex items-center gap-2 ml-auto">
             {onEdit && (
               <Button
                 size="sm"
                 variant="outline"
                 onClick={(e) => {
                   e.stopPropagation();
                   onEdit(task);
                 }}
                 className="text-xs px-2 py-1 h-7"
               >
                 Редактировать
               </Button>
             )}
             
             {onDelete && (
               <Button
                 size="sm"
                 variant="destructive"
                 onClick={(e) => {
                   e.stopPropagation();
                   onDelete(task.id);
                 }}
                 className="text-xs px-2 py-1 h-7"
               >
                 Удалить
               </Button>
             )}
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
