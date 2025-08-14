import { differenceInDays, eachDayOfInterval, format } from 'date-fns';
import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { useAppStore } from '@/store';

interface BurndownChartProps {
  sprintId: string;
}

export function BurndownChart({ sprintId }: BurndownChartProps) {
  const { sprints, tasks } = useAppStore();

  const chartData = useMemo(() => {
    const sprint = sprints.find(s => s.id === sprintId);
    if (!sprint) return [];

    const sprintTasks = tasks.filter(t => t.sprintId === sprint.id);
    const totalStoryPoints = sprintTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);

    const sprintStart = new Date(sprint.startDate);
    const sprintEnd = new Date(sprint.endDate);
    const sprintDuration = differenceInDays(sprintEnd, sprintStart) + 1;
    const idealPointsPerDay = totalStoryPoints / (sprintDuration - 1);

    const dateInterval = eachDayOfInterval({ start: sprintStart, end: sprintEnd });

    return dateInterval.map((date, index) => {
      const formattedDate = format(date, 'MMM d');
      const idealRemaining = Math.max(0, totalStoryPoints - (idealPointsPerDay * index));

      const completedTasksOnDate = sprintTasks.filter(task =>
        task.status === 'done' &&
        task.updatedAt &&
        new Date(task.updatedAt) <= date
      );

      const actualCompletedPoints = completedTasksOnDate.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
      const actualRemaining = totalStoryPoints - actualCompletedPoints;

      return {
        date: formattedDate,
        'Идеально': idealRemaining,
        'Реально': actualRemaining,
      };
    });
  }, [sprintId, sprints, tasks]);

  if (chartData.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Недостаточно данных для построения диаграммы сгорания.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="Идеально" stroke="#8884d8" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Реально" stroke="#82ca9d" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
