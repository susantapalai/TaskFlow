import { useState } from 'react';
import { Edit2, Trash2, Calendar, Clock, Sparkles, ChevronDown } from 'lucide-react';
import type { Task, TaskStatus } from '../../types';
import { useTaskStore } from '../../store/taskStore';
import { getStatusBadgeClass, getPriorityBadgeClass, getStatusLabel, getPriorityLabel, formatDate, isOverdue } from '../../utils/helpers';
import ConfirmDialog from '../ui/ConfirmDialog';
import toast from 'react-hot-toast';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const STATUS_OPTIONS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

export default function TaskCard({ task, onEdit }: TaskCardProps) {
  const { updateStatus, deleteTask } = useTaskStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStatusChange = async (status: TaskStatus) => {
    setShowStatusMenu(false);
    if (status === task.status) return;
    setIsUpdatingStatus(true);
    try {
      await updateStatus(task.id, status);
      toast.success(`Moved to "${getStatusLabel(status)}"`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteConfirmed = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
      setIsDeleting(false);
    }
  };

  const overdue = isOverdue(task.dueDate) && task.status !== 'DONE';

  return (
    <>
      <div className={`card-hover p-4 group animate-slide-up transition-opacity ${isDeleting ? 'opacity-40 pointer-events-none' : ''} ${task.status === 'DONE' ? 'opacity-60' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-sm font-medium leading-snug ${task.status === 'DONE' ? 'line-through text-surface-500' : 'text-surface-100'}`}>
                {task.title}
              </h3>
              {task.aiGenerated && (
                <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-brand-900/30 text-brand-500 border border-brand-900/50 shrink-0">
                  <Sparkles size={10} /> AI
                </span>
              )}
            </div>
          </div>

          {/* Actions — visible on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-surface-500 hover:text-surface-200 hover:bg-surface-800 transition-all"
              title="Edit task"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-surface-500 hover:text-red-400 hover:bg-red-950/30 transition-all disabled:opacity-50"
              title="Delete task"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-surface-500 mb-3 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between flex-wrap gap-2 mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                disabled={isUpdatingStatus}
                className={`${getStatusBadgeClass(task.status)} flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity`}
              >
                {isUpdatingStatus && (
                  <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                )}
                {getStatusLabel(task.status)}
                <ChevronDown size={10} />
              </button>

              {showStatusMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
                  <div className="absolute left-0 top-full mt-1.5 z-20 bg-surface-800 border border-surface-700 rounded-xl shadow-xl py-1.5 min-w-[140px]">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-surface-700 transition-colors flex items-center gap-2 ${s === task.status ? 'text-brand-400' : 'text-surface-300'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          s === 'DONE' ? 'bg-brand-500' :
                          s === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-surface-500'
                        }`} />
                        {getStatusLabel(s)}
                        {s === task.status && <span className="ml-auto text-brand-600">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <span className={getPriorityBadgeClass(task.priority)}>
              {getPriorityLabel(task.priority)}
            </span>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-surface-500">
            {task.estimatedEffort && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {task.estimatedEffort}
              </span>
            )}
            {task.dueDate && (
              <span className={`flex items-center gap-1 ${overdue ? 'text-red-400 font-medium' : ''}`}>
                <Calendar size={11} />
                {formatDate(task.dueDate)}
                {overdue && ' · Overdue'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete task?"
          message={`"${task.title}" will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
}
