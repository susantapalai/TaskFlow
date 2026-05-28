import type { TaskPriority, TaskStatus } from '../types';

export const getStatusBadgeClass = (status: TaskStatus): string => {
  switch (status) {
    case 'TODO': return 'badge-todo';
    case 'IN_PROGRESS': return 'badge-in-progress';
    case 'DONE': return 'badge-done';
    default: return 'badge-todo';
  }
};

export const getPriorityBadgeClass = (priority: TaskPriority): string => {
  switch (priority) {
    case 'LOW': return 'badge-low';
    case 'MEDIUM': return 'badge-medium';
    case 'HIGH': return 'badge-high';
    case 'CRITICAL': return 'badge-critical';
    default: return 'badge-medium';
  }
};

export const getStatusLabel = (status: TaskStatus): string => {
  switch (status) {
    case 'TODO': return 'To Do';
    case 'IN_PROGRESS': return 'In Progress';
    case 'DONE': return 'Done';
    default: return status;
  }
};

export const getPriorityLabel = (priority: TaskPriority): string => {
  switch (priority) {
    case 'LOW': return 'Low';
    case 'MEDIUM': return 'Medium';
    case 'HIGH': return 'High';
    case 'CRITICAL': return 'Critical';
    default: return priority;
  }
};

export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const isOverdue = (dueDateStr: string | undefined): boolean => {
  if (!dueDateStr) return false;
  return new Date(dueDateStr) < new Date();
};
