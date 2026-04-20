import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const loc = useLocation();

const nav = [
  { path: '/', label: '🏠 Dashboard' },
  { path: '/medicines', label: '💊 Medicines' },
  { path: '/reminders', label: '🔔 Reminders' },
  { path: '/logs', label: '📋 Logs' },
];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
          <span className="text-xl font-bold text-green-600">💊 MediTrack</span>
          <div className="flex gap-4 items-center">
            {nav.map(n => (
              <Link key={n.path} to={n.path}
                className={`text-sm font-medium px-3 py-1 rounded-full transition ${
                  loc.pathname === n.path 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-500 hover:text-green-600'
                }`}
              >{n.label}</Link>
            ))}
            <button onClick={logout} className="text-sm text-red-400 hover:text-red-600 ml-2">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}