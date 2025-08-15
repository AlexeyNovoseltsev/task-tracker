import { Star, FolderOpen, Target, Calendar, Clock, User, Tag } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { ProjectModal } from '@/components/project/ProjectModal';
import { SprintModal } from '@/components/sprint/SprintModal';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/hooks/useToast';
import { api } from '@/lib/api';
import { FavoriteWithDetails, Project, Task, Sprint } from '@/types';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const { success, error } = useToast();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.getFavorites();
      if (response.success) {
        setFavorites(response.data);
      }
    } catch (err) {
      error('Ошибка загрузки избранного', 'Не удалось загрузить избранные элементы');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      await api.removeFromFavorites(favoriteId);
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      success('Удалено из избранного', 'Элемент удален из избранного');
    } catch (err) {
      error('Ошибка удаления', 'Не удалось удалить из избранного');
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleViewSprint = (sprint: Sprint) => {
    setSelectedSprint(sprint);
    setShowSprintModal(true);
  };

  const favoriteProjects = favorites.filter(fav => fav.itemType === 'project' && fav.project);
  const favoriteTasks = favorites.filter(fav => fav.itemType === 'task' && fav.task);
  const favoriteSprints = favorites.filter(fav => fav.itemType === 'sprint' && fav.sprint);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <Star className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold">Избранное</h1>
          <p className="text-muted-foreground">
            Ваши избранные проекты, задачи и спринты
          </p>
        </div>
      </div>

      {/* Избранные проекты */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Избранные проекты
            <Badge variant="secondary">{favoriteProjects.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {favoriteProjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favoriteProjects.map((favorite) => {
                const project = favorite.project!;
                return (
                  <Card key={favorite.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: project.color }}
                            />
                            <h3 className="font-semibold">{project.name}</h3>
                          </div>
                          {project.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {project.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Ключ: {project.key}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFavorite(favorite.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Удалить
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => handleViewProject(project)}
                      >
                        Просмотр
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={FolderOpen}
              title="Нет избранных проектов"
              description="Добавьте проекты в избранное для быстрого доступа"
            />
          )}
        </CardContent>
      </Card>

      {/* Избранные задачи */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Избранные задачи
            <Badge variant="secondary">{favoriteTasks.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {favoriteTasks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favoriteTasks.map((favorite) => {
                const task = favorite.task!;
                return (
                  <Card key={favorite.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Badge variant="outline">{task.type}</Badge>
                            <Badge variant="outline">{task.status}</Badge>
                            <Badge variant="outline">{task.priority}</Badge>
                          </div>
                          {task.storyPoints && (
                            <div className="text-xs text-muted-foreground">
                              Story Points: {task.storyPoints}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFavorite(favorite.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Удалить
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => handleViewTask(task)}
                      >
                        Просмотр
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Target}
              title="Нет избранных задач"
              description="Добавьте задачи в избранное для быстрого доступа"
            />
          )}
        </CardContent>
      </Card>

      {/* Избранные спринты */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Избранные спринты
            <Badge variant="secondary">{favoriteSprints.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {favoriteSprints.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favoriteSprints.map((favorite) => {
                const sprint = favorite.sprint!;
                return (
                  <Card key={favorite.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{sprint.name}</h3>
                          {sprint.goal && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {sprint.goal}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Badge variant="outline">{sprint.status}</Badge>
                            {sprint.capacity && (
                              <span>Capacity: {sprint.capacity}</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(sprint.startDate).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })} - {new Date(sprint.endDate).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFavorite(favorite.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Удалить
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => handleViewSprint(sprint)}
                      >
                        Просмотр
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="Нет избранных спринтов"
              description="Добавьте спринты в избранное для быстрого доступа"
            />
          )}
        </CardContent>
      </Card>

      {/* Модальные окна */}
      {showProjectModal && selectedProject && (
        <ProjectModal
          isOpen={showProjectModal}
          onClose={() => setShowProjectModal(false)}
          project={selectedProject}
          mode="view"
        />
      )}

      {showTaskModal && selectedTask && (
        <TaskDetailModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          task={selectedTask}
        />
      )}

      {showSprintModal && selectedSprint && (
        <SprintModal
          isOpen={showSprintModal}
          onClose={() => setShowSprintModal(false)}
          sprint={selectedSprint}
          mode="view"
        />
      )}
    </div>
  );
} 