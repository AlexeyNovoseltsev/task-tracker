import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import type { Project, Task, Sprint, User } from '@/types';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

interface AppState {
  // Data
  projects: Project[];
  tasks: Task[];
  sprints: Sprint[];
  users: User[];
  
  // UI State
  selectedProjectId: string | null;
  selectedSprintId: string | null;
  
  // Project Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setSelectedProject: (projectId: string | null) => void;
  
  // Task Actions
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Sprint Actions
  addSprint: (sprint: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSprint: (id: string, updates: Partial<Sprint>) => void;
  deleteSprint: (id: string) => void;
  setSelectedSprint: (sprintId: string | null) => void;
  
  // User Actions
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      projects: [],
      tasks: [],
      sprints: [],
      users: [],
      selectedProjectId: null,
      selectedSprintId: null,
      
      // Project Actions
      addProject: (project) => set((state) => {
        const newProject: Project = {
          ...project,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        state.projects.push(newProject);
        if (!state.selectedProjectId) {
          state.selectedProjectId = newProject.id;
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
      
      setSelectedProject: (projectId) => set((state) => {
        state.selectedProjectId = projectId;
      }),
      
      // Task Actions
      addTask: (task) => set((state) => {
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
      
      // Sprint Actions
      addSprint: (sprint) => set((state) => {
        const newSprint: Sprint = {
          ...sprint,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        state.sprints.push(newSprint);
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
        if (state.selectedSprintId === id) {
          state.selectedSprintId = null;
        }
      }),
      
      setSelectedSprint: (sprintId) => set((state) => {
        state.selectedSprintId = sprintId;
      }),
      
      // User Actions
      addUser: (user) => set((state) => {
        const newUser: User = {
          ...user,
          id: generateId(),
        };
        state.users.push(newUser);
      }),
      
      updateUser: (id, updates) => set((state) => {
        const index = state.users.findIndex(u => u.id === id);
        if (index !== -1) {
          state.users[index] = {
            ...state.users[index],
            ...updates,
          };
        }
      }),
      
      deleteUser: (id) => set((state) => {
        state.users = state.users.filter(u => u.id !== id);
      }),
    })),
    {
      name: 'task-tracker-storage',
      // Only persist data, not UI state
      partialize: (state) => ({
        projects: state.projects,
        tasks: state.tasks,
        sprints: state.sprints,
        users: state.users,
        selectedProjectId: state.selectedProjectId,
      }),
    }
  )
);

// Selectors
export const useSelectedProject = () => useAppStore((state) => 
  state.projects.find(p => p.id === state.selectedProjectId) || null
);

export const useSelectedSprint = () => useAppStore((state) => 
  state.sprints.find(s => s.id === state.selectedSprintId) || null
);

export const useProjectTasks = (projectId?: string) => useAppStore((state) => 
  projectId ? state.tasks.filter(t => t.projectId === projectId) : state.tasks
); 