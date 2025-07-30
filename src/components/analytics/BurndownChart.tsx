import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { differenceInDays, format, eachDayOfInterval } from 'date-fns';
import { Sprint, Task } from '@/types';
import { useAppStore } from '@/store';

interface BurndownChartProps {
  sprint: Sprint;
  className?: string;
}

interface BurndownData {
  date: string;
  ideal: number;
  actual: number;
  remaining: number;
}

export function BurndownChart({ sprint, className = '' }: BurndownChartProps) {
  const { tasks } = useAppStore();

  const sprintTasks = tasks.filter(task => sprint.taskIds.includes(task.id));
  const totalStoryPoints = sprintTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);

  // Generate data for each day of the sprint
  const sprintDays = eachDayOfInterval({
    start: sprint.startDate,
    end: sprint.endDate,
  });

  const burndownData: BurndownData[] = sprintDays.map((day, index) => {
    const totalDays = sprintDays.length;
    const currentDay = index + 1;
    
    // Ideal burndown (linear)
    const ideal = totalStoryPoints - (totalStoryPoints * currentDay / totalDays);
    
    // Simulate actual progress (in a real app, this would come from historical data)
    // For demo purposes, we'll simulate some realistic burndown
    let actual: number;
    let remaining: number;
    
    if (sprint.status === 'completed') {
      // If sprint is completed, show final burndown
      const progressRate = 0.8 + (Math.random() * 0.4); // 80-120% of ideal pace
      actual = Math.max(0, totalStoryPoints - (totalStoryPoints * currentDay * progressRate / totalDays));
      remaining = actual;
    } else if (sprint.status === 'active') {
      // For active sprint, show current progress
      const today = new Date();
      const daysPassed = Math.min(differenceInDays(today, sprint.startDate) + 1, totalDays);
      
      if (currentDay <= daysPassed) {
        // Past days - simulate completed work
        const completedTasks = sprintTasks.filter(task => task.status === 'done');
        const completedPoints = completedTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
        
        // Add some variation to make it more realistic
        const dailyVariation = (Math.random() - 0.5) * 0.2;
        const progressFactor = Math.min(1, (currentDay / daysPassed) * (1 + dailyVariation));
        
        actual = totalStoryPoints - (completedPoints * progressFactor);
        remaining = actual;
      } else {
        // Future days - no data yet
        actual = NaN;
        remaining = NaN;
      }
    } else {
      // Planned sprint - no actual data yet
      actual = NaN;
      remaining = NaN;
    }

    return {
      date: format(day, 'MMM dd'),
      ideal: Math.max(0, Math.round(ideal)),
      actual: isNaN(actual) ? null : Math.max(0, Math.round(actual)),
      remaining: isNaN(remaining) ? null : Math.max(0, Math.round(remaining)),
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-md">
          <p className="font-medium">{`Date: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey === 'ideal' ? 'Ideal' : 
                 entry.dataKey === 'actual' ? 'Actual' : 'Remaining'}: ${entry.value || 0} SP`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Sprint Burndown Chart</h3>
        <p className="text-sm text-gray-600">
          Story points remaining over time • Total: {totalStoryPoints} SP
        </p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={burndownData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
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
            
            {/* Ideal burndown line */}
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Ideal Burndown"
            />
            
            {/* Actual burndown line */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              connectNulls={false}
              name="Actual Progress"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sprint Status Indicator */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border-2 border-gray-400 rounded" style={{ borderStyle: 'dashed' }} />
            <span className="text-gray-600">Ideal Burndown</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-gray-600">Actual Progress</span>
          </div>
        </div>
        
        <div className="text-right">
          <p className="font-medium text-gray-900">
            Sprint Status: <span className={`
              ${sprint.status === 'active' ? 'text-blue-600' :
                sprint.status === 'completed' ? 'text-green-600' : 'text-gray-600'}
            `}>
              {sprint.status === 'active' ? 'In Progress' :
               sprint.status === 'completed' ? 'Completed' : 'Planned'}
            </span>
          </p>
          {sprint.status === 'active' && (
            <p className="text-gray-600">
              {Math.max(0, differenceInDays(sprint.endDate, new Date()))} days remaining
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 