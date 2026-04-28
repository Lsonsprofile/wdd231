import { useEffect } from 'react';
import { useApp, useProfile } from '@/context/AppContext';
import { isBirthdayToday } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { TopBar } from './TopBar';
import { OnboardingOverlay } from './OnboardingOverlay';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { PartyPopper } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  const profile = useProfile();

  const showOnboarding = !state.onboardingComplete;

  useEffect(() => {
    if (isBirthdayToday(profile.birthday)) {
      toast.success(
        <div className="flex items-center gap-2">
          <PartyPopper className="w-5 h-5 text-pink-500" />
          <div>
            <p className="font-semibold">Happy Birthday, {profile.name}!</p>
            <p className="text-sm text-gray-500">Wishing you a wonderful day!</p>
          </div>
        </div>,
        { duration: 8000 }
      );
    }
  }, [profile.birthday, profile.name]);

  return (
    <div className="min-h-screen bg-[#F3F4F8]">
      <Sidebar />

      {/* TopBar - only visible on desktop */}
      <div className="hidden lg:block">
        <TopBar />
      </div>

      {/* Mobile header - simplified */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-end">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#A78BFA] flex items-center justify-center text-white font-semibold text-sm">
            {profile.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <MobileBottomNav />

      {showOnboarding && <OnboardingOverlay />}

      <Toaster position="top-right" richColors />
    </div>
  );
}