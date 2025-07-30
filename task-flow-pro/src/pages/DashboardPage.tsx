import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store";
import { useToast } from "@/hooks/useToast";
import { FolderPlus } from "lucide-react";
import { ProjectModal } from "@/components/project/ProjectModal";

export function DashboardPage() {
  const { projects, tasks, sprints, addProject, addTask, addSprint, setSelectedProject } = useAppStore();
  const { success } = useToast();
  const [projectModalOpen, setProjectModalOpen] = useState(false);

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Дашборд</h1>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => setProjectModalOpen(true)} 
            variant="outline"
            size="lg"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Проекты</h3>
          <p className="text-3xl font-bold text-primary">{projects.length}</p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Задачи</h3>
          <p className="text-3xl font-bold text-primary">{tasks.length}</p>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Активные спринты</h3>
          <p className="text-3xl font-bold text-primary">
            {sprints.filter(s => s.status === 'active').length}
          </p>
        </div>
      </div>

      {projects.length > 0 && (
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">{task.type} • {task.status}</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {task.storyPoints} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Начало работы</h2>
        <p className="text-muted-foreground mb-4">
          Добро пожаловать в TaskFlow Pro! Это современный трекер задач, созданный для продакт-менеджеров. 
          Начните с создания проекта и добавления задач.
        </p>
        <div className="space-y-2">
          <p>📋 Создавайте проекты для организации работы</p>
          <p>✅ Добавляйте задачи и пользовательские истории</p>
          <p>🏃‍♂️ Планируйте спринты и отслеживайте прогресс</p>
          <p>📊 Используйте канбан-доски для визуального управления</p>
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
      />
    </div>
  );
} 