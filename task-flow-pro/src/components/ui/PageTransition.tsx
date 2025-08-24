import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
  duration?: number;
  delay?: number;
}

const variants = {
  enter: (direction: string) => ({
    x: direction === "left" ? 1000 : direction === "right" ? -1000 : 0,
    y: direction === "up" ? 1000 : direction === "down" ? -1000 : 0,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    y: 0,
    opacity: 1,
  },
  exit: (direction: string) => ({
    zIndex: 0,
    x: direction === "left" ? -1000 : direction === "right" ? 1000 : 0,
    y: direction === "up" ? -1000 : direction === "down" ? 1000 : 0,
    opacity: 0,
  }),
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  direction = "right",
  duration = 0.3,
  delay = 0,
}) => {
  return (
    <motion.div
      className={cn("w-full h-full", className)}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        y: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: duration * 0.5 },
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};

// Компонент для анимированного контейнера страницы
export const AnimatedPage: React.FC<{
  children: React.ReactNode;
  className?: string;
  show?: boolean;
  delay?: number;
}> = ({ children, className, show = true, delay = 0 }) => {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          className={cn("w-full h-full", className)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            delay,
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Компонент для анимированного появления контента
export const FadeInContent: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
}> = ({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.5,
  direction = "up" 
}) => {
  const getInitialPosition = () => {
    switch (direction) {
      case "up": return { y: 20, opacity: 0 };
      case "down": return { y: -20, opacity: 0 };
      case "left": return { x: 20, opacity: 0 };
      case "right": return { x: -20, opacity: 0 };
      default: return { y: 20, opacity: 0 };
    }
  };

  return (
    <motion.div
      className={className}
      initial={getInitialPosition()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{
        delay,
        duration,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {children}
    </motion.div>
  );
};

// Компонент для анимированного списка с появлением элементов
export const StaggeredList: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  itemDelay?: number;
}> = ({ children, className, staggerDelay = 0.1, itemDelay = 0.1 }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: itemDelay,
          },
        },
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 24,
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
