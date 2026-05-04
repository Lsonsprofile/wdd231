import { useState } from 'react';
import { useApp, useSettings, useThemeMode } from '../context/AppContext';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Bell,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Info,
  RotateCcw,
  Calendar,
} from 'lucide-react';

// MUI Components
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Box,
  Switch,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';

export function Settings() {
  const { state, dispatch } = useApp();
  const settings = useSettings();
  const { isDark, toggleMode } = useThemeMode();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportData, setExportData] = useState('');

  // ─── HANDLERS ───

  const handleWeekStartChange = (day: 0 | 1) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { weekStartsOn: day } });
    toast.success(`Week starts on ${day === 1 ? 'Monday' : 'Sunday'}`);
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { notificationsEnabled: enabled } });
    toast.success(enabled ? 'Notifications enabled' : 'Notifications disabled');
  };

  const handleResetOnboarding = () => {
    dispatch({ type: 'IMPORT_STATE', payload: { ...state, onboardingComplete: false } });
    toast.success('Onboarding will show on next visit');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    setExportData(dataStr);
    setShowExportDialog(true);
    
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-app-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.habits !== undefined && imported.oneTimeTasks !== undefined) {
          dispatch({ type: 'IMPORT_STATE', payload: imported });
          toast.success('Data imported successfully!');
        } else {
          toast.error('Invalid backup file format');
        }
      } catch {
        toast.error('Failed to parse backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    localStorage.clear();
    dispatch({ type: 'RESET_DATA' });
    setShowClearConfirm(false);
    toast.success('All data cleared! Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Header */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Settings</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Customize your app experience
        </Typography>
      </Box>

      {/* ─── APPEARANCE CARD ─── */}
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isDark ? (
                <Moon className="w-5 h-5" style={{ color: '#A78BFA' }} />
              ) : (
                <Sun className="w-5 h-5" style={{ color: '#F59E0B' }} />
              )}
              <Typography variant="h6">Appearance</Typography>
            </Box>
          }
        />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Theme Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: isDark ? 'rgba(108, 92, 231, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isDark ? (
                  <Moon className="w-5 h-5" style={{ color: '#A78BFA' }} />
                ) : (
                  <Sun className="w-5 h-5" style={{ color: '#F59E0B' }} />
                )}
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {isDark ? 'Easier on the eyes at night' : 'Clean and bright'}
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={isDark}
              onChange={toggleMode}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#6C5CE7',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#6C5CE7',
                },
              }}
            />
          </Box>

          <Divider />

          {/* Week Start */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar className="w-5 h-5" style={{ color: '#3B82F6' }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Week Starts On</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Choose your preferred start day
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, bgcolor: 'grey.100', p: 0.5, borderRadius: 2 }}>
              <Button
                size="small"
                onClick={() => handleWeekStartChange(1)}
                sx={{
                  bgcolor: settings.weekStartsOn === 1 ? 'white' : 'transparent',
                  color: settings.weekStartsOn === 1 ? 'text.primary' : 'text.secondary',
                  boxShadow: settings.weekStartsOn === 1 ? 1 : 0,
                  textTransform: 'none',
                  fontWeight: settings.weekStartsOn === 1 ? 'bold' : 'normal',
                }}
              >
                Monday
              </Button>
              <Button
                size="small"
                onClick={() => handleWeekStartChange(0)}
                sx={{
                  bgcolor: settings.weekStartsOn === 0 ? 'white' : 'transparent',
                  color: settings.weekStartsOn === 0 ? 'text.primary' : 'text.secondary',
                  boxShadow: settings.weekStartsOn === 0 ? 1 : 0,
                  textTransform: 'none',
                  fontWeight: settings.weekStartsOn === 0 ? 'bold' : 'normal',
                }}
              >
                Sunday
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Bell className="w-5 h-5" style={{ color: '#6C5CE7' }} />
              <Typography variant="h6">Notifications</Typography>
            </Box>
          }
        />
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'rgba(236, 72, 153, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bell className="w-5 h-5" style={{ color: '#EC4899' }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Enable Notifications</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  UI indicator for reminder badges
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={settings.notificationsEnabled}
              onChange={(e) => handleNotificationsToggle(e.target.checked)}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Help */}
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info className="w-5 h-5" style={{ color: '#6C5CE7' }} />
              <Typography variant="h6">Help</Typography>
            </Box>
          }
        />
        <CardContent>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<RotateCcw className="w-5 h-5" />}
            onClick={handleResetOnboarding}
            sx={{ justifyContent: 'flex-start', textTransform: 'none', py: 1.5 }}
          >
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>View Instructions</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Show the onboarding guide again
              </Typography>
            </Box>
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon className="w-5 h-5" style={{ color: '#6C5CE7' }} />
              <Typography variant="h6">Data Management</Typography>
            </Box>
          }
        />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Download className="w-5 h-5" style={{ color: '#10B981' }} />}
            onClick={handleExport}
            sx={{ justifyContent: 'flex-start', textTransform: 'none', py: 1.5 }}
          >
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Export Data</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Download a JSON backup of all your data
              </Typography>
            </Box>
          </Button>

          <Box>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              id="import-file"
              style={{ display: 'none' }}
            />
            <label htmlFor="import-file" style={{ width: '100%', display: 'block' }}>
              <Button
                fullWidth
                variant="outlined"
                component="span"
                startIcon={<Upload className="w-5 h-5" style={{ color: '#3B82F6' }} />}
                sx={{ justifyContent: 'flex-start', textTransform: 'none', py: 1.5 }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Import Data</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Restore from a JSON backup file
                  </Typography>
                </Box>
              </Button>
            </label>
          </Box>

          <Divider />

          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Trash2 className="w-5 h-5" />}
            onClick={() => setShowClearConfirm(true)}
            sx={{ justifyContent: 'flex-start', textTransform: 'none', py: 1.5, borderColor: 'error.light' }}
          >
            <Box sx={{ textAlign: 'left' }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'error.main' }}>
                Clear All Data
              </Typography>
              <Typography variant="caption" sx={{ color: 'error.light' }}>
                Permanently delete everything — cannot be undone
              </Typography>
            </Box>
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Task App v2.0.0
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
          Built for your daily productivity
        </Typography>
      </Box>

      {/* ─── DIALOGS ─── */}

      <Dialog
        open={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertTriangle className="w-6 h-6" />
          Clear All Data?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This will permanently delete all your:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2, color: 'text.secondary' }}>
            <li>Habits & streaks</li>
            <li>Tasks & subtasks</li>
            <li>Deadlines</li>
            <li>Reminders</li>
            <li>Progress goals</li>
            <li>Birthdays</li>
            <li>Profile settings</li>
          </Box>
          <Typography variant="body2" sx={{ mt: 2, fontWeight: 'medium', color: 'error.main' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setShowClearConfirm(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleClear}
            variant="contained"
            color="error"
            startIcon={<Trash2 className="w-4 h-4" />}
          >
            Yes, Clear Everything
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Exported Data Preview</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={exportData}
            slotProps={{ input: { readOnly: true } }}
            sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}