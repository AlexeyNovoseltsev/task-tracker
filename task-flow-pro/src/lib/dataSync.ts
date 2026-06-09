import { api } from '@/lib/api';

import type { Project, Task } from '@/types';



const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;



export function isApiMode(): boolean {

  try {

    const raw = localStorage.getItem('auth_tokens');

    if (!raw) return false;

    const tokens = JSON.parse(raw) as { access?: string };

    return Boolean(tokens.access);

  } catch {

    return false;

  }

}



export function isUuid(value?: string | null): boolean {

  return Boolean(value && UUID_RE.test(value));

}



function mapPriority(priority: string): 'low' | 'medium' | 'high' {

  if (priority === 'urgent') return 'high';

  if (priority === 'low' || priority === 'medium' || priority === 'high') return priority;

  return 'medium';

}



function optionalUuid(value?: string): string | undefined {

  return value && UUID_RE.test(value) ? value : undefined;

}



export function taskFromApi(row: Record<string, unknown>): Task {

  return {

    id: String(row.id),

    title: String(row.title),

    description: row.description ? String(row.description) : undefined,

    type: row.type as Task['type'],

    status: row.status as Task['status'],

    priority: row.priority as Task['priority'],

    storyPoints: row.story_points != null ? Number(row.story_points) : undefined,

    projectId: row.project_id ? String(row.project_id) : undefined,

    epicId: row.epic_id ? String(row.epic_id) : undefined,

    assigneeId: row.assignee_id ? String(row.assignee_id) : undefined,

    coAssigneeIds: Array.isArray(row.co_assignee_ids)
      ? (row.co_assignee_ids as string[]).map(String)
      : [],

    reporterId: row.reporter_id ? String(row.reporter_id) : undefined,

    sprintId: row.sprint_id ? String(row.sprint_id) : undefined,

    labels: Array.isArray(row.labels) ? (row.labels as string[]) : [],

    dueDate: row.due_date ? new Date(String(row.due_date)) : undefined,

    estimatedHours: row.estimated_hours != null ? Number(row.estimated_hours) : undefined,

    loggedHours: row.logged_hours != null ? Number(row.logged_hours) : undefined,

    color: row.color ? String(row.color) : undefined,

    watchers: Array.isArray(row.watcher_ids)
      ? (row.watcher_ids as string[]).map(String)
      : Array.isArray(row.watchers)
        ? (row.watchers as string[]).map(String)
        : [],

    attachments: [],

    linkedTasks: [],

    createdAt: new Date(String(row.created_at)),

    updatedAt: new Date(String(row.updated_at)),

  };

}



export function taskToApi(

  task: Partial<Task>,

  projectId?: string

): Record<string, unknown> {

  const body: Record<string, unknown> = {

    title: task.title,

    description: task.description,

    type: task.type || 'task',

    status: task.status || 'todo',

    priority: mapPriority(task.priority || 'medium'),

    story_points: task.storyPoints,

    assignee_id: optionalUuid(task.assigneeId),

    co_assignee_ids: (task.coAssigneeIds || []).filter((id) => isUuid(id)),

    labels: task.labels || [],

    due_date: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,

    color: task.color,

  };



  if (projectId && isUuid(projectId)) {

    body.project_id = projectId;

  }



  return body;

}



export function userFromApi(row: Record<string, unknown>): import('@/types').User {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    avatar: row.avatar_url ? String(row.avatar_url) : undefined,
  };
}

export async function fetchUsersFromApi(): Promise<import('@/types').User[]> {
  const rows = await api.getUsers() as Record<string, unknown>[];
  return Array.isArray(rows) ? rows.map(userFromApi) : [];
}

export function projectFromApi(row: Record<string, unknown>): Project {

  return {

    id: String(row.id),

    name: String(row.name),

    description: row.description ? String(row.description) : undefined,

    key: String(row.key),

    color: String(row.color || '#3B82F6'),

    createdAt: new Date(String(row.created_at)),

    updatedAt: new Date(String(row.updated_at)),

  };

}



export async function fetchAllFromApi(): Promise<{ projects: Project[]; tasks: Task[] }> {

  const projectsRaw = await api.getProjects() as Record<string, unknown>[];

  const projects = projectsRaw.map(projectFromApi);



  const [projectTaskGroups, personalTasksRaw] = await Promise.all([

    Promise.all(

      projects.map(async (project) => {

        const rows = await api.getTasks(project.id) as Record<string, unknown>[];

        return rows.map(taskFromApi);

      })

    ),

    api.getTasks() as Promise<Record<string, unknown>[]>,

  ]);



  const personalTasks = personalTasksRaw.map(taskFromApi);

  const projectTasks = projectTaskGroups.flat();



  return {

    projects,

    tasks: [...projectTasks, ...personalTasks],

  };

}



export async function createProjectInApi(

  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>

): Promise<Project> {

  const row = await api.createProject({

    name: data.name,

    description: data.description,

    key: data.key,

    color: data.color,

  }) as Record<string, unknown>;

  return projectFromApi(row);

}



export async function createTaskInApi(

  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'watchers' | 'attachments' | 'linkedTasks'>,

  projectId?: string

): Promise<Task> {

  const row = await api.createTask(taskToApi(task, projectId)) as Record<string, unknown>;

  return taskFromApi(row);

}



export async function updateTaskInApi(taskId: string, updates: Partial<Task>): Promise<Task> {

  const body: Record<string, unknown> = {};

  if (updates.title !== undefined) body.title = updates.title;

  if (updates.description !== undefined) body.description = updates.description;

  if (updates.type !== undefined) body.type = updates.type;

  if (updates.status !== undefined) body.status = updates.status;

  if (updates.priority !== undefined) body.priority = mapPriority(updates.priority);

  if (updates.storyPoints !== undefined) body.story_points = updates.storyPoints;

  if (updates.assigneeId !== undefined) {
    if (updates.assigneeId && !isUuid(updates.assigneeId)) {
      throw new Error('Исполнитель должен быть пользователем из облака (UUID)');
    }
    body.assignee_id = updates.assigneeId ? updates.assigneeId : null;
  }

  if (updates.coAssigneeIds !== undefined) {
    const invalid = updates.coAssigneeIds.filter((id) => !isUuid(id));
    if (invalid.length > 0) {
      throw new Error('Соисполнители должны быть пользователями из облака (UUID)');
    }
    body.co_assignee_ids = updates.coAssigneeIds;
  }

  if (updates.projectId !== undefined) {
    body.project_id = updates.projectId && isUuid(updates.projectId) ? updates.projectId : null;
  }

  if (updates.labels !== undefined) body.labels = updates.labels;

  if (updates.dueDate !== undefined) {

    body.due_date = updates.dueDate ? new Date(updates.dueDate).toISOString() : null;

  }

  if (updates.color !== undefined) body.color = updates.color;



  const row = await api.updateTask(taskId, body) as Record<string, unknown>;

  return taskFromApi(row);

}



export async function deleteTaskInApi(taskId: string): Promise<void> {

  await api.deleteTask(taskId);

}


