import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";
import { TrendingUp, Target, Users, Clock } from "lucide-react";

export function AnalyticsPage() {
  const { tasks, sprints, selectedProjectId } = useAppStore();

  const projectTasks = selectedProjectId 
    ? tasks.filter(task => task.projectId === selectedProjectId)
    : tasks;

  const projectSprints = selectedProjectId 
    ? sprints.filter(sprint => sprint.projectId === selectedProjectId)
    : sprints;

  // Task Statistics
  const tasksByStatus = {
    todo: projectTasks.filter(t => t.status === "todo").length,
    inProgress: projectTasks.filter(t => t.status === "in-progress").length,
    inReview: projectTasks.filter(t => t.status === "in-review").length,
    done: projectTasks.filter(t => t.status === "done").length,
  };

  const tasksByPriority = {
    high: projectTasks.filter(t => t.priority === "high").length,
    medium: projectTasks.filter(t => t.priority === "medium").length,
    low: projectTasks.filter(t => t.priority === "low").length,
  };

  const completionRate = projectTasks.length > 0 
    ? Math.round((tasksByStatus.done / projectTasks.length) * 100)
    : 0;

  const totalStoryPoints = projectTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
  const completedStoryPoints = projectTasks
    .filter(task => task.status === "done")
    .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

  const activeSprints = projectSprints.filter(s => s.status === "active");
  const completedSprints = projectSprints.filter(s => s.status === "completed");

  // Velocity calculation (average story points per completed sprint)
  const velocity = completedSprints.length > 0
    ? Math.round(completedSprints.reduce((sum, sprint) => {
        const sprintTasks = tasks.filter(t => t.sprintId === sprint.id && t.status === "done");
        return sum + sprintTasks.reduce((taskSum, task) => taskSum + (task.storyPoints || 0), 0);
      }, 0) / completedSprints.length)
    : 0;

  if (!selectedProjectId) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Analytics & Reports</h1>
        <div className="text-center text-muted-foreground">
          Please select a project to view analytics.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Analytics & Reports</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
              <p className="text-3xl font-bold text-primary">{completionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {tasksByStatus.done} of {projectTasks.length} tasks
              </p>
            </div>
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Story Points</p>
              <p className="text-3xl font-bold text-primary">{completedStoryPoints}/{totalStoryPoints}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0}% completed
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Team Velocity</p>
              <p className="text-3xl font-bold text-primary">{velocity}</p>
              <p className="text-xs text-muted-foreground mt-1">
                pts/sprint average
              </p>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Sprints</p>
              <p className="text-3xl font-bold text-primary">{activeSprints.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {projectSprints.length} total sprints
              </p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Task Status Distribution */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Task Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(tasksByStatus).map(([status, count]) => {
              const percentage = projectTasks.length > 0 ? (count / projectTasks.length) * 100 : 0;
              const colors = {
                todo: "bg-gray-500",
                inProgress: "bg-blue-500",
                inReview: "bg-yellow-500",
                done: "bg-green-500",
              };
              
              return (
                <div key={status} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 min-w-[100px]">
                    <div className={cn("w-3 h-3 rounded-full", colors[status as keyof typeof colors])}></div>
                    <span className="text-sm font-medium capitalize">
                      {status === "inProgress" ? "In Progress" : status === "inReview" ? "In Review" : status}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn("h-2 rounded-full", colors[status as keyof typeof colors])}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground ml-2 min-w-[60px]">
                        {count} ({Math.round(percentage)}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
          <div className="space-y-3">
            {Object.entries(tasksByPriority).map(([priority, count]) => {
              const percentage = projectTasks.length > 0 ? (count / projectTasks.length) * 100 : 0;
              const colors = {
                high: "bg-red-500",
                medium: "bg-yellow-500",
                low: "bg-green-500",
              };
              
              return (
                <div key={priority} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 min-w-[100px]">
                    <div className={cn("w-3 h-3 rounded-full", colors[priority as keyof typeof colors])}></div>
                    <span className="text-sm font-medium capitalize">{priority}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={cn("h-2 rounded-full", colors[priority as keyof typeof colors])}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground ml-2 min-w-[60px]">
                        {count} ({Math.round(percentage)}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sprint Overview */}
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Sprint Overview</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500 mb-1">
              {projectSprints.filter(s => s.status === "planned").length}
            </div>
            <div className="text-sm text-muted-foreground">Planned Sprints</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500 mb-1">
              {activeSprints.length}
            </div>
            <div className="text-sm text-muted-foreground">Active Sprints</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-500 mb-1">
              {completedSprints.length}
            </div>
            <div className="text-sm text-muted-foreground">Completed Sprints</div>
          </div>
        </div>
      </div>

      {/* Project Insights */}
      <div className="bg-card p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Project Insights</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">📊 Progress Summary</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• {completionRate}% of tasks completed</li>
              <li>• {tasksByPriority.high} high-priority items remaining</li>
              <li>• Average velocity: {velocity} story points per sprint</li>
              <li>• {activeSprints.length} sprint(s) currently active</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">🎯 Recommendations</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {tasksByPriority.high > 5 && (
                <li>• Consider prioritizing high-priority tasks</li>
              )}
              {completionRate < 50 && (
                <li>• Focus on completing in-progress tasks</li>
              )}
              {activeSprints.length === 0 && projectSprints.length > 0 && (
                <li>• Start a new sprint to maintain momentum</li>
              )}
              {velocity === 0 && (
                <li>• Complete a sprint to establish velocity baseline</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 