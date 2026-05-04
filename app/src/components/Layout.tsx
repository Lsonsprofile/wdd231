import { useEffect } from 'react';
import { useApp, useProfile } from '../context/AppContext';
import { isBirthdayToday } from '../lib/utils';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { TopBar } from './TopBar';
import { OnboardingOverlay } from './OnboardingOverlay';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';
import { PartyPopper } from 'lucide-react';
import { Box, Typography, useTheme } from '@mui/material';

export function Layout({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  const profile = useProfile();
  const theme = useTheme();

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
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      <Sidebar />

      {/* TopBar - only visible on desktop */}
      <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
        <TopBar />
      </Box>

      {/* Mobile header - theme aware */}
      <Box
        sx={{
          display: { xs: 'flex', lg: 'none' },
          position: 'sticky',
          top: 0,
          zIndex: 30,
          backdropFilter: 'blur(12px)',
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(26, 26, 46, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6C5CE7, #A78BFA)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          {profile.name.charAt(0).toUpperCase()}
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          p: { xs: 2, lg: 4 },
          pb: { xs: 12, lg: 4 },
          overflowY: 'auto',
        }}
      >
        <Box sx={{ maxWidth: '1280px', mx: 'auto' }}>
          {children}
        </Box>

        {/* SIGNATURE - Theme aware */}
        <Box
          sx={{
            textAlign: 'center',
            py: 3,
            mt: 2,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Made with ❤️ by{' '}
            <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
              Emmanuel Ndogo
            </Box>
          </Typography>
        </Box>
      </Box>

      <MobileBottomNav />

      {showOnboarding && <OnboardingOverlay />}

      <Toaster position="top-right" richColors />
    </Box>
  );
}