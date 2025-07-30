import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Sprint, Task } from '@/types';
import { useAppStore } from '@/store';

interface VelocityChartProps {
  projectId: string;
  className?: string;
}

interface VelocityData {
  sprintName: string;
  planned: number;
  completed: number;
  carryover: number;
}

export function VelocityChart({ projectId, className = '' }: VelocityChartProps) {
  const { sprints, tasks } = useAppStore();

  // Get completed sprints for the project
  const projectSprints = sprints
    .filter(sprint => sprint.projectId === projectId && sprint.status === 'completed')
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const velocityData: VelocityData[] = projectSprints.map(sprint => {
    const sprintTasks = tasks.filter(task => sprint.taskIds.includes(task.id));
    const completedTasks = sprintTasks.filter(task => task.status === 'done');
    
    const plannedPoints = sprintTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
    const completedPoints = completedTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
    const carryoverPoints = plannedPoints - completedPoints;

    return {
      sprintName: sprint.name.length > 15 ? `${sprint.name.substring(0, 12)}...` : sprint.name,
      planned: plannedPoints,
      completed: completedPoints,
      carryover: Math.max(0, carryoverPoints),
    };
  });

  // Calculate velocity metrics
  const averageVelocity = velocityData.length > 0 
    ? Math.round(velocityData.reduce((sum, data) => sum + data.completed, 0) / velocityData.length)
    : 0;

  const lastThreeAverage = velocityData.length >= 3
    ? Math.round(velocityData.slice(-3).reduce((sum, data) => sum + data.completed, 0) / 3)
    : averageVelocity;

  const trend = velocityData.length >= 2
    ? velocityData[velocityData.length - 1].completed - velocityData[velocityData.length - 2].completed
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-md">
          <p className="font-medium">{`Sprint: ${label}`}</p>
          <p style={{ color: '#3b82f6' }}>
            {`Completed: ${data.completed} SP`}
          </p>
          <p style={{ color: '#ef4444' }}>
            {`Carryover: ${data.carryover} SP`}
          </p>
          <p style={{ color: '#64748b' }}>
            {`Planned: ${data.planned} SP`}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {`Completion Rate: ${data.planned > 0 ? Math.round((data.completed / data.planned) * 100) : 0}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (velocityData.length === 0) {
    return (
      <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Team Velocity</h3>
          <p className="text-sm text-gray-600">
            Story points completed per sprint
          </p>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p className="text-lg font-medium">No Completed Sprints</p>
          <p className="text-sm">Complete some sprints to see velocity data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Team Velocity</h3>
        <p className="text-sm text-gray-600">
          Story points completed per sprint • {velocityData.length} sprints
        </p>
      </div>

      {/* Velocity Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{averageVelocity}</p>
          <p className="text-sm text-gray-600">Average Velocity</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">{lastThreeAverage}</p>
          <p className="text-sm text-gray-600">Last 3 Sprints</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? '+' : ''}{trend}
          </p>
          <p className="text-sm text-gray-600">Trend</p>
        </div>
      </div>

      {/* Velocity Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={velocityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="sprintName" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Bar 
              dataKey="completed" 
              fill="#3b82f6" 
              name="Completed"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="carryover" 
              fill="#ef4444" 
              name="Carryover"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Velocity Insights */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Velocity Insights</h4>
        <div className="space-y-1 text-sm text-blue-800">
          {trend > 0 && (
            <p>📈 Velocity is trending upward (+{trend} SP from last sprint)</p>
          )}
          {trend < 0 && (
            <p>📉 Velocity is trending downward ({trend} SP from last sprint)</p>
          )}
          {trend === 0 && (
            <p>📊 Velocity is stable (no change from last sprint)</p>
          )}
          
          {lastThreeAverage > averageVelocity && (
            <p>🚀 Recent performance is above historical average</p>
          )}
          {lastThreeAverage < averageVelocity && (
            <p>🔄 Recent performance is below historical average</p>
          )}
          
          <p>
            💡 Use {lastThreeAverage} SP as planning baseline for next sprint
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-gray-600">Completed Work</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span className="text-gray-600">Incomplete Work</span>
        </div>
      </div>
    </div>
  );
} 