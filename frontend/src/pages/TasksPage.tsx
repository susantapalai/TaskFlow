import { useEffect, useState } from 'react';
import { Plus, Search, Filter, ListTodo, SlidersHorizontal } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import TaskCard from '../components/tasks/TaskCard';
import TaskFormModal from '../components/tasks/TaskFormModal';
import type { Task, TaskPriority, TaskStatus } from '../types';

export default function TasksPage() {
  const { tasks, filter, fetchTasks, setFilter, isLoading } = useTaskStore();
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditTask(null);
  };

  const filtered = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-surface-100">My Tasks</h1>
          <p className="text-surface-400 text-sm mt-0.5">{tasks.length} task{tasks.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3 mb-6 animate-slide-up">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="input pl-9 text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-surface-500" />
          <select
            value={filter.status || ''}
            onChange={(e) => setFilter({ ...filter, status: e.target.value as TaskStatus | '' })}
            className="input text-sm py-1.5 w-auto"
          >
            <option value="">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Priority Filter */}
        <select
          value={filter.priority || ''}
          onChange={(e) => setFilter({ ...filter, priority: e.target.value as TaskPriority | '' })}
          className="input text-sm py-1.5 w-auto"
        >
          <option value="">All Priority</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Clear filters */}
        {(filter.status || filter.priority || search) && (
          <button
            onClick={() => { setFilter({}); setSearch(''); }}
            className="btn-ghost text-xs px-2 py-1.5 text-surface-500"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-4 bg-surface-800 rounded w-1/3 mb-3" />
              <div className="h-3 bg-surface-800 rounded w-2/3 mb-3" />
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-surface-800 rounded" />
                <div className="h-5 w-14 bg-surface-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <ListTodo size={40} className="mx-auto text-surface-700 mb-4" />
          <p className="text-surface-400 font-medium mb-1">
            {search || filter.status || filter.priority ? 'No tasks match your filters' : 'No tasks yet'}
          </p>
          <p className="text-surface-600 text-sm mb-4">
            {search || filter.status || filter.priority
              ? 'Try adjusting your search or filters'
              : 'Create your first task to get started'}
          </p>
          {!search && !filter.status && !filter.priority && (
            <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus size={15} /> Create Task
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TaskFormModal task={editTask} onClose={handleCloseModal} />
      )}
    </div>
  );
}
