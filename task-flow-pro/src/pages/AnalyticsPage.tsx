import { TrendingUp, Target, Users, Clock, BarChart, AreaChart } from "lucide-react";
import { useState, useEffect } from "react";

import { BurndownChart } from "@/components/analytics/BurndownChart";
import { VelocityChart } from "@/components/analytics/VelocityChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { cn } from "@/lib/utils";
import { useAppStore, useSettings } from "@/store";

export function AnalyticsPage() {
  const { tasks, sprints, selectedProjectId } = useAppStore();
  const { showStoryPoints } = useSettings();
  const [selectedSprintId, setSelectedSprintId] = useState('');

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

  useEffect(() => {
    if (activeSprints.length > 0) {
      setSelectedSprintId(activeSprints[0].id);
    } else if (completedSprints.length > 0) {
      setSelectedSprintId(completedSprints[completedSprints.length - 1].id);
    }
  }, [selectedProjectId, sprints]);

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
        <h1 className="text-3xl font-bold mb-6">Аналитика и отчеты</h1>
        <div className="text-center text-muted-foreground">
          Выберите проект для просмотра аналитики.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Аналитика и отчеты</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Процент выполнения</p>
              <p className="text-3xl font-bold text-primary">{completionRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {tasksByStatus.done} из {projectTasks.length} задач
              </p>
            </div>
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        {showStoryPoints && (
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Очки истории</p>
                <p className="text-3xl font-bold text-primary">{completedStoryPoints}/{totalStoryPoints}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalStoryPoints > 0 ? Math.round((completedStoryPoints / totalStoryPoints) * 100) : 0}% выполнено
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        )}

        {showStoryPoints && (
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Скорость команды</p>
                <p className="text-3xl font-bold text-primary">{velocity}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  оч./спринт в среднем
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        )}

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Активные спринты</p>
              <p className="text-3xl font-bold text-primary">{activeSprints.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {projectSprints.length} всего спринтов
              </p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <AreaChart className="h-5 w-5 mr-2" />
              Диаграмма сгорания
            </h3>
            <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Выберите спринт" />
              </SelectTrigger>
              <SelectContent>
                {projectSprints.map(sprint => (
                  <SelectItem key={sprint.id} value={sprint.id}>{sprint.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedSprintId ? (
            <BurndownChart sprintId={selectedSprintId} />
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Выберите спринт для отображения диаграммы сгорания.
            </div>
          )}
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart className="h-5 w-5 mr-2" />
            Скорость команды
          </h3>
          <VelocityChart />
        </div>
      </div>
    </div>
  );
} 