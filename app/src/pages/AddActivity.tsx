import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, useActivityTypes } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { IconRenderer } from '@/components/IconRenderer';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  Clock,
  Bell,
  Ruler,
} from 'lucide-react';

const availableIcons = [
  { name: 'Fuel', label: 'Fuel' },
  { name: 'Dumbbell', label: 'Workout' },
  { name: 'Stethoscope', label: 'Health' },
  { name: 'Flag', label: 'Deadline' },
  { name: 'Brain', label: 'Mind' },
  { name: 'Gift', label: 'Gift' },
  { name: 'CalendarDays', label: 'Calendar' },
  { name: 'Heart', label: 'Heart' },
  { name: 'Coffee', label: 'Coffee' },
  { name: 'BookOpen', label: 'Reading' },
  { name: 'Music', label: 'Music' },
  { name: 'Plane', label: 'Travel' },
];

const colorPalette = [
  '#6C5CE7', '#10B981', '#3B82F6', '#EC4899', '#F59E0B',
  '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16',
];

const categories = [
  { value: 'health', label: 'Health', color: '#10B981' },
  { value: 'work', label: 'Work', color: '#EC4899' },
  { value: 'personal', label: 'Personal', color: '#F59E0B' },
  { value: 'finance', label: 'Finance', color: '#3B82F6' },
  { value: 'other', label: 'Other', color: '#6C5CE7' },
] as const;

export function AddActivity() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const activityTypes = useActivityTypes();
  const [mode, setMode] = useState<'log' | 'create'>('log');

  // Log form state
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [logDate, setLogDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [logTime, setLogTime] = useState(format(new Date(), 'HH:mm'));
  const [logAmount, setLogAmount] = useState('');
  const [logExpectedDuration, setLogExpectedDuration] = useState('');
  const [logNotes, setLogNotes] = useState('');

  // Create form state
  const [createName, setCreateName] = useState('');
  const [createCategory, setCreateCategory] = useState<string>('personal');
  const [createIcon, setCreateIcon] = useState('CalendarDays');
  const [createColor, setCreateColor] = useState('#6C5CE7');
  const [createHasAmount, setCreateHasAmount] = useState(false);
  const [createAmountLabel, setCreateAmountLabel] = useState('');
  const [createHasDuration, setCreateHasDuration] = useState(false);
  const [createReminderEnabled, setCreateReminderEnabled] = useState(false);

  const selectedActivity = activityTypes.find(at => at.id === selectedActivityId);

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityId) {
      toast.error('Please select an activity type');
      return;
    }

    const newLog = {
      id: `log-${uuidv4()}`,
      activityTypeId: selectedActivityId,
      date: logDate,
      time: logTime,
      amount: logAmount ? parseFloat(logAmount) : undefined,
      expectedDuration: logExpectedDuration ? parseInt(logExpectedDuration) : undefined,
      notes: logNotes || undefined,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_LOG', payload: newLog });

    if (logExpectedDuration) {
      const dueDate = new Date(logDate);
      dueDate.setDate(dueDate.getDate() + parseInt(logExpectedDuration));
      const reminder = {
        id: `rem-${uuidv4()}`,
        activityTypeId: selectedActivityId,
        dueDate: dueDate.toISOString().split('T')[0],
        message: `${selectedActivity?.name || 'Activity'} (Estimated)`,
        dismissed: false,
      };
      dispatch({ type: 'ADD_REMINDER', payload: reminder });
    }

    toast.success('Activity logged successfully!');

    setSelectedActivityId('');
    setLogAmount('');
    setLogExpectedDuration('');
    setLogNotes('');
    setLogDate(format(new Date(), 'yyyy-MM-dd'));
    setLogTime(format(new Date(), 'HH:mm'));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      toast.error('Please enter an activity name');
      return;
    }

    const newType = {
      id: `at-${uuidv4()}`,
      name: createName.trim(),
      category: createCategory as 'health' | 'work' | 'personal' | 'finance' | 'other',
      icon: createIcon,
      color: createColor,
      hasExpectedDuration: createHasDuration,
      hasAmount: createHasAmount,
      amountLabel: createHasAmount ? createAmountLabel || 'Units' : undefined,
      reminderEnabled: createReminderEnabled,
    };

    dispatch({ type: 'ADD_ACTIVITY_TYPE', payload: newType });
    toast.success('Activity type created!');

    setCreateName('');
    setCreateCategory('personal');
    setCreateIcon('CalendarDays');
    setCreateColor('#6C5CE7');
    setCreateHasAmount(false);
    setCreateAmountLabel('');
    setCreateHasDuration(false);
    setCreateReminderEnabled(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'log' ? 'Log Activity' : 'Create Activity Type'}
          </h1>
          <p className="text-sm text-gray-500">
            {mode === 'log' ? 'Record a new activity occurrence' : 'Define a new reusable activity template'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-1.5 shadow-card flex">
        <button
          onClick={() => setMode('log')}
          className={cn(
            'flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200',
            mode === 'log'
              ? 'bg-[#6C5CE7] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          Log Activity
        </button>
        <button
          onClick={() => setMode('create')}
          className={cn(
            'flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200',
            mode === 'create'
              ? 'bg-[#6C5CE7] text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          Create New Type
        </button>
      </div>

      {mode === 'log' && (
        <form onSubmit={handleLogSubmit} className="bg-white rounded-2xl p-6 shadow-card space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Activity Type</Label>
            <div className="relative">
              <select
                value={selectedActivityId}
                onChange={(e) => {
                  setSelectedActivityId(e.target.value);
                  setLogAmount('');
                  setLogExpectedDuration('');
                }}
                className="w-full h-12 pl-4 pr-10 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] appearance-none"
              >
                <option value="">Select an activity...</option>
                {activityTypes.map(at => (
                  <option key={at.id} value={at.id}>{at.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {selectedActivity && (
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: selectedActivity.color + '18' }}>
                  <IconRenderer iconName={selectedActivity.icon} className="w-4 h-4" style={{ color: selectedActivity.color }} />
                </div>
                <span className="text-sm text-gray-600">{selectedActivity.name}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Date</Label>
              <Input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Time</Label>
              <Input
                type="time"
                value={logTime}
                onChange={(e) => setLogTime(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          {selectedActivity?.hasAmount && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {selectedActivity.amountLabel || 'Amount'}
              </Label>
              <Input
                type="number"
                placeholder={`Enter ${selectedActivity.amountLabel || 'amount'}...`}
                value={logAmount}
                onChange={(e) => setLogAmount(e.target.value)}
                className="h-12 rounded-xl"
              />
            </div>
          )}

          {selectedActivity?.hasExpectedDuration && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Expected Duration (days)</Label>
              <Input
                type="number"
                placeholder="How long should this last?"
                value={logExpectedDuration}
                onChange={(e) => setLogExpectedDuration(e.target.value)}
                className="h-12 rounded-xl"
              />
              <p className="text-xs text-gray-400">We will remind you when it is time to do this again</p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Notes (optional)</Label>
            <Textarea
              placeholder="Add any notes..."
              value={logNotes}
              onChange={(e) => setLogNotes(e.target.value)}
              className="rounded-xl min-h-[100px] resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#6C5CE7] hover:bg-[#5B4BD4] text-white rounded-xl font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Log Activity
          </Button>
        </form>
      )}

      {mode === 'create' && (
        <form onSubmit={handleCreateSubmit} className="bg-white rounded-2xl p-6 shadow-card space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Activity Name</Label>
            <Input
              placeholder="e.g., Reading, Swimming, Grocery..."
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Category</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCreateCategory(cat.value)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors border',
                    createCategory === cat.value
                      ? 'border-transparent text-white'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  )}
                  style={createCategory === cat.value ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Icon</Label>
            <div className="flex flex-wrap gap-2">
              {availableIcons.map(icon => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => setCreateIcon(icon.name)}
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center transition-all border-2',
                    createIcon === icon.name
                      ? 'border-[#6C5CE7] bg-[#6C5CE7]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <IconRenderer iconName={icon.name} className={cn(
                    'w-5 h-5',
                    createIcon === icon.name ? 'text-[#6C5CE7]' : 'text-gray-500'
                  )} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Color</Label>
            <div className="flex flex-wrap gap-2">
              {colorPalette.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setCreateColor(color)}
                  className={cn(
                    'w-9 h-9 rounded-lg transition-all border-2',
                    createColor === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Track Amount/Value</p>
                  <p className="text-xs text-gray-400">Ask for a numeric value when logging</p>
                </div>
              </div>
              <Switch checked={createHasAmount} onCheckedChange={setCreateHasAmount} />
            </div>

            {createHasAmount && (
              <div className="pl-12">
                <Input
                  placeholder="Label (e.g., Minutes, Liters, Pages)"
                  value={createAmountLabel}
                  onChange={(e) => setCreateAmountLabel(e.target.value)}
                  className="h-10 rounded-xl"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Expected Duration</p>
                  <p className="text-xs text-gray-400">Ask how long this should last (in days)</p>
                </div>
              </div>
              <Switch checked={createHasDuration} onCheckedChange={setCreateHasDuration} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Enable Reminders</p>
                  <p className="text-xs text-gray-400">Get reminded about this activity</p>
                </div>
              </div>
              <Switch checked={createReminderEnabled} onCheckedChange={setCreateReminderEnabled} />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#6C5CE7] hover:bg-[#5B4BD4] text-white rounded-xl font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Activity Type
          </Button>
        </form>
      )}
    </div>
  );
}
