import { Search, X } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  variant?: "default" | "filled" | "outline";
  size?: "sm" | "md" | "lg";
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, variant = "default", size = "md", onClear, ...props }, ref) => {
    const [hasValue, setHasValue] = React.useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    const handleClear = () => {
      if (props.value) {
        const event = {
          target: { value: "" }
        } as React.ChangeEvent<HTMLInputElement>;
        props.onChange?.(event);
      }
      onClear?.();
      setHasValue(false);
    };

    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className={cn(
            "flex w-full rounded-modern border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            {
              "pl-10 pr-10": true,
              "h-8 text-xs": size === "sm",
              "h-10 text-sm": size === "md",
              "h-12 text-base": size === "lg",
              "bg-muted/50": variant === "filled",
              "border-2": variant === "outline",
            },
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        />
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-modern p-1 hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"

export { SearchInput } 