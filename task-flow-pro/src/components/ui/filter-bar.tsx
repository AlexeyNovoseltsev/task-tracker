import React from 'react';
import { Filter, X } from 'lucide-react';

import { Button } from './button';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface FilterOption {
  key: string;
  label: string;
  value: string;
}

interface FilterBarProps {
  title?: string;
  filters: FilterOption[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters?: () => void;
  className?: string;
}

export function FilterBar({
  title = "Фильтры",
  filters,
  activeFilters,
  onFilterChange,
  onClearFilters,
  className
}: FilterBarProps) {
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className={cn("flex items-center gap-4 p-4 bg-card border border-border/50 rounded-modern", className)}>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map(filter => (
          <Button
            key={filter.key}
            variant={activeFilters[filter.key] === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.key, filter.value)}
            className="h-8"
          >
            {filter.label}
          </Button>
        ))}
      </div>
      
      {hasActiveFilters && onClearFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-8 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Очистить
        </Button>
      )}
      
      {hasActiveFilters && (
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground">Активные:</span>
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find(f => f.key === key && f.value === value);
            return filter ? (
              <Badge key={`${key}-${value}`} variant="secondary" className="text-xs">
                {filter.label}
              </Badge>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}
