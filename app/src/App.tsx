import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useApp } from './context/AppContext';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Activities } from '@/pages/Activities';
import { AddActivity } from '@/pages/AddActivity';
import { Calendar } from '@/pages/Calendar';
import { Reminders } from '@/pages/Reminders';
import { Statistics } from '@/pages/Statistics';
import { Profile } from '@/pages/Profile';
import { Settings } from '@/pages/Settings';

const createAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: { main: '#6C5CE7' },
    secondary: { main: '#EC4899' },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    info: { main: '#3B82F6' },
    background: {
      default: mode === 'light' ? '#F3F4F8' : '#0F0F23',
      paper: mode === 'light' ? '#FFFFFF' : '#1A1A2E',
    },
    text: {
      primary: mode === 'light' ? '#1F2937' : '#E5E7EB',
      secondary: mode === 'light' ? '#6B7280' : '#9CA3AF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  const mode = (state.settings.theme as 'light' | 'dark') || 'light';
  const theme = createAppTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

function App() {
  return (
    <ThemeWrapper>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/add" element={<AddActivity />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </ThemeWrapper>
  );
}

export default App;