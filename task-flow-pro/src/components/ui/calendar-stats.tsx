import React from 'react';
import { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';

interface CalendarStatsProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  className?: string;
}

export function CalendarStats({
  title,
  value,
  description,
  icon: Icon,
  color = 'blue',
  className
}: CalendarStatsProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-600',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-600',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600'
        };
      case 'orange':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-600',
          iconBg: 'bg-orange-100',
          iconColor: 'text-orange-600'
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-600',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-600',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-600',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
    }
  };

  const colors = getColorClasses(color);

  return (
    <Card className={cn("border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200", className)}>
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          {Icon && (
            <div className={cn("p-1.5 rounded-lg", colors.iconBg)}>
              <Icon className={cn("h-4 w-4", colors.iconColor)} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-600 truncate">{title}</p>
            <p className={cn("text-lg font-bold", colors.text)}>
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-500 truncate">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
