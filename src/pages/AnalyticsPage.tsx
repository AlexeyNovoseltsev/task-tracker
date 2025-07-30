import { useState } from 'react';
import { BarChart3, TrendingUp, Target, Calendar, Users, AlertCircle } from 'lucide-react';
import { useAppStore, useSelectedProject } from '@/store';
import { BurndownChart } from '@/components/analytics/BurndownChart';
import { VelocityChart } from '@/components/analytics/VelocityChart';
import { Button } from '@/components/ui/button';

export function AnalyticsPage() {
  const { sprints, tasks, selectedProjectId } = useAppStore();
  const selectedProject = useSelectedProject();
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');

  if (!selectedProjectId || !selectedProject) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600 max-w-md">
            Please select a project from the sidebar to view analytics and reports.
          </p>
        </div>
      </div>
    );
  }

  const projectSprints = sprints.filter(sprint => sprint.projectId === selectedProjectId);
  const projectTasks = tasks.filter(task => task.projectId === selectedProjectId);
  
  const activeSprints = projectSprints.filter(s => s.status === 'active');
  const completedSprints = projectSprints.filter(s => s.status === 'completed');
  const selectedSprint = selectedSprintId ? projectSprints.find(s => s.id === selectedSprintId) : activeSprints[0];

  // Calculate project metrics
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(t => t.status === 'done').length;
  const totalStoryPoints = projectTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
  const completedStoryPoints = projectTasks
    .filter(t => t.status === 'done')
    .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const storyPointsRate = totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0;

  // Task distribution by status
  const tasksByStatus = {
    todo: projectTasks.filter(t => t.status === 'todo').length,
    'in-progress': projectTasks.filter(t => t.status === 'in-progress').length,
    'in-review': projectTasks.filter(t => t.status === 'in-review').length,
    done: projectTasks.filter(t => t.status === 'done').length,
  };

  // Task distribution by priority
  const tasksByPriority = {
    urgent: projectTasks.filter(t => t.priority === 'urgent').length,
    high: projectTasks.filter(t => t.priority === 'high').length,
    medium: projectTasks.filter(t => t.priority === 'medium').length,
    low: projectTasks.filter(t => t.priority === 'low').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">
            Project insights and performance metrics for {selectedProject.name}
          </p>
        </div>
      </div>

      {/* Project Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Task Completion</p>
              <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
              <p className="text-xs text-muted-foreground">{completedTasks}/{totalTasks} tasks</p>
            </div>
            <Target className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Story Points</p>
              <p className="text-2xl font-bold text-foreground">{storyPointsRate}%</p>
              <p className="text-xs text-muted-foreground">{completedStoryPoints}/{totalStoryPoints} SP</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Sprints</p>
              <p className="text-2xl font-bold text-foreground">{activeSprints.length}</p>
              <p className="text-xs text-muted-foreground">{projectSprints.length} total sprints</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg Velocity</p>
              <p className="text-2xl font-bold text-foreground">
                {completedSprints.length > 0 
                  ? Math.round(completedStoryPoints / completedSprints.length) 
                  : 0}
              </p>
              <p className="text-xs text-muted-foreground">SP per sprint</p>
            </div>
            <Users className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Velocity Chart */}
        <VelocityChart projectId={selectedProjectId} />

        {/* Burndown Chart */}
        <div className="space-y-4">
          {projectSprints.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Sprint Burndown</h3>
                <select
                  value={selectedSprintId || (activeSprints[0]?.id || '')}
                  onChange={(e) => setSelectedSprintId(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {activeSprints.map(sprint => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} (Active)
                    </option>
                  ))}
                  {completedSprints.map(sprint => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name} (Completed)
                    </option>
                  ))}
                </select>
              </div>
              {selectedSprint ? (
                <BurndownChart sprint={selectedSprint} />
              ) : (
                <div className="bg-white p-6 rounded-lg border border-gray-200 h-64 flex items-center justify-center">
                  <p className="text-gray-500">No sprint selected</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sprint Burndown</h3>
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <AlertCircle className="h-12 w-12 mb-2" />
                <p className="text-lg font-medium">No Sprints Available</p>
                <p className="text-sm">Create a sprint to see burndown data</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Task Distribution by Status</h3>
          <div className="space-y-3">
            {Object.entries(tasksByStatus).map(([status, count]) => {
              const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
              const statusLabels = {
                'todo': 'To Do',
                'in-progress': 'In Progress',
                'in-review': 'In Review',
                'done': 'Done'
              };
              const statusColors = {
                'todo': 'bg-gray-400',
                'in-progress': 'bg-blue-500',
                'in-review': 'bg-yellow-500',
                'done': 'bg-green-500'
              };
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]}`} />
                    <span className="text-sm font-medium">{statusLabels[status as keyof typeof statusLabels]}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${statusColors[status as keyof typeof statusColors]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Priority Distribution */}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Task Distribution by Priority</h3>
          <div className="space-y-3">
            {Object.entries(tasksByPriority).map(([priority, count]) => {
              const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
              const priorityLabels = {
                'urgent': 'Urgent',
                'high': 'High',
                'medium': 'Medium',
                'low': 'Low'
              };
              const priorityColors = {
                'urgent': 'bg-red-500',
                'high': 'bg-orange-500',
                'medium': 'bg-yellow-500',
                'low': 'bg-green-500'
              };
              
              return (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${priorityColors[priority as keyof typeof priorityColors]}`} />
                    <span className="text-sm font-medium">{priorityLabels[priority as keyof typeof priorityLabels]}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${priorityColors[priority as keyof typeof priorityColors]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
          Project Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Progress:</strong> {completionRate}% of tasks completed with {storyPointsRate}% of story points delivered.
            </p>
            <p className="text-gray-700">
              <strong>Sprint Status:</strong> {activeSprints.length} active sprint(s), {completedSprints.length} completed.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Priority Focus:</strong> {tasksByPriority.urgent + tasksByPriority.high} high-priority tasks remaining.
            </p>
            <p className="text-gray-700">
              <strong>Team Performance:</strong> 
              {completedSprints.length > 0 
                ? ` Averaging ${Math.round(completedStoryPoints / completedSprints.length)} SP per sprint.`
                : ' No completed sprints yet.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 