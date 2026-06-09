import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap gap-2 rounded-modern text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Modern variants inspired by Linear and Notion
        subtle: "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
        gradient: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-sm hover:shadow-md",
        glass: "backdrop-blur-sm bg-white/10 border border-white/20 text-foreground hover:bg-white/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-modern px-3 text-xs",
        lg: "h-12 rounded-modern px-8 text-base",
        xl: "h-14 rounded-modern px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isFullWidth = typeof className === 'string' && className.includes('w-full');

    return (
      <motion.div
        className={cn(isFullWidth && 'block w-full min-w-0')}
        whileHover={isFullWidth ? undefined : { scale: 1.02 }}
        whileTap={isFullWidth ? undefined : { scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled || loading}
          {...props}
        >
          {loading ? (
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span>Загрузка...</span>
            </motion.div>
          ) : (
            <motion.div
              className={cn('flex items-center gap-2', isFullWidth && 'w-full min-w-0')}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          )}
        </Comp>
      </motion.div>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants }; 