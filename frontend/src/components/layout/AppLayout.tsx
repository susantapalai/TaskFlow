import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, LogOut, Zap, User, ServerCrash } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showWakeUp, setShowWakeUp] = useState(() => {
    // Show banner only once per session
    const shown = sessionStorage.getItem('wakeup_shown');
    return !shown;
  });

  useEffect(() => {
    if (showWakeUp) {
      sessionStorage.setItem('wakeup_shown', 'true');
      const timer = setTimeout(() => setShowWakeUp(false), 45000);
      return () => clearTimeout(timer);
    }
  }, [showWakeUp]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tasks', icon: CheckSquare, label: 'My Tasks' },
  ];

  return (
    <div className="flex h-screen overflow-hidden flex-col">
      {/* Server wake-up banner */}
      {showWakeUp && (
        <div className="flex items-center justify-between gap-3 px-4 py-2 bg-yellow-950/60 border-b border-yellow-800/50 text-yellow-300 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <ServerCrash size={14} className="shrink-0 animate-pulse" />
            <span>⏳ Backend server may be waking up (free tier). If actions fail, wait 30–60 seconds and try again.</span>
          </div>
          <button onClick={() => setShowWakeUp(false)} className="text-yellow-500 hover:text-yellow-300 font-bold shrink-0 px-1">✕</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 bg-surface-900 border-r border-surface-800 flex flex-col shrink-0">
          {/* Logo */}
          <div className="px-5 py-5 border-b border-surface-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-semibold text-surface-100 tracking-tight">TaskFlow</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-brand-900/50 text-brand-400 border border-brand-800/50 font-mono ml-auto">AI</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-900/50 text-brand-400 border border-brand-800/50'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800'
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User */}
          <div className="px-3 py-4 border-t border-surface-800">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-brand-700 flex items-center justify-center shrink-0">
                <User size={14} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-200 truncate">{user?.fullName || user?.username}</p>
                <p className="text-xs text-surface-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-400 hover:text-red-400 hover:bg-red-950/30 transition-all duration-150 mt-1"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

