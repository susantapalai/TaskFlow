import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center mb-4">
        <Icon size={24} className="text-surface-600" />
      </div>
      <h3 className="text-sm font-semibold text-surface-300 mb-1">{title}</h3>
      {description && <p className="text-sm text-surface-600 max-w-xs">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary mt-5 text-sm">
          {action.label}
        </button>
      )}
    </div>
  );
}
