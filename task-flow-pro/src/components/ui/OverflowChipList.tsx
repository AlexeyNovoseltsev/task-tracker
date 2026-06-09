import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface OverflowChipItem {
  id: string;
  label: string;
  leading?: ReactNode;
}

interface OverflowChipListProps {
  items: OverflowChipItem[];
  maxVisible?: number;
  onRemove?: (id: string) => void;
  className?: string;
  chipClassName?: string;
  overflowClassName?: string;
  emptyText?: string;
}

export function OverflowChipList({
  items,
  maxVisible = 3,
  onRemove,
  className,
  chipClassName,
  overflowClassName,
  emptyText,
}: OverflowChipListProps) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) {
    return emptyText ? (
      <p className="text-xs text-muted-foreground">{emptyText}</p>
    ) : null;
  }

  const hiddenCount = Math.max(0, items.length - maxVisible);
  const visibleItems = expanded ? items : items.slice(0, maxVisible);
  const hiddenLabels = items.slice(maxVisible).map((i) => i.label).join(', ');

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {visibleItems.map((item) => (
        <span
          key={item.id}
          className={cn(
            'inline-flex max-w-full items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground',
            onRemove && 'pr-1.5 hover:bg-secondary/80',
            chipClassName
          )}
        >
          {item.leading}
          <span className="truncate">{item.label}</span>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title="Убрать"
              aria-label={`Убрать ${item.label}`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </span>
      ))}

      {!expanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          title={hiddenLabels}
          className={cn(
            'inline-flex h-7 min-w-7 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 bg-muted/50 px-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary',
            overflowClassName
          )}
        >
          +{hiddenCount}
        </button>
      )}

      {expanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          свернуть
        </button>
      )}
    </div>
  );
}
