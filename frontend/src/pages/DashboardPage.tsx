import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Clock, ListTodo, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';

function StatCard({ label, value, icon: Icon, colorClass }: {
  label: string; value: number; icon: React.ElementType; colorClass: string;
}) {
  return (
    <div className="card p-5 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-surface-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-semibold text-surface-100 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { stats, tasks, fetchStats, fetchTasks, isLoading } = useTaskStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchStats();
    fetchTasks();
  }, []);

  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl font-semibold text-surface-100">
          Good {getTimeOfDay()}, <span className="text-brand-400">{user?.fullName || user?.username}</span> 👋
        </h1>
        <p className="text-surface-400 mt-1">Here's your task overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Tasks"
          value={stats?.total ?? 0}
          icon={ListTodo}
          colorClass="bg-surface-800 text-surface-300"
        />
        <StatCard
          label="To Do"
          value={stats?.todo ?? 0}
          icon={ListTodo}
          colorClass="bg-surface-800 text-surface-400"
        />
        <StatCard
          label="In Progress"
          value={stats?.inProgress ?? 0}
          icon={Clock}
          colorClass="bg-blue-900/50 text-blue-400"
        />
        <StatCard
          label="Completed"
          value={stats?.done ?? 0}
          icon={CheckSquare}
          colorClass="bg-brand-900/50 text-brand-400"
        />
      </div>

      {/* Progress Bar */}
      {stats && stats.total > 0 && (
        <div className="card p-5 mb-8 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-400" />
              <span className="text-sm font-medium text-surface-200">Overall Progress</span>
            </div>
            <span className="text-sm font-semibold text-brand-400">
              {Math.round((stats.done / stats.total) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-700"
              style={{ width: `${(stats.done / stats.total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-surface-500 mt-2">{stats.done} of {stats.total} tasks completed</p>
        </div>
      )}

      {/* AI Feature Banner */}
      <div className="relative overflow-hidden card p-5 mb-8 border-brand-900/50 animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/50 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600/20 rounded-lg flex items-center justify-center border border-brand-700/50">
              <Zap size={18} className="text-brand-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-surface-100">AI Task Assistant</p>
              <p className="text-xs text-surface-400">Let AI generate task descriptions and priority</p>
            </div>
          </div>
          <Link to="/tasks" className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5">
            Try it <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-surface-200">Recent Tasks</h2>
          <Link to="/tasks" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-surface-800 rounded w-1/3 mb-2" />
                <div className="h-3 bg-surface-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="card p-8 text-center">
            <ListTodo size={32} className="mx-auto text-surface-600 mb-3" />
            <p className="text-surface-400 text-sm">No tasks yet.</p>
            <Link to="/tasks" className="btn-primary text-sm mt-3 inline-block">Create your first task</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTasks.map((task) => (
              <div key={task.id} className="card-hover p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      task.status === 'DONE' ? 'bg-brand-500' :
                      task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-surface-600'
                    }`} />
                    <p className={`text-sm font-medium truncate ${task.status === 'DONE' ? 'line-through text-surface-500' : 'text-surface-200'}`}>
                      {task.title}
                    </p>
                    {task.aiGenerated && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-brand-900/30 text-brand-500 border border-brand-900/50 shrink-0">AI</span>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-md shrink-0 ml-3 ${
                    task.priority === 'CRITICAL' ? 'bg-red-900/50 text-red-400' :
                    task.priority === 'HIGH' ? 'bg-orange-900/50 text-orange-400' :
                    task.priority === 'MEDIUM' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-surface-800 text-surface-500'
                  }`}>{task.priority}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
