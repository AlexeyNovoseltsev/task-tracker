import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useTheme } from "@/hooks/useTheme";
import { useKeyboardShortcuts, GLOBAL_SHORTCUTS } from "@/hooks/useKeyboardShortcuts";
import { TaskModal } from "@/components/task/TaskModal";
import { ProjectModal } from "@/components/project/ProjectModal";
import { SprintModal } from "@/components/sprint/SprintModal";

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
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
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
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="backlog" element={<BacklogPage />} />
          <Route path="sprints" element={<SprintsPage />} />
          <Route path="kanban" element={<KanbanPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
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