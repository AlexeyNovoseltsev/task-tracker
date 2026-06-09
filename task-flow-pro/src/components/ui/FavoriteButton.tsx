import { Loader2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { useFavorite } from '@/hooks/useFavorite';
import { cn } from '@/lib/utils';

type FavoriteItemType = 'task' | 'project' | 'sprint';

interface FavoriteButtonProps {
  itemType: FavoriteItemType;
  itemId: string;
  itemTitle?: string;
  variant?: 'icon' | 'pill';
  size?: 'sm' | 'md';
  className?: string;
  /** Показывать кнопку только при hover родителя (для карточек) */
  revealOnHover?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const SPARKLE_ANGLES = [0, 60, 120, 180, 240, 300];

export function FavoriteButton({
  itemType,
  itemId,
  itemTitle,
  variant = 'icon',
  size = 'sm',
  className,
  revealOnHover = false,
  onClick,
}: FavoriteButtonProps) {
  const {
    isFavorited,
    isLoading,
    isChecking,
    canFavorite,
    justAdded,
    toggle,
    tooltip,
  } = useFavorite({ itemType, itemId, itemTitle });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
    void toggle();
  };

  if (!canFavorite && variant === 'icon' && revealOnHover) {
    return null;
  }

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const btnSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';

  const star = (
    <span className="relative flex items-center justify-center">
      <AnimatePresence>
        {justAdded &&
          SPARKLE_ANGLES.map((angle) => (
            <motion.span
              key={angle}
              className="pointer-events-none absolute h-1 w-1 rounded-full bg-yellow-400"
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                scale: 1,
                x: Math.cos((angle * Math.PI) / 180) * 14,
                y: Math.sin((angle * Math.PI) / 180) * 14,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
            />
          ))}
      </AnimatePresence>

      <motion.span
        animate={
          justAdded
            ? { scale: [1, 1.45, 1], rotate: [0, -12, 12, 0] }
            : isFavorited
              ? { scale: 1 }
              : { scale: 1 }
        }
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {isLoading || isChecking ? (
          <Loader2 className={cn(iconSize, 'animate-spin text-muted-foreground')} />
        ) : (
          <Star
            className={cn(
              iconSize,
              'transition-colors duration-200',
              isFavorited
                ? 'fill-amber-400 text-amber-500 drop-shadow-[0_0_6px_rgba(251,191,36,0.55)]'
                : 'text-muted-foreground group-hover/fav:text-amber-500/80'
            )}
          />
        )}
      </motion.span>

      {isFavorited && !isLoading && (
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-amber-400/40"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.8, 0], scale: [0.8, 1.4] }}
          transition={{ duration: 0.5 }}
          key={justAdded ? 'pulse' : 'idle'}
        />
      )}
    </span>
  );

  if (variant === 'pill') {
    return (
      <Button
        type="button"
        variant={isFavorited ? 'secondary' : 'outline'}
        size="sm"
        disabled={!canFavorite || isLoading}
        onClick={handleClick}
        title={tooltip}
        className={cn(
          'group/fav gap-2 transition-all',
          isFavorited && 'border-amber-400/40 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50',
          !canFavorite && 'opacity-50',
          className
        )}
      >
        {star}
        <span className="text-sm">
          {isFavorited ? 'В избранном' : 'В избранное'}
        </span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={!canFavorite || isLoading}
      onClick={handleClick}
      title={tooltip}
      aria-label={tooltip}
      aria-pressed={isFavorited}
      className={cn(
        'group/fav relative transition-all',
        btnSize,
        revealOnHover && !isFavorited && 'opacity-0 group-hover:opacity-100',
        isFavorited && 'opacity-100',
        isFavorited && 'hover:bg-amber-50 dark:hover:bg-amber-950/30',
        !canFavorite && 'cursor-not-allowed opacity-40',
        className
      )}
    >
      {star}
    </Button>
  );
}
