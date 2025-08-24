import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: "vertical" | "horizontal";
  gap?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
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
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  className,
  staggerDelay = 0.1,
  direction = "vertical",
  gap = 4,
}) => {
  return (
    <motion.div
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        className
      )}
      style={{ gap: `${gap * 0.25}rem` }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          custom={index}
          transition={{
            delay: index * staggerDelay,
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

interface AnimatedListItemProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
  delay?: number;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({
  children,
  className,
  index = 0,
  delay = 0,
}) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{
        delay: delay + index * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 24,
      }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  );
};

// Компонент для анимированного появления/исчезновения элементов
export const AnimatedContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  show?: boolean;
  delay?: number;
}> = ({ children, className, show = true, delay = 0 }) => {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          className={className}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            delay,
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
