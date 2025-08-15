import {
  DndContext,
  closestCorners,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useDroppable } from "@dnd-kit/core";
import { Plus, Edit } from "lucide-react";
import { useState, useMemo } from "react";

import { TaskCard } from "@/components/task/TaskCard";
import { TaskDetailModal } from "@/components/task/TaskDetailModal";
import { TaskModal } from "@/components/task/TaskModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { Task, Status } from "@/types";


const statusColumns: { id: Status; title: string; bgColor: string }[] = [
  { id: "todo", title: "К выполнению", bgColor: "bg-slate-100 dark:bg-slate-800" },
  { id: "in-progress", title: "В работе", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "in-review", title: "На проверке", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" },
  { id: "done", title: "Готово", bgColor: "bg-green-100 dark:bg-green-900/30" },
];

function KanbanColumn({
  id,
  title,
  tasks,
  bgColor,
  onTaskClick,
}: {
  id: Status;
  title: string;
  tasks: Task[];
  bgColor: string;
  onTaskClick: (task: Task) => void;
}) {
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
  const { setNodeRef, isOver } = useDroppable({ 
    id,
    data: {
      type: 'column',
      status: id
    }
  });

  return (
    <div className={cn("rounded-lg p-4 flex flex-col", bgColor)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">{title}</h3>
        <span className="text-sm text-muted-foreground">{tasks.length}</span>
      </div>
      <div 
        ref={setNodeRef}
        className={cn(
          "flex-1 transition-colors min-h-[200px]",
          isOver && "bg-primary/5 ring-2 ring-primary/50 rounded-lg"
        )}
      >
        <SortableContext items={taskIds} id={id}>
          <div className="space-y-3 overflow-y-auto">
            {tasks.map((task) => (
              <SortableTaskItem key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))}
            {tasks.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed border-muted-foreground/20 rounded-lg">
                Перетащите задачи сюда
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

function SortableTaskItem({ task, onClick }: { task: Task; onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { ...task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard 
        task={task} 
        onClick={onClick} 
        isDragging={isDragging} 
        compact 
        dragHandleProps={listeners}
      />
    </div>
  );
}

export function KanbanPage() {
  const { tasks, updateTask, reorderTasks, selectedProjectId } = useAppStore();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>();
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const projectTasks = useMemo(() => selectedProjectId
    ? tasks.filter(task => task.projectId === selectedProjectId)
    : tasks, [tasks, selectedProjectId]);

  const tasksByStatus = useMemo(() => {
    return statusColumns.reduce((acc, column) => {
      acc[column.id] = projectTasks
        .filter((task) => task.status === column.id)
        .sort((a, b) => (a.position || 0) - (b.position || 0));
      return acc;
    }, {} as Record<Status, Task[]>);
  }, [projectTasks]);

  const findContainer = (id: UniqueIdentifier) => {
    // Check if it's a task
    for (const status of Object.keys(tasksByStatus) as Status[]) {
      if (tasksByStatus[status].some(task => task.id === id)) {
        return status;
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = projectTasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    // This logic handles moving items between columns visually before drop
    // It's complex, so we'll simplify and only update on drop for now.
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeContainer = findContainer(active.id);

    // Check if dropping on a column
    if (over.data.current?.type === 'column') {
      const targetStatus = over.data.current.status as Status;
      if (activeContainer !== targetStatus) {
        updateTask(active.id as string, { status: targetStatus });
      }
      return;
    }

    // Check if dropping on another task
    const overTaskContainer = findContainer(over.id);
    if (!activeContainer || !overTaskContainer) return;

    if (activeContainer !== overTaskContainer) {
      // Task moved to a new column - update status
      updateTask(active.id as string, { status: overTaskContainer as Status });
    } else {
      // Same column - handle reordering
      const activeIndex = tasksByStatus[activeContainer].findIndex(t => t.id === active.id);
      const overIndex = tasksByStatus[overTaskContainer].findIndex(t => t.id === over.id);

      if (activeIndex !== overIndex) {
        reorderTasks(active.id as string, over.id as string);
      }
    }
  };

  const openCreateModal = () => {
    setEditingTaskId(undefined);
    setTaskModalOpen(true);
  };

  const openEditModal = (taskId: string) => {
    setEditingTaskId(taskId);
    setTaskModalOpen(true);
  };

  const closeModal = () => {
    setTaskModalOpen(false);
    setEditingTaskId(undefined);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailModalOpen(true);
  };

  const closeTaskDetailModal = () => {
    setTaskDetailModalOpen(false);
    setSelectedTask(null);
  };

  if (!selectedProjectId) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Канбан-доска</h1>
        <div className="text-center text-muted-foreground">
          Выберите проект для отображения канбан-доски.
        </div>
      </div>
    );
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Канбан-доска</h1>
          <div className="text-sm text-muted-foreground">
            Всего задач: {projectTasks.length}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 flex-1">
          {statusColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={tasksByStatus[column.id] || []}
              bgColor={column.bgColor}
              onTaskClick={handleTaskClick}
            />
          ))}
        </div>


        {/* Task Modal */}
        <TaskModal
          isOpen={taskModalOpen}
          onClose={closeModal}
          taskId={editingTaskId}
        />

        {/* Task Detail Modal */}
        <TaskDetailModal
          task={selectedTask}
          isOpen={taskDetailModalOpen}
          onClose={closeTaskDetailModal}
        />
      </div>
    </DndContext>
  );
} 