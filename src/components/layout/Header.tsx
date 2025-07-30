import { Button } from "@/components/ui/button";
import { useAppStore, useSelectedProject } from "@/store";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Computer, Settings } from "lucide-react";

export function Header() {
  const selectedProject = useSelectedProject();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      default: return Computer;
    }
  };

  const ThemeIcon = getThemeIcon();

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div>
          {selectedProject ? (
            <div>
              <h2 className="font-semibold text-foreground">{selectedProject.name}</h2>
              <p className="text-sm text-muted-foreground">{selectedProject.key}</p>
            </div>
          ) : (
            <div>
              <h2 className="font-semibold text-foreground">TaskFlow Pro</h2>
              <p className="text-sm text-muted-foreground">No project selected</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-9 w-9 p-0"
        >
          <ThemeIcon className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
} 