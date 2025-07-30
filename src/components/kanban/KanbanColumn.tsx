import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Task, Status } from '@/types';
import { TaskCard } from '@/components/task/TaskCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  status: Status;
  tasks: Task[];
  title: string;
  onAddTask: (status: Status) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const statusColors = {
  'todo': 'bg-slate-100 border-slate-300',
  'in-progress': 'bg-blue-100 border-blue-300',
  'in-review': 'bg-yellow-100 border-yellow-300',
  'done': 'bg-green-100 border-green-300',
};

const statusHeaders = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  'done': 'Done',
};

export function KanbanColumn({
  status,
  tasks,
  title,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col w-80 bg-gray-50 rounded-lg">
      {/* Column Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b-2 rounded-t-lg",
        statusColors[status]
      )}>
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-900">
            {statusHeaders[status]}
          </h3>
          <span className="bg-white text-gray-600 text-sm px-2 py-1 rounded-full font-medium">
            {tasks.length}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddTask(status)}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Column Content */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-4 min-h-[200px] transition-colors",
          isOver && "bg-blue-50"
        )}
      >
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
        
        {/* Add Task Button */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <Plus className="h-8 w-8 mb-2" />
            <p className="text-sm">No tasks yet</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddTask(status)}
              className="mt-2 text-gray-500 hover:text-gray-700"
            >
              Add a task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 