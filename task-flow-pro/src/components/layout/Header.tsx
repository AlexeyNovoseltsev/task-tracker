import { Button } from "@/components/ui/button";
import { useSelectedProject, useAppStore } from "@/store";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/useToast";
import { Sun, Moon, Computer, ChevronDown, Folder, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function Header() {
  const project = useSelectedProject();
  const { projects, setSelectedProject } = useAppStore();
  const { success } = useToast();
  const { currentTheme, setTheme } = useTheme();
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProjectDropdown(false);
      }
    };

    if (showProjectDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProjectDropdown]);

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
    <header className="h-14 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          {/* Project Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="flex items-center space-x-2 px-2 md:px-3 py-1.5 rounded-lg border bg-card hover:bg-accent transition-colors text-sm"
            >
              {project ? (
                <>
                  <div 
                    className="w-4 h-4 rounded-sm" 
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="font-medium">{project.name}</span>
                  <span className="text-muted-foreground text-sm">({project.key})</span>
                </>
              ) : (
                <>
                  <Folder className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Выберите проект</span>
                </>
              )}
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Dropdown */}
            {showProjectDropdown && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-card border rounded-xl shadow-lg z-50 animate-fadeIn">
                <div className="p-3 border-b">
                  <h3 className="font-medium text-sm">Проекты</h3>
                  <p className="text-xs text-muted-foreground">Выберите проект для работы</p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div 
                    className={`flex items-center space-x-3 px-3 py-2 hover:bg-accent cursor-pointer transition-colors ${
                      !project ? 'bg-accent' : ''
                    }`}
                    onClick={() => {
                      setSelectedProject(null);
                      setShowProjectDropdown(false);
                      success("Проект", "Отключились от проекта", 2000);
                    }}
                  >
                    <Folder className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Все проекты</div>
                      <div className="text-xs text-muted-foreground">Просмотр всех задач</div>
                    </div>
                    {!project && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className={`flex items-center space-x-3 px-3 py-2 hover:bg-accent cursor-pointer transition-colors ${
                        project?.id === proj.id ? 'bg-accent' : ''
                      }`}
                      onClick={() => {
                        setSelectedProject(proj.id);
                        setShowProjectDropdown(false);
                        success("Проект", `Переключились на "${proj.name}"`, 2000);
                      }}
                    >
                      <div 
                        className="w-4 h-4 rounded-sm" 
                        style={{ backgroundColor: proj.color }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{proj.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {proj.key} • {proj.description || 'Без описания'}
                        </div>
                      </div>
                      {project?.id === proj.id && <Check className="w-4 h-4 text-primary" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
            <span className="text-sm font-medium">Продакт-менеджер</span>
          </div>
        </div>
      </div>
    </header>
  );
} 