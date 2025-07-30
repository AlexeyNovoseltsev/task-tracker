import { useState } from "react";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Calendar, Target, Users, TrendingUp, Edit } from "lucide-react";
import { SprintModal } from "@/components/sprint/SprintModal";

export function SprintsPage() {
  const { sprints, tasks, selectedProjectId } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sprintModalOpen, setSprintModalOpen] = useState(false);
  const [editingSprintId, setEditingSprintId] = useState<string | undefined>();

  const projectSprints = selectedProjectId 
    ? sprints.filter(sprint => sprint.projectId === selectedProjectId)
    : sprints;

  const filteredSprints = statusFilter === "all" 
    ? projectSprints 
    : projectSprints.filter(sprint => sprint.status === statusFilter);

  const getSprintTasks = (sprintId: string) => {
    return tasks.filter(task => task.sprintId === sprintId);
  };

  const calculateProgress = (sprintId: string) => {
    const sprintTasks = getSprintTasks(sprintId);
    if (sprintTasks.length === 0) return 0;
    const completedTasks = sprintTasks.filter(task => task.status === "done");
    return Math.round((completedTasks.length / sprintTasks.length) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "planned": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "completed": return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const openCreateModal = () => {
    setEditingSprintId(undefined);
    setSprintModalOpen(true);
  };

  const openEditModal = (sprintId: string) => {
    setEditingSprintId(sprintId);
    setSprintModalOpen(true);
  };

  const closeModal = () => {
    setSprintModalOpen(false);
    setEditingSprintId(undefined);
  };

  if (!selectedProjectId) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Управление спринтами</h1>
        <div className="text-center text-muted-foreground">
          Выберите проект для просмотра спринтов.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Управление спринтами</h1>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          Создать спринт
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Фильтр по статусу:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Все спринты</option>
            <option value="active">Активные</option>
            <option value="planned">Запланированные</option>
            <option value="completed">Завершенные</option>
          </select>
        </div>
      </div>

      {/* Sprint Categories */}
      <div className="space-y-8">
        {/* Active Sprints */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Активные спринты
          </h2>
          <div className="grid gap-4">
            {projectSprints.filter(s => s.status === 'active').map((sprint) => {
              const sprintTasks = getSprintTasks(sprint.id);
              const progress = calculateProgress(sprint.id);
              const daysRemaining = getDaysRemaining(sprint.endDate);
              
              return (
                <div key={sprint.id} className="bg-card p-6 rounded-lg border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{sprint.name}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{sprint.goal}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(sprint.status))}>
                        {sprint.status === "active" ? "АКТИВНЫЙ" : 
                         sprint.status === "planned" ? "ЗАПЛАНИРОВАННЫЙ" : 
                         sprint.status === "completed" ? "ЗАВЕРШЕННЫЙ" : sprint.status.toUpperCase()}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditModal(sprint.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        Завершить спринт
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{formatDate(sprint.startDate)}</div>
                        <div className="text-xs text-muted-foreground">Дата начала</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{formatDate(sprint.endDate)}</div>
                        <div className="text-xs text-muted-foreground">Дата окончания</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{sprint.capacity} pts</div>
                        <div className="text-xs text-muted-foreground">Емкость</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{daysRemaining} дн.</div>
                        <div className="text-xs text-muted-foreground">Осталось</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Прогресс</span>
                      <span className="text-sm text-muted-foreground">{progress}% выполнено</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {sprintTasks.length} задач • {sprintTasks.filter(t => t.status === "done").length} выполнено
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Planned Sprints */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            Запланированные спринты
          </h2>
          <div className="grid gap-4">
            {projectSprints.filter(s => s.status === 'planned').map((sprint) => {
              const sprintTasks = getSprintTasks(sprint.id);
              
              return (
                <div key={sprint.id} className="bg-card p-6 rounded-lg border">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{sprint.name}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{sprint.goal}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(sprint.status))}>
                        {sprint.status === "active" ? "АКТИВНЫЙ" : 
                         sprint.status === "planned" ? "ЗАПЛАНИРОВАННЫЙ" : 
                         sprint.status === "completed" ? "ЗАВЕРШЕННЫЙ" : sprint.status.toUpperCase()}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditModal(sprint.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm">
                        Запустить спринт
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</div>
                        <div className="text-xs text-muted-foreground">Длительность</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{sprint.capacity} pts</div>
                        <div className="text-xs text-muted-foreground">Емкость</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{sprintTasks.length} задач</div>
                        <div className="text-xs text-muted-foreground">Запланировано</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completed Sprints */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
            Завершенные спринты
          </h2>
          <div className="grid gap-4">
            {projectSprints.filter(s => s.status === 'completed').map((sprint) => {
              const sprintTasks = getSprintTasks(sprint.id);
              const progress = calculateProgress(sprint.id);
              
              return (
                <div key={sprint.id} className="bg-card p-6 rounded-lg border opacity-75">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{sprint.name}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{sprint.goal}</p>
                    </div>
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getStatusColor(sprint.status))}>
                      {sprint.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}</div>
                        <div className="text-xs text-muted-foreground">Длительность</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{progress}% выполнено</div>
                        <div className="text-xs text-muted-foreground">Итоговый прогресс</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{sprintTasks.filter(t => t.status === "done").length}/{sprintTasks.length} задач</div>
                        <div className="text-xs text-muted-foreground">Выполнено</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredSprints.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {projectSprints.length === 0 
            ? "Спринты еще не созданы. Создайте первый спринт!" 
            : "Нет спринтов, соответствующих фильтру."}
        </div>
      )}

      {/* Sprint Modal */}
      <SprintModal
        isOpen={sprintModalOpen}
        onClose={closeModal}
        sprintId={editingSprintId}
      />
    </div>
  );
} 