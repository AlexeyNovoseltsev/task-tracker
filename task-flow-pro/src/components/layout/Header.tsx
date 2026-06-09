import { Sun, Moon, Computer, ChevronDown, Folder, Check, Search, Bell, User, LogOut, Settings } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";
import { useSelectedProject, useAppStore } from "@/store";

export function Header() {
  const project = useSelectedProject();
  const { projects, setSelectedProject } = useAppStore();
  const { success } = useToast();
  const { currentTheme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setShowProjectDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    if (showProjectDropdown || showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProjectDropdown, showUserDropdown]);

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
    <header className="sticky top-0 h-20 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center space-x-4">
                     {/* Project Selector */}
           <div className="relative" ref={projectDropdownRef}>
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
              <div className="absolute top-full left-0 mt-2 w-80 bg-card border rounded-modern shadow-lg animate-fadeIn backdrop-blur-sm z-40">
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
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-base font-semibold">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{user?.name || 'Пользователь'}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-card border rounded-modern shadow-lg animate-fadeIn backdrop-blur-sm z-40">
                  <div className="p-4 border-b border-border/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-lg font-semibold">
                        {user?.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{user?.name}</div>
                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                        <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 px-4 py-2 text-sm hover:bg-accent transition-colors"
                      onClick={() => setShowUserDropdown(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Настройки</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserDropdown(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-2 text-sm hover:bg-accent transition-colors w-full text-left text-destructive hover:text-destructive"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Выйти</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 