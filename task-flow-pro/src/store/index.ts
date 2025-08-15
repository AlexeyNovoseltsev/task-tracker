import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { initialProjects, initialSprints, initialTasks } from './initialData';

import { generateId } from '@/lib/utils';
import type { Project, Task, Sprint, User, Comment, Activity, Attachment, TimeEntry } from '@/types';


export interface SettingsState {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  pushNotifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
  taskReminders: boolean;
  projectUpdates: boolean;
  mentionNotifications: boolean;
  profileVisibility: 'public' | 'team' | 'private';
  activityTracking: boolean;
  dataCollection: boolean;
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  showAvatars: boolean;
  animationsEnabled: boolean;
  showStoryPoints: boolean;
  autoSave: boolean;
  autoBackup: boolean;
  cacheSize: string;
  syncInterval: string;
  autoExportBackups: boolean;
  exportFormat: 'json' | 'csv' | 'xlsx';
  includeAttachments: boolean;
}

interface AppState {
  // Data
  projects: Project[];
  tasks: Task[];
  sprints: Sprint[];
  users: User[];
  comments: Comment[];
  activities: Activity[];
  attachments: Attachment[];
  timeEntries: TimeEntry[];
  
  // UI State
  selectedProjectId: string | null;
  selectedSprintId: string | null;
  
  // Settings
  settings: SettingsState;
  
  // Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'watchers' | 'attachments' | 'linkedTasks'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (activeId: string, overId: string) => void;
  
  addSprint: (sprint: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSprint: (id: string, updates: Partial<Sprint>) => void;
  deleteSprint: (id: string) => void;
  
  addComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateComment: (id: string, updates: Partial<Comment>) => void;
  deleteComment: (id: string) => void;
  
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  
  addAttachment: (attachment: Omit<Attachment, 'id' | 'uploadedAt'>) => void;
  deleteAttachment: (id: string) => void;
  
  addTimeEntry: (timeEntry: Omit<TimeEntry, 'id' | 'createdAt'>) => void;
  deleteTimeEntry: (id: string) => void;
  
  setSelectedProject: (id: string | null) => void;
  setSelectedSprint: (id: string | null) => void;
  
  // Settings actions
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  resetSettings: () => void;
  
  // Initialization
  initializeWithDemoData: () => void;
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
          name: 'Александр Петров',
          email: 'alex.petrov@company.com',
          avatar: undefined,
        },
        {
          id: 'user-2',
          name: 'Мария Иванова',
          email: 'maria.ivanova@company.com',
          avatar: undefined,
        },
        {
          id: 'user-3',
          name: 'Сергей Смирнов',
          email: 'sergey.smirnov@company.com',
          avatar: undefined,
        },
      ],
      comments: [],
      activities: [],
      attachments: [],
      timeEntries: [],
      selectedProjectId: null,
      selectedSprintId: null,
      settings: {
        language: "ru",
        timezone: "Europe/Moscow",
        dateFormat: "DD.MM.YYYY",
        timeFormat: "24h",
        pushNotifications: true,
        emailNotifications: true,
        soundEnabled: true,
        taskReminders: true,
        projectUpdates: true,
        mentionNotifications: true,
        profileVisibility: "team",
        activityTracking: true,
        dataCollection: false,
        theme: "system",
        compactMode: false,
        showAvatars: true,
        animationsEnabled: true,
        showStoryPoints: true,
        autoSave: true,
        autoBackup: true,
        cacheSize: "100MB",
        syncInterval: "5min",
        autoExportBackups: false,
        exportFormat: "json",
        includeAttachments: true,
      },
      
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
          watchers: [],
          attachments: [],
          linkedTasks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        state.tasks.push(task);
        
        // Add creation activity
        const activity: Activity = {
          id: generateId(),
          type: 'created',
          description: 'создал задачу',
          taskId: task.id,
          projectId: task.projectId,
          userId: task.reporterId || 'user-1',
          createdAt: new Date(),
        };
        state.activities.push(activity);
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

      reorderTasks: (activeId, overId) => set((state) => {
        const activeTask = state.tasks.find((t) => t.id === activeId);
        const overTask = state.tasks.find((t) => t.id === overId);

        if (!activeTask || !overTask) return;

        // Only reorder tasks within the same status
        if (activeTask.status === overTask.status) {
          const tasksInStatus = state.tasks.filter(t => t.status === activeTask.status);
          const activeIndex = tasksInStatus.findIndex((t) => t.id === activeId);
          const overIndex = tasksInStatus.findIndex((t) => t.id === overId);

          if (activeIndex !== -1 && overIndex !== -1) {
            // Reorder within the same status
            const [removed] = tasksInStatus.splice(activeIndex, 1);
            tasksInStatus.splice(overIndex, 0, removed);

            // Update positions only for tasks in this status
            tasksInStatus.forEach((task, index) => {
              const taskIndex = state.tasks.findIndex(t => t.id === task.id);
              if (taskIndex !== -1) {
                state.tasks[taskIndex].position = index;
              }
            });
          }
        }
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
      
      // Comment actions
      addComment: (commentData) => set((state) => {
        const comment: Comment = {
          ...commentData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        state.comments.push(comment);
        
        // Add comment activity
        const activity: Activity = {
          id: generateId(),
          type: 'commented',
          description: 'добавил комментарий',
          taskId: comment.taskId,
          userId: comment.authorId,
          createdAt: new Date(),
        };
        state.activities.push(activity);
      }),
      
      updateComment: (id, updates) => set((state) => {
        const index = state.comments.findIndex(c => c.id === id);
        if (index !== -1) {
          state.comments[index] = {
            ...state.comments[index],
            ...updates,
            updatedAt: new Date(),
          };
        }
      }),
      
      deleteComment: (id) => set((state) => {
        state.comments = state.comments.filter(c => c.id !== id);
      }),
      
      // Activity actions
      addActivity: (activityData) => set((state) => {
        const activity: Activity = {
          ...activityData,
          id: generateId(),
          createdAt: new Date(),
        };
        state.activities.push(activity);
      }),
      
      // Attachment actions
      addAttachment: (attachmentData) => set((state) => {
        const attachment: Attachment = {
          ...attachmentData,
          id: generateId(),
          uploadedAt: new Date(),
        };
        state.attachments.push(attachment);
        
        // Add attachment activity
        const activity: Activity = {
          id: generateId(),
          type: 'attachment_added',
          description: `прикрепил файл ${attachment.name}`,
          taskId: attachment.taskId,
          userId: attachment.uploadedBy,
          createdAt: new Date(),
        };
        state.activities.push(activity);
      }),
      
      deleteAttachment: (id) => set((state) => {
        state.attachments = state.attachments.filter(a => a.id !== id);
      }),
      
      // Time entry actions
      addTimeEntry: (timeEntryData) => set((state) => {
        const timeEntry: TimeEntry = {
          ...timeEntryData,
          id: generateId(),
          createdAt: new Date(),
        };
        state.timeEntries.push(timeEntry);
        
        // Update task logged hours
        const taskIndex = state.tasks.findIndex(t => t.id === timeEntry.taskId);
        if (taskIndex !== -1) {
          const currentHours = state.tasks[taskIndex].loggedHours || 0;
          state.tasks[taskIndex].loggedHours = currentHours + timeEntry.hours;
          state.tasks[taskIndex].updatedAt = new Date();
        }
      }),
      
      deleteTimeEntry: (id) => set((state) => {
        const timeEntry = state.timeEntries.find(te => te.id === id);
        if (timeEntry) {
          // Update task logged hours
          const taskIndex = state.tasks.findIndex(t => t.id === timeEntry.taskId);
          if (taskIndex !== -1) {
            const currentHours = state.tasks[taskIndex].loggedHours || 0;
            state.tasks[taskIndex].loggedHours = Math.max(0, currentHours - timeEntry.hours);
            state.tasks[taskIndex].updatedAt = new Date();
          }
        }
        state.timeEntries = state.timeEntries.filter(te => te.id !== id);
      }),
      
      // UI actions
      setSelectedProject: (id) => set((state) => {
        state.selectedProjectId = id;
      }),
      
      setSelectedSprint: (id) => set((state) => {
        state.selectedSprintId = id;
      }),
      
      // Settings actions
      updateSettings: (newSettings) => set((state) => {
        state.settings = { ...state.settings, ...newSettings };
      }),
      resetSettings: () => set((state) => {
        state.settings = {
          language: "ru",
          timezone: "Europe/Moscow",
          dateFormat: "DD.MM.YYYY",
          timeFormat: "24h",
          pushNotifications: true,
          emailNotifications: true,
          soundEnabled: true,
          taskReminders: true,
          projectUpdates: true,
          mentionNotifications: true,
          profileVisibility: "team",
          activityTracking: true,
          dataCollection: false,
          theme: "system",
          compactMode: false,
          showAvatars: true,
          animationsEnabled: true,
          showStoryPoints: true,
          autoSave: true,
          autoBackup: true,
          cacheSize: "100MB",
          syncInterval: "5min",
          autoExportBackups: false,
          exportFormat: "json",
          includeAttachments: true,
        };
      }),
      
      // Initialization
      initializeWithDemoData: () => set((state) => {
        // Добавляем проекты
        const projectIds = new Map<string, string>();
        initialProjects.forEach((projectData, index) => {
          const projectId = generateId();
          projectIds.set(`project-${index + 1}`, projectId);
          
          const project: Project = {
            ...projectData,
            id: projectId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          state.projects.push(project);
        });
        
        // Добавляем спринты
        const sprintIds = new Map<string, string>();
        initialSprints.forEach((sprintData, index) => {
          const sprintId = generateId();
          sprintIds.set(`sprint-${index + 1}`, sprintId);
          
          const sprint: Sprint = {
            ...sprintData,
            id: sprintId,
            projectId: projectIds.get(sprintData.projectId) || sprintData.projectId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          state.sprints.push(sprint);
        });
        
        // Добавляем задачи
        initialTasks.forEach((taskData) => {
          const task: Task = {
            ...taskData,
            id: generateId(),
            projectId: projectIds.get(taskData.projectId) || taskData.projectId,
            sprintId: sprintIds.get(taskData.sprintId || '') || taskData.sprintId,
            watchers: [],
            attachments: [],
            linkedTasks: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          state.tasks.push(task);
        });
        
        // Устанавливаем первый проект как выбранный
        if (state.projects.length > 0 && !state.selectedProjectId) {
          state.selectedProjectId = state.projects[0].id;
        }
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

export const useSettings = () => useAppStore(state => state.settings);
export const useShowStoryPoints = () => useAppStore(state => state.settings.showStoryPoints);