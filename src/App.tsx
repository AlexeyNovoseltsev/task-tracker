import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useTheme } from "@/hooks/useTheme";

// Layouts
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import { DashboardPage } from "@/pages/DashboardPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { BacklogPage } from "@/pages/BacklogPage";
import { SprintsPage } from "@/pages/SprintsPage";
import { KanbanPage } from "@/pages/KanbanPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { SettingsPage } from "@/pages/SettingsPage";

function App() {
  const { theme } = useTheme();

  return (
    <div className={`h-full ${theme}`}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="backlog" element={<BacklogPage />} />
          <Route path="sprints" element={<SprintsPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <Toaster />
    </div>
  );
}

export default App; 