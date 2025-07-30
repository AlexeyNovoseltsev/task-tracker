import { create } from 'zustand';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  createdAt: Date;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'createdAt'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = generateId();
    const newToast: Toast = {
      ...toast,
      id,
      createdAt: new Date(),
      duration: toast.duration ?? 5000,
      dismissible: toast.dismissible ?? true,
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
    
    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  
  clearAllToasts: () => {
    set({ toasts: [] });
  },
}));

// Helper hook for easy toast usage
export const useToast = () => {
  const { addToast, removeToast, clearAllToasts } = useToastStore();
  
  const toast = {
    success: (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
      addToast({
        message,
        type: 'success',
        ...options,
      });
    },
    
    error: (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
      addToast({
        message,
        type: 'error',
        duration: 7000, // Longer duration for errors
        ...options,
      });
    },
    
    warning: (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
      addToast({
        message,
        type: 'warning',
        duration: 6000,
        ...options,
      });
    },
    
    info: (message: string, options?: Partial<Omit<Toast, 'type' | 'message'>>) => {
      addToast({
        message,
        type: 'info',
        ...options,
      });
    },
    
    // Specialized toasts for common actions
    taskCreated: (taskTitle: string) => {
      addToast({
        title: 'Task Created',
        message: `"${taskTitle}" has been created successfully`,
        type: 'success',
      });
    },
    
    taskUpdated: (taskTitle: string) => {
      addToast({
        title: 'Task Updated',
        message: `"${taskTitle}" has been updated`,
        type: 'success',
      });
    },
    
    taskDeleted: (taskTitle: string) => {
      addToast({
        title: 'Task Deleted',
        message: `"${taskTitle}" has been deleted`,
        type: 'info',
        duration: 4000,
      });
    },
    
    sprintCreated: (sprintName: string) => {
      addToast({
        title: 'Sprint Created',
        message: `"${sprintName}" has been created and is ready for planning`,
        type: 'success',
        duration: 6000,
      });
    },
    
    sprintStarted: (sprintName: string) => {
      addToast({
        title: 'Sprint Started',
        message: `"${sprintName}" is now active. Good luck team! 🚀`,
        type: 'success',
        duration: 6000,
      });
    },
    
    sprintCompleted: (sprintName: string) => {
      addToast({
        title: 'Sprint Completed',
        message: `"${sprintName}" has been completed. Great work! 🎉`,
        type: 'success',
        duration: 7000,
      });
    },
    
    projectCreated: (projectName: string) => {
      addToast({
        title: 'Project Created',
        message: `"${projectName}" is ready to go. Start adding tasks!`,
        type: 'success',
        duration: 6000,
      });
    },
    
    invalidAction: (message: string) => {
      addToast({
        title: 'Action Not Available',
        message,
        type: 'warning',
        duration: 4000,
      });
    },
    
    networkError: () => {
      addToast({
        title: 'Connection Error',
        message: 'Unable to save changes. Please check your connection.',
        type: 'error',
        duration: 8000,
      });
    },
  };
  
  return {
    toast,
    removeToast,
    clearAllToasts,
  };
};

// Icon mapping for different toast types
export const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return CheckCircle;
    case 'error':
      return AlertCircle;
    case 'warning':
      return AlertTriangle;
    case 'info':
      return Info;
    default:
      return Info;
  }
};

// Color classes for different toast types
export const getToastStyles = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        container: 'bg-green-50 border-green-200',
        icon: 'text-green-600',
        title: 'text-green-900',
        message: 'text-green-800',
        button: 'text-green-600 hover:text-green-800',
      };
    case 'error':
      return {
        container: 'bg-red-50 border-red-200',
        icon: 'text-red-600',
        title: 'text-red-900',
        message: 'text-red-800',
        button: 'text-red-600 hover:text-red-800',
      };
    case 'warning':
      return {
        container: 'bg-yellow-50 border-yellow-200',
        icon: 'text-yellow-600',
        title: 'text-yellow-900',
        message: 'text-yellow-800',
        button: 'text-yellow-600 hover:text-yellow-800',
      };
    case 'info':
      return {
        container: 'bg-blue-50 border-blue-200',
        icon: 'text-blue-600',
        title: 'text-blue-900',
        message: 'text-blue-800',
        button: 'text-blue-600 hover:text-blue-800',
      };
    default:
      return {
        container: 'bg-gray-50 border-gray-200',
        icon: 'text-gray-600',
        title: 'text-gray-900',
        message: 'text-gray-800',
        button: 'text-gray-600 hover:text-gray-800',
      };
  }
}; 