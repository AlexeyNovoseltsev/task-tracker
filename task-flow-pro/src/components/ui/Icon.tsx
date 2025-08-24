import { motion } from "framer-motion";
import { LucideIcon, LucideProps } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

interface IconProps extends LucideProps {
  icon: LucideIcon;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "ghost" | "outline" | "filled";
  hover?: boolean;
  pulse?: boolean;
  spin?: boolean;
}

const sizeClasses = {
  xs: "w-3 h-3",
  sm: "w-4 h-4", 
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8"
};

const variantClasses = {
  default: "",
  ghost: "p-2 rounded-lg hover:bg-muted/50 transition-colors",
  outline: "p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors",
  filled: "p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
};

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ 
    icon: IconComponent, 
    size = "md", 
    variant = "default",
    hover = false,
    pulse = false,
    spin = false,
    className, 
    ...props 
  }, ref) => {
    return (
      <motion.div
        className={cn(
          "inline-flex items-center justify-center",
          variantClasses[variant],
          className
        )}
        whileHover={hover ? { scale: 1.1 } : undefined}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.div
          animate={pulse ? { scale: [1, 1.1, 1] } : spin ? { rotate: 360 } : undefined}
          transition={pulse ? { duration: 2, repeat: Infinity } : spin ? { duration: 1, repeat: Infinity, ease: "linear" } : undefined}
        >
          <IconComponent
            ref={ref}
            className={cn(sizeClasses[size])}
            {...props}
          />
        </motion.div>
      </motion.div>
    );
  }
);

Icon.displayName = "Icon";

// Удобные компоненты для часто используемых иконок
export const IconButton = React.forwardRef<HTMLButtonElement, IconProps & React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ 
    icon: IconComponent, 
    size = "md", 
    variant = "ghost",
    hover = true,
    className,
    ...props 
  }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          variantClasses[variant],
          className
        )}
        whileHover={hover ? { scale: 1.05 } : undefined}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        <IconComponent className={cn(sizeClasses[size])} />
      </motion.button>
    );
  }
);

IconButton.displayName = "IconButton";
