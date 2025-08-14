import { 
  FolderPlus, 
  ExternalLink, 
  ChevronDown,
  Clock,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  BarChart3,
  Sparkles,
  Zap,
  ArrowUpRight,
  X
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Icon3dCalendar } from "@/components/icons/Icon3dCalendar";
import { Icon3dClipboard } from "@/components/icons/Icon3dClipboard";
import { Icon3dFolder } from "@/components/icons/Icon3dFolder";
import { Icon3dWorkstation } from "@/components/icons/Icon3dWorkstation";
import { ProjectModal } from "@/components/project/ProjectModal";
import { ProjectViewModal } from "@/components/project/ProjectViewModal";
import { TaskDetailModal } from "@/components/task/TaskDetailModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import { useAppStore, useSettings } from "@/store";
// --- Новые импорты 3D иконок ---
import type { Task } from "@/types";

export function DashboardPage() {
  const { projects, tasks, sprints, addProject, addTask, addSprint, setSelectedProject } = useAppStore();
  const { showStoryPoints } = useSettings();
  const { success } = useToast();
  const navigate = useNavigate();
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingProject, setViewingProject] = useState<string | undefined>();
  const [isRecentTasksCollapsed, setIsRecentTasksCollapsed] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showGettingStarted, setShowGettingStarted] = useState(true);

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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    success("Задача", `Открываем детали задачи "${task.title}"`, 2000);
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

  const stats = [
    {
      name: "Проекты",
      value: projects.length,
      description: "активных",
      icon: Icon3dFolder,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/projects",
      onClick: navigateToProjects
    },
    {
      name: "Задачи",
      value: tasks.length,
      description: "всего",
      icon: Icon3dClipboard,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/tasks",
      onClick: () => navigateToTasks('all', 'Все задачи')
    },
    {
      name: "Спринты",
      value: sprints.filter(s => s.status === 'active').length,
      description: "активных",
      icon: Icon3dCalendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/sprints",
      onClick: navigateToSprints
    },
    {
      name: "В работе",
      value: tasks.filter(t => t.status === 'in-progress' || t.status === 'in-review').length,
      description: "задач",
      icon: Icon3dWorkstation,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/tasks",
      onClick: () => navigateToTasks('active', 'Активные задачи')
    }
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between pt-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Дашборд</h1>
          <p className="text-lg text-muted-foreground">Обзор ваших проектов и активности</p>
        </div>
        <div className="flex items-center space-x-4 ml-6 flex-shrink-0">
          <Button 
            onClick={() => setProjectModalOpen(true)} 
            size="lg"
            className="gap-3 text-base bg-[#2c5545] text-white hover:bg-[#2c5545]/90"
          >
            <FolderPlus className="h-5 w-5" />
            Создать проект
          </Button>
          {projects.length === 0 && (
            <Button onClick={handleCreateSampleProject} size="lg" className="gap-3 text-base">
              <Zap className="h-5 w-5" />
              Создать демо проект
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card 
            key={stat.name}
            className="interactive-card cursor-pointer group"
            onClick={stat.onClick}
            style={{ zIndex: 1 }}
          >
                         <CardContent className="p-6">
                                                                                            <div className="flex items-center justify-between">
                                     <div className="flex items-center justify-center">
                       <stat.icon className={`h-24 w-24`} />
                     </div>
                                                                               <div className="text-right">
                       <p className="text-lg font-medium text-muted-foreground mb-1">{stat.name}</p>
                       <p className="text-3xl font-bold">{stat.value}</p>
                       <p className="text-base text-muted-foreground mt-1">{stat.description}</p>
                     </div>
                   <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length > 0 && (
        <div className="space-y-6">
          {/* Recent Tasks */}
          <Card style={{ zIndex: 1 }}>
            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between">
                                   <div className="flex items-center gap-3">
                                                                                   <Icon3dClipboard className="h-10 w-10" />
                     <div>
                       <CardTitle className="text-xl">Последние задачи</CardTitle>
                       <CardDescription>Недавно обновленные задачи</CardDescription>
                     </div>
                   </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => navigateToTasks('all', 'Все задачи')}
                    className="gap-3 text-base"
                  >
                    <ExternalLink className="h-5 w-5" />
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
            </CardHeader>
            {!isRecentTasksCollapsed && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-modern border border-border/60 hover:bg-muted/50 transition-all duration-200 interactive-card cursor-pointer group"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8">
                          {task.status === 'done' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : task.status === 'in-progress' ? (
                            <PlayCircle className="h-5 w-5 text-blue-500" />
                          ) : task.status === 'in-review' ? (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-gray-400" />
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
                        <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>

          {/* Project Quick Access */}
          <Card variant="elevated" style={{ zIndex: 1 }}>
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                                                               <Icon3dFolder className="h-12 w-12" />
                   <div>
                    <CardTitle className="text-xl">Быстрый доступ к проектам</CardTitle>
                    <CardDescription>Ваши активные проекты</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigateToProjects()}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Все проекты
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.slice(0, 6).map((project) => (
                  <div 
                    key={project.id}
                    className="p-4 bg-card/80 rounded-modern border interactive-card hover-lift cursor-pointer group"
                    onClick={() => {
                      setViewingProject(project.id);
                      setShowViewModal(true);
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                                             <div 
                         className="w-10 h-10 rounded-modern flex items-center justify-center"
                       >
                                                                                                       <Icon3dFolder className="h-10 w-10" />
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
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground/50 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Getting Started */}
      {showGettingStarted && (
                 <Card variant="glass" style={{ zIndex: 1 }}>
           <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-modern bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Начало работы</h2>
                  <p className="text-muted-foreground">Добро пожаловать в TaskFlow Pro!</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGettingStarted(false)}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Это современный трекер задач, созданный для продакт-менеджеров. 
              Начните с создания проекта и добавления задач для эффективного управления продуктом.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                className="flex items-center gap-3 p-4 bg-muted/30 rounded-modern cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => {
                  setProjectModalOpen(true);
                  success("Создание проекта", "Открываем форму создания проекта", 2000);
                }}
              >
                <div className="w-8 h-8 rounded-modern bg-primary/10 flex items-center justify-center">
                  <FolderPlus className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Создавайте проекты</p>
                  <p className="text-sm text-muted-foreground">для организации работы</p>
                </div>
              </div>
              <div 
                className="flex items-center gap-3 p-4 bg-muted/30 rounded-modern cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => {
                  navigate('/tasks');
                  success("Задачи", "Переходим к созданию задач", 2000);
                }}
              >
                <div className="w-8 h-8 rounded-modern bg-primary/10 flex items-center justify-center">
                                                                           <Icon3dClipboard className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-medium">Добавляйте задачи</p>
                  <p className="text-sm text-muted-foreground">и пользовательские истории</p>
                </div>
              </div>
              <div 
                className="flex items-center gap-3 p-4 bg-muted/30 rounded-modern cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => {
                  navigate('/sprints');
                  success("Спринты", "Переходим к планированию спринтов", 2000);
                }}
              >
                <div className="w-8 h-8 rounded-modern bg-primary/10 flex items-center justify-center">
                                                                           <Icon3dCalendar className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Планируйте спринты</p>
                  <p className="text-sm text-muted-foreground">и отслеживайте прогресс</p>
                </div>
              </div>
              <div 
                className="flex items-center gap-3 p-4 bg-muted/30 rounded-modern cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => {
                  navigate('/kanban');
                  success("Канбан", "Переходим к канбан-доске", 2000);
                }}
              >
                <div className="w-8 h-8 rounded-modern bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Используйте канбан</p>
                  <p className="text-sm text-muted-foreground">для визуального управления</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
      />
    </div>
  );
} 