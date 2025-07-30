import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FolderKanban, 
  ListTodo, 
  CheckSquare,
  Zap,
  Kanban,
  BarChart3,
  Settings,
  Wifi,
  Sparkles,
  Target,
  Calendar,
  Users,
  PieChart
} from "lucide-react";

const navigation = [
  { name: "Дашборд", href: "/", icon: LayoutDashboard },
  { name: "Проекты", href: "/projects", icon: FolderKanban },
  { name: "Задачи", href: "/tasks", icon: CheckSquare },
  { name: "Бэклог", href: "/backlog", icon: ListTodo },
  { name: "Спринты", href: "/sprints", icon: Target },
  { name: "Канбан", href: "/kanban", icon: Kanban },
  { name: "Аналитика", href: "/analytics", icon: PieChart },
  { name: "Настройки", href: "/settings", icon: Settings },
  { name: "🧪 Тест API", href: "/api-test", icon: Wifi },
];

export function Sidebar() {
  return (
    <div className="w-56 bg-card/95 border-r border-border/60 flex flex-col backdrop-blur-sm">
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground font-['Comforta']">TF Pro</h1>
        </div>
        <p className="text-xs text-muted-foreground font-['Comforta']">Управление продуктом</p>
      </div>
      
      <nav className="flex-1 p-3">
        <ul className="space-y-0.5">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  )
                }
              >
                <item.icon className="mr-3 h-4 w-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Compact footer */}
      <div className="p-3 border-t border-border/30">
        <div className="text-xs text-muted-foreground text-center">
          v1.0.0
        </div>
      </div>
    </div>
  );
} 