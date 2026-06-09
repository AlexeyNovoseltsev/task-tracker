const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getAuthHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem('auth_tokens');
    if (!raw) return {};
    const tokens = JSON.parse(raw) as { access?: string };
    return tokens.access ? { Authorization: `Bearer ${tokens.access}` } : {};
  } catch {
    return {};
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function extractApiError(json: Record<string, unknown>, status: number): ApiError {
  const raw = json.error;
  if (typeof raw === 'object' && raw && 'message' in raw) {
    const errObj = raw as { message: string; code?: string };
    return new ApiError(errObj.message, status, errObj.code);
  }
  if (typeof raw === 'string') {
    return new ApiError(raw, status, json.code as string | undefined);
  }
  return new ApiError(
    (json.message as string) || `HTTP ${status}`,
    status,
    json.code as string | undefined
  );
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    const json = await response.json().catch(() => ({}));

    if (!response.ok || json.success === false) {
      throw extractApiError(json, response.status);
    }

    if (json && typeof json.success === 'boolean' && 'data' in json) {
      return json.data as T;
    }

    return json as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Сетевая ошибка',
      0
    );
  }
}

export const api = {
  // Проекты
  getProjects: () => apiRequest('/projects'),
  getProject: (id: string) => apiRequest(`/projects/${id}`),
  createProject: (data: any) => apiRequest('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProject: (id: string, data: any) => apiRequest(`/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteProject: (id: string) => apiRequest(`/projects/${id}`, {
    method: 'DELETE',
  }),
  getProjectMembers: (projectId: string) => apiRequest(`/projects/${projectId}/members`),

  // Пользователи
  getUsers: () => apiRequest('/users'),
  getUser: (id: string) => apiRequest(`/users/${id}`),

  // Задачи
  getTasks: (projectId?: string) => 
    apiRequest(`/tasks${projectId ? `?project_id=${projectId}` : ''}`),
  getTask: (id: string) => apiRequest(`/tasks/${id}`),
  createTask: (data: any) => apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTask: (id: string, data: any) => apiRequest(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteTask: (id: string) => apiRequest(`/tasks/${id}`, {
    method: 'DELETE',
  }),
  getTaskWatchers: (taskId: string) => apiRequest(`/tasks/${taskId}/watchers`),
  watchTask: (taskId: string) => apiRequest(`/tasks/${taskId}/watch`, { method: 'POST' }),
  unwatchTask: (taskId: string) => apiRequest(`/tasks/${taskId}/watch`, { method: 'DELETE' }),
  addTaskWatcher: (taskId: string, userId: string) =>
    apiRequest(`/tasks/${taskId}/watchers`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    }),
  removeTaskWatcher: (taskId: string, userId: string) =>
    apiRequest(`/tasks/${taskId}/watchers/${userId}`, { method: 'DELETE' }),
  getTaskActivities: (taskId: string) => apiRequest(`/tasks/${taskId}/activities`),

  // Спринты
  getSprints: (projectId?: string) => 
    apiRequest(`/sprints${projectId ? `?projectId=${projectId}` : ''}`),
  getSprint: (id: string) => apiRequest(`/sprints/${id}`),
  createSprint: (data: any) => apiRequest('/sprints', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateSprint: (id: string, data: any) => apiRequest(`/sprints/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteSprint: (id: string) => apiRequest(`/sprints/${id}`, {
    method: 'DELETE',
  }),

  // Комментарии
  getComments: (taskId: string) => apiRequest(`/comments?taskId=${taskId}`),
  createComment: (data: any) => apiRequest('/comments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateComment: (id: string, data: any) => apiRequest(`/comments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteComment: (id: string) => apiRequest(`/comments/${id}`, {
    method: 'DELETE',
  }),

  // Аналитика
  getAnalytics: (projectId: string) => apiRequest(`/analytics?projectId=${projectId}`),

  // Проверка здоровья сервера
  health: () => apiRequest('/health'),
  
  // Тест базы данных (без авторизации)
  testDatabase: () => apiRequest('/health/database'),

  // Избранное
  getFavorites: () => apiRequest('/favorites'),
  addToFavorites: (data: any) => apiRequest('/favorites', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateFavorite: (id: string, data: any) => apiRequest(`/favorites/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  removeFromFavorites: (id: string) => apiRequest(`/favorites/${id}`, {
    method: 'DELETE',
  }),
  checkIfFavorited: (itemType: string, itemId: string) => 
    apiRequest(`/favorites/check/${itemType}/${itemId}`),
};