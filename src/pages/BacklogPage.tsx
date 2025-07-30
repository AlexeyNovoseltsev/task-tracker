import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Search, Filter, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store';
import { Task, Sprint } from '@/types';
import { Button } from '@/components/ui/button';
import { TaskCard } from '@/components/task/TaskCard';
import { TaskModal } from '@/components/task/TaskModal';

export function BacklogPage() {
  const { tasks, sprints, selectedProjectId, updateTask, addTask } = useAppStore();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all');
  const [selectedSprint, setSelectedSprint] = useState<string>('');

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

  // Get project tasks that are not in any sprint (backlog items)
  const projectTasks = selectedProjectId 
    ? tasks.filter(task => task.projectId === selectedProjectId)
    : [];

  const sprintTaskIds = sprints
    .filter(sprint => sprint.projectId === selectedProjectId)
    .flatMap(sprint => sprint.taskIds);

  const backlogTasks = projectTasks.filter(task => !sprintTaskIds.includes(task.id));

  // Apply filters
  const filteredTasks = backlogTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // Get sprints for assignment
  const projectSprints = sprints.filter(sprint => 
    sprint.projectId === selectedProjectId && sprint.status !== 'completed'
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredTasks.findIndex(task => task.id === active.id);
      const newIndex = filteredTasks.findIndex(task => task.id === over.id);
      
      // In a real implementation, you'd want to update the priority/order in the backend
      console.log(`Moved task from index ${oldIndex} to ${newIndex}`);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    // TODO: Add confirmation dialog and delete functionality
    console.log('Delete task:', taskId);
  };

  const handleAssignToSprint = () => {
    if (!selectedSprint) return;
    
    // For now, we'll just log this. In a real implementation, you'd update the sprint
    console.log('Assign selected tasks to sprint:', selectedSprint);
  };

  const totalStoryPoints = filteredTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);

  if (!selectedProjectId) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="text-gray-400 mb-4">
            <Plus className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600 max-w-md">
            Please select a project from the sidebar to manage the backlog.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Product Backlog</h1>
          <p className="text-muted-foreground mt-1">
            Prioritize and manage your project backlog • {filteredTasks.length} items • {totalStoryPoints} story points
          </p>
        </div>
        <Button onClick={handleCreateTask} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </Button>
      </div>

      {/* Filters and Actions */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Sprint Assignment */}
        {projectSprints.length > 0 && (
          <div className="flex items-center space-x-2">
            <select
              value={selectedSprint}
              onChange={(e) => setSelectedSprint(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Sprint</option>
              {projectSprints.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={handleAssignToSprint}
              disabled={!selectedSprint}
              className="flex items-center space-x-1"
            >
              <ArrowRight className="h-4 w-4" />
              <span>Assign</span>
            </Button>
          </div>
        )}
      </div>

      {/* Backlog Items */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Backlog Items
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Drag to reorder by priority)
              </span>
            </h2>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredTasks.map(task => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <TaskCard
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="text-gray-400 mb-4">
            <Plus className="h-16 w-16 mx-auto mb-4" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {searchTerm || priorityFilter !== 'all' ? 'No Matching Tasks' : 'Empty Backlog'}
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            {searchTerm || priorityFilter !== 'all' 
              ? 'Try adjusting your filters to find the tasks you\'re looking for.'
              : 'Start building your product backlog by adding user stories, bugs, and tasks.'
            }
          </p>
          {(!searchTerm && priorityFilter === 'all') && (
            <Button onClick={handleCreateTask} size="lg" className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Add Your First Task</span>
            </Button>
          )}
        </div>
      )}

      {/* Priority Guide */}
      {filteredTasks.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Priority Guide</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>Urgent - Critical issues</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span>High - Important features</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span>Medium - Standard tasks</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>Low - Nice to have</span>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={editingTask}
        defaultStatus="todo"
      />
    </div>
  );
} 