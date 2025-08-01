import * as React from "react"
import { Filter, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"

export interface FilterButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  count?: number;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  onClear?: () => void;
}

const FilterButton = React.forwardRef<HTMLButtonElement, FilterButtonProps>(
  ({ 
    className, 
    isActive = false, 
    count, 
    variant = "default", 
    size = "md",
    onClear,
    children,
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-modern text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm": variant === "default" && isActive,
            "bg-muted text-muted-foreground hover:bg-muted/80": variant === "default" && !isActive,
            "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
            "h-7 px-2 text-xs": size === "sm",
            "h-9 px-3 text-sm": size === "md",
            "h-11 px-4 text-base": size === "lg",
          },
          className
        )}
        ref={ref}
        {...props}
      >
        <Filter className="mr-2 h-3 w-3" />
        {children}
        {count !== undefined && count > 0 && (
          <Badge 
            variant="secondary" 
            size="sm" 
            className="ml-2"
          >
            {count}
          </Badge>
        )}
        {isActive && onClear && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="ml-2 p-0.5 hover:bg-muted rounded-sm transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </button>
    )
  }
)
FilterButton.displayName = "FilterButton"

export { FilterButton } 