import type { TaskPriority, TaskStatus } from '../../types';
import { getStatusBadgeClass, getPriorityBadgeClass, getStatusLabel, getPriorityLabel } from '../../utils/helpers';

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={getStatusBadgeClass(status)}>{getStatusLabel(status)}</span>;
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const dots: Record<TaskPriority, string> = {
    LOW: 'bg-surface-500',
    MEDIUM: 'bg-yellow-500',
    HIGH: 'bg-orange-500',
    CRITICAL: 'bg-red-500',
  };
  return (
    <span className={getPriorityBadgeClass(priority)}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${dots[priority]}`} />
      {getPriorityLabel(priority)}
    </span>
  );
}
