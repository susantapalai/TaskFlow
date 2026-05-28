import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onConfirm, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-surface-900 border border-surface-800 rounded-2xl shadow-2xl p-6 animate-slide-up">
        <div className="flex items-start gap-4">
          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            variant === 'danger' ? 'bg-red-900/50' : 'bg-yellow-900/50'
          }`}>
            <AlertTriangle size={18} className={variant === 'danger' ? 'text-red-400' : 'text-yellow-400'} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-surface-100 mb-1">{title}</h3>
            <p className="text-sm text-surface-400">{message}</p>
          </div>
          <button onClick={onCancel} className="shrink-0 text-surface-600 hover:text-surface-400 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onCancel} className="btn-secondary flex-1 py-2 text-sm">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-yellow-600 hover:bg-yellow-500 text-white'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
