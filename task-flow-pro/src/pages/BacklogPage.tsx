import { useState } from "react";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Search, Filter, Edit, Trash } from "lucide-react";
import { TaskModal } from "@/components/task/TaskModal";

export function BacklogPage() {
  const { tasks, selectedProjectId, deleteTask } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>();

  const projectTasks = selectedProjectId 
    ? tasks.filter(task => task.projectId === selectedProjectId)
    : tasks;

  // Filter tasks for backlog (not in sprints and not done)
  const backlogTasks = projectTasks.filter(task => 
    !task.sprintId && task.status !== "done"
  );

  // Apply search and priority filters
  const filteredTasks = backlogTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100 dark:bg-red-900/30";
      case "medium": return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30";
      case "low": return "text-green-600 bg-green-100 dark:bg-green-900/30";
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-900/30";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bug": return "🐛";
      case "story": return "📖";
      case "task": return "✅";
      default: return "📝";
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

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    if (confirm(`Вы уверены, что хотите удалить "${taskTitle}"?`)) {
      deleteTask(taskId);
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Бэклог продукта</h1>
        <div className="text-center text-muted-foreground">
          Выберите проект для просмотра бэклога.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Бэклог продукта</h1>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить задачу
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Поиск задач..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Все приоритеты</option>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>
        </div>
      </div>

      {/* Priority Guide */}
      <div className="mb-6 bg-card p-4 rounded-lg border">
        <h3 className="font-semibold mb-2">Priority Guide</h3>
        <div className="flex space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>High - Critical issues, blocking features</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Medium - Important features, planned work</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Low - Nice to have, future enhancements</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {backlogTasks.length === 0 
              ? "Нет задач в бэклоге. Создайте первую задачу!" 
              : "Нет задач, соответствующих фильтрам."}
          </div>
                 ) : (
           filteredTasks.map((task, index) => (
             <div
               key={task.id}
               className="bg-card p-4 rounded-lg border hover:shadow-md transition-all duration-200 group hover-lift animate-slideIn"
             >
               <div className="flex items-start justify-between">
                 <div className="flex-1">
                   <div className="flex items-center space-x-3 mb-2">
                     <span className="text-sm font-mono text-muted-foreground">
                       #{index + 1}
                     </span>
                     <span className="text-lg">{getTypeIcon(task.type)}</span>
                     <h3 className="font-semibold">{task.title}</h3>
                   </div>
                   
                   {task.description && (
                     <p className="text-muted-foreground mb-3 text-sm">
                       {task.description}
                     </p>
                   )}

                   <div className="flex items-center space-x-4">
                     <span className={cn(
                       "px-2 py-1 rounded-full text-xs font-medium uppercase",
                       getPriorityColor(task.priority)
                     )}>
                       {task.priority}
                     </span>

                     <span className="text-xs text-muted-foreground uppercase">
                       {task.type}
                     </span>

                     {task.labels && task.labels.length > 0 && (
                       <div className="flex space-x-1">
                         {task.labels.map((label) => (
                           <span
                             key={label}
                             className="text-xs bg-secondary px-2 py-1 rounded"
                           >
                             {label}
                           </span>
                         ))}
                       </div>
                     )}
                   </div>
                 </div>

                 <div className="flex items-center space-x-3">
                   {task.storyPoints && (
                     <div className="text-sm font-medium bg-primary text-primary-foreground px-3 py-1 rounded">
                       {task.storyPoints} pts
                     </div>
                   )}
                   
                   {task.dueDate && (
                     <div className="text-xs text-muted-foreground">
                       📅 {new Date(task.dueDate).toLocaleDateString()}
                     </div>
                   )}

                   {/* Action Buttons */}
                   <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => openEditModal(task.id)}
                       className="h-8 w-8 p-0"
                     >
                       <Edit className="h-3 w-3" />
                     </Button>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => handleDeleteTask(task.id, task.title)}
                       className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                     >
                       <Trash className="h-3 w-3" />
                     </Button>
                   </div>
                 </div>
               </div>
             </div>
           ))
         )}
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-primary">{backlogTasks.length}</div>
          <div className="text-sm text-muted-foreground">Всего в бэклоге</div>
        </div>
        <div className="bg-card p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-red-500">
            {backlogTasks.filter(t => t.priority === "high").length}
          </div>
          <div className="text-sm text-muted-foreground">Высокий приоритет</div>
        </div>
        <div className="bg-card p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-primary">
            {backlogTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0)}
          </div>
          <div className="text-sm text-muted-foreground">Всего очков</div>
        </div>
        <div className="bg-card p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-green-500">
            {backlogTasks.filter(t => t.type === "story").length}
          </div>
          <div className="text-sm text-muted-foreground">Пользов. истории</div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={closeModal}
        taskId={editingTaskId}
      />
    </div>
  );
} 