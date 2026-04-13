import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, CalendarDays, Wallet, LogOut, Menu, X,
  TrendingUp, ChevronRight,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/schedule', icon: CalendarDays, label: 'Schedule' },
  { to: '/finance', icon: Wallet, label: 'Finance' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'FT';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#2a2a38]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-glow-sm">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#f1f0ff]">FinTrack</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
                  : 'text-[#a09db5] hover:bg-[#1e1e2a] hover:text-[#f1f0ff]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-violet-400' : 'text-current'} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-violet-400/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-[#2a2a38]">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#1a1a24]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#f1f0ff] truncate">{user?.name}</p>
            <p className="text-xs text-[#6b6880] truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-[#6b6880] hover:text-rose-400 hover:bg-rose-400/10 transition-all duration-200"
            title="Logout"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-[#0d0d14] border-r border-[#2a2a38] fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#0d0d14] border-r border-[#2a2a38] z-50 transform transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-60">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#2a2a38] bg-[#0d0d14] sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
              <TrendingUp size={14} className="text-white" />
            </div>
            <span className="font-bold text-[#f1f0ff]">FinTrack</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-[#a09db5] hover:bg-[#1e1e2a] transition-colors"
          >
            <Menu size={20} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
