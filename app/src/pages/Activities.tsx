import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // ← Merge imports
import {
  useApp,
  useHabits,
  useOneTimeTasks,
  useDeadlineTasks,
  useReminderItems,
  useProgressTasks,
} from '../context/AppContext';
import { getDaysUntil } from '@/lib/dateUtils';
import { getTodayISO } from '@/lib/seed';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Trash2,
  Clock,
  Flame,
  CheckCircle2,
  Bell,
  Target,
  Zap,
  Edit3,
  MoreVertical,
  RotateCcw,
  Check,
  PlusCircle,
} from 'lucide-react';

// MUI Components
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Chip,
  Box,
  Tabs,
  Tab,
  Avatar,
  LinearProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';

type TabValue = 'habits' | 'tasks' | 'deadlines' | 'reminders' | 'progress';

const tabConfig: Record<TabValue, { label: string; icon: typeof Flame; color: string }> = {
  habits: { label: 'Habits', icon: Flame, color: '#10B981' },
  tasks: { label: 'Tasks', icon: CheckCircle2, color: '#F59E0B' },
  deadlines: { label: 'Deadlines', icon: Clock, color: '#EF4444' },
  reminders: { label: 'Reminders', icon: Bell, color: '#6C5CE7' },
  progress: { label: 'Progress', icon: Target, color: '#3B82F6' },
};

// ============================================================
// EDIT DIALOGS
// ============================================================

function EditHabitDialog({ open, onClose, habit }: { open: boolean; onClose: () => void; habit: any }) {
  const { dispatch } = useApp();
  const [title, setTitle] = useState(habit?.title || '');
  const [repeatType, setRepeatType] = useState(habit?.repeatType || 'daily');
  const [interval, setInterval] = useState(habit?.customInterval || 7);

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_HABIT',
      payload: { ...habit, title, repeatType, customInterval: interval },
    });
    toast.success('Habit updated');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Habit</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <FormControl fullWidth>
            <InputLabel>Repeat</InputLabel>
            <Select value={repeatType} label="Repeat" onChange={(e) => setRepeatType(e.target.value)}>
              <MuiMenuItem value="daily">Daily</MuiMenuItem>
              <MuiMenuItem value="weekly">Weekly</MuiMenuItem>
              <MuiMenuItem value="custom">Custom</MuiMenuItem>
            </Select>
          </FormControl>
          {repeatType === 'custom' && (
            <TextField
              fullWidth
              type="number"
              label="Interval (days)"
              value={interval}
              onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
              slotProps={{ htmlInput: { min: 1 } }}
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#6C5CE7' }}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

function EditTaskDialog({ open, onClose, task }: { open: boolean; onClose: () => void; task: any }) {
  const { dispatch } = useApp();
  const [title, setTitle] = useState(task?.title || '');
  const [dueDate, setDueDate] = useState(task?.dueDate || getTodayISO());

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_ONE_TIME_TASK',
      payload: { ...task, title, dueDate },
    });
    toast.success('Task updated');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField fullWidth label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField
            fullWidth
            type="date"
            label="Due Date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#6C5CE7' }}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================
// MAIN ACTIVITIES PAGE
// ============================================================

export function Activities() {
  const navigate = useNavigate();
  const location = useLocation(); // ← INSIDE the component!
  const { dispatch } = useApp();
  const habits = useHabits();
  const tasks = useOneTimeTasks();
  const deadlines = useDeadlineTasks();
  const reminders = useReminderItems();
  const progressTasks = useProgressTasks();

  // Get tab from navigation state, default to 'habits'
  const initialTab = (location.state as any)?.activeTab as TabValue || 'habits';
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit dialog states
  const [editHabitOpen, setEditHabitOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Menu states
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuItemId, setMenuItemId] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setMenuAnchor(event.currentTarget);
    setMenuItemId(id);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuItemId(null);
  };

  const now = new Date();

  // Filter functions
  const filterBySearch = (items: any[]) =>
    items.filter((item) => item.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredHabits = filterBySearch(habits);
  const filteredTasks = filterBySearch(tasks);
  const filteredDeadlines = filterBySearch(deadlines);
  const filteredReminders = filterBySearch(reminders);
  const filteredProgress = filterBySearch(progressTasks);

  // Delete handlers
  const handleDeleteHabit = (id: string) => {
    dispatch({ type: 'DELETE_HABIT', id });
    toast.success('Habit deleted');
    handleMenuClose();
  };
  const handleDeleteTask = (id: string) => {
    dispatch({ type: 'DELETE_ONE_TIME_TASK', id });
    toast.success('Task deleted');
    handleMenuClose();
  };
  const handleDeleteDeadline = (id: string) => {
    dispatch({ type: 'DELETE_DEADLINE_TASK', id });
    toast.success('Deadline deleted');
    handleMenuClose();
  };
  const handleDeleteReminder = (id: string) => {
    dispatch({ type: 'DELETE_REMINDER_ITEM', id });
    toast.success('Reminder deleted');
    handleMenuClose();
  };
  const handleDeleteProgress = (id: string) => {
    dispatch({ type: 'DELETE_PROGRESS_TASK', id });
    toast.success('Progress goal deleted');
    handleMenuClose();
  };

  // Log habit (mark as done)
  const handleLogHabit = (id: string) => {
    dispatch({ type: 'LOG_HABIT', id, date: getTodayISO() });
    toast.success('Habit logged for today! 🔥');
  };

  // Toggle task
  const handleToggleTask = (id: string) => {
    dispatch({ type: 'TOGGLE_ONE_TIME_TASK', id });
    const task = tasks.find(t => t.id === id);
    toast.success(task?.status === 'completed' ? 'Task marked pending' : 'Task completed! ✓');
  };

  // Reminder actions
  const handleDismissReminder = (id: string) => {
    dispatch({ type: 'DISMISS_REMINDER_ITEM', id });
    toast.success('Reminder dismissed');
  };
  const handleSnoozeReminder = (id: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dispatch({ type: 'SNOOZE_REMINDER_ITEM', id, until: tomorrow.toISOString() });
    toast.success('Reminder snoozed for 24h');
  };
  const handleRestoreReminder = (id: string) => {
    dispatch({
      type: 'UPDATE_REMINDER_ITEM',
      payload: { ...reminders.find((r) => r.id === id)!, dismissed: false },
    });
    toast.success('Reminder restored');
  };

  // Progress actions
  const handleAddProgress = (taskId: string, amount: number) => {
    dispatch({
      type: 'ADD_PROGRESS_LOG',
      taskId,
      payload: {
        id: `plog-${Date.now()}`,
        date: getTodayISO(),
        amount,
      },
    });
    toast.success(`+${amount} progress added!`);
  };

  const getItemCount = () => {
    switch (activeTab) {
      case 'habits': return habits.length;
      case 'tasks': return tasks.length;
      case 'deadlines': return deadlines.length;
      case 'reminders': return reminders.length;
      case 'progress': return progressTasks.length;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      // ─── HABITS ───
      case 'habits':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredHabits.map((habit) => {
              const isDoneToday = habit.lastLoggedDate === getTodayISO();
              return (
                <Card key={habit.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: habit.color + '20', color: habit.color }}>
                        <Flame className="w-5 h-5" />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{habit.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {habit.repeatType === 'daily' ? 'Daily' : habit.repeatType === 'weekly' ? 'Weekly' : `Every ${habit.customInterval} days`}
                          {habit.optionalTarget && ` • Target: ${habit.optionalTarget.value} ${habit.optionalTarget.unit}`}
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          <Chip
                            size="small"
                            label={`🔥 ${habit.streakCount} day streak`}
                            sx={{ bgcolor: habit.color + '15', color: habit.color, fontWeight: 'bold' }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant={isDoneToday ? 'outlined' : 'contained'}
                          color={isDoneToday ? 'success' : 'primary'}
                          onClick={() => handleLogHabit(habit.id)}
                          startIcon={isDoneToday ? <Check className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                        >
                          {isDoneToday ? 'Done' : 'Mark Done'}
                        </Button>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, habit.id)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
            {filteredHabits.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Flame className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <Typography sx={{ color: 'text.secondary' }}>No habits yet</Typography>
                <Button sx={{ mt: 2 }} onClick={() => navigate('/add')}>Create Habit</Button>
              </Box>
            )}
          </Box>
        );

      // ─── TASKS ───
      case 'tasks':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredTasks.map((task) => {
              const daysUntil = getDaysUntil(task.dueDate);
              const isOverdue = daysUntil < 0;
              return (
                <Card key={task.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: task.status === 'completed' ? '#D1FAE5' : '#F3F4F6',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleToggleTask(task.id)}
                      >
                        <CheckCircle2 
                          className="w-5 h-5" 
                          style={{ color: task.status === 'completed' ? '#10B981' : '#9CA3AF' }} 
                        />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 'bold',
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                            color: task.status === 'completed' ? 'text.disabled' : 'text.primary',
                          }}
                        >
                          {task.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Due: {task.dueDate}
                          {task.subtasks?.length > 0 && ` • ${task.subtasks.filter((s: any) => s.completed).length}/${task.subtasks.length} done`}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={isOverdue ? `${Math.abs(daysUntil)}d overdue` : daysUntil === 0 ? 'Today' : `${daysUntil}d left`}
                        color={isOverdue ? 'error' : daysUntil <= 2 ? 'warning' : 'default'}
                        variant="outlined"
                      />
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, task.id)}>
                        <MoreVertical className="w-4 h-4" />
                      </IconButton>
                    </Box>
                    {/* Subtasks */}
                    {task.subtasks?.length > 0 && (
                      <Box sx={{ mt: 1.5, ml: 7, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {task.subtasks.map((sub: any) => (
                          <Box key={sub.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: 0.5,
                                border: '2px solid',
                                borderColor: sub.completed ? '#10B981' : '#D1D5DB',
                                bgcolor: sub.completed ? '#D1FAE5' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              onClick={() => {
                                dispatch({
                                  type: 'UPDATE_ONE_TIME_TASK',
                                  payload: {
                                    ...task,
                                    subtasks: task.subtasks.map((s: any) =>
                                      s.id === sub.id ? { ...s, completed: !s.completed } : s
                                    ),
                                  },
                                });
                              }}
                            >
                              {sub.completed && <Check className="w-3 h-3" style={{ color: '#10B981' }} />}
                            </Box>
                            <Typography
                              variant="caption"
                              sx={{
                                textDecoration: sub.completed ? 'line-through' : 'none',
                                color: sub.completed ? 'text.disabled' : 'text.primary',
                              }}
                            >
                              {sub.title}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {filteredTasks.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <Typography sx={{ color: 'text.secondary' }}>No tasks yet</Typography>
                <Button sx={{ mt: 2 }} onClick={() => navigate('/add')}>Create Task</Button>
              </Box>
            )}
          </Box>
        );

      // ─── DEADLINES ───
      case 'deadlines':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredDeadlines
              .sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date))
              .map((deadline) => {
                const daysUntil = getDaysUntil(deadline.date);
                const isUrgent = daysUntil <= 3 && daysUntil >= 0;
                return (
                  <Card key={deadline.id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: isUrgent ? '#FEE2E2' : '#F3F4F6' }}>
                          <Clock className="w-5 h-5" style={{ color: isUrgent ? '#EF4444' : '#9CA3AF' }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{deadline.title}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{deadline.date}</Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={daysUntil < 0 ? 'Passed' : daysUntil === 0 ? 'Today' : `${daysUntil} days`}
                          color={isUrgent ? 'error' : daysUntil < 0 ? 'default' : 'primary'}
                          variant="outlined"
                        />
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, deadline.id)}>
                          <MoreVertical className="w-4 h-4" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            {filteredDeadlines.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <Typography sx={{ color: 'text.secondary' }}>No deadlines yet</Typography>
                <Button sx={{ mt: 2 }} onClick={() => navigate('/add')}>Add Deadline</Button>
              </Box>
            )}
          </Box>
        );

      // ─── REMINDERS ───
      case 'reminders':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredReminders.map((reminder) => {
              const reminderDate = new Date(reminder.dateTime);
              const isOverdue = reminderDate < now && !reminder.dismissed;
              const timeStr = reminderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
              const isSnoozed = reminder.snoozedUntil && new Date(reminder.snoozedUntil) > now;
              return (
                <Card 
                  key={reminder.id} 
                  variant="outlined" 
                  sx={{ 
                    opacity: reminder.dismissed ? 0.5 : 1,
                    bgcolor: isOverdue ? 'rgba(239,68,68,0.04)' : 'inherit',
                    borderColor: isOverdue ? 'error.light' : 'divider',
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: reminder.color + '20', color: reminder.color }}>
                        <Bell className="w-5 h-5" />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 'bold',
                            textDecoration: reminder.dismissed ? 'line-through' : 'none',
                          }}
                        >
                          {reminder.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {reminderDate.toLocaleDateString()} at {timeStr}
                          {reminder.repeat !== 'none' && ` • Repeats ${reminder.repeat}`}
                          {isSnoozed && ' • Snoozed'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {!reminder.dismissed ? (
                          <>
                            {isSnoozed ? (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<RotateCcw className="w-3 h-3" />}
                                onClick={() => handleRestoreReminder(reminder.id)}
                              >
                                Unsnooze
                              </Button>
                            ) : (
                              <>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleSnoozeReminder(reminder.id)}
                                >
                                  Snooze
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<Check className="w-3 h-3" />}
                                  onClick={() => handleDismissReminder(reminder.id)}
                                >
                                  Done
                                </Button>
                              </>
                            )}
                          </>
                        ) : (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<RotateCcw className="w-3 h-3" />}
                            onClick={() => handleRestoreReminder(reminder.id)}
                          >
                            Restore
                          </Button>
                        )}
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, reminder.id)}>
                          <MoreVertical className="w-4 h-4" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
            {filteredReminders.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <Typography sx={{ color: 'text.secondary' }}>No reminders yet</Typography>
                <Button sx={{ mt: 2 }} onClick={() => navigate('/add')}>Set Reminder</Button>
              </Box>
            )}
          </Box>
        );

      // ─── PROGRESS ───
      case 'progress':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredProgress.map((task) => {
              const percentage = Math.round((task.currentProgress / task.targetValue) * 100);
              const isComplete = percentage >= 100;
              return (
                <Card key={task.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: task.color + '20', color: task.color }}>
                        <Target className="w-5 h-5" />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{task.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {task.currentProgress} / {task.targetValue} {task.unit}
                          {task.dailyTargetEnabled && task.dailyTarget && ` • Daily: ${task.dailyTarget}`}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: isComplete ? '#10B981' : task.color }}>
                        {isComplete ? '✓ Done' : `${percentage}%`}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(percentage, 100)}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: 'grey.100',
                        '& .MuiLinearProgress-bar': { 
                          bgcolor: isComplete ? '#10B981' : task.color, 
                          borderRadius: 5 
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                      {!isComplete && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleAddProgress(task.id, 1)}
                            startIcon={<PlusCircle className="w-3 h-3" />}
                          >
                            +1
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleAddProgress(task.id, 5)}
                            startIcon={<PlusCircle className="w-3 h-3" />}
                          >
                            +5
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleAddProgress(task.id, 10)}
                            startIcon={<PlusCircle className="w-3 h-3" />}
                            sx={{ bgcolor: task.color }}
                          >
                            +10
                          </Button>
                        </>
                      )}
                      {isComplete && (
                        <Chip 
                          size="small" 
                          label="Goal Reached! 🎉" 
                          color="success" 
                          sx={{ fontWeight: 'bold' }} 
                        />
                      )}
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, task.id)}>
                        <MoreVertical className="w-4 h-4" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
            {filteredProgress.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <Typography sx={{ color: 'text.secondary' }}>No progress goals yet</Typography>
                <Button sx={{ mt: 2 }} onClick={() => navigate('/add')}>Create Goal</Button>
              </Box>
            )}
          </Box>
        );
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Activities</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage all your habits, tasks, deadlines, reminders, and goals
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/add')}
          sx={{ bgcolor: '#6C5CE7', '&:hover': { bgcolor: '#5B4BD4' } }}
        >
          Add New
        </Button>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        slotProps={{
          input: {
            startAdornment: <Search className="w-4 h-4 text-gray-400" style={{ marginRight: 8 }} />,
          },
        }}
      />

      {/* Tabs */}
      <Card>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-flexContainer': { gap: 1, p: 1 },
            '& .MuiTab-root': {
              borderRadius: 2,
              textTransform: 'none',
              minHeight: 48,
              fontWeight: 'bold',
            },
          }}
        >
          {(Object.entries(tabConfig) as [TabValue, typeof tabConfig['habits']][]).map(([key, config]) => (
            <Tab
              key={key}
              value={key}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <config.icon className="w-4 h-4" />
                  {config.label}
                  <Chip 
                    size="small" 
                    label={
                      key === 'habits' ? habits.length :
                      key === 'tasks' ? tasks.length :
                      key === 'deadlines' ? deadlines.length :
                      key === 'reminders' ? reminders.length :
                      progressTasks.length
                    } 
                    sx={{ ml: 0.5, height: 20, fontSize: '0.7rem' }} 
                  />
                </Box>
              }
              sx={{
                color: activeTab === key ? `${config.color} !important` : 'inherit',
                bgcolor: activeTab === key ? `${config.color}15` : 'transparent',
              }}
            />
          ))}
        </Tabs>
      </Card>

      {/* Content */}
      {renderContent()}

      {/* Context Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => {
          if (activeTab === 'habits') {
            const habit = habits.find(h => h.id === menuItemId);
            setSelectedHabit(habit);
            setEditHabitOpen(true);
          } else if (activeTab === 'tasks') {
            const task = tasks.find(t => t.id === menuItemId);
            setSelectedTask(task);
            setEditTaskOpen(true);
          }
          handleMenuClose();
        }}>
          <Edit3 className="w-4 h-4 mr-2" /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (activeTab === 'habits') handleDeleteHabit(menuItemId!);
            else if (activeTab === 'tasks') handleDeleteTask(menuItemId!);
            else if (activeTab === 'deadlines') handleDeleteDeadline(menuItemId!);
            else if (activeTab === 'reminders') handleDeleteReminder(menuItemId!);
            else if (activeTab === 'progress') handleDeleteProgress(menuItemId!);
          }}
          sx={{ color: 'error.main' }}
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </MenuItem>
      </Menu>

      {/* Edit Dialogs */}
      <EditHabitDialog open={editHabitOpen} onClose={() => setEditHabitOpen(false)} habit={selectedHabit} />
      <EditTaskDialog open={editTaskOpen} onClose={() => setEditTaskOpen(false)} task={selectedTask} />
    </Box>
  );
}