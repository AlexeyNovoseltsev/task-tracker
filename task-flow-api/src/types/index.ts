export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'in-review' | 'done';
export type TaskType = 'story' | 'bug' | 'task' | 'epic';
export type SprintStatus = 'planned' | 'active' | 'completed';
export type ActivityType = 
  | 'created' 
  | 'updated' 
  | 'status_changed' 
  | 'assigned' 
  | 'priority_changed'
  | 'due_date_changed'
  | 'attachment_added'
  | 'link_added'
  | 'watcher_added'
  | 'commented';

// Base interfaces with database fields
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  avatar_url?: string;
  role: 'admin' | 'user' | 'viewer';
  last_active_at?: string;
}

export interface Project extends BaseEntity {
  name: string;
  description?: string;
  key: string;
  color: string;
  owner_id: string;
  is_archived: boolean;
  settings?: {
    default_assignee?: string;
    auto_archive_sprints?: boolean;
    notification_settings?: Record<string, boolean>;
  };
}

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  type: TaskType;
  status: Status;
  priority: Priority;
  story_points?: number;
  project_id: string;
  epic_id?: string;
  assignee_id?: string;
  reporter_id?: string;
  sprint_id?: string;
  labels: string[];
  due_date?: string;
  estimated_hours?: number;
  logged_hours?: number;
  watchers: string[];
  attachments: string[]; // Array of attachment IDs
  linked_tasks: string[]; // Array of linked task IDs
}

export interface Sprint extends BaseEntity {
  name: string;
  goal?: string;
  start_date: string;
  end_date: string;
  status: SprintStatus;
  capacity: number;
  project_id: string;
}

export interface Comment extends BaseEntity {
  content: string;
  task_id: string;
  author_id: string;
  parent_id?: string; // For nested comments
  is_edited: boolean;
  edited_at?: string;
}

export interface Activity extends BaseEntity {
  type: ActivityType;
  description: string;
  task_id: string;
  project_id: string;
  user_id: string;
  metadata?: Record<string, any>;
}

export interface Attachment extends BaseEntity {
  name: string;
  size: number;
  type: string;
  url: string;
  task_id: string;
  uploaded_by: string;
  storage_path: string;
}

export interface TaskLink extends BaseEntity {
  source_task_id: string;
  target_task_id: string;
  link_type: 'blocks' | 'blocked_by' | 'relates_to' | 'duplicates' | 'clones';
  created_by: string;
}

export interface TimeEntry extends BaseEntity {
  description: string;
  hours: number;
  date: string;
  task_id: string;
  user_id: string;
}

export interface ProjectMember extends BaseEntity {
  project_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  invited_by?: string;
  joined_at: string;
}

// API Request/Response types
export interface CreateTaskRequest {
  title: string;
  description?: string;
  type: TaskType;
  priority: Priority;
  story_points?: number;
  project_id: string;
  assignee_id?: string;
  labels?: string[];
  due_date?: string;
  estimated_hours?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  type?: TaskType;
  status?: Status;
  priority?: Priority;
  story_points?: number;
  assignee_id?: string;
  labels?: string[];
  due_date?: string;
  estimated_hours?: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  key: string;
  color?: string;
}

export interface CreateSprintRequest {
  name: string;
  goal?: string;
  start_date: string;
  end_date: string;
  capacity: number;
  project_id: string;
}

export interface CreateCommentRequest {
  content: string;
  task_id: string;
  parent_id?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// WebSocket event types
export interface SocketEvent {
  type: string;
  payload: any;
  room?: string;
  user_id?: string;
  timestamp: string;
}

export interface TaskUpdatedEvent extends SocketEvent {
  type: 'task:updated';
  payload: {
    task: Task;
    changes: Partial<Task>;
  };
}

export interface CommentAddedEvent extends SocketEvent {
  type: 'comment:added';
  payload: {
    comment: Comment;
    task_id: string;
  };
}

export interface ProjectUpdatedEvent extends SocketEvent {
  type: 'project:updated';
  payload: {
    project: Project;
  };
}

export interface UserJoinedEvent extends SocketEvent {
  type: 'user:joined';
  payload: {
    user: AuthUser;
    project_id: string;
  };
}

// Database join types
export interface TaskWithDetails extends Task {
  assignee?: User;
  reporter?: User;
  project: Project;
  sprint?: Sprint;
  comments_count: number;
  activities_count: number;
}

export interface ProjectWithStats extends Project {
  owner: User;
  tasks_count: number;
  completed_tasks_count: number;
  active_sprints_count: number;
  members_count: number;
}

export interface SprintWithTasks extends Sprint {
  project: Project;
  tasks: Task[];
  tasks_count: number;
  completed_tasks_count: number;
}