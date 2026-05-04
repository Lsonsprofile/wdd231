import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { generateId, getTodayISO, getNowISO } from '@/lib/seed';
import { CATEGORY_MAP, REPEAT_OPTIONS, REMINDER_REPEAT_OPTIONS, UNIT_OPTIONS } from '@/types';
import type { RepeatType, ReminderRepeat, UnitType } from '@/types';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  Zap,
  CheckCircle2,
  Clock,
  Bell,
  Target,
  Flame,
  RotateCcw,
  Droplets,
  BookOpen,
  Dumbbell,
  Heart,
  Brain,
  Briefcase,
  Palette,
  Music,
  Code,
  DollarSign,
  Users,
  Home,
  Plane,
  Coffee,
  Sun,
  Moon,
  Star,
  Trophy,
  TrendingUp,
  CalendarDays,
  AlertCircle,
  Check,
} from 'lucide-react';

import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Chip,
  Avatar,
  Divider,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

const colorPalette = [
  '#10B981', '#3B82F6', '#EC4899', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#F97316', '#84CC16', '#6C5CE7',
];

const categoryIcons: Record<string, typeof Flame> = {
  health: Heart,
  fitness: Dumbbell,
  productivity: Briefcase,
  learning: BookOpen,
  creative: Palette,
  social: Users,
  finance: DollarSign,
  mindfulness: Brain,
  hobby: Coffee,
  travel: Plane,
  other: Star,
};

type TabValue = 'habit' | 'task' | 'deadline' | 'reminder' | 'progress';

const tabConfig: Record<TabValue, { 
  label: string; 
  icon: typeof Zap; 
  color: string; 
  description: string;
  bgColor: string;
}> = {
  habit: { 
    label: 'Habits', 
    icon: Flame, 
    color: '#10B981',
    description: 'Recurring habits',
    bgColor: '#D1FAE5',
  },
  task: { 
    label: 'Tasks', 
    icon: CheckCircle2, 
    color: '#F59E0B',
    description: 'One-time tasks',
    bgColor: '#FEF3C7',
  },
  deadline: { 
    label: 'Deadlines', 
    icon: Clock, 
    color: '#EF4444',
    description: 'Deadline based',
    bgColor: '#FEE2E2',
  },
  reminder: { 
    label: 'Reminders', 
    icon: Bell, 
    color: '#6C5CE7',
    description: 'Time-based alerts',
    bgColor: '#EDE9FE',
  },
  progress: { 
    label: 'Progress', 
    icon: Target, 
    color: '#3B82F6',
    description: 'Track your progress',
    bgColor: '#DBEAFE',
  },
};

function CategorySelector({ value, onChange }: { value: string; onChange: (cat: string) => void }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {Object.entries(CATEGORY_MAP).map(([key, info]) => {
        const Icon = categoryIcons[key] || Star;
        const isSelected = value === key;
        return (
          <Chip
            key={key}
            icon={<Icon className="w-4 h-4" style={{ color: isSelected ? '#fff' : info.color }} />}
            label={info.label}
            onClick={() => onChange(key)}
            sx={{
              bgcolor: isSelected ? info.color : info.lightColor,
              color: isSelected ? '#fff' : info.color,
              fontWeight: 'bold',
              borderRadius: 2,
              px: 1,
              '& .MuiChip-icon': {
                color: isSelected ? '#fff !important' : `${info.color} !important`,
              },
              '&:hover': { 
                bgcolor: isSelected ? info.color : info.lightColor,
                opacity: 0.9,
              },
            }}
          />
        );
      })}
    </Box>
  );
}

function ColorSelector({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
      {colorPalette.map((color) => (
        <Box
          key={color}
          onClick={() => onChange(color)}
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: color,
            cursor: 'pointer',
            border: value === color ? '3px solid #1f2937' : '3px solid transparent',
            boxShadow: value === color ? `0 0 0 2px ${color}40` : 'none',
            transition: 'all 0.2s',
            '&:hover': { transform: 'scale(1.15)' },
          }}
        />
      ))}
    </Box>
  );
}

// ─── PREVIEW COMPONENTS ───

function HabitPreview({ title, color, repeatType, customInterval, optionalTarget }: any) {
  return (
    <Card variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#FAFAFA' }}>
      <Avatar sx={{ bgcolor: color + '20', color: color, width: 48, height: 48 }}>
        <Flame className="w-6 h-6" />
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{title || 'New Habit'}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {repeatType === 'daily' ? 'Daily' : repeatType === 'weekly' ? 'Weekly' : `Every ${customInterval} days`}
          {optionalTarget && ` • ${optionalTarget.value} ${optionalTarget.unit}`}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color }}>0</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>streak</Typography>
      </Box>
    </Card>
  );
}

function TaskPreview({ title, dueDate, subtasks, color }: any) {
  const completed = subtasks.filter((s: any) => s.completed).length;
  return (
    <Card variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#FAFAFA' }}>
      <Avatar sx={{ bgcolor: color + '20', color: color, width: 48, height: 48 }}>
        <CheckCircle2 className="w-6 h-6" />
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{title || 'New Task'}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Due {dueDate || 'Today'}
          {subtasks.length > 0 && ` • ${completed}/${subtasks.length} subtasks`}
        </Typography>
      </Box>
      <Chip size="small" label="Pending" variant="outlined" />
    </Card>
  );
}

function DeadlinePreview({ title, date, color, isCountdown, lastRefill, duration, reminderDays }: any) {
  if (isCountdown && lastRefill && duration) {
    const dueDate = dayjs(lastRefill).add(duration, 'day');
    const daysLeft = dueDate.diff(dayjs(), 'day');
    return (
      <Card variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#FAFAFA' }}>
        <Avatar sx={{ bgcolor: color + '20', color: color, width: 48, height: 48 }}>
          <Clock className="w-6 h-6" />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{title || 'New Countdown'}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {duration} days • Remind {reminderDays} days before
          </Typography>
        </Box>
        <Chip size="small" label={daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'} color={daysLeft <= 3 ? 'error' : 'primary'} variant="outlined" />
      </Card>
    );
  }
  
  return (
    <Card variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#FAFAFA' }}>
      <Avatar sx={{ bgcolor: color + '20', color: color, width: 48, height: 48 }}>
        <Clock className="w-6 h-6" />
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{title || 'New Deadline'}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{date || 'No date set'}</Typography>
      </Box>
      <Chip size="small" label="Upcoming" color="primary" variant="outlined" />
    </Card>
  );
}

function ReminderPreview({ title, dateTime, color }: any) {
  return (
    <Card variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#FAFAFA' }}>
      <Avatar sx={{ bgcolor: color + '20', color: color, width: 48, height: 48 }}>
        <Bell className="w-6 h-6" />
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{title || 'New Reminder'}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{dateTime || 'No time set'}</Typography>
      </Box>
      <Chip size="small" label="Active" color="primary" variant="outlined" />
    </Card>
  );
}

function ProgressPreview({ title, targetValue, unit, currentProgress, color }: any) {
  const percentage = targetValue > 0 ? Math.round((currentProgress / targetValue) * 100) : 0;
  return (
    <Card variant="outlined" sx={{ p: 2, bgcolor: '#FAFAFA' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
        <Avatar sx={{ bgcolor: color + '20', color: color, width: 48, height: 48 }}>
          <Target className="w-6 h-6" />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{title || 'New Goal'}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {currentProgress} / {targetValue || 0} {unit}
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color }}>{percentage}%</Typography>
      </Box>
      <Box sx={{ width: '100%', height: 8, bgcolor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ width: `${percentage}%`, height: '100%', bgcolor: color, borderRadius: 4, transition: 'width 0.3s' }} />
      </Box>
    </Card>
  );
}



export function AddActivity() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<TabValue>('habit');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('health');
  const [color, setColor] = useState(colorPalette[0]);

  // Habit
  const [habitRepeat, setHabitRepeat] = useState<RepeatType>('daily');
  const [habitInterval, setHabitInterval] = useState(7);
  const [habitTarget, setHabitTarget] = useState('');
  const [habitUnit, setHabitUnit] = useState<UnitType>('minutes');
  const [habitCustomUnit, setHabitCustomUnit] = useState('');

  // Task
  const [taskDueDate, setTaskDueDate] = useState<Dayjs | null>(dayjs());
  const [taskSubtasks, setTaskSubtasks] = useState<string[]>(['']);

  // Deadline
  const [deadlineDate, setDeadlineDate] = useState<Dayjs | null>(dayjs().add(7, 'day'));

  // Deadline - countdown tracker
  const [deadlineIsCountdown, setDeadlineIsCountdown] = useState(false);
  const [deadlineLastRefill, setDeadlineLastRefill] = useState<Dayjs | null>(dayjs());
  const [deadlineDuration, setDeadlineDuration] = useState(15);
  const [deadlineReminderDays, setDeadlineReminderDays] = useState(3);

  // Reminder
  const [reminderDate, setReminderDate] = useState<Dayjs | null>(dayjs());
  const [reminderTime, setReminderTime] = useState<Dayjs | null>(dayjs());
  const [reminderRepeat, setReminderRepeat] = useState<ReminderRepeat>('none');

  // Progress
  const [progressTarget, setProgressTarget] = useState('');
  const [progressUnit, setProgressUnit] = useState<UnitType>('pages');
  const [progressCustomUnit, setProgressCustomUnit] = useState('');
  const [progressDailyTarget, setProgressDailyTarget] = useState('');
  const [progressDailyEnabled, setProgressDailyEnabled] = useState(false);

    const resetForm = () => {
    setTitle('');
    setCategory('health');
    setColor(colorPalette[0]);
    setHabitRepeat('daily');
    setHabitInterval(7);
    setHabitTarget('');
    setHabitUnit('minutes');
    setHabitCustomUnit('');
    setTaskDueDate(dayjs());
    setTaskSubtasks(['']);
    setDeadlineDate(dayjs().add(7, 'day'));
    setDeadlineIsCountdown(false);        // NEW
    setDeadlineLastRefill(dayjs());        // NEW
    setDeadlineDuration(15);               // NEW
    setDeadlineReminderDays(3);          // NEW
    setReminderDate(dayjs());
    setReminderTime(dayjs());
    setReminderRepeat('none');
    setProgressTarget('');
    setProgressUnit('pages');
    setProgressCustomUnit('');
    setProgressDailyTarget('');
    setProgressDailyEnabled(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const baseId = generateId();
    const now = getNowISO();

    switch (activeTab) {
      case 'habit': {
        dispatch({
          type: 'ADD_HABIT',
          payload: {
            id: `habit-${baseId}`,
            title: title.trim(),
            repeatType: habitRepeat,
            customInterval: habitInterval,
            lastLoggedDate: null,
            streakCount: 0,
            optionalTarget: habitTarget ? {
              value: parseFloat(habitTarget),
              unit: habitUnit,
              customUnit: habitUnit === 'custom' ? habitCustomUnit : undefined,
            } : undefined,
            category: category as any,
            color,
            createdAt: now,
          },
        });
        toast.success('Habit created successfully!');
        break;
      }

      case 'task': {
        dispatch({
          type: 'ADD_ONE_TIME_TASK',
          payload: {
            id: `task-${baseId}`,
            title: title.trim(),
            dueDate: taskDueDate ? taskDueDate.format('YYYY-MM-DD') : getTodayISO(),
            status: 'pending',
            subtasks: taskSubtasks
              .filter(st => st.trim())
              .map((st, i) => ({ id: `st-${i}-${baseId}`, title: st.trim(), completed: false })),
            category: category as any,
            color,
            createdAt: now,
          },
        });
        toast.success('Task created successfully!');
        break;
      }

      case 'deadline': {
        if (deadlineIsCountdown) {
          // Countdown tracker (gas-style)
          if (!deadlineLastRefill || deadlineDuration <= 0) {
            toast.error('Please set last refill date and duration');
            return;
          }
          dispatch({
            type: 'ADD_DEADLINE_TASK',
            payload: {
              id: `deadline-${baseId}`,
              title: title.trim(),
              date: deadlineLastRefill.add(deadlineDuration, 'day').format('YYYY-MM-DD'), // calculated due date
              category: category as any,
              color,
              createdAt: now,
              lastRefillDate: deadlineLastRefill.format('YYYY-MM-DD'),
              durationDays: deadlineDuration,
              reminderDays: deadlineReminderDays,
              refillHistory: [],  // ← ADD THIS
            },
          });
          toast.success('Countdown tracker created! Refill button will appear on dashboard.');
        } else {
          // Regular deadline
          dispatch({
            type: 'ADD_DEADLINE_TASK',
            payload: {
              id: `deadline-${baseId}`,
              title: title.trim(),
              date: deadlineDate ? deadlineDate.format('YYYY-MM-DD') : getTodayISO(),
              category: category as any,
              color,
              createdAt: now,
              refillHistory: [],  
            },
          });
          toast.success('Deadline created successfully!');
        }
        break;
      }

      case 'reminder': {
        const dateStr = reminderDate ? reminderDate.format('YYYY-MM-DD') : getTodayISO();
        const timeStr = reminderTime ? reminderTime.format('HH:mm') : '09:00';
        dispatch({
          type: 'ADD_REMINDER_ITEM',
          payload: {
            id: `reminder-${baseId}`,
            title: title.trim(),
            dateTime: `${dateStr}T${timeStr}:00.000Z`,
            repeat: reminderRepeat,
            snoozedUntil: null,
            dismissed: false,
            category: category as any,
            color,
            createdAt: now,
          },
        });
        toast.success('Reminder created successfully!');
        break;
      }

      case 'progress': {
        if (!progressTarget || parseFloat(progressTarget) <= 0) {
          toast.error('Please enter a valid target value');
          return;
        }
        dispatch({
          type: 'ADD_PROGRESS_TASK',
          payload: {
            id: `progress-${baseId}`,
            title: title.trim(),
            targetValue: parseFloat(progressTarget),
            currentProgress: 0,
            unit: progressUnit,
            customUnit: progressUnit === 'custom' ? progressCustomUnit : undefined,
            dailyTarget: progressDailyEnabled && progressDailyTarget ? parseFloat(progressDailyTarget) : undefined,
            dailyTargetEnabled: progressDailyEnabled,
            logs: [],
            category: category as any,
            color,
            createdAt: now,
          },
        });
        toast.success('Progress goal created successfully!');
        break;
      }
    }

    resetForm();
  };

  const addSubtask = () => setTaskSubtasks([...taskSubtasks, '']);
  const updateSubtask = (index: number, value: string) => {
    const updated = [...taskSubtasks];
    updated[index] = value;
    setTaskSubtasks(updated);
  };
  const removeSubtask = (index: number) => {
    setTaskSubtasks(taskSubtasks.filter((_, i) => i !== index));
  };

  const renderPreview = () => {
    switch (activeTab) {
      case 'habit':
        return (
          <HabitPreview
            title={title}
            color={color}
            repeatType={habitRepeat}
            customInterval={habitInterval}
            optionalTarget={habitTarget ? { value: parseFloat(habitTarget), unit: habitUnit } : undefined}
          />
        );
      case 'task':
        return (
          <TaskPreview
            title={title}
            color={color}
            dueDate={taskDueDate?.format('YYYY-MM-DD')}
            subtasks={taskSubtasks.filter(s => s.trim()).map((s, i) => ({ id: i, title: s, completed: false }))}
          />
        );
      case 'deadline':
        return (
          <DeadlinePreview
            title={title}
            color={color}
            date={deadlineDate?.format('YYYY-MM-DD')}
            isCountdown={deadlineIsCountdown}
            lastRefill={deadlineLastRefill?.format('YYYY-MM-DD')}
            duration={deadlineDuration}
            reminderDays={deadlineReminderDays}
          />
        );
      case 'reminder':
        return (
          <ReminderPreview
            title={title}
            color={color}
            dateTime={reminderDate && reminderTime ? `${reminderDate.format('MMM D')} at ${reminderTime.format('h:mm A')}` : undefined}
          />
        );
      case 'progress':
        return (
          <ProgressPreview
            title={title}
            color={color}
            targetValue={parseFloat(progressTarget) || 0}
            unit={progressUnit}
            currentProgress={0}
          />
        );
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ maxWidth: 900, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3, pb: 4 }}>

        {/* ─── HEADER ─── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(-1)} 
            startIcon={<ArrowLeft className="w-5 h-5" />}
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Add Activity</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Choose a category and fill in the details to add a new activity.
            </Typography>
          </Box>
        </Box>

        {/* ─── CATEGORY CARDS ─── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
          {(Object.entries(tabConfig) as [TabValue, typeof tabConfig['habit']][]).map(([key, config]) => {
            const Icon = config.icon;
            const isSelected = activeTab === key;
            return (
              <Card
                key={key}
                onClick={() => setActiveTab(key)}
                sx={{
                  cursor: 'pointer',
                  p: 2,
                  border: isSelected ? `2px solid ${config.color}` : '2px solid transparent',
                  bgcolor: isSelected ? config.bgColor : '#fff',
                  boxShadow: isSelected ? `0 4px 12px ${config.color}20` : 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: `0 4px 12px ${config.color}30`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Avatar sx={{ bgcolor: config.color + '20', color: config.color, width: 36, height: 36 }}>
                    <Icon className="w-5 h-5" />
                  </Avatar>
                  {isSelected && (
                    <Box sx={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%', 
                      bgcolor: config.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Check className="w-3 h-3" style={{ color: '#fff' }} />
                    </Box>
                  )}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: isSelected ? config.color : 'text.primary' }}>
                  {config.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {config.description}
                </Typography>
              </Card>
            );
          })}
        </Box>

        {/* ─── MAIN FORM CARD ─── */}
        <Card sx={{ boxShadow: 2 }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

            {/* Title */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                Title <Typography component="span" color="error">*</Typography>
              </Typography>
              <TextField
                fullWidth
                placeholder={`e.g., ${activeTab === 'habit' ? 'Drink Water' : activeTab === 'task' ? 'Buy Groceries' : activeTab === 'deadline' ? 'Project Launch' : activeTab === 'reminder' ? 'Take Medicine' : 'Read Book'}`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>

            {/* Category & Color */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Category</Typography>
                <CategorySelector value={category} onChange={setCategory} />
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>Color</Typography>
                <ColorSelector value={color} onChange={setColor} />
              </Box>
            </Box>

            <Divider />

            {/* ─── HABIT FORM ─── */}
            {activeTab === 'habit' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: tabConfig.habit.color, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Flame className="w-5 h-5" /> Habit Details
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Repeat Type *</InputLabel>
                    <Select 
                      value={habitRepeat} 
                      label="Repeat Type *" 
                      onChange={(e) => setHabitRepeat(e.target.value as RepeatType)}
                    >
                      {REPEAT_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {habitRepeat === 'custom' && (
                    <TextField
                      fullWidth
                      type="number"
                      label="Custom Interval (days)"
                      value={habitInterval}
                      onChange={(e) => setHabitInterval(parseInt(e.target.value) || 1)}
                      slotProps={{ htmlInput: { min: 1 } }}
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle2">Optional Target</Typography>
                  <Switch 
                    checked={!!habitTarget} 
                    onChange={(e) => setHabitTarget(e.target.checked ? '1' : '')} 
                  />
                </Box>

                {habitTarget && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Target Value"
                      value={habitTarget}
                      onChange={(e) => setHabitTarget(e.target.value)}
                      placeholder="e.g., 2"
                    />
                    <FormControl fullWidth>
                      <InputLabel>Unit</InputLabel>
                      <Select value={habitUnit} label="Unit" onChange={(e) => setHabitUnit(e.target.value as UnitType)}>
                        {UNIT_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {habitUnit === 'custom' && (
                  <TextField
                    fullWidth
                    label="Custom Unit"
                    value={habitCustomUnit}
                    onChange={(e) => setHabitCustomUnit(e.target.value)}
                    placeholder="e.g., liters, laps"
                  />
                )}
              </Box>
            )}

            {/* ─── TASK FORM ─── */}
            {activeTab === 'task' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: tabConfig.task.color, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle2 className="w-5 h-5" /> Task Details
                </Typography>

                <DatePicker
                  label="Due Date *"
                  value={taskDueDate}
                  onChange={(val) => setTaskDueDate(val)}
                  slotProps={{ textField: { fullWidth: true } }}
                />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Subtasks (optional)</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {taskSubtasks.map((subtask, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder={`Subtask ${index + 1}`}
                          value={subtask}
                          onChange={(e) => updateSubtask(index, e.target.value)}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                        {taskSubtasks.length > 1 && (
                          <Button variant="outlined" color="error" size="small" onClick={() => removeSubtask(index)} sx={{ minWidth: 'auto', px: 1.5 }}>
                            ✕
                          </Button>
                        )}
                      </Box>
                    ))}
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={addSubtask} 
                      startIcon={<Plus className="w-4 h-4" />}
                      sx={{ alignSelf: 'flex-start', borderRadius: 2, textTransform: 'none' }}
                    >
                      Add Subtask
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}

                     {/* ─── DEADLINE FORM ─── */}
            {activeTab === 'deadline' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: tabConfig.deadline.color, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Clock className="w-5 h-5" /> Deadline Details
                </Typography>

                {/* Toggle between regular deadline and countdown tracker */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={deadlineIsCountdown}
                      onChange={(e) => setDeadlineIsCountdown(e.target.checked)}
                    />
                  }
                  label="Track countdown (refill, renewal, restock, etc.)"
                />

                {!deadlineIsCountdown ? (
                  // Regular deadline
                  <DatePicker
                    label="Due Date *"
                    value={deadlineDate}
                    onChange={(val) => setDeadlineDate(val)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                ) : (
                  // Countdown tracker
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <DatePicker
                      label="Last Renewed / Refilled *"
                      value={deadlineLastRefill}
                      onChange={(val) => setDeadlineLastRefill(val)}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                    
                    <TextField
                      fullWidth
                      type="number"
                      label="Duration (days) *"
                      value={deadlineDuration}
                      onChange={(e) => setDeadlineDuration(parseInt(e.target.value) || 15)}
                      helperText="How many days until next renewal/restock?"
                      slotProps={{ htmlInput: { min: 1 } }}
                    />
                    
                    <TextField
                      fullWidth
                      type="number"
                      label="Reminder Days Before"
                      value={deadlineReminderDays}
                      onChange={(e) => setDeadlineReminderDays(parseInt(e.target.value) || 3)}
                      helperText="Warn me this many days before it expires"
                      slotProps={{ htmlInput: { min: 1 } }}
                    />

                    {/* Auto-calculated due date display */}
                    {deadlineLastRefill && deadlineDuration > 0 && (
                      <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Next due: <strong>{deadlineLastRefill.add(deadlineDuration, 'day').format('MMMM D, YYYY')}</strong>
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {deadlineDuration} days from last renewal
                        </Typography>
                      </Card>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {/* ─── REMINDER FORM ─── */}
            {activeTab === 'reminder' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: tabConfig.reminder.color, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Bell className="w-5 h-5" /> Reminder Details
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <DatePicker
                    label="Date *"
                    value={reminderDate}
                    onChange={(val) => setReminderDate(val)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                  <TimePicker
                    label="Time *"
                    value={reminderTime}
                    onChange={(val) => setReminderTime(val)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Repeat</InputLabel>
                  <Select value={reminderRepeat} label="Repeat" onChange={(e) => setReminderRepeat(e.target.value as ReminderRepeat)}>
                    {REMINDER_REPEAT_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* ─── PROGRESS FORM ─── */}
            {activeTab === 'progress' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: tabConfig.progress.color, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Target className="w-5 h-5" /> Progress Goal Details
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Target Value *"
                    value={progressTarget}
                    onChange={(e) => setProgressTarget(e.target.value)}
                    placeholder="e.g., 30"
                  />
                  <FormControl fullWidth>
                    <InputLabel>Unit</InputLabel>
                    <Select value={progressUnit} label="Unit" onChange={(e) => setProgressUnit(e.target.value as UnitType)}>
                      {UNIT_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {progressUnit === 'custom' && (
                  <TextField
                    fullWidth
                    label="Custom Unit"
                    value={progressCustomUnit}
                    onChange={(e) => setProgressCustomUnit(e.target.value)}
                    placeholder="e.g., chapters"
                  />
                )}

                <FormControlLabel
                  control={
                    <Switch
                      checked={progressDailyEnabled}
                      onChange={(e) => setProgressDailyEnabled(e.target.checked)}
                    />
                  }
                  label="Enable Daily Target"
                />

                {progressDailyEnabled && (
                  <TextField
                    fullWidth
                    type="number"
                    label="Daily Target"
                    value={progressDailyTarget}
                    onChange={(e) => setProgressDailyTarget(e.target.value)}
                    placeholder="e.g., 5"
                  />
                )}
              </Box>
            )}

            <Divider />

            {/* ─── PREVIEW ─── */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold', color: 'text.secondary' }}>
                Preview
              </Typography>
              {renderPreview()}
            </Box>

            <Divider />

            {/* ─── SUBMIT ─── */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={resetForm}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold', px: 4 }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSubmit}
                startIcon={<Plus className="w-5 h-5" />}
                sx={{
                  bgcolor: tabConfig[activeTab].color,
                  '&:hover': { bgcolor: tabConfig[activeTab].color, opacity: 0.9 },
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                }}
              >
                Add {tabConfig[activeTab].label.slice(0, -1)}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
}