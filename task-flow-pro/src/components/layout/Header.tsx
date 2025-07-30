import { Button } from "@/components/ui/button";
import { useSelectedProject } from "@/store";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Computer } from "lucide-react";

export function Header() {
  const project = useSelectedProject();
  const { currentTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const;
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'light': return Sun;
      case 'dark': return Moon;
      default: return Computer;
    }
  };

  const ThemeIcon = getThemeIcon();

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          {project && (
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-sm" 
                style={{ backgroundColor: project.color }}
              />
              <span className="font-medium">{project.name}</span>
              <span className="text-muted-foreground">({project.key})</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={`Switch to ${currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'system' : 'light'} theme`}
          >
            <ThemeIcon className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              PM
            </div>
            <span className="text-sm font-medium">Product Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
} 