import { 
  LayoutDashboard, 
  FolderKanban, 
  ListTodo, 
  CheckSquare,
  Kanban,
  Settings,
  Wifi,
  PieChart,
  Star
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { SprintIcon, LogoIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Дашборд", href: "/", icon: LayoutDashboard, description: "Обзор проектов" },
  { name: "Избранное", href: "/favorites", icon: Star, description: "Избранные элементы" },
  { name: "Проекты", href: "/projects", icon: FolderKanban, description: "Управление проектами" },
  { name: "Задачи", href: "/tasks", icon: CheckSquare, description: "Все задачи" },
  { name: "Бэклог", href: "/backlog", icon: ListTodo, description: "Планирование" },
  { name: "Спринты", href: "/sprints", icon: SprintIcon, description: "Спринт-планирование" },
  { name: "Канбан", href: "/kanban", icon: Kanban, description: "Визуальное управление" },
  { name: "Аналитика", href: "/analytics", icon: PieChart, description: "Отчеты и метрики" },
  { name: "Настройки", href: "/settings", icon: Settings, description: "Конфигурация" },
  { name: "🧪 Тест API", href: "/api-test", icon: Wifi, description: "Тестирование API" },
];

export function Sidebar() {
  return (
         <div className="w-80 bg-card/95 border-r border-border/60 flex flex-col backdrop-blur-sm">
      {/* Header */}
             <div className="border-b border-border/30">
         <LogoIcon size={216} />
       </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                                 cn(
                   "group flex items-center px-4 py-3 text-base font-medium rounded-modern transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "bg-[#2c5545] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                )
              }
            >
                             <item.icon className="mr-4 h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
               <div className="flex-1 min-w-0">
                 <span className="truncate block">{item.name}</span>
                 <span className="text-sm opacity-60 truncate block">
                   {item.description}
                 </span>
               </div>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );
} 