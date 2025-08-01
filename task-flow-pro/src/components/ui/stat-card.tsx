import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./card"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "info";
  className?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, description, icon: Icon, trend, variant = "default", className }, ref) => {
    const getVariantStyles = () => {
      switch (variant) {
        case "success":
          return "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/10";
        case "warning":
          return "border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10";
        case "info":
          return "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/10";
        default:
          return "border-border bg-card";
      }
    };

    const getIconColor = () => {
      switch (variant) {
        case "success":
          return "text-green-600";
        case "warning":
          return "text-yellow-600";
        case "info":
          return "text-blue-600";
        default:
          return "text-primary";
      }
    };

    return (
      <Card
        ref={ref}
        className={cn(
          "transition-all duration-200 hover:shadow-md",
          getVariantStyles(),
          className
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-foreground">
                  {value}
                </p>
                {trend && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}>
                    {trend.isPositive ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(trend.value)}%
                  </div>
                )}
              </div>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            {Icon && (
              <div className={cn(
                "w-12 h-12 rounded-modern flex items-center justify-center",
                getIconColor()
              )}>
                <Icon className="h-6 w-6" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)
StatCard.displayName = "StatCard"

export { StatCard } 