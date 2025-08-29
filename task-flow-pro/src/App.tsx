import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { PrivateRoute, PublicOnlyRoute } from "@/components/auth/ProtectedRoute";
import { ProjectModal } from "@/components/project/ProjectModal";
import { SprintModal } from "@/components/sprint/SprintModal";
import { TaskModal } from "@/components/task/TaskModal";
import { Toaster } from "@/components/ui/toaster";
import { useKeyboardShortcuts, GLOBAL_SHORTCUTS } from "@/hooks/useKeyboardShortcuts";
import { useTheme } from "@/hooks/useTheme";
import { Suspense } from "react";
import { LazyPages, preloadCriticalPages } from "@/utils/lazyLoad";
import { PageLoading } from "@/components/ui/LoadingSpinner";

// Preload critical pages
preloadCriticalPages();
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
        {/* Публичные маршруты (доступны только неавторизованным) */}
                        <Route path="/login" element={
                  <PublicOnlyRoute>
                    <Suspense fallback={<PageLoading />}>
                      <LazyPages.Login />
                    </Suspense>
                  </PublicOnlyRoute>
                } />
                <Route path="/register" element={
                  <PublicOnlyRoute>
                    <Suspense fallback={<PageLoading />}>
                      <LazyPages.Register />
                    </Suspense>
                  </PublicOnlyRoute>
                } />
                <Route path="/check-email" element={
                  <PublicOnlyRoute>
                    <Suspense fallback={<PageLoading />}>
                      <LazyPages.CheckEmail />
                    </Suspense>
                  </PublicOnlyRoute>
                } />

        {/* Защищенные маршруты (требуют авторизацию) */}
        <Route path="/" element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }>
          <Route index element={
            <Suspense fallback={<div>Loading...</div>}>
              <LazyPages.Dashboard />
            </Suspense>
          } />
          <Route path="favorites" element={
            <Suspense fallback={<div>Loading...</div>}>
              <LazyPages.Favorites />
            </Suspense>
          } />
          <Route path="projects" element={
            <Suspense fallback={<div>Loading...</div>}>
              <LazyPages.Projects />
            </Suspense>
          } />
          <Route path="tasks" element={
            <Suspense fallback={<div>Loading...</div>}>
              <LazyPages.Tasks />
            </Suspense>
          } />
          <Route path="backlog" element={
            <Suspense fallback={<div>Loading...</div>}>
              <LazyPages.Backlog />
            </Suspense>
          } />
          <Route path="sprints" element={
            <Suspense fallback={<div>Loading...</div>}>
              <LazyPages.Sprints />
            </Suspense>
          } />
          <Route path="kanban" element={
            <Suspense fallback={<div>Loading...</div>}>
              <LazyPages.Kanban />
            </Suspense>
          } />
          <Route path="analytics" element={
            <Suspense fallback={<div>Loading...</div>}>
              <LazyPages.Analytics />
            </Suspense>
          } />
          <Route path="calendar" element={
            <Suspense fallback={<div>Loading...</div>}>
              <LazyPages.Calendar />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<div>Loading...</div>}>
              <LazyPages.Settings />
            </Suspense>
          } />
          <Route path="api-test" element={
            <Suspense fallback={<div>Loading...</div>}>
              <LazyPages.ApiTest />
            </Suspense>
          } />
          <Route path="color-demo" element={
            <Suspense fallback={<div>Loading...</div>}>
              <LazyPages.ColorDemo />
            </Suspense>
          } />
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