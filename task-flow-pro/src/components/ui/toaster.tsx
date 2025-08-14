import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useToast } from "@/hooks/useToast";

interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: React.ReactNode;
  onClose?: () => void;
}

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

function Toast({ 
  id, 
  title, 
  description, 
  variant = 'info', 
  duration = 5000, 
  action, 
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  const Icon = toastIcons[variant];

  useEffect(() => {
    // Show animation
    const showTimer = setTimeout(() => setIsVisible(true), 10);
    
    // Auto-close timer
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose?.();
    }, 300); // Match CSS transition duration
  };

  return (
    <div
      className={`notification ${variant} ${isVisible && !isLeaving ? 'show' : ''} ${isLeaving ? 'hide' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="notification-icon">
        <Icon size={20} />
      </div>
      
      <div className="notification-content">
        {title && (
          <div className="notification-title">{title}</div>
        )}
        {description && (
          <div className="notification-message">{description}</div>
        )}
        {action && (
          <div className="mt-2">{action}</div>
        )}
      </div>
      
      <button
        onClick={handleClose}
        className="notification-close"
        aria-label="Закрыть уведомление"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="notification-container">
      {toasts.map((toast) => (
        <Toast 
          key={toast.id} 
          {...toast} 
          onClose={() => dismiss(toast.id)} 
        />
      ))}
    </div>
  );
} 