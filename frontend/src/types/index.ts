export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  userId: number;
  username: string;
  email: string;
  fullName?: string;
  token: string;
  tokenType: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  estimatedEffort?: string;
  aiGenerated: boolean;
  userId: number;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  estimatedEffort?: string;
  aiGenerated?: boolean;
}

export interface AiSuggestion {
  description: string;
  priority: TaskPriority;
  estimatedEffort: string;
  aiGenerated: boolean;
  fallbackReason?: string;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export type TaskFilter = {
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
};
