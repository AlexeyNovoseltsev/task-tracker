
import { X, Filter, CheckSquare, Clock, AlertCircle, CheckCircle2, Activity } from 'lucide-react';

import { CustomTaskIcon } from '@/components/icons/CustomTaskIcon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { useShowStoryPoints } from '@/store';
import type { Task } from '@/types';

interface TaskListModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  title: string;
  filter?: 'all' | 'active' | 'completed' | 'in-progress' | 'todo' | 'in-review' | 'done';
  projectName?: string;
}

const statusIcons = {
  'todo': Clock,
  'in-progress': Activity,
  'in-review': AlertCircle,
  'done': CheckCircle2,
};

const statusColors = {
  'todo': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'in-review': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  'done': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

const priorityColors = {
  'low': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  'medium': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  'high': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  'urgent': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export function TaskListModal({ 
  isOpen, 
  onClose, 
  tasks, 
  title, 
  filter = 'all',
  projectName 
}: TaskListModalProps) {
  const { info } = useToast();
  const showStoryPoints = useShowStoryPoints();

  if (!isOpen) return null;

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'active') return task.status === 'in-progress' || task.status === 'in-review';
    if (filter === 'completed') return task.status === 'done';
    return task.status === filter;
  });

  const handleTaskClick = (task: Task) => {
    info("Задача", `Открываем детали задачи "${task.title}"`, 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-modalIn">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b px-8 py-6 flex items-center justify-between rounded-t-2xl">
                     <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
               <CustomTaskIcon className="w-6 h-6" />
             </div>
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              {projectName && (
                <p className="text-muted-foreground text-sm">
                  Проект: {projectName}
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-8">
          {/* Stats */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Найдено: {filteredTasks.length} {filteredTasks.length === 1 ? 'задача' : filteredTasks.length < 5 ? 'задачи' : 'задач'}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {filter === 'all' ? 'Все задачи' :
               filter === 'active' ? 'Активные' :
               filter === 'completed' ? 'Завершенные' :
               filter === 'in-progress' ? 'В работе' :
               filter === 'todo' ? 'К выполнению' :
               filter === 'in-review' ? 'На проверке' :
               filter === 'done' ? 'Выполнено' : filter}
            </Badge>
          </div>

          {/* Task List */}
          {filteredTasks.length === 0 ? (
                         <div className="text-center py-12">
               <CustomTaskIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
               <h3 className="text-lg font-semibold mb-2">Задачи не найдены</h3>
              <p className="text-muted-foreground">
                В данном фильтре нет задач для отображения
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredTasks.map((task) => {
                const StatusIcon = statusIcons[task.status];
                return (
                  <div
                    key={task.id}
                    className="p-6 border rounded-2xl hover:bg-muted/50 transition-all duration-200 cursor-pointer group"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mt-1">
                          <StatusIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge className={statusColors[task.status]}>
                              {task.status === 'todo' ? 'К выполнению' :
                               task.status === 'in-progress' ? 'В работе' :
                               task.status === 'in-review' ? 'На проверке' :
                               task.status === 'done' ? 'Выполнено' : task.status}
                            </Badge>
                            <Badge className={priorityColors[task.priority]}>
                              {task.priority === 'low' ? 'Низкий' :
                               task.priority === 'medium' ? 'Средний' :
                               task.priority === 'high' ? 'Высокий' : task.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {task.type === 'story' ? 'История' :
                               task.type === 'bug' ? 'Баг' :
                               task.type === 'task' ? 'Задача' :
                               task.type === 'epic' ? 'Эпик' : task.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {showStoryPoints && task.storyPoints && (
                          <div className="text-center">
                            <div className="font-medium">{task.storyPoints}</div>
                            <div className="text-xs">ОИ</div>
                          </div>
                        )}
                        <X className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Всего задач в проекте: {tasks.length}
            </div>
            <Button onClick={onClose} variant="outline">
              Закрыть
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}