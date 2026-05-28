import { create } from 'zustand';
import type { Task, TaskFilter, TaskPriority, TaskRequest, TaskStats, TaskStatus } from '../types';
import { tasksApi } from '../api/tasks';

interface TaskState {
  tasks: Task[];
  stats: TaskStats | null;
  filter: TaskFilter;
  isLoading: boolean;
  isAiLoading: boolean;
  fetchTasks: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createTask: (payload: TaskRequest) => Promise<Task>;
  updateTask: (id: number, payload: TaskRequest) => Promise<Task>;
  updateStatus: (id: number, status: TaskStatus) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  setFilter: (filter: TaskFilter) => void;
  generateAi: (title: string) => Promise<import('../types').AiSuggestion>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  stats: null,
  filter: {},
  isLoading: false,
  isAiLoading: false,

  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const { filter } = get();
      const tasks = await tasksApi.getAll(
        filter.status as TaskStatus | undefined,
        filter.priority as TaskPriority | undefined
      );
      set({ tasks, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await tasksApi.getStats();
      set({ stats });
    } catch (e) {
      console.error('Failed to fetch stats', e);
    }
  },

  createTask: async (payload) => {
    const task = await tasksApi.create(payload);
    // Re-fetch from server to ensure list is in sync
    await get().fetchTasks();
    get().fetchStats();
    return task;
  },

  updateTask: async (id, payload) => {
    const updated = await tasksApi.update(id, payload);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }));
    return updated;
  },

  updateStatus: async (id, status) => {
    const updated = await tasksApi.updateStatus(id, status);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }));
    get().fetchStats();
  },

  deleteTask: async (id) => {
    await tasksApi.delete(id);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    get().fetchStats();
  },

  setFilter: (filter) => {
    set({ filter });
  },

  generateAi: async (title) => {
    set({ isAiLoading: true });
    try {
      const suggestion = await tasksApi.generateAi(title);
      return suggestion;
    } finally {
      set({ isAiLoading: false });
    }
  },
}));
