import { useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Произошла неизвестная ошибка';
      
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Специализированные хуки для разных API операций
export function useProjects() {
  const { execute, ...state } = useApi<any[]>();
  
  const fetchProjects = useCallback(() => 
    execute(() => api.getProjects()), [execute]);
    
  const createProject = useCallback((data: any) => 
    execute(() => api.createProject(data)), [execute]);
    
  return {
    ...state,
    fetchProjects,
    createProject,
  };
}

export function useTasks() {
  const { execute, ...state } = useApi<any[]>();
  
  const fetchTasks = useCallback((projectId?: string) => 
    execute(() => api.getTasks(projectId)), [execute]);
    
  const createTask = useCallback((data: any) => 
    execute(() => api.createTask(data)), [execute]);
    
  return {
    ...state,
    fetchTasks,
    createTask,
  };
}

export function useApiHealth() {
  const { execute, ...state } = useApi<any>();
  
  const checkHealth = useCallback(() => 
    execute(() => api.health()), [execute]);
    
  return {
    ...state,
    checkHealth,
  };
}