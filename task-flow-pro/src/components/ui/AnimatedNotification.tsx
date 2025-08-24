import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedNotificationProps {
  title: string;
  message?: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
  show?: boolean;
  className?: string;
}

const notificationVariants = {
  hidden: {
    opacity: 0,
    y: -50,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

const getIcon = (type: string) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "error":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />;
    default:
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

const getStyles = (type: string) => {
  switch (type) {
    case "success":
      return {
        bg: "bg-green-50 dark:bg-green-900/20",
        border: "border-green-200 dark:border-green-800",
        text: "text-green-800 dark:text-green-200",
      };
    case "error":
      return {
        bg: "bg-red-50 dark:bg-red-900/20",
        border: "border-red-200 dark:border-red-800",
        text: "text-red-800 dark:text-red-200",
      };
    case "warning":
      return {
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        border: "border-yellow-200 dark:border-yellow-800",
        text: "text-yellow-800 dark:text-yellow-200",
      };
    case "info":
      return {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-800 dark:text-blue-200",
      };
    default:
      return {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-800 dark:text-blue-200",
      };
  }
};

export const AnimatedNotification: React.FC<AnimatedNotificationProps> = ({
  title,
  message,
  type = "info",
  duration = 5000,
  onClose,
  show = true,
  className,
}) => {
  const styles = getStyles(type);

  React.useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={cn(
            "fixed top-4 right-4 z-50 max-w-sm w-full",
            styles.bg,
            styles.border,
            "border rounded-lg shadow-lg p-4",
            className
          )}
          variants={notificationVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          layout
        >
          <div className="flex items-start space-x-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            >
              {getIcon(type)}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <motion.h4
                className={cn("text-sm font-medium", styles.text)}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {title}
              </motion.h4>
              {message && (
                <motion.p
                  className={cn("text-sm mt-1", styles.text)}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {message}
                </motion.p>
              )}
            </div>
            
            {onClose && (
              <motion.button
                onClick={onClose}
                className={cn(
                  "flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors",
                  styles.text
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </div>
          
          {/* Progress bar */}
          {duration && (
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-current opacity-20"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Компонент для стека уведомлений
export const NotificationStack: React.FC<{
  notifications: Array<{
    id: string;
    title: string;
    message?: string;
    type?: "success" | "error" | "warning" | "info";
    duration?: number;
  }>;
  onRemove: (id: string) => void;
}> = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              delay: index * 0.1,
            }}
            layout
          >
            <AnimatedNotification
              title={notification.title}
              message={notification.message}
              type={notification.type}
              duration={notification.duration}
              onClose={() => onRemove(notification.id)}
              show={true}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
