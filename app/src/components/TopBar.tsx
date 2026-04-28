import { useApp, useProfile } from '@/context/AppContext';
import { getGreeting } from '@/lib/utils';

export function TopBar() {
  const profile = useProfile();
  const { state } = useApp();
  const greeting = getGreeting();
  const unreadCount = state.reminders.filter(r => !r.dismissed).length;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/60 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Empty div for balance */}
        <div className="invisible flex items-center gap-4">
          <div className="p-2.5"> {/* Invisible placeholder */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-0">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            </svg>
          </div>
          <div className="w-10 h-10 rounded-full opacity-0"></div>
        </div>

        {/* Centered greeting */}
        <div className="text-center flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting}, {profile.name}! <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Stay on track and keep going!</p>
        </div>

        {/* Right side - notifications and profile */}
        <div className="flex items-center gap-4">
          <button className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#A78BFA] flex items-center justify-center text-white font-semibold">
            {profile.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}