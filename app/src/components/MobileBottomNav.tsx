import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, ListTodo, Plus, CalendarDays, UserCircle } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/activities', label: 'Activities', icon: ListTodo },
  { path: '/add', label: '', icon: Plus, isFab: true },
  { path: '/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/profile', label: 'Profile', icon: UserCircle },
];

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-4 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          if (item.isFab) {
            return (
              <button
                key="add"
                onClick={() => navigate('/add')}
                className="w-14 h-14 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center shadow-lg shadow-[#6C5CE7]/30 -mt-6 hover:scale-105 active:scale-95 transition-transform"
              >
                <Plus className="w-6 h-6" />
              </button>
            );
          }

          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors',
                isActive ? 'text-[#6C5CE7]' : 'text-gray-400'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
