import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Target, 
  Zap, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar,
  Activity
} from 'lucide-react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { Task } from '@/types';
import { useMemo } from 'react';

interface KanbanStatsProps {
  tasks: Task[];
  className?: string;
  compact?: boolean;
}

interface StatItem {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

export function KanbanStats({ tasks, className, compact = false }: KanbanStatsProps) {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const urgent = tasks.filter(t => t.priority === 'urgent').length;
    const overdue = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date()
    ).length;
    const dueToday = tasks.filter(t => {
      if (!t.dueDate) return false;
      const today = new Date();
      const dueDate = new Date(t.dueDate);
      return dueDate.toDateString() === today.toDateString();
    }).length;
    const unassigned = tasks.filter(t => !t.assigneeId).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Вычисляем среднее время выполнения
    const completedTasks = tasks.filter(t => t.status === 'done');
    const avgCompletionTime = completedTasks.length > 0 
      ? Math.round(completedTasks.reduce((acc, task) => {
          const created = new Date(task.createdAt);
          const updated = new Date(task.updatedAt);
          return acc + (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / completedTasks.length)
      : 0;

    return {
      total,
      completed,
      inProgress,
      urgent,
      overdue,
      dueToday,
      unassigned,
      completionRate,
      avgCompletionTime,
    };
  }, [tasks]);

  const statItems: StatItem[] = [
    {
      label: 'Всего задач',
      value: stats.total,
      icon: <Target className="h-4 w-4" />,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Готово',
      value: `${stats.completionRate}%`,
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      trend: stats.completionRate > 50 ? 'up' : 'down',
      trendValue: `${stats.completed}/${stats.total}`,
    },
    {
      label: 'В работе',
      value: stats.inProgress,
      icon: <Activity className="h-4 w-4" />,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: 'Срочные',
      value: stats.urgent,
      icon: <Zap className="h-4 w-4" />,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'Просроченные',
      value: stats.overdue,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      label: 'На сегодня',
      value: stats.dueToday,
      icon: <Calendar className="h-4 w-4" />,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      label: 'Без исполнителя',
      value: stats.unassigned,
      icon: <Users className="h-4 w-4" />,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-800/20',
    },
    {
      label: 'Ср. время выполнения',
      value: `${stats.avgCompletionTime} дн.`,
      icon: <Clock className="h-4 w-4" />,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-4", className)}
    >
      {compact ? (
        // Компактный режим - все в одну строку
        <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto pb-2">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex-shrink-0 p-2 sm:p-3 rounded-lg border transition-all duration-200 hover:shadow-md w-[120px] sm:w-[140px] lg:w-[160px] h-[70px] sm:h-[80px]",
                item.bgColor,
                "border-gray-200 dark:border-gray-700"
              )}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className={cn("p-1 sm:p-1.5 rounded-lg", item.bgColor)}>
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                    {item.label}
                  </p>
                  <p className={cn("text-sm sm:text-lg font-bold", item.color)}>
                    {item.value}
                  </p>
                  {item.trendValue && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.trendValue}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <>
          {/* Основная статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statItems.slice(0, 4).map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
                  item.bgColor,
                  "border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {item.label}
                    </p>
                    <p className={cn("text-2xl font-bold", item.color)}>
                      {item.value}
                    </p>
                    {item.trendValue && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {item.trendValue}
                      </p>
                    )}
                  </div>
                  <div className={cn("p-2 rounded-lg", item.bgColor)}>
                    {item.icon}
                  </div>
                </div>
                {item.trend && (
                  <div className="flex items-center mt-2">
                    <TrendingUp 
                      className={cn(
                        "h-3 w-3 mr-1",
                        item.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      )}
                    />
                    <span className={cn(
                      "text-xs font-medium",
                      item.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    )}>
                      {item.trend === 'up' ? 'Улучшение' : 'Требует внимания'}
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Дополнительная статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statItems.slice(4).map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (index + 4) * 0.1 }}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-200 hover:shadow-md",
                  item.bgColor,
                  "border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn("p-2 rounded-lg", item.bgColor)}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {item.label}
                    </p>
                    <p className={cn("text-lg font-bold", item.color)}>
                      {item.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Прогресс-бар завершения */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Прогресс проекта
              </h3>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                {stats.completionRate}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.completionRate}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={cn(
                  "h-3 rounded-full transition-all duration-300",
                  stats.completionRate >= 80 ? "bg-green-500" :
                  stats.completionRate >= 60 ? "bg-blue-500" :
                  stats.completionRate >= 40 ? "bg-yellow-500" :
                  "bg-red-500"
                )}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>Завершено: {stats.completed}</span>
              <span>Осталось: {stats.total - stats.completed}</span>
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
