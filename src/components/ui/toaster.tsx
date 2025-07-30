import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useToastStore, getToastIcon, getToastStyles, Toast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const Icon = getToastIcon(toast.type);
  const styles = getToastStyles(toast.type);

  useEffect(() => {
    // Keyboard support for dismissing toasts
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && toast.dismissible) {
        onRemove(toast.id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toast.id, toast.dismissible, onRemove]);

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-md overflow-hidden rounded-lg border shadow-lg',
        'animate-in slide-in-from-right-full duration-300',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
        styles.container
      )}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex flex-1 items-start p-4">
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', styles.icon)} aria-hidden="true" />
        </div>
        
        <div className="ml-3 flex-1">
          {toast.title && (
            <h4 className={cn('text-sm font-medium', styles.title)}>
              {toast.title}
            </h4>
          )}
          <p className={cn('text-sm', toast.title ? 'mt-1' : '', styles.message)}>
            {toast.message}
          </p>
          
          {toast.action && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toast.action.onClick}
                className={cn('text-sm font-medium', styles.button)}
              >
                {toast.action.label}
              </Button>
            </div>
          )}
        </div>
        
        {toast.dismissible && (
          <div className="ml-4 flex flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(toast.id)}
              className={cn(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                styles.button
              )}
              aria-label="Close notification"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      className="fixed top-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:bottom-0 sm:right-0 sm:flex-col md:max-w-[420px]"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="mb-2 last:mb-0">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}

// Progress bar component for toasts with duration
interface ToastProgressProps {
  duration: number;
  startTime: Date;
}

function ToastProgress({ duration, startTime }: ToastProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime.getTime();
      const progressPercent = (elapsed / duration) * 100;
      
      if (progressPercent >= 100) {
        setProgress(100);
        clearInterval(interval);
      } else {
        setProgress(progressPercent);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, startTime]);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
      <div
        className="h-full bg-current transition-all duration-75 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
} 