import { useState } from 'react';
import { 
  Filter, 
  X, 
  User, 
  Flag, 
  Tag, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from './button';
import { Input } from './Input';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { Priority, TaskType, User as UserType } from '@/types';

interface FilterPanelProps {
  filters: {
    assignee: string;
    priority: string;
    type: string;
    search: string;
    dueDate: string;
    labels: string[];
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  users: UserType[];
  availableLabels: string[];
  className?: string;
}

const priorityOptions = [
  { value: 'urgent', label: 'Срочно', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'high', label: 'Высокий', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'medium', label: 'Средний', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'low', label: 'Низкий', color: 'bg-green-100 text-green-700 border-green-200' },
];

const typeOptions = [
  { value: 'story', label: 'История', icon: '📖' },
  { value: 'bug', label: 'Ошибка', icon: '🐛' },
  { value: 'epic', label: 'Эпик', icon: '🎯' },
  { value: 'task', label: 'Задача', icon: '📋' },
];

const dueDateOptions = [
  { value: 'today', label: 'Сегодня' },
  { value: 'tomorrow', label: 'Завтра' },
  { value: 'this-week', label: 'На этой неделе' },
  { value: 'next-week', label: 'На следующей неделе' },
  { value: 'overdue', label: 'Просроченные' },
];

export function FilterPanel({
  filters,
  onFiltersChange,
  onClearFilters,
  users,
  availableLabels,
  className
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
    
    // Обновляем активные фильтры
    const newActiveFilters = Object.entries(newFilters)
      .filter(([_, val]) => {
        if (Array.isArray(val)) return val.length > 0;
        return val && val !== '';
      })
      .map(([key, _]) => key);
    
    setActiveFilters(newActiveFilters);
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...filters };
    if (Array.isArray(newFilters[key as keyof typeof newFilters])) {
      (newFilters[key as keyof typeof newFilters] as any) = [];
    } else {
      (newFilters[key as keyof typeof newFilters] as any) = '';
    }
    onFiltersChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(val => {
      if (Array.isArray(val)) return val.length > 0;
      return val && val !== '';
    }).length;
  };

  return (
    <div className={cn("relative", className)}>
      {/* Кнопка фильтров */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center space-x-2 transition-all duration-200",
          getActiveFiltersCount() > 0 && "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300"
        )}
      >
        <Filter className="h-4 w-4" />
        <span>Фильтры</span>
        {getActiveFiltersCount() > 0 && (
          <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300">
            {getActiveFiltersCount()}
          </Badge>
        )}
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {/* Панель фильтров */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-50"
          >
            <div className="p-4 space-y-4">
              {/* Заголовок */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Фильтры</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Поиск */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Поиск</span>
                </label>
                <Input
                  placeholder="Поиск по названию или описанию..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Исполнитель */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Исполнитель</span>
                </label>
                <select
                  value={filters.assignee}
                  onChange={(e) => updateFilter('assignee', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Все исполнители</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Приоритет */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <Flag className="h-4 w-4" />
                  <span>Приоритет</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {priorityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateFilter('priority', filters.priority === option.value ? '' : option.value)}
                      className={cn(
                        "px-3 py-2 text-sm rounded-md border transition-all duration-200",
                        filters.priority === option.value
                          ? option.color
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Тип задачи */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>Тип задачи</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {typeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateFilter('type', filters.type === option.value ? '' : option.value)}
                      className={cn(
                        "px-3 py-2 text-sm rounded-md border transition-all duration-200 flex items-center space-x-2",
                        filters.type === option.value
                          ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Срок выполнения */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Срок выполнения</span>
                </label>
                <select
                  value={filters.dueDate}
                  onChange={(e) => updateFilter('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Любой срок</option>
                  {dueDateOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Активные фильтры */}
              {getActiveFiltersCount() > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Активные фильтры
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(filters).map(([key, value]) => {
                      if (!value || (Array.isArray(value) && value.length === 0)) return null;
                      
                      let label = '';
                      let displayValue = '';
                      
                      switch (key) {
                        case 'assignee':
                          const user = users.find(u => u.id === value);
                          if (user) {
                            label = 'Исполнитель';
                            displayValue = user.name;
                          }
                          break;
                        case 'priority':
                          const priority = priorityOptions.find(p => p.value === value);
                          if (priority) {
                            label = 'Приоритет';
                            displayValue = priority.label;
                          }
                          break;
                        case 'type':
                          const type = typeOptions.find(t => t.value === value);
                          if (type) {
                            label = 'Тип';
                            displayValue = type.label;
                          }
                          break;
                        case 'dueDate':
                          const dueDate = dueDateOptions.find(d => d.value === value);
                          if (dueDate) {
                            label = 'Срок';
                            displayValue = dueDate.label;
                          }
                          break;
                        case 'search':
                          label = 'Поиск';
                          displayValue = value;
                          break;
                      }
                      
                      if (!label || !displayValue) return null;
                      
                      return (
                        <Badge
                          key={key}
                          variant="secondary"
                          className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300"
                        >
                          <span className="text-xs">{label}: {displayValue}</span>
                          <button
                            onClick={() => clearFilter(key)}
                            className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
