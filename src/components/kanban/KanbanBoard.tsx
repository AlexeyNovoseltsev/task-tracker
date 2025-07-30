import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Task, Status } from '@/types';
import { useAppStore } from '@/store';
import { KanbanColumn } from './KanbanColumn';
import { TaskModal } from '@/components/task/TaskModal';

const columns: { status: Status; title: string }[] = [
  { status: 'todo', title: 'To Do' },
  { status: 'in-progress', title: 'In Progress' },
  { status: 'in-review', title: 'In Review' },
  { status: 'done', title: 'Done' },
];

export function KanbanBoard() {
  const { tasks, updateTask, selectedProjectId } = useAppStore();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<Status>('todo');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Filter tasks for selected project
  const projectTasks = selectedProjectId 
    ? tasks.filter(task => task.projectId === selectedProjectId)
    : tasks;

  // Group tasks by status
  const tasksByStatus = columns.reduce((acc, column) => {
    acc[column.status] = projectTasks.filter(task => task.status === column.status);
    return acc;
  }, {} as Record<Status, Task[]>);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTaskId = active.id as string;
    const overContainerId = over.id as Status;

    const activeTask = projectTasks.find(task => task.id === activeTaskId);
    if (!activeTask) return;

    // If dropping on a different status column
    if (activeTask.status !== overContainerId) {
      updateTask(activeTaskId, { status: overContainerId });
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the containers
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // Update task status immediately for visual feedback
    const activeTask = projectTasks.find(task => task.id === activeId);
    if (activeTask && activeTask.status !== overContainer) {
      updateTask(activeId, { status: overContainer as Status });
    }
  };

  const findContainer = (id: string): Status | null => {
    // First check if id is a status (container)
    if (columns.find(col => col.status === id)) {
      return id as Status;
    }

    // Otherwise, find which container contains this task
    for (const [status, tasks] of Object.entries(tasksByStatus)) {
      if (tasks.find(task => task.id === id)) {
        return status as Status;
      }
    }

    return null;
  };

  const handleAddTask = (status: Status) => {
    setNewTaskStatus(status);
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    // TODO: Add confirmation dialog
    // deleteTask(taskId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>
          <p className="text-gray-600 mt-1">
            {selectedProjectId ? 'Project tasks' : 'All tasks'} • {projectTasks.length} tasks total
          </p>
        </div>
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto">
        <div className="p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            <div className="flex space-x-6 min-w-max">
              {columns.map((column) => (
                <KanbanColumn
                  key={column.status}
                  status={column.status}
                  title={column.title}
                  tasks={tasksByStatus[column.status]}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                />
              ))}
            </div>
          </DndContext>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        defaultStatus={newTaskStatus}
      />
    </div>
  );
} 