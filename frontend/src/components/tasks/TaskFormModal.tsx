import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import type { Task, TaskPriority, TaskStatus } from '../../types';
import toast from 'react-hot-toast';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  dueDate: z.string().optional(),
  estimatedEffort: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface TaskFormModalProps {
  task?: Task | null;
  onClose: () => void;
}

export default function TaskFormModal({ task, onClose }: TaskFormModalProps) {
  const { createTask, updateTask, generateAi, isAiLoading } = useTaskStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasAiGenerated, setWasAiGenerated] = useState(false);
  const isEdit = Boolean(task);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: task ? {
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate || '',
      estimatedEffort: task.estimatedEffort || '',
    } : { status: 'TODO', priority: 'MEDIUM' },
  });

  const titleValue = watch('title');

  const handleAiGenerate = async () => {
    if (!titleValue?.trim()) {
      toast.error('Please enter a title first');
      return;
    }
    try {
      const suggestion = await generateAi(titleValue);
      setValue('description', suggestion.description);
      setValue('priority', suggestion.priority as TaskPriority);
      setValue('estimatedEffort', suggestion.estimatedEffort);
      setWasAiGenerated(true);
      if (suggestion.aiGenerated) {
        toast.success('✨ Gemini AI suggestions applied!');
      } else {
        toast('Smart fallback suggestions applied', {
          icon: '💡',
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' }
        });
      }
    } catch (err: any) {
      const msg = err?.userMessage || 'Failed to generate AI suggestions';
      toast.error(msg);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: data.title,
        description: data.description || undefined,
        status: data.status as TaskStatus,
        priority: data.priority as TaskPriority,
        dueDate: data.dueDate || undefined,
        estimatedEffort: data.estimatedEffort || undefined,
        aiGenerated: !isEdit && wasAiGenerated,
      };

      if (isEdit && task) {
        await updateTask(task.id, payload);
        toast.success('Task updated successfully');
      } else {
        await createTask(payload);
        toast.success('Task created successfully ✅');
      }
      onClose();
    } catch (err: any) {
      const msg = err?.userMessage || err?.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} task`;
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-800">
          <h2 className="text-base font-semibold text-surface-100">
            {isEdit ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Title + AI Button */}
          <div>
            <label className="label">Title *</label>
            <div className="flex gap-2">
              <input
                {...register('title')}
                className="input flex-1"
                placeholder="e.g. Prepare client presentation"
              />
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={isAiLoading}
                title="Generate with AI"
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-900/50 border border-brand-800/50 text-brand-400 hover:bg-brand-900 hover:text-brand-300 transition-all duration-150 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAiLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                {isAiLoading ? 'Generating...' : 'AI Fill'}
              </button>
            </div>
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
            <p className="text-surface-600 text-xs mt-1.5">
              Enter a title then click <span className="text-brand-500">AI Fill</span> to auto-generate description & priority
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea
              {...register('description')}
              className="input min-h-[90px] resize-y"
              placeholder="Task description..."
            />
          </div>

          {/* Row: Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select {...register('priority')} className="input">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          {/* Row: Due Date + Effort */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due Date</label>
              <input {...register('dueDate')} type="date" className="input" />
            </div>
            <div>
              <label className="label">Est. Effort</label>
              <input
                {...register('estimatedEffort')}
                className="input"
                placeholder="e.g. 4 hours"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEdit ? 'Saving...' : 'Creating...'}
                </span>
              ) : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
