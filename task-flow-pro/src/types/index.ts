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
  projectId: string;
  epicId?: string;
  assigneeId?: string;
  reporterId?: string;
  sprintId?: string;
  labels: string[];
  dueDate?: Date;
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
  type: 'created' | 'updated' | 'commented' | 'assigned' | 'status_changed';
  description: string;
  taskId?: string;
  userId: string;
  createdAt: Date;
} 