const API_BASE_URL = 'http://localhost:3001/api';

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

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData.code
      );
    }

    return await response.json();
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
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteProject: (id: string) => apiRequest(`/projects/${id}`, {
    method: 'DELETE',
  }),

  // Задачи
  getTasks: (projectId?: string) => 
    apiRequest(`/tasks${projectId ? `?projectId=${projectId}` : ''}`),
  getTask: (id: string) => apiRequest(`/tasks/${id}`),
  createTask: (data: any) => apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTask: (id: string, data: any) => apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteTask: (id: string) => apiRequest(`/tasks/${id}`, {
    method: 'DELETE',
  }),

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
};