import apiClient from './client';
import type { ApiResponse, Task, TaskRequest, TaskStats, TaskStatus, TaskPriority, AiSuggestion } from '../types';

export const tasksApi = {
  getAll: async (status?: TaskStatus | '', priority?: TaskPriority | ''): Promise<Task[]> => {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    if (priority) params.priority = priority;
    const { data } = await apiClient.get<ApiResponse<Task[]>>('/tasks', { params });
    return data.data;
  },

  getById: async (id: number): Promise<Task> => {
    const { data } = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return data.data;
  },

  create: async (payload: TaskRequest): Promise<Task> => {
    const { data } = await apiClient.post<ApiResponse<Task>>('/tasks', payload);
    return data.data;
  },

  update: async (id: number, payload: TaskRequest): Promise<Task> => {
    const { data } = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, payload);
    return data.data;
  },

  updateStatus: async (id: number, status: TaskStatus): Promise<Task> => {
    const { data } = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/status`, null, {
      params: { status }
    });
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },

  getStats: async (): Promise<TaskStats> => {
    const { data } = await apiClient.get<ApiResponse<TaskStats>>('/tasks/stats');
    return data.data;
  },

  generateAi: async (title: string): Promise<AiSuggestion> => {
    const { data } = await apiClient.post<ApiResponse<AiSuggestion>>('/ai/generate', { title });
    return data.data;
  },
};
