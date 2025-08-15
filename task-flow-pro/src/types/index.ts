export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'todo' | 'in-progress' | 'in-review' | 'done';
export type TaskType = 'story' | 'bug' | 'epic' | 'task';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  key: string; // e.g., "PROJ"
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Epic {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  status: Status;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  status: Status;
  priority: Priority;
  storyPoints?: number;
  position?: number;
  projectId: string;
  epicId?: string;
  assigneeId?: string;
  reporterId?: string;
  sprintId?: string;
  labels: string[];
  dueDate?: Date;
  estimatedHours?: number;
  loggedHours?: number;
  color?: string; // Цвет карточки задачи в календаре
  watchers: string[]; // user IDs
  attachments: Attachment[];
  linkedTasks: TaskLink[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  id: string;
  name: string;
  goal?: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  capacity?: number;
  status: 'planned' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  type: 'created' | 'updated' | 'commented' | 'assigned' | 'status_changed' | 'priority_changed' | 'due_date_changed' | 'attachment_added' | 'link_added' | 'watcher_added';
  description: string;
  taskId?: string;
  projectId?: string;
  userId: string;
  metadata?: Record<string, any>; // for storing additional context
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string; // MIME type
  url: string;
  taskId: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface TaskLink {
  id: string;
  sourceTaskId: string;
  targetTaskId: string;
  relationship: 'blocks' | 'blocked_by' | 'relates_to' | 'duplicates' | 'subtask_of';
  createdBy: string;
  createdAt: Date;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  description?: string;
  hours: number;
  date: Date;
  createdAt: Date;
}

// Favorites types
export interface Favorite {
  id: string;
  userId: string;
  itemType: 'project' | 'task' | 'sprint';
  itemId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FavoriteWithDetails extends Favorite {
  project?: Project;
  task?: Task;
  sprint?: Sprint;
}

export interface CreateFavoriteRequest {
  itemType: 'project' | 'task' | 'sprint';
  itemId: string;
  notes?: string;
}

export interface UpdateFavoriteRequest {
  notes?: string;
} 