import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  LayoutDashboard,
  ListTodo,
  PlusCircle,
  CalendarDays,
  Bell,
  BarChart3,
  UserCircle,
  Settings,
  Dumbbell,
  Fuel,
  CalendarPlus,
  Flag,
  Menu,
  X,
} from 'lucide-react';

const mainNavItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/activities', label: 'Activities', icon: ListTodo },
  { path: '/add', label: 'Add Activity', icon: PlusCircle },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/reminders', label: 'Reminders', icon: Bell },
  { path: '/statistics', label: 'Statistics', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: UserCircle },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const quickAddItems = [
  { label: 'Log Exercise', icon: Dumbbell, color: 'bg-emerald-500 hover:bg-emerald-600' },
  { label: 'Refill Gas', icon: Fuel, color: 'bg-blue-500 hover:bg-blue-600' },
  { label: 'Add Appointment', icon: CalendarPlus, color: 'bg-violet-500 hover:bg-violet-600' },
  { label: 'Add Deadline', icon: Flag, color: 'bg-orange-500 hover:bg-orange-600' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Close sidebar when navigating
  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button - Visible on ALL screen sizes */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2.5 bg-[#1A1B2E] text-white rounded-xl shadow-lg hover:bg-[#2A2B3E] transition-all duration-200"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay - clicks close the menu */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - slides in from left on ALL screen sizes */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-[#1A1B2E] text-white flex flex-col transition-all duration-300 z-50 w-[280px]',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10 mt-4">
          <div className="w-10 h-10 rounded-xl bg-[#6C5CE7] flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-lg font-bold leading-tight">LifeTrack</h1>
            <p className="text-xs text-[#A1A5B7]">Track. Plan. Achieve.</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                isActive(item.path)
                  ? 'bg-[#6C5CE7] text-white'
                  : 'text-[#A1A5B7] hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.path === '/reminders' && state.reminders.filter(r => !r.dismissed).length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {state.reminders.filter(r => !r.dismissed).length}
                </span>
              )}
            </button>
          ))}

          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-[#A1A5B7] uppercase tracking-wider">Quick Add</p>
          </div>
          <div className="space-y-2 px-1">
            {quickAddItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavigate('/add')}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200',
                  item.color
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
        {/* Signature at bottom of sidebar */}
        <div className="px-3 py-4 border-t border-white/10 mt-auto">
          <p className="text-xs text-center text-[#A1A5B7]">
            Made with ❤️ by Emmanuel Ndogo
          </p>
        </div>
      </aside>
    </>
  );
}