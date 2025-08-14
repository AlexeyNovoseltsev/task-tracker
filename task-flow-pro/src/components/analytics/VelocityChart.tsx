import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { useAppStore } from '@/store';

export function VelocityChart() {
  const { sprints, tasks, selectedProjectId } = useAppStore();

  const chartData = useMemo(() => {
    const projectSprints = sprints.filter(s => s.projectId === selectedProjectId && s.status === 'completed');

    // Get last 5 completed sprints
    const recentSprints = projectSprints
      .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
      .slice(0, 5)
      .reverse();

    return recentSprints.map(sprint => {
      const sprintTasks = tasks.filter(t => t.sprintId === sprint.id && t.status === 'done');
      const completedPoints = sprintTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
      return {
        name: sprint.name,
        'Выполнено очков': completedPoints,
        'Запланировано очков': sprint.capacity || 0,
      };
    });
  }, [sprints, tasks, selectedProjectId]);

  if (chartData.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Нет данных о скорости команды. Завершите несколько спринтов для построения графика.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Запланировано очков" fill="#8884d8" />
        <Bar dataKey="Выполнено очков" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}
