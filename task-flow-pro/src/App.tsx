import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectModal } from "@/components/project/ProjectModal";
import { SprintModal } from "@/components/sprint/SprintModal";
import { TaskModal } from "@/components/task/TaskModal";
import { Toaster } from "@/components/ui/toaster";
import { useKeyboardShortcuts, GLOBAL_SHORTCUTS } from "@/hooks/useKeyboardShortcuts";
import { useTheme } from "@/hooks/useTheme";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import ApiTestPage from "@/pages/ApiTestPage";
import { BacklogPage } from "@/pages/BacklogPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { ColorPickerDemo } from "@/pages/ColorPickerDemo";
import { DashboardPage } from "@/pages/DashboardPage";
import FavoritesPage from "@/pages/FavoritesPage";
import { KanbanPage } from "@/pages/KanbanPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SprintsPage } from "@/pages/SprintsPage";
import { TasksPage } from "@/pages/TasksPage";
import { useAppStore } from "@/store";

function App() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { initializeWithDemoData, projects } = useAppStore();

  useEffect(() => {
    // Initialize with demo data if the store is empty
    if (projects.length === 0) {
      initializeWithDemoData();
    }
  }, [initializeWithDemoData, projects.length]);
  
  // Modal states
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [sprintModalOpen, setSprintModalOpen] = useState(false);

  // Global keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        ...GLOBAL_SHORTCUTS.CREATE_TASK,
        action: () => setTaskModalOpen(true),
      },
      {
        ...GLOBAL_SHORTCUTS.CREATE_PROJECT,
        action: () => setProjectModalOpen(true),
      },
      {
        ...GLOBAL_SHORTCUTS.CREATE_SPRINT,
        action: () => setSprintModalOpen(true),
      },
      {
        ...GLOBAL_SHORTCUTS.TOGGLE_THEME,
        action: () => toggleTheme(),
      },
      {
        ...GLOBAL_SHORTCUTS.DASHBOARD,
        action: () => navigate('/'),
      },
      {
        ...GLOBAL_SHORTCUTS.PROJECTS,
        action: () => navigate('/projects'),
      },
      {
        ...GLOBAL_SHORTCUTS.TASKS,
        action: () => navigate('/tasks'),
      },
      {
        ...GLOBAL_SHORTCUTS.BACKLOG,
        action: () => navigate('/backlog'),
      },
      {
        ...GLOBAL_SHORTCUTS.SPRINTS,
        action: () => navigate('/sprints'),
      },
      {
        ...GLOBAL_SHORTCUTS.KANBAN,
        action: () => navigate('/kanban'),
      },
      {
        ...GLOBAL_SHORTCUTS.ANALYTICS,
        action: () => navigate('/analytics'),
      },
      {
        ...GLOBAL_SHORTCUTS.CALENDAR,
        action: () => navigate('/calendar'),
      },
      {
        ...GLOBAL_SHORTCUTS.SETTINGS,
        action: () => navigate('/settings'),
      },
    ]
  });

  return (
    <div className={`h-full ${theme}`}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="favorites" element={<FavoritesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="backlog" element={<BacklogPage />} />
          <Route path="sprints" element={<SprintsPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="api-test" element={<ApiTestPage />} />
          <Route path="color-demo" element={<ColorPickerDemo />} />
        </Route>
      </Routes>
      
      {/* Global Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
      />
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
      />
      <SprintModal
        isOpen={sprintModalOpen}
        onClose={() => setSprintModalOpen(false)}
      />
      
      <Toaster />
    </div>
  );
}

export default App; 