import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppStore, useShowStoryPoints } from "@/store";
import { useToast } from "@/hooks/useToast";
import { 
  FolderPlus, 
  Folder, 
  CheckSquare, 
  Calendar, 
  TrendingUp, 
  Users, 
  Activity, 
  Plus, 
  ExternalLink, 
  ChevronDown,
  Target,
  Clock,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  BarChart3,
  Sparkles
} from "lucide-react";
import { ProjectModal } from "@/components/project/ProjectModal";
import { ProjectViewModal } from "@/components/project/ProjectViewModal";

export function DashboardPage() {
  const { projects, tasks, sprints, addProject, addTask, addSprint, setSelectedProject } = useAppStore();
  const showStoryPoints = useShowStoryPoints();
  const { success } = useToast();
  const navigate = useNavigate();
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProject, setViewingProject] = useState<string | undefined>();
  const [isRecentTasksCollapsed, setIsRecentTasksCollapsed] = useState(false);


  // Navigation functions
  const navigateToProjects = () => {
    success("Переход", "Открываем страницу проектов", 2000);
    navigate('/projects');
  };

  const navigateToTasks = (filter?: string, title?: string) => {
    if (filter && title) {
      success("Переход", `Открываем ${title.toLowerCase()}`, 2000);
    } else {
      success("Переход", "Открываем страницу всех задач", 2000);
    }
    navigate('/tasks');
  };

  const navigateToSprints = () => {
    success("Переход", "Открываем страницу спринтов", 2000);
    navigate('/sprints');
  };

  const handleCreateSampleProject = () => {
    // Create project
    const projectId = `project-${Date.now()}`;
    const newProject = {
      name: "TaskFlow Pro Sample",
      description: "A sample project showcasing all TaskFlow Pro features",
      key: "TFP",
      color: "#3b82f6",
    };
    
    // Add project first
    addProject(newProject);
    
    // Get the actually created project ID from store
    setTimeout(() => {
      const createdProject = projects.find(p => p.name === newProject.name);
      const actualProjectId = createdProject?.id || projectId;
      
      // Select the newly created project
      setSelectedProject(actualProjectId);

      // Create demo tasks with the correct project ID
      const demoTasks = [
        {
          title: "User Authentication System",
          description: "Implement secure user login and registration",
          type: "story" as const,
          status: "in-progress" as const,
          priority: "high" as const,
          projectId: actualProjectId,
                 assigneeId: "user-1",
         storyPoints: 8,
         labels: ["backend", "security"],
         dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
       },
       {
         title: "Dashboard Analytics",
         description: "Create comprehensive analytics dashboard",
         type: "story" as const,
         status: "todo" as const,
         priority: "medium" as const,
         projectId: actualProjectId,
                 assigneeId: "user-1",
         storyPoints: 5,
         labels: ["frontend", "analytics"],
         dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
       },
       {
         title: "Fix button styling",
         description: "Update button styles for better accessibility",
         type: "bug" as const,
         status: "in-review" as const,
         priority: "low" as const,
         projectId: actualProjectId,
         assigneeId: "user-1",
         storyPoints: 2,
         labels: ["frontend", "ui"],
       },
       {
         title: "Database Migration",
         description: "Migrate user data to new schema",
         type: "task" as const,
         status: "done" as const,
         priority: "high" as const,
         projectId: actualProjectId,
         assigneeId: "user-1",
         storyPoints: 3,
         labels: ["backend", "database"],
       },
       {
         title: "Mobile Responsive Design",
         description: "Ensure application works on mobile devices",
         type: "story" as const,
         status: "todo" as const,
         priority: "medium" as const,
         projectId: actualProjectId,
         assigneeId: "user-1",
         storyPoints: 13,
         labels: ["frontend", "mobile"],
       }
     ];

     // Add all demo tasks
     demoTasks.forEach(taskData => {
       addTask(taskData);
     });

     // Create demo sprints
     const currentDate = new Date();
     const sprintStartDate = new Date(currentDate);
     const sprintEndDate = new Date(currentDate);
     sprintEndDate.setDate(sprintEndDate.getDate() + 14);

     addSprint({
       name: "Sprint 1: Foundation",
       goal: "Establish core authentication and user management features",
       startDate: sprintStartDate,
       endDate: sprintEndDate,
       capacity: 40,
       status: "active" as const,
       projectId: actualProjectId,
     });

     const nextSprintStart = new Date(sprintEndDate);
     nextSprintStart.setDate(nextSprintStart.getDate() + 1);
     const nextSprintEnd = new Date(nextSprintStart);
     nextSprintEnd.setDate(nextSprintEnd.getDate() + 14);

     addSprint({
       name: "Sprint 2: Enhancement",
       goal: "Improve user experience and add analytics features",
       startDate: nextSprintStart,
       endDate: nextSprintEnd,
       capacity: 45,
       status: "planned" as const,
       projectId: actualProjectId,
     });

         // Show success notifications
    success("🎉 Демо проект успешно создан!");
    
    setTimeout(() => {
      success("✅ 5 демо задач добавлено в бэклог");
    }, 1000);
    
    setTimeout(() => {
      success("🏃‍♂️ 2 спринта созданы и готовы к планированию");
    }, 2000);
     
     }, 100); // End of setTimeout
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Дашборд</h1>
          <p className="text-sm text-muted-foreground">Обзор ваших проектов и активности</p>
        </div>
        <div className="flex items-center space-x-2 md:space-x-3 ml-4 flex-shrink-0">
          <Button 
            onClick={() => setProjectModalOpen(true)} 
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Создать проект
          </Button>
          {projects.length === 0 && (
            <Button onClick={handleCreateSampleProject} size="lg">
              🚀 Создать демо проект
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div 
          className="bg-card p-4 md:p-5 rounded-lg border shadow-sm interactive-card hover-lift cursor-pointer transition-all duration-200"
          onClick={navigateToProjects}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Folder className="h-4 w-4 text-primary" />
            </div>
            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-60" />
          </div>
          <h3 className="text-xs font-medium text-muted-foreground mb-1">Проекты</h3>
          <p className="text-2xl md:text-3xl font-bold text-foreground mb-0.5">{projects.length}</p>
          <p className="text-xs text-muted-foreground">активных</p>
        </div>

        <div 
          className="bg-card p-4 md:p-5 rounded-lg border shadow-sm interactive-card hover-lift cursor-pointer transition-all duration-200"
          onClick={() => navigateToTasks('all', 'Все задачи')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-primary" />
            </div>
            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-60" />
          </div>
          <h3 className="text-xs font-medium text-muted-foreground mb-1">Задачи</h3>
          <p className="text-2xl md:text-3xl font-bold text-foreground mb-0.5">{tasks.length}</p>
          <p className="text-xs text-muted-foreground">всего</p>
        </div>

        <div 
          className="bg-card p-4 md:p-5 rounded-lg border shadow-sm interactive-card hover-lift cursor-pointer transition-all duration-200"
          onClick={navigateToSprints}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-60" />
          </div>
          <h3 className="text-xs font-medium text-muted-foreground mb-1">Спринты</h3>
          <p className="text-2xl md:text-3xl font-bold text-foreground mb-0.5">
            {sprints.filter(s => s.status === 'active').length}
          </p>
          <p className="text-xs text-muted-foreground">активных</p>
        </div>

        <div 
          className="bg-card p-4 md:p-5 rounded-lg border shadow-sm interactive-card hover-lift cursor-pointer transition-all duration-200"
          onClick={() => navigateToTasks('active', 'Активные задачи')}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <PlayCircle className="h-4 w-4 text-primary" />
            </div>
            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-60" />
          </div>
          <h3 className="text-xs font-medium text-muted-foreground mb-1">В работе</h3>
          <p className="text-2xl md:text-3xl font-bold text-foreground mb-0.5">
            {tasks.filter(t => t.status === 'in-progress' || t.status === 'in-review').length}
          </p>
          <p className="text-xs text-muted-foreground">задач</p>
        </div>
      </div>

      {projects.length > 0 && (
        <div className="space-y-4 md:space-y-6">
          {/* Recent Tasks */}
          <div className="bg-card p-4 md:p-6 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Последние задачи
              </h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateToTasks('all', 'Все задачи')}
                  className="gap-2"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="hidden sm:inline">Все задачи</span>
                  <span className="sm:hidden">Все</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsRecentTasksCollapsed(!isRecentTasksCollapsed)}
                  className="p-1.5"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                    isRecentTasksCollapsed ? 'rotate-180' : ''
                  }`} />
                </Button>
              </div>
            </div>
            {!isRecentTasksCollapsed && (
              <div className="space-y-2">
              {tasks.slice(0, 5).map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/60 hover:bg-card hover:border-border transition-all duration-200 interactive-card cursor-pointer group"
                  onClick={() => navigateToTasks('all', 'Все задачи')}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-6 h-6">
                      {task.status === 'done' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : task.status === 'in-progress' ? (
                        <PlayCircle className="h-4 w-4 text-blue-500" />
                      ) : task.status === 'in-review' ? (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-base">{task.title}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full status-indicator ${task.status}`}>
                          {task.status}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full status-indicator ${task.priority}-priority`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {task.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {showStoryPoints && task.storyPoints && (
                      <span className="font-medium">{task.storyPoints} pts</span>
                    )}
                    <ExternalLink className="h-4 w-4 opacity-50" />
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>

          {/* Project Quick Access */}
          <div className="bg-card p-8 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Folder className="h-6 w-6 text-primary" />
                Быстрый доступ к проектам
              </h2>
              <Button 
                variant="outline" 
                onClick={() => info("Проекты", "Переходим к странице проектов", 2000)}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Все проекты
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 6).map((project) => (
                <div 
                  key={project.id}
                  className="p-4 bg-card/80 rounded-xl border interactive-card hover-lift cursor-pointer"
                  onClick={() => {
                    setViewingProject(project.id);
                    setShowViewModal(true);
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: project.color }}
                    >
                      <Folder className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{project.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{project.key}</p>
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {tasks.filter(t => t.projectId === project.id).length} задач
                    </span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground/50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-card p-6 rounded-lg border">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold">Начало работы</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Добро пожаловать в TaskFlow Pro! Это современный трекер задач, созданный для продакт-менеджеров. 
          Начните с создания проекта и добавления задач.
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderPlus className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm">Создавайте проекты для организации работы</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm">Добавляйте задачи и пользовательские истории</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm">Планируйте спринты и отслеживайте прогресс</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm">Используйте канбан-доски для визуального управления</p>
          </div>
        </div>
      </div>

      {/* Project Create Modal */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
      />

      {/* Project View Modal */}
      <ProjectViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        project={viewingProject ? projects.find(p => p.id === viewingProject) || null : null}
        onEditProject={(project) => {
          setShowViewModal(false);
          // Можно добавить функционал редактирования
        }}
        onDeleteProject={(projectId) => {
          setShowViewModal(false);
          // Можно добавить функционал удаления
        }}
        onNavigateToProject={(projectId) => {
          setSelectedProject(projectId);
          success("Проект выбран!", "Переходим к странице проекта", 2000);
        }}
      />


    </div>
  );
} 