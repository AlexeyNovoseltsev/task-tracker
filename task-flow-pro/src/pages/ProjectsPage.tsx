import { useState } from "react";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
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
  StarOff
} from "lucide-react";
import { ProjectModal } from "@/components/project/ProjectModal";

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

  const handleFavoriteToggle = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, { 
        // Добавим поле favorite в интерфейс, если его нет
        favorite: !(project as any).favorite 
      });
      success((project as any).favorite ? "Удалено из избранного" : "Добавлено в избранное");
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

  return (
    <div className="p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Проекты</h1>
          <p className="text-muted-foreground mt-1">
            Управление проектами и командной работой
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Создать проект
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Всего проектов</p>
              <p className="text-2xl font-bold">{filteredProjects.length}</p>
            </div>
            <Folder className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Активных задач</p>
              <p className="text-2xl font-bold">
                {projects.reduce((sum, p) => sum + getProjectStats(p.id).active, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Выполненных задач</p>
              <p className="text-2xl font-bold">
                {projects.reduce((sum, p) => sum + getProjectStats(p.id).completed, 0)}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Общий прогресс</p>
              <p className="text-2xl font-bold">
                {projects.length > 0 
                  ? Math.round(projects.reduce((sum, p) => sum + getProjectStats(p.id).progress, 0) / projects.length)
                  : 0}%
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">%</span>
            </div>
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
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
        }>
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project.id);
            const isSelected = selectedProjectId === project.id;
            const isFavorite = (project as any).favorite;

            return (
              <div
                key={project.id}
                className={`
                  bg-card border rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer
                  ${isSelected ? "ring-2 ring-primary border-primary" : ""}
                  ${viewMode === "list" ? "flex items-center" : ""}
                `}
                onClick={() => handleSelectProject(project.id)}
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
                          className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded flex items-center gap-2"
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
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${stats.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Updated date */}
                <div className={`text-xs text-muted-foreground ${viewMode === "grid" ? "mt-4 pt-4 border-t" : ""}`}>
                  Обновлен: {new Date(project.updatedAt).toLocaleDateString('ru-RU')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        projectId={editingProject}
      />
    </div>
  );
} 