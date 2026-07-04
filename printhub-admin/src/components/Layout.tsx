import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Users,
  Store,
  FileText,
  CreditCard,
  FileBox,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Printer,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/shops', icon: Store, label: 'Shops' },
  { to: '/orders', icon: FileText, label: 'Orders' },
  { to: '/payments', icon: CreditCard, label: 'Payments' },
  { to: '/cms', icon: FileBox, label: 'CMS' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar transform transition-transform lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-6 h-16 border-b border-sidebar-hover">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">
            Print<span className="text-accent">Hub</span>
          </span>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-hover">
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-6 gap-4">
          <button
            className="lg:hidden text-slate-500 hover:text-slate-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-lg font-semibold text-slate-900 hidden sm:block">
            Admin Dashboard
          </h1>

          <div className="ml-auto flex items-center gap-4">
            <button className="relative text-slate-400 hover:text-slate-600">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            <div className="relative">
              <button
                className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                  {user?.name?.[0] || 'A'}
                </div>
                <span className="hidden sm:block font-medium">{user?.name || 'Admin'}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-50"
                      >
                        Sign out
                      </button>
                    </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
