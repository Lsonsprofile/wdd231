import { useState } from 'react';
import { useApp, useSettings } from '../context/AppContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  Sun,
  Bell,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Info,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function Settings() {
  const { state, dispatch } = useApp();
  const settings = useSettings();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExport = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifetrack-backup-${new Date().toISOString().split('T')[0]}.json`;
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
        if (imported.activityTypes && imported.activityLogs) {
          dispatch({ type: 'IMPORT_STATE', payload: imported });
          toast.success('Data imported successfully!');
        } else {
          toast.error('Invalid backup file');
        }
      } catch {
        toast.error('Failed to parse backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    dispatch({ type: 'RESET_DATA' });
    setShowClearConfirm(false);
    toast.success('All data cleared');
  };

  const handleResetOnboarding = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
    dispatch({ type: 'UPDATE_SETTINGS', payload: {} });
    // Force re-trigger by marking incomplete
    const newState = { ...state, onboardingComplete: false };
    dispatch({ type: 'IMPORT_STATE', payload: newState });
    toast.success('Instructions will show on next visit');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Customize your LifeTrack experience</p>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-2xl p-5 shadow-card space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[#6C5CE7]" />
          Appearance
        </h3>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Sun className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Theme</p>
              <p className="text-xs text-gray-400">Currently light mode only</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button className="px-3 py-1.5 rounded-md bg-white text-sm font-medium shadow-sm text-gray-700">Light</button>
            <button className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 cursor-not-allowed">Dark</button>
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Week Starts On</p>
              <p className="text-xs text-gray-400">Choose your preferred start day</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { weekStartsOn: 1 } })}
              className={settings.weekStartsOn === 1 ? 'px-3 py-1.5 rounded-md bg-white text-sm font-medium shadow-sm text-gray-700' : 'px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700'}
            >
              Monday
            </button>
            <button
              onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { weekStartsOn: 0 } })}
              className={settings.weekStartsOn === 0 ? 'px-3 py-1.5 rounded-md bg-white text-sm font-medium shadow-sm text-gray-700' : 'px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700'}
            >
              Sunday
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-5 shadow-card space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#6C5CE7]" />
          Notifications
        </h3>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Enable Notifications</p>
              <p className="text-xs text-gray-400">UI indicator for reminder badges</p>
            </div>
          </div>
          <Switch
            checked={settings.notificationsEnabled}
            onCheckedChange={(checked) => dispatch({ type: 'UPDATE_SETTINGS', payload: { notificationsEnabled: checked } })}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-2xl p-5 shadow-card space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Info className="w-5 h-5 text-[#6C5CE7]" />
          Help
        </h3>

        <button
          onClick={handleResetOnboarding}
          className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-700">View Instructions</p>
              <p className="text-xs text-gray-400">Show the onboarding guide again</p>
            </div>
          </div>
        </button>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-2xl p-5 shadow-card space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[#6C5CE7]" />
          Data Management
        </h3>

        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-emerald-500" />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700">Export Data</p>
                <p className="text-xs text-gray-400">Download a JSON backup</p>
              </div>
            </div>
          </button>

          <label className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Upload className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Import Data</p>
                <p className="text-xs text-gray-400">Restore from a JSON backup</p>
              </div>
            </div>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-500" />
              <div className="text-left">
                <p className="text-sm font-medium text-red-600">Clear All Data</p>
                <p className="text-xs text-red-400">This cannot be undone</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* About */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400">LifeTrack v1.0.0</p>
        <p className="text-xs text-gray-400 mt-1">Built with care for your daily tracking needs</p>
      </div>

      {/* Clear Confirmation Dialog */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Clear All Data?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 mt-2">
            This will permanently delete all your activity types, logs, and reminders. This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1 rounded-xl" onClick={handleClear}>
              Clear Everything
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
