import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Activity, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Plus, 
  CheckCircle, 
  X,
  Folder,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useAppStore } from '@/store';
import type { Project } from '@/types';

interface ProjectViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
  onNavigateToProject?: (projectId: string) => void;
}

export function ProjectViewModal({ 
  isOpen,
  onClose,
  project, 
  onEditProject,
  onDeleteProject,
  onNavigateToProject 
}: ProjectViewModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { success, info } = useToast();
  const { tasks } = useAppStore();

  if (!isOpen || !project) return null;

  // Get project tasks
  const projectTasks = tasks.filter(task => task.projectId === project.id);

  const navigateToProjectTasks = (_filter: string, title: string) => {
    success("Переход", `Открываем ${title.toLowerCase()} проекта "${project.name}"`, 2000);
    onClose(); // Закрываем модальное окно проекта
    navigate('/tasks'); // Переходим к странице задач
  };

  const handleNavigateToProject = () => {
    success(
      "Переход к проекту",
      `Открываем проект "${project.name}"`,
      3000
    );
    onNavigateToProject?.(project.id);
    onClose();
  };

  const handleEditProject = () => {
    info(
      "Редактирование проекта",
      "Открываем форму редактирования проекта",
      3000
    );
    onEditProject?.(project);
    onClose();
  };

  const handleDeleteProject = () => {
    if (window.confirm(`Вы уверены, что хотите удалить проект "${project.name}"?`)) {
      setIsLoading(true);
      // Симуляция удаления
      setTimeout(() => {
        setIsLoading(false);
        success(
          "Проект удален",
          `Проект "${project.name}" успешно удален`,
          4000
        );
        onDeleteProject?.(project.id);
        onClose();
      }, 1000);
    }
  };

  // Мок данные для статистики
  const stats = {
    tasksCount: Math.floor(Math.random() * 50) + 10,
    completedTasksCount: Math.floor(Math.random() * 30) + 5,
    activeSprintsCount: Math.floor(Math.random() * 3) + 1,
    membersCount: Math.floor(Math.random() * 8) + 2,
  };

  const completionPercent = stats.tasksCount > 0 
    ? Math.round((stats.completedTasksCount / stats.tasksCount) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto animate-modalIn">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-md border-b px-8 py-6 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center"
              style={{ backgroundColor: project.color }}
            >
              <Folder className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{project.name}</h2>
                <Badge variant="secondary" className="status-indicator text-xs">
                  {project.key}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {project.description || 'Описание проекта отсутствует'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-8 space-y-8">
          {/* Project Progress */}
          <div className="p-6 rounded-2xl border bg-gradient-to-br from-card to-muted/20 interactive-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-primary" />
                Прогресс проекта
              </h3>
              <div className="text-3xl font-bold text-primary">
                {completionPercent}%
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-3 mb-4 overflow-hidden">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                  completionPercent >= 80 ? 'progress-bar-success' :
                  completionPercent >= 50 ? 'progress-bar-info' :
                  completionPercent >= 25 ? 'progress-bar-warning' :
                  'progress-bar'
                }`}
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Завершено {stats.completedTasksCount} из {stats.tasksCount} задач
              </span>
              <span className="flex items-center gap-1 text-primary">
                <TrendingUp className="w-4 h-4" />
                На 15% больше чем в прошлом месяце
              </span>
            </div>
          </div>

          {/* Project Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              className="text-center p-6 rounded-xl border bg-card shadow-sm interactive-card hover-lift cursor-pointer transition-all duration-200"
              onClick={() => navigateToProjectTasks('all', 'Все задачи')}
            >
              <div className="text-3xl font-bold text-foreground mb-3">
                {projectTasks.length}
              </div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Всего задач
              </div>
              <div className="text-xs text-muted-foreground">
                Кликните для просмотра
              </div>
            </div>
            <div 
              className="text-center p-6 rounded-xl border bg-card shadow-sm interactive-card hover-lift cursor-pointer transition-all duration-200"
              onClick={() => navigateToProjectTasks('completed', 'Завершенные задачи')}
            >
              <div className="text-3xl font-bold text-success mb-3">
                {projectTasks.filter(t => t.status === 'done').length}
              </div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Завершено
              </div>
              <div className="text-xs text-muted-foreground">
                Кликните для просмотра
              </div>
            </div>
            <div 
              className="text-center p-6 rounded-xl border bg-card shadow-sm interactive-card hover-lift cursor-pointer transition-all duration-200"
              onClick={() => navigateToProjectTasks('active', 'Активные задачи')}
            >
              <div className="text-3xl font-bold text-info mb-3">
                {projectTasks.filter(t => t.status === 'in-progress' || t.status === 'in-review').length}
              </div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Активные задачи
              </div>
              <div className="text-xs text-muted-foreground">
                Кликните для просмотра
              </div>
            </div>
            <div 
              className="text-center p-6 rounded-xl border bg-card shadow-sm interactive-card hover-lift cursor-pointer transition-all duration-200"
              onClick={() => info("Участники", "Функция управления участниками в разработке", 2000)}
            >
              <div className="text-3xl font-bold text-muted-foreground mb-3">
                {stats.membersCount}
              </div>
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Участники
              </div>
              <div className="text-xs text-muted-foreground">
                Скоро доступно
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={handleNavigateToProject}
              className="h-14 flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
            >
              <ExternalLink className="w-5 h-5" />
              Открыть проект
            </Button>
            <Button 
              variant="outline" 
              onClick={handleEditProject}
              className="h-14 flex items-center justify-center gap-3 hover:bg-secondary/80"
            >
              <Edit className="w-5 h-5" />
              Редактировать
            </Button>
            <Button 
              variant="outline" 
              className="h-14 flex items-center justify-center gap-3 hover:bg-secondary/80"
            >
              <Users className="w-5 h-5" />
              Участники
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDeleteProject}
              disabled={isLoading}
              className="h-14 flex items-center justify-center gap-3 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
            >
              <Trash2 className="w-5 h-5" />
              {isLoading ? 'Удаление...' : 'Удалить'}
            </Button>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-3">
              <Activity className="w-6 h-6 text-primary" />
              Последняя активность
            </h3>
            <div className="space-y-4">
              {[
                {
                  type: 'success',
                  title: 'Задача "Новая функция авторизации" завершена',
                  user: 'Анна Петрова',
                  time: '2 часа назад',
                  color: 'bg-green-500'
                },
                {
                  type: 'info',
                  title: 'Спринт "Релиз v2.1" запущен',
                  user: 'Максим Иванов',
                  time: '1 день назад',
                  color: 'bg-blue-500'
                },
                {
                  type: 'warning',
                  title: 'Приближается дедлайн задачи "Исправление критического бага"',
                  user: 'Система',
                  time: '2 дня назад',
                  color: 'bg-yellow-500'
                },
                {
                  type: 'info',
                  title: 'Добавлен новый участник проекта',
                  user: 'Елена Сидорова',
                  time: '3 дня назад',
                  color: 'bg-purple-500'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-5 p-5 rounded-2xl border bg-card/50 hover:bg-card transition-all duration-200 hover-lift">
                  <div className={`w-4 h-4 rounded-full ${activity.color} shadow-sm flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium leading-relaxed mb-1">
                      {activity.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Add Task */}
          <div className="p-8 rounded-2xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-all duration-200 hover:bg-primary/5">
            <Button 
              variant="ghost" 
              className="w-full h-20 text-muted-foreground hover:text-primary transition-all duration-200"
              onClick={() => info("Быстрое добавление", "Функция в разработке", 2000)}
            >
              <Plus className="w-6 h-6 mr-3" />
              <div className="text-center">
                <div className="font-medium">Быстрое добавление задачи</div>
                <div className="text-xs opacity-70">Нажмите, чтобы создать новую задачу</div>
              </div>
            </Button>
          </div>
        </div>
      </div>


    </div>
  );
}