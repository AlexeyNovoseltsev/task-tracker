import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import type { Project, Task, Sprint, User } from '@/types';
import { generateId } from '@/lib/utils';

interface AppState {
  // Data
  projects: Project[];
  tasks: Task[];
  sprints: Sprint[];
  users: User[];
  
  // UI State
  selectedProjectId: string | null;
  selectedSprintId: string | null;
  
  // Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  addSprint: (sprint: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSprint: (id: string, updates: Partial<Sprint>) => void;
  deleteSprint: (id: string) => void;
  
  setSelectedProject: (id: string | null) => void;
  setSelectedSprint: (id: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    immer((set) => ({
      // Initial state
      projects: [],
      tasks: [],
      sprints: [],
      users: [
        {
          id: 'user-1',
          name: 'Product Manager',
          email: 'pm@company.com',
          avatar: undefined,
        },
      ],
      selectedProjectId: null,
      selectedSprintId: null,
      
      // Project actions
      addProject: (projectData) => set((state) => {
        const project: Project = {
          ...projectData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        state.projects.push(project);
        if (!state.selectedProjectId) {
          state.selectedProjectId = project.id;
        }
      }),
      
      updateProject: (id, updates) => set((state) => {
        const index = state.projects.findIndex(p => p.id === id);
        if (index !== -1) {
          state.projects[index] = {
            ...state.projects[index],
            ...updates,
            updatedAt: new Date(),
          };
        }
      }),
      
      deleteProject: (id) => set((state) => {
        state.projects = state.projects.filter(p => p.id !== id);
        state.tasks = state.tasks.filter(t => t.projectId !== id);
        state.sprints = state.sprints.filter(s => s.projectId !== id);
        if (state.selectedProjectId === id) {
          state.selectedProjectId = state.projects[0]?.id || null;
        }
      }),
      
      // Task actions
      addTask: (taskData) => set((state) => {
        const task: Task = {
          ...taskData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        state.tasks.push(task);
      }),
      
      updateTask: (id, updates) => set((state) => {
        const index = state.tasks.findIndex(t => t.id === id);
        if (index !== -1) {
          state.tasks[index] = {
            ...state.tasks[index],
            ...updates,
            updatedAt: new Date(),
          };
        }
      }),
      
      deleteTask: (id) => set((state) => {
        state.tasks = state.tasks.filter(t => t.id !== id);
      }),
      
      // Sprint actions
      addSprint: (sprintData) => set((state) => {
        const sprint: Sprint = {
          ...sprintData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        state.sprints.push(sprint);
        if (!state.selectedSprintId) {
          state.selectedSprintId = sprint.id;
        }
      }),
      
      updateSprint: (id, updates) => set((state) => {
        const index = state.sprints.findIndex(s => s.id === id);
        if (index !== -1) {
          state.sprints[index] = {
            ...state.sprints[index],
            ...updates,
            updatedAt: new Date(),
          };
        }
      }),
      
      deleteSprint: (id) => set((state) => {
        state.sprints = state.sprints.filter(s => s.id !== id);
        // Remove sprint from tasks
        state.tasks.forEach(task => {
          if (task.sprintId === id) {
            task.sprintId = undefined;
          }
        });
        if (state.selectedSprintId === id) {
          state.selectedSprintId = null;
        }
      }),
      
      // UI actions
      setSelectedProject: (id) => set((state) => {
        state.selectedProjectId = id;
      }),
      
      setSelectedSprint: (id) => set((state) => {
        state.selectedSprintId = id;
      }),
    })),
    {
      name: 'taskflow-storage',
    }
  )
);

// Selectors
export const useProjects = () => useAppStore(state => state.projects);
export const useTasks = () => useAppStore(state => state.tasks);
export const useSprints = () => useAppStore(state => state.sprints);
export const useSelectedProject = () => {
  const selectedProjectId = useAppStore(state => state.selectedProjectId);
  const projects = useAppStore(state => state.projects);
  return projects.find(p => p.id === selectedProjectId);
};
export const useSelectedSprint = () => {
  const selectedSprintId = useAppStore(state => state.selectedSprintId);
  const sprints = useAppStore(state => state.sprints);
  return sprints.find(s => s.id === selectedSprintId);
}; 