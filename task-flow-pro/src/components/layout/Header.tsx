import { Sun, Moon, Computer, ChevronDown, Folder, Check, Search, Bell, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/useToast";
import { useSelectedProject, useAppStore } from "@/store";

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
    <header className="h-20 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-[99998]">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center space-x-4">
                     {/* Project Selector */}
           <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="flex items-center space-x-4 px-6 py-3 rounded-modern border bg-card hover:bg-accent transition-all duration-200 text-base font-medium shadow-sm hover:shadow-md"
            >
              {project ? (
                <>
                  <div 
                    className="w-5 h-5 rounded-sm" 
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-base">{project.name}</span>
                    <span className="text-sm text-muted-foreground">{project.key}</span>
                  </div>
                </>
              ) : (
                <>
                  <Folder className="w-5 h-5 text-muted-foreground" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-base">Выберите проект</span>
                    <span className="text-sm text-muted-foreground">Начните работу</span>
                  </div>
                </>
              )}
              <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-200" />
            </button>

            {/* Dropdown */}
            {showProjectDropdown && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-card border rounded-modern shadow-lg animate-fadeIn backdrop-blur-sm z-[99999]">
                <div className="p-4 border-b border-border/30">
                  <h3 className="font-semibold text-sm mb-1">Проекты</h3>
                  <p className="text-xs text-muted-foreground">Выберите проект для работы</p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <div 
                    className={`flex items-center space-x-3 px-4 py-3 hover:bg-accent cursor-pointer transition-colors ${
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
                      className={`flex items-center space-x-3 px-4 py-3 hover:bg-accent cursor-pointer transition-colors ${
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
          {/* Search */}
          <Button variant="ghost" size="icon" className="relative">
            <Search className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 text-xs bg-muted px-1 rounded text-muted-foreground">
              ⌘K
            </span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={`Switch to ${currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'system' : 'light'} theme`}
          >
            <ThemeIcon className="h-5 w-5" />
          </Button>
          
          {/* User Profile */}
          <div className="flex items-center space-x-4 pl-4 border-l border-border/30">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-base font-semibold">
              <User className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <div className="text-base font-medium">Продакт-менеджер</div>
              <div className="text-sm text-muted-foreground">admin@taskflow.pro</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 