import { 
  Plus, 
  Search, 
  Filter, 
  Folder, 
  Calendar, 
  Users,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Archive,
  Star,
  StarOff,
  TrendingUp
} from "lucide-react";
import { useState, useEffect } from "react";

import { ProjectModal } from "@/components/project/ProjectModal";
import { ProjectViewModal } from "@/components/project/ProjectViewModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { api } from "@/lib/api";
import { useAppStore } from "@/store";

export function ProjectsPage() {
  const { 
    projects, 
    tasks, 
    setSelectedProject, 
    selectedProjectId,
    deleteProject,
    updateProject 
  } = useAppStore();
  const { success, error } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "created" | "updated">("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<string | undefined>();
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProject, setViewingProject] = useState<string | undefined>();
  const [favoritedProjects, setFavoritedProjects] = useState<Set<string>>(new Set());

  // Load favorite status for all projects
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      try {
        const promises = projects.map(async (project) => {
          try {
            const response = await api.checkIfFavorited('project', project.id);
            return {
              projectId: project.id,
              isFavorited: response.success && response.data.is_favorited
            };
          } catch (err) {
            return { projectId: project.id, isFavorited: false };
          }
        });

        const results = await Promise.all(promises);
        const favoritedIds = results
          .filter(result => result.isFavorited)
          .map(result => result.projectId);
        
        setFavoritedProjects(new Set(favoritedIds));
      } catch (err) {
        // Silent fail for favorite loading
      }
    };

    if (projects.length > 0) {
      loadFavoriteStatus();
    }
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.key.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    const completedTasks = projectTasks.filter(task => task.status === "done");
    const activeTasks = projectTasks.filter(task => 
      task.status === "in-progress" || task.status === "in-review"
    );
    
    return {
      total: projectTasks.length,
      completed: completedTasks.length,
      active: activeTasks.length,
      progress: projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0
    };
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProject(projectId);
    success("Проект выбран!");
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm("Вы уверены, что хотите удалить этот проект? Все связанные задачи также будут удалены.")) {
      deleteProject(projectId);
      success("Проект удален!");
    }
  };

  const handleFavoriteToggle = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    try {
      // Проверяем текущий статус избранного
      const response = await api.checkIfFavorited('project', projectId);
      const isCurrentlyFavorited = response.success && response.data.is_favorited;
      const currentFavoriteId = response.data.favorite?.id;

      if (isCurrentlyFavorited && currentFavoriteId) {
        // Удаляем из избранного
        await api.removeFromFavorites(currentFavoriteId);
        setFavoritedProjects(prev => {
          const newSet = new Set(prev);
          newSet.delete(projectId);
          return newSet;
        });
        success('Удалено из избранного', 'Проект удален из избранного');
      } else {
        // Добавляем в избранное
        await api.addToFavorites({
          itemType: 'project',
          itemId: projectId
        });
        setFavoritedProjects(prev => new Set([...prev, projectId]));
        success('Добавлено в избранное', 'Проект добавлен в избранное');
      }
    } catch (err) {
      error('Ошибка', 'Не удалось обновить избранное');
    }
  };

  const openCreateModal = () => {
    setEditingProject(undefined);
    setShowProjectModal(true);
  };

  const openEditModal = (projectId: string) => {
    setEditingProject(projectId);
    setShowProjectModal(true);
  };

  const openViewModal = (projectId: string) => {
    setViewingProject(projectId);
    setShowViewModal(true);
  };

  const handleProjectClick = (projectId: string) => {
    // Вместо простого выбора, открываем модальное окно просмотра
    openViewModal(projectId);
  };

  const handleNavigateToProject = (projectId: string) => {
    setSelectedProject(projectId);
    success("Проект выбран!", "Переходим к странице проекта", 2000);
    // Здесь можно добавить навигацию к странице проекта
  };

  return (
    <div className="p-4 md:p-6 h-full max-w-7xl mx-auto">
      {/* Compact Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Проекты</h1>
          <p className="text-sm text-muted-foreground">
            Управление проектами и командной работой
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 ml-4 flex-shrink-0 bg-[#2c5545] text-white hover:bg-[#2c5545]/90" size="sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Создать проект</span>
          <span className="sm:hidden">Создать</span>
        </Button>
      </div>

      {/* Compact Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск проектов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="name">По названию</option>
          <option value="created">По дате создания</option>
          <option value="updated">По дате обновления</option>
        </select>

        {/* View Mode */}
        <div className="flex border border-input rounded-md">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 text-sm ${
              viewMode === "grid" 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            }`}
          >
            Сетка
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 text-sm border-l ${
              viewMode === "list" 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            }`}
          >
            Список
          </button>
        </div>
      </div>

      {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
        <div className="bg-card p-4 md:p-5 rounded-xl border shadow-sm hover-lift transition-all duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Folder className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Всего проектов</p>
            <p className="text-2xl md:text-3xl font-bold text-foreground leading-none">{filteredProjects.length}</p>
          </div>
        </div>
        <div className="bg-card p-4 md:p-5 rounded-xl border shadow-sm hover-lift transition-all duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center mb-3">
              <Users className="h-5 w-5 text-info" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Активных задач</p>
            <p className="text-2xl md:text-3xl font-bold text-info leading-none">
              {projects.reduce((sum, p) => sum + getProjectStats(p.id).active, 0)}
            </p>
          </div>
        </div>
        <div className="bg-card p-4 md:p-5 rounded-xl border shadow-sm hover-lift transition-all duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mb-3">
              <Calendar className="h-5 w-5 text-success" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Выполненных</p>
            <p className="text-2xl md:text-3xl font-bold text-success leading-none">
              {projects.reduce((sum, p) => sum + getProjectStats(p.id).completed, 0)}
            </p>
          </div>
        </div>
        <div className="bg-card p-4 md:p-5 rounded-xl border shadow-sm hover-lift transition-all duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Прогресс</p>
            <p className="text-2xl md:text-3xl font-bold text-foreground leading-none">
              {projects.length > 0 
                ? Math.round(projects.reduce((sum, p) => sum + getProjectStats(p.id).progress, 0) / projects.length)
                : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Projects */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? "Проекты не найдены" : "Нет проектов"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? "Попробуйте изменить поисковый запрос" 
              : "Создайте свой первый проект для начала работы"
            }
          </p>
          {!searchQuery && (
            <Button onClick={openCreateModal} className="gap-2">
              <Plus className="h-4 w-4" />
              Создать проект
            </Button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
            : "space-y-4"
        }>
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project.id);
            const isSelected = selectedProjectId === project.id;
            const isFavorite = favoritedProjects.has(project.id);

            return (
              <div
                key={project.id}
                className={`
                  bg-card border border-border/50 rounded-2xl p-6 interactive-card hover-lift cursor-pointer shadow-sm hover:shadow-md transition-all duration-200
                  ${isSelected ? "ring-2 ring-primary/50 border-primary/50 shadow-lg" : ""}
                  ${viewMode === "list" ? "flex items-center" : ""}
                `}
                onClick={() => handleProjectClick(project.id)}
              >
                {/* Project Icon and Header */}
                <div className={`flex items-start ${viewMode === "list" ? "w-1/3" : "justify-between mb-4"}`}>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: project.color }}
                    >
                      <Folder className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground font-mono">
                          {project.key}
                        </span>
                        {isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                      </div>
                    </div>
                  </div>
                  
                  {viewMode === "grid" && (
                    <div className="relative group">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                      <div className="absolute right-0 top-8 bg-card border rounded-md shadow-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-[120px]">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(project.id);
                          }}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded flex items-center gap-2"
                        >
                          <Edit className="h-3 w-3" />
                          Изменить
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFavoriteToggle(project.id);
                          }}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded flex items-center gap-2 whitespace-nowrap"
                        >
                          {isFavorite ? <StarOff className="h-3 w-3" /> : <Star className="h-3 w-3" />}
                          {isFavorite ? "Убрать из избранного" : "В избранное"}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(project.key);
                            success("Ключ проекта скопирован!");
                          }}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded flex items-center gap-2"
                        >
                          <Copy className="h-3 w-3" />
                          Копировать ключ
                        </button>
                        <hr className="my-1" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                          Удалить
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {project.description && (
                  <p className={`text-sm text-muted-foreground ${viewMode === "list" ? "w-1/3 px-4" : "mb-4"}`}>
                    {project.description}
                  </p>
                )}

                {/* Stats */}
                <div className={viewMode === "list" ? "w-1/3 flex items-center justify-between" : ""}>
                  <div className={`${viewMode === "grid" ? "space-y-3" : "flex space-x-6"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Задач:</span>
                      <span className="text-sm font-medium">{stats.total}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Активных:</span>
                      <span className="text-sm font-medium text-blue-600">{stats.active}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Выполнено:</span>
                      <span className="text-sm font-medium text-green-600">{stats.completed}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {viewMode === "grid" && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Прогресс</span>
                        <span className="text-xs font-medium">{Math.round(stats.progress)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ease-out ${
                            stats.progress >= 80 ? 'progress-bar-success' :
                            stats.progress >= 50 ? 'progress-bar-info' :
                            stats.progress >= 25 ? 'progress-bar-warning' :
                            'progress-bar'
                          }`}
                          style={{ width: `${stats.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Updated date and author */}
                <div className={`text-xs text-muted-foreground ${viewMode === "grid" ? "mt-4 pt-4 border-t" : ""}`}>
                  <div className="flex items-center justify-between">
                    <span>Обновлен: {new Date(project.updatedAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}</span>
                    <span>Автор: {project.createdBy || 'Система'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Create/Edit Modal */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        projectId={editingProject}
      />

      {/* Project View Modal */}
      <ProjectViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        project={viewingProject ? projects.find(p => p.id === viewingProject) || null : null}
        onEditProject={(project) => {
          setShowViewModal(false);
          openEditModal(project.id);
        }}
        onDeleteProject={handleDeleteProject}
        onNavigateToProject={handleNavigateToProject}
      />
    </div>
  );
} 