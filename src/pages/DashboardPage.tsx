import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store";
import { useToast } from "@/hooks/useToast";
import { Plus, FolderKanban, ListChecks, Zap, TrendingUp } from "lucide-react";
import { generateId } from "@/lib/utils";

export function DashboardPage() {
  const { projects, tasks, sprints, addProject, addTask, addSprint, setSelectedProject } = useAppStore();
  const { toast } = useToast();

  const createSampleData = () => {
    try {
      // Create sample project
      const projectId = generateId();
      const projectName = "TaskFlow Pro Development";
      
      addProject({
        name: projectName,
        description: "Building the ultimate task management tool",
        key: "TFP",
        color: "#3b82f6",
      });

      // Create sample tasks
      const sampleTasks = [
        {
          id: generateId(),
          title: "Set up project architecture",
          description: "Design and implement the overall project structure with modern React patterns",
          type: "task" as const,
          status: "done" as const,
          priority: "high" as const,
          projectId,
          storyPoints: 8,
          labels: ["architecture", "setup"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: generateId(),
          title: "Create Kanban board component",
          description: "Build a fully functional Kanban board with drag & drop functionality",
          type: "story" as const,
          status: "done" as const,
          priority: "high" as const,
          projectId,
          storyPoints: 13,
          labels: ["kanban", "ui"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: generateId(),
          title: "Implement Sprint planning features",
          description: "Add sprint creation, management, and planning tools",
          type: "epic" as const,
          status: "done" as const,
          priority: "medium" as const,
          projectId,
          storyPoints: 21,
          labels: ["sprint", "planning"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: generateId(),
          title: "Add Analytics and reporting",
          description: "Create burndown charts, velocity tracking, and team analytics",
          type: "story" as const,
          status: "in-progress" as const,
          priority: "high" as const,
          projectId,
          storyPoints: 13,
          labels: ["analytics", "charts"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: generateId(),
          title: "Fix task card styling issues",
          description: "Resolve visual inconsistencies in task card display",
          type: "bug" as const,
          status: "todo" as const,
          priority: "medium" as const,
          projectId,
          storyPoints: 3,
          labels: ["bug", "ui"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: generateId(),
          title: "Implement user authentication",
          description: "Add login, registration, and user management features",
          type: "epic" as const,
          status: "todo" as const,
          priority: "medium" as const,
          projectId,
          storyPoints: 21,
          labels: ["auth", "security"],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const taskIds = sampleTasks.map(task => task.id);
      sampleTasks.forEach(task => addTask(task));

      // Create sample sprints
      const sprint1Id = generateId();
      const sprint2Id = generateId();
      
      // Sprint 1 - Completed
      const completedTaskIds = taskIds.slice(0, 3); // First 3 tasks
      addSprint({
        id: sprint1Id,
        name: "Sprint 1 - Foundation",
        description: "Setting up the core architecture and basic features",
        goal: "Establish solid foundation for the task management system",
        startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        status: "completed",
        capacity: 40,
        projectId,
        taskIds: completedTaskIds,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Sprint 2 - Active
      const activeTaskIds = taskIds.slice(3, 5); // Next 2 tasks
      addSprint({
        id: sprint2Id,
        name: "Sprint 2 - Analytics",
        description: "Building analytics and reporting features",
        goal: "Deliver comprehensive analytics and sprint management tools",
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: "active",
        capacity: 40,
        projectId,
        taskIds: activeTaskIds,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setSelectedProject(projectId);
      
      // Show success notification
      toast.projectCreated(projectName);
      
      // Additional info toast with action
      toast.info('Sample data created successfully! Explore the Kanban board, Sprint planning, and Analytics features.', {
        duration: 8000,
        action: {
          label: 'View Kanban',
          onClick: () => {
            // Navigate to kanban - in a real app this would use router
            window.location.hash = '/kanban';
          }
        }
      });
    } catch (error) {
      console.error('Error creating sample data:', error);
      toast.error('Failed to create sample project. Please try again.');
    }
  };

  const projectTasks = projects.length > 0 ? tasks.filter(t => t.projectId === projects[0]?.id) : [];
  const completedTasks = projectTasks.filter(t => t.status === 'done');
  const inProgressTasks = projectTasks.filter(t => t.status === 'in-progress');
  const totalStoryPoints = projectTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome to TaskFlow Pro - Your modern project management solution
          </p>
        </div>
        {projects.length === 0 && (
          <Button onClick={createSampleData} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Sample Project</span>
          </Button>
        )}
      </div>

      {projects.length > 0 ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold text-foreground">{projectTasks.length}</p>
                </div>
                <ListChecks className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</p>
                </div>
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Story Points</p>
                  <p className="text-2xl font-bold text-purple-600">{totalStoryPoints}</p>
                </div>
                <FolderKanban className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Sprint Overview */}
          {sprints.length > 0 && (
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Sprint Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sprints.slice(0, 2).map((sprint) => {
                  const sprintTasks = tasks.filter(task => sprint.taskIds.includes(task.id));
                  const completedSprintTasks = sprintTasks.filter(task => task.status === 'done');
                  const progress = sprintTasks.length > 0 ? (completedSprintTasks.length / sprintTasks.length) * 100 : 0;
                  
                  return (
                    <div key={sprint.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">{sprint.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          sprint.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          sprint.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sprint.status === 'active' ? 'Active' :
                           sprint.status === 'completed' ? 'Completed' : 'Planned'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{sprint.goal}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{completedSprintTasks.length}/{sprintTasks.length} tasks</span>
                          <span>{sprintTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0)} SP</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Recent Tasks</h2>
            <div className="space-y-3">
              {projectTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      task.priority === 'urgent' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-orange-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <div>
                      <p className="font-medium text-foreground">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.type.toUpperCase()} • {task.storyPoints ? `${task.storyPoints} SP` : 'No estimate'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      task.status === 'done' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      task.status === 'in-review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status === 'in-progress' ? 'In Progress' :
                       task.status === 'in-review' ? 'In Review' :
                       task.status === 'done' ? 'Done' : 'To Do'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <FolderKanban className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Projects Yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Get started by creating your first project with sample data to explore TaskFlow Pro's features including Sprint Planning and Analytics.
          </p>
          <Button onClick={createSampleData} size="lg" className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Create Sample Project</span>
          </Button>
        </div>
      )}
    </div>
  );
} 