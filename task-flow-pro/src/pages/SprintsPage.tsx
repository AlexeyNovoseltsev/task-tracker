import { Plus, Calendar, Target, Users, TrendingUp, Edit, CheckCircle, Clock, AlertCircle, PlayCircle, Star } from "lucide-react";
import { useState, useEffect } from "react";

import { SprintModal } from "@/components/sprint/SprintModal";
import { SprintStatusDialog } from "@/components/sprint/SprintStatusDialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useToast } from "@/hooks/useToast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAppStore , useShowStoryPoints } from "@/store";

export function SprintsPage() {
  const { sprints, tasks, selectedProjectId, updateSprint, initializeWithDemoData } = useAppStore();
  const showStoryPoints = useShowStoryPoints();
  const { success, error } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sprintModalOpen, setSprintModalOpen] = useState(false);
  const [editingSprintId, setEditingSprintId] = useState<string | undefined>();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusDialogAction, setStatusDialogAction] = useState<'start' | 'complete'>('start');
  const [statusDialogSprintId, setStatusDialogSprintId] = useState<string>('');
  const [statusDialogLoading, setStatusDialogLoading] = useState(false);
  const [favoritedSprints, setFavoritedSprints] = useState<Set<string>>(new Set());

  // Load favorite status for all sprints
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      try {
        const promises = sprints.map(async (sprint) => {
          try {
            const response = await api.checkIfFavorited('sprint', sprint.id);
            return {
              sprintId: sprint.id,
              isFavorited: response.success && response.data.is_favorited
            };
          } catch (err) {
            return { sprintId: sprint.id, isFavorited: false };
          }
        });

        const results = await Promise.all(promises);
        const favoritedIds = results
          .filter(result => result.isFavorited)
          .map(result => result.sprintId);
        
        setFavoritedSprints(new Set(favoritedIds));
      } catch (err) {
        // Silent fail for favorite loading
      }
    };

    if (sprints.length > 0) {
      loadFavoriteStatus();
    }
  }, [sprints]);

  const handleFavoriteToggle = async (sprintId: string) => {
    try {
      // Проверяем текущий статус избранного
      const response = await api.checkIfFavorited('sprint', sprintId);
      const isCurrentlyFavorited = response.success && response.data.is_favorited;
      const currentFavoriteId = response.data.favorite?.id;

      if (isCurrentlyFavorited && currentFavoriteId) {
        // Удаляем из избранного
        await api.removeFromFavorites(currentFavoriteId);
        setFavoritedSprints(prev => {
          const newSet = new Set(prev);
          newSet.delete(sprintId);
          return newSet;
        });
        success('Удалено из избранного', 'Спринт удален из избранного');
      } else {
        // Добавляем в избранное
        await api.addToFavorites({
          itemType: 'sprint',
          itemId: sprintId
        });
        setFavoritedSprints(prev => new Set([...prev, sprintId]));
        success('Добавлено в избранное', 'Спринт добавлен в избранное');
      }
    } catch (err) {
      error('Ошибка', 'Не удалось обновить избранное');
    }
  };

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

  const getSprintStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return CheckCircle;
      case 'in-progress': return PlayCircle;
      case 'in-review': return AlertCircle;
      case 'todo': return Clock;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      case 'in-review': return 'text-yellow-600';
      case 'todo': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const openStatusDialog = (sprintId: string, action: 'start' | 'complete') => {
    setStatusDialogSprintId(sprintId);
    setStatusDialogAction(action);
    setStatusDialogOpen(true);
  };

  const closeStatusDialog = () => {
    setStatusDialogOpen(false);
    setStatusDialogSprintId('');
    setStatusDialogLoading(false);
  };

  const handleStartSprint = async () => {
    const sprint = sprints.find(s => s.id === statusDialogSprintId);
    if (!sprint) return;

    // Check if there's already an active sprint
    const activeSprints = projectSprints.filter(s => s.status === 'active');
    if (activeSprints.length > 0) {
      error('Только один спринт может быть активным одновременно', 'Завершите текущий активный спринт, чтобы начать новый.');
      closeStatusDialog();
      return;
    }

    setStatusDialogLoading(true);
    
    try {
      // Update sprint status to active
      updateSprint(statusDialogSprintId, { status: 'active' });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success(`Спринт "${sprint.name}" успешно запущен!`);
      closeStatusDialog();
    } catch (err) {
      console.error('Error starting sprint:', err);
      error('Ошибка при запуске спринта', (err as Error).message);
    } finally {
      setStatusDialogLoading(false);
    }
  };

  const handleCompleteSprint = async () => {
    const sprint = sprints.find(s => s.id === statusDialogSprintId);
    if (!sprint) return;

    setStatusDialogLoading(true);
    
    try {
      // Update sprint status to completed
      updateSprint(statusDialogSprintId, { status: 'completed' });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      success(`Спринт "${sprint.name}" успешно завершен!`);
      closeStatusDialog();
    } catch (err) {
      console.error('Error completing sprint:', err);
      error('Ошибка при завершении спринта', (err as Error).message);
    } finally {
      setStatusDialogLoading(false);
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Управление спринтами</h1>
        <div className="text-center text-muted-foreground">
          Выберите проект для просмотра спринтов.
        </div>
        <div className="mt-4 text-center">
          <Button onClick={initializeWithDemoData} className="bg-[#2c5545] text-white hover:bg-[#2c5545]/90">
            Загрузить демо-данные
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Управление спринтами</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Выбранный проект: {selectedProjectId || 'Нет'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {projectSprints.length === 0 && (
            <Button variant="outline" onClick={initializeWithDemoData}>
              Загрузить демо-данные
            </Button>
          )}
          <Button onClick={openCreateModal} className="bg-[#2c5545] text-white hover:bg-[#2c5545]/90" data-testid="open-sprint-modal">
            <Plus className="h-4 w-4 mr-2" />
            Создать спринт
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Фильтр по статусу:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Фильтр по статусу" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все спринты</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="planned">Запланированные</SelectItem>
              <SelectItem value="completed">Завершенные</SelectItem>
            </SelectContent>
          </Select>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFavoriteToggle(sprint.id)}
                        className="p-1 h-6 w-6"
                      >
                        <Star className={cn(
                          "h-3 w-3",
                          favoritedSprints.has(sprint.id) ? "fill-yellow-400 text-yellow-500" : "text-muted-foreground"
                        )} />
                      </Button>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getSprintStatusColor(sprint.status))}>
                        {sprint.status === "active" ? "АКТИВНЫЙ" : 
                         sprint.status === "planned" ? "ЗАПЛАНИРОВАННЫЙ" : 
                         sprint.status === "completed" ? "ЗАВЕРШЕННЫЙ" : sprint.status}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditModal(sprint.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openStatusDialog(sprint.id, 'complete')}
                      >
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
                                         {showStoryPoints && sprint.capacity && (
                       <div className="flex items-center space-x-2">
                         <Target className="h-4 w-4 text-muted-foreground" />
                         <div>
                           <div className="text-sm font-medium">{sprint.capacity} pts</div>
                           <div className="text-xs text-muted-foreground">Емкость</div>
                         </div>
                       </div>
                     )}
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

                                     <div className="text-sm text-muted-foreground mb-4">
                     {sprintTasks.length} задач • {sprintTasks.filter(t => t.status === "done").length} выполнено
                   </div>

                   {/* Sprint Tasks */}
                   {sprintTasks.length > 0 && (
                     <div className="border-t pt-4">
                       <h4 className="text-sm font-medium mb-3">Задачи спринта</h4>
                       <div className="space-y-2">
                         {sprintTasks.map((task) => {
                           const StatusIcon = getStatusIcon(task.status);
                           return (
                             <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                               <div className="flex items-center space-x-3 flex-1">
                                 <StatusIcon className={cn("h-4 w-4", getStatusColor(task.status))} />
                                 <div className="flex-1 min-w-0">
                                   <div className="text-sm font-medium truncate">{task.title}</div>
                                   <div className="flex items-center space-x-2 mt-1">
                                     <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getPriorityColor(task.priority))}>
                                       {task.priority === 'high' ? 'Высокий' : 
                                        task.priority === 'medium' ? 'Средний' : 
                                        task.priority === 'low' ? 'Низкий' : 
                                        task.priority === 'urgent' ? 'Срочный' : task.priority}
                                     </span>
                                     {showStoryPoints && task.storyPoints && (
                                       <span className="text-xs text-muted-foreground">
                                         {task.storyPoints} SP
                                       </span>
                                     )}
                                   </div>
                                 </div>
                               </div>
                               <div className="text-xs text-muted-foreground">
                                 {task.status === 'done' ? 'Выполнено' :
                                  task.status === 'in-progress' ? 'В работе' :
                                  task.status === 'in-review' ? 'На проверке' :
                                  task.status === 'todo' ? 'К выполнению' : task.status}
                               </div>
                             </div>
                           );
                         })}
                       </div>
                     </div>
                   )}
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
                       <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getSprintStatusColor(sprint.status))}>
                         {sprint.status === "active" ? "АКТИВНЫЙ" : 
                          sprint.status === "planned" ? "ЗАПЛАНИРОВАННЫЙ" : 
                          sprint.status === "completed" ? "ЗАВЕРШЕННЫЙ" : sprint.status}
                       </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditModal(sprint.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => openStatusDialog(sprint.id, 'start')}
                      >
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
                    {showStoryPoints && sprint.capacity && (
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{sprint.capacity} pts</div>
                          <div className="text-xs text-muted-foreground">Емкость</div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{sprintTasks.length} задач</div>
                        <div className="text-xs text-muted-foreground">Запланировано</div>
                      </div>
                    </div>
                  </div>

                  {/* Sprint Tasks */}
                  {sprintTasks.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-3">Задачи спринта</h4>
                      <div className="space-y-2">
                        {sprintTasks.map((task) => {
                          const StatusIcon = getStatusIcon(task.status);
                          return (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center space-x-3 flex-1">
                                <StatusIcon className={cn("h-4 w-4", getStatusColor(task.status))} />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">{task.title}</div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getPriorityColor(task.priority))}>
                                      {task.priority === 'high' ? 'Высокий' : 
                                       task.priority === 'medium' ? 'Средний' : 
                                       task.priority === 'low' ? 'Низкий' : 
                                       task.priority === 'urgent' ? 'Срочный' : task.priority}
                                    </span>
                                    {showStoryPoints && task.storyPoints && (
                                      <span className="text-xs text-muted-foreground">
                                        {task.storyPoints} SP
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {task.status === 'done' ? 'Выполнено' :
                                 task.status === 'in-progress' ? 'В работе' :
                                 task.status === 'in-review' ? 'На проверке' :
                                 task.status === 'todo' ? 'К выполнению' : task.status}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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
                                         <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getSprintStatusColor(sprint.status))}>
                       {sprint.status === "active" ? "АКТИВНЫЙ" : 
                        sprint.status === "planned" ? "ЗАПЛАНИРОВАННЫЙ" : 
                        sprint.status === "completed" ? "ЗАВЕРШЕННЫЙ" : sprint.status}
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

                  {/* Sprint Tasks */}
                  {sprintTasks.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-3">Задачи спринта</h4>
                      <div className="space-y-2">
                        {sprintTasks.map((task) => {
                          const StatusIcon = getStatusIcon(task.status);
                          return (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center space-x-3 flex-1">
                                <StatusIcon className={cn("h-4 w-4", getStatusColor(task.status))} />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">{task.title}</div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", getPriorityColor(task.priority))}>
                                      {task.priority === 'high' ? 'Высокий' : 
                                       task.priority === 'medium' ? 'Средний' : 
                                       task.priority === 'low' ? 'Низкий' : 
                                       task.priority === 'urgent' ? 'Срочный' : task.priority}
                                    </span>
                                    {showStoryPoints && task.storyPoints && (
                                      <span className="text-xs text-muted-foreground">
                                        {task.storyPoints} SP
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {task.status === 'done' ? 'Выполнено' :
                                 task.status === 'in-progress' ? 'В работе' :
                                 task.status === 'in-review' ? 'На проверке' :
                                 task.status === 'todo' ? 'К выполнению' : task.status}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
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

      {/* Sprint Status Dialog */}
      <SprintStatusDialog
        isOpen={statusDialogOpen}
        onClose={closeStatusDialog}
        onConfirm={statusDialogAction === 'start' ? handleStartSprint : handleCompleteSprint}
        sprintName={sprints.find(s => s.id === statusDialogSprintId)?.name || ''}
        action={statusDialogAction}
        isLoading={statusDialogLoading}
      />
    </div>
  );
} 