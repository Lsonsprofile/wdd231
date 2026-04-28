import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, ListTodo, Plus, CalendarDays, UserCircle, ChevronUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const navRef = useRef<HTMLElement>(null);

  // Handle scroll to hide/show bottom nav
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Handle touch/swipe on the nav
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touchEnd = e.touches[0].clientY;
    const diff = touchStart - touchEnd;
    
    // Swipe down to show, swipe up to hide
    if (diff > 50 && isVisible) {
      setIsVisible(false);
    } else if (diff < -50 && !isVisible) {
      setIsVisible(true);
    }
  };

  return (
    <>
      {/* Show button when nav is hidden */}
      <button
        onClick={() => setIsVisible(true)}
        className={cn(
          'lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-[#6C5CE7] text-white rounded-full shadow-lg transition-all duration-300 hover:bg-[#5b4cd6] active:scale-95',
          isVisible ? 'opacity-0 pointer-events-none scale-0' : 'opacity-100 pointer-events-auto scale-100'
        )}
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      {/* Bottom Navigation */}
      <nav
        ref={navRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        className={cn(
          'lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-4 py-2 transition-transform duration-300 ease-out'
        )}
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)'
        }}
      >
        {/* Drag handle indicator */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>

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
    </>
  );
}