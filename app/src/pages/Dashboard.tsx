import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateDeadlineCountdown } from '@/lib/utils';
import { toast } from 'sonner';
import {
  useHabits,
  useOneTimeTasks,
  useDeadlineTasks,
  useReminderItems,
  useProgressTasks,
  useProfile,
  useApp,
} from '../context/AppContext';
import { getGreeting } from '@/lib/utils';
import { getDaysUntil, getTodayISO } from '@/lib/dateUtils';

import {
  Flame,
  CheckCircle2,
  Clock,
  Bell,
  Target,
  Plus,
  Minus,
  Zap,
  CalendarDays,
  Sun,
  Moon,
  Star,
  Trophy,
} from 'lucide-react';

import {
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Box,
  Grid,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
} from '@mui/material';

// ─── HABIT LOG DIALOG ───
function HabitLogDialog({ open, onClose, habit }: { open: boolean; onClose: () => void; habit: any }) {
  const { dispatch } = useApp();
  const [amount, setAmount] = useState('');

  const handleLog = () => {
    dispatch({ type: 'LOG_HABIT', id: habit.id, date: getTodayISO() });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Log Habit: {habit?.title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Current streak: <strong>{habit?.streakCount}</strong> days
        </Typography>
        {habit?.optionalTarget && (
          <TextField
            fullWidth
            label={`Amount (${habit.optionalTarget.unit})`}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ mb: 2 }}
            helperText={`Target: ${habit.optionalTarget.value} ${habit.optionalTarget.unit}`}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleLog} variant="contained" color="success">
          Mark as Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── PROGRESS LOG DIALOG ───
function ProgressLogDialog({ open, onClose, task }: { open: boolean; onClose: () => void; task: any }) {
  const { dispatch } = useApp();
  const [amount, setAmount] = useState('');

  const handleAdd = () => {
    if (!amount) return;
    dispatch({
      type: 'ADD_PROGRESS_LOG',
      taskId: task.id,
      payload: {
        id: Math.random().toString(36).substring(2),
        date: getTodayISO(),
        amount: parseFloat(amount),
      },
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Progress: {task?.title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          Current: <strong>{task?.currentProgress}</strong> / {task?.targetValue} {task?.unit}
        </Typography>
        <TextField
          fullWidth
          label={`Add ${task?.unit}`}
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained" color="primary">
          Add Progress
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── CIRCULAR PROGRESS ───
function CircularProgress({ value, color, size = 56 }: { value: number; color: string; size?: number }) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={3} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <Typography variant="caption" sx={{ position: 'absolute', fontWeight: 'bold', fontSize: '0.75rem', color }}>
        {value}%
      </Typography>
    </Box>
  );
}

// ─── SUMMARY CARD ───
function SummaryCard({ icon, count, label, subtext, color, bgColor, onClick }: any) {
  const Icon = icon;
  return (
    <Card 
      onClick={onClick}
      sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        boxShadow: 1,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 3, transform: 'translateY(-2px)', transition: 'all 0.2s' } : {},
      }}
    >
      <Avatar sx={{ bgcolor: bgColor, color: color, width: 44, height: 44 }}>
        <Icon className="w-5 h-5" />
      </Avatar>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>{count}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>{label}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{subtext}</Typography>
      </Box>
    </Card>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const habits = useHabits();
  const oneTimeTasks = useOneTimeTasks();
  const deadlineTasks = useDeadlineTasks();
  const reminders = useReminderItems();
  const progressTasks = useProgressTasks();
  const profile = useProfile();
  const greeting = getGreeting();

  const now = new Date();

  const [habitDialogOpen, setHabitDialogOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const [selectedProgressTask, setSelectedProgressTask] = useState<any>(null);
  const [dailyTargetEnabled, setDailyTargetEnabled] = useState(true);

  // ─── NAVIGATION HELPERS ───
  const goToActivities = (tab: string) => {
    navigate('/activities', { state: { activeTab: tab } });
  };

  // ─── TOP SUMMARY ───
  const habitsDoneToday = habits.filter(h => h.lastLoggedDate === getTodayISO()).length;
  const tasksCompleted = oneTimeTasks.filter(t => t.status === 'completed').length;
  const upcomingDeadlines = deadlineTasks.filter(d => {
    const days = getDaysUntil(d.date);
    return days >= 0 && days <= 7;
  }).length;
  const todaysReminders = reminders.filter(r => {
    const rDate = new Date(r.dateTime);
    return rDate.toDateString() === now.toDateString() && !r.dismissed;
  }).length;
  const onTrackProgress = progressTasks.filter(t => {
    const pct = t.currentProgress / t.targetValue;
    return pct >= 0.5;
  }).length;

  // ─── PROGRESS STEP ───
  const handleProgressStep = (task: any, delta: number) => {
    dispatch({
      type: 'ADD_PROGRESS_LOG',
      taskId: task.id,
      payload: {
        id: `plog-${Date.now()}`,
        date: getTodayISO(),
        amount: delta,
      },
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* ═══════════════════════════════════════
          GREETING
          ═══════════════════════════════════════ */}
      <Box sx={{ mb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
          {greeting}, {profile.name}! 👋
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Stay on track and keep going!
        </Typography>
      </Box>

      {/* ═══════════════════════════════════════
          TOP SUMMARY CARDS — ALL CLICKABLE
          ═══════════════════════════════════════ */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
          <SummaryCard
            icon={Zap}
            count={habits.length}
            label="Habits"
            subtext={`${habitsDoneToday} completed today`}
            color="#6C5CE7"
            bgColor="#EDE9FE"
            onClick={() => goToActivities('habits')}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
          <SummaryCard
            icon={CheckCircle2}
            count={oneTimeTasks.length}
            label="Tasks"
            subtext={`${tasksCompleted} completed`}
            color="#3B82F6"
            bgColor="#DBEAFE"
            onClick={() => goToActivities('tasks')}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
          <SummaryCard
            icon={Clock}
            count={deadlineTasks.length}
            label="Deadlines"
            subtext={`${upcomingDeadlines} upcoming`}
            color="#F59E0B"
            bgColor="#FEF3C7"
            onClick={() => goToActivities('deadlines')}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
          <SummaryCard
            icon={Bell}
            count={reminders.length}
            label="Reminders"
            subtext={`${todaysReminders} today`}
            color="#EC4899"
            bgColor="#FCE7F3"
            onClick={() => goToActivities('reminders')}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
          <SummaryCard
            icon={Target}
            count={progressTasks.length}
            label="Progress"
            subtext={`${onTrackProgress} on track`}
            color="#10B981"
            bgColor="#D1FAE5"
            onClick={() => goToActivities('progress')}
          />
        </Grid>
      </Grid>

      {/* ═══════════════════════════════════════
          MAIN 3-SECTION ROW (Habits, Tasks, Deadlines)
          ═══════════════════════════════════════ */}
      <Grid container spacing={3}>

        {/* ─── 1. HABITS (RECURRING) ─── */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={1} sx={{ height: '100%', cursor: 'pointer' }} onClick={() => goToActivities('habits')}>
            <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                1. Habits (Recurring)
              </Typography>
              <Button 
                size="small" 
                onClick={(e) => { e.stopPropagation(); goToActivities('habits'); }}
                sx={{ textTransform: 'none' }}
              >
                View all
              </Button>
            </Box>
            <CardContent sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                {habits.slice(0, 3).map((habit) => {
                  const isDoneToday = habit.lastLoggedDate === getTodayISO();
                  const progress = habit.optionalTarget
                    ? Math.min(100, Math.round((habit.streakCount / habit.optionalTarget.value) * 100))
                    : 0;
                  return (
                    <Grid size={{ xs: 12 }} key={habit.id}>
                      <Card variant="outlined" sx={{ p: 2 }} onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                          <Avatar sx={{ bgcolor: habit.color + '20', color: habit.color }}>
                            <Flame className="w-5 h-5" />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{habit.title}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {habit.repeatType === 'daily' ? 'Daily' : habit.repeatType === 'weekly' ? 'Weekly' : `Custom (${habit.customInterval} days)`}
                            </Typography>
                          </Box>
                          {isDoneToday ? (
                            <Avatar sx={{ bgcolor: '#D1FAE5', width: 32, height: 32 }}>
                              <CheckCircle2 className="w-4 h-4" style={{ color: '#10B981' }} />
                            </Avatar>
                          ) : (
                            <CircularProgress value={progress} color={habit.color} size={48} />
                          )}
                        </Box>
                        
                        {habit.optionalTarget && (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1.5 }}>
                            <IconButton size="small" sx={{ bgcolor: '#F3F4F6' }} onClick={(e) => e.stopPropagation()}>
                              <Minus className="w-4 h-4" />
                            </IconButton>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {habit.streakCount} / {habit.optionalTarget.value} {habit.optionalTarget.unit}
                            </Typography>
                            <IconButton size="small" sx={{ bgcolor: '#F3F4F6' }} onClick={(e) => e.stopPropagation()}>
                              <Plus className="w-4 h-4" />
                            </IconButton>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Last logged: {isDoneToday ? 'Today 🔥' : habit.lastLoggedDate ? `${getDaysUntil(habit.lastLoggedDate)} days ago` : 'Never'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: habit.color, fontWeight: 'bold' }}>
                            Streak: {habit.streakCount} 🔥
                          </Typography>
                        </Box>

                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          sx={{
                            mt: 1.5,
                            bgcolor: isDoneToday ? '#10B981' : habit.color,
                            '&:hover': { bgcolor: isDoneToday ? '#059669' : habit.color, opacity: 0.9 },
                            textTransform: 'none',
                            borderRadius: 1.5,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isDoneToday) return;
                            setSelectedHabit(habit);
                            setHabitDialogOpen(true);
                          }}
                        >
                          {isDoneToday ? 'Done' : 'Mark as done'}
                        </Button>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
              {habits.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Flame className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <Typography sx={{ color: 'text.secondary' }}>No habits yet</Typography>
                </Box>
              )}
              <Button
                fullWidth
                variant="text"
                startIcon={<Plus className="w-4 h-4" />}
                onClick={(e) => { e.stopPropagation(); navigate('/add'); }}
                sx={{ mt: 2, textTransform: 'none', color: '#6C5CE7' }}
              >
                Add Habit
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── 2. TASKS (ONE-TIME) ─── */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={1} sx={{ height: '100%', cursor: 'pointer' }} onClick={() => goToActivities('tasks')}>
            <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                2. Tasks (One-time)
              </Typography>
              <Button 
                size="small" 
                onClick={(e) => { e.stopPropagation(); goToActivities('tasks'); }}
                sx={{ textTransform: 'none' }}
              >
                View all
              </Button>
            </Box>
            <CardContent sx={{ pt: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {oneTimeTasks.slice(0, 4).map((task) => {
                  const daysUntil = getDaysUntil(task.dueDate);
                  const isOverdue = daysUntil < 0;
                  return (
                    <Card key={task.id} variant="outlined" sx={{ p: 1.5 }} onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'TOGGLE_ONE_TIME_TASK', id: task.id });
                          }}
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: 0.75,
                            border: '2px solid',
                            borderColor: task.status === 'completed' ? '#10B981' : '#D1D5DB',
                            bgcolor: task.status === 'completed' ? '#D1FAE5' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            mt: 0.5,
                            flexShrink: 0,
                          }}
                        >
                          {task.status === 'completed' && <CheckCircle2 className="w-3 h-3" style={{ color: '#10B981' }} />}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 'medium',
                              textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                              color: task.status === 'completed' ? 'text.disabled' : 'text.primary',
                            }}
                          >
                            {task.title}
                          </Typography>
                          {task.subtasks.length > 0 && (
                            <Box sx={{ mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {task.subtasks.slice(0, 2).map((sub: any) => (
                                <Typography key={sub.id} variant="caption" sx={{ color: 'text.secondary', pl: 1 }}>
                                  ○ {sub.title}
                                </Typography>
                              ))}
                              {task.subtasks.length > 2 && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', pl: 1 }}>
                                  +{task.subtasks.length - 2} more
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                          <CalendarDays className="w-3 h-3" style={{ color: isOverdue ? '#EF4444' : '#9CA3AF' }} />
                          <Typography variant="caption" sx={{ color: isOverdue ? 'error.main' : 'text.secondary', fontWeight: isOverdue ? 'bold' : 'normal' }}>
                            {isOverdue ? 'Overdue' : daysUntil === 0 ? 'Today' : `May ${task.dueDate.split('-')[2]}`}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  );
                })}
                {oneTimeTasks.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <Typography sx={{ color: 'text.secondary' }}>No tasks yet</Typography>
                  </Box>
                )}
              </Box>
              <Button
                fullWidth
                variant="text"
                startIcon={<Plus className="w-4 h-4" />}
                onClick={(e) => { e.stopPropagation(); navigate('/add'); }}
                sx={{ mt: 2, textTransform: 'none', color: '#3B82F6' }}
              >
                Add Task
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── 3. DEADLINES ─── */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={1} sx={{ height: '100%', cursor: 'pointer' }} onClick={() => goToActivities('deadlines')}>
            <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                3. Deadlines
              </Typography>
              <Button 
                size="small" 
                onClick={(e) => { e.stopPropagation(); goToActivities('deadlines'); }}
                sx={{ textTransform: 'none' }}
              >
                View all
              </Button>
            </Box>
            <CardContent sx={{ pt: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {deadlineTasks.sort((a, b) => {
                  const countA = calculateDeadlineCountdown(a);
                  const countB = calculateDeadlineCountdown(b);
                  if (countA && countB) return countA.daysLeft - countB.daysLeft;
                  if (countA) return -1;
                  if (countB) return 1;
                  return getDaysUntil(a.date) - getDaysUntil(b.date);
                }).slice(0, 4).map((deadline) => {
                  const countdown = calculateDeadlineCountdown(deadline);
                  const daysUntil = getDaysUntil(deadline.date);
                  
                  if (countdown) {
                    const isUrgent = countdown.isUrgent;
                    const isOverdue = countdown.isOverdue;
                    
                    return (
                      <Card key={deadline.id} variant="outlined" sx={{ p: 2 }} onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                          <Avatar sx={{ bgcolor: deadline.color + '20', color: deadline.color }}>
                            <Clock className="w-5 h-5" />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>{deadline.title}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {isOverdue ? 'Overdue!' : `${countdown.daysLeft} days left`}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={isOverdue ? 'Renew Now' : isUrgent ? 'Soon' : 'OK'}
                            color={isOverdue ? 'error' : isUrgent ? 'warning' : 'success'}
                            variant="outlined"
                            sx={{ height: 24, fontSize: '0.7rem' }}
                          />
                        </Box>

                        {/* Progress bar */}
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {countdown.daysSince} days since last renewal
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 'bold', color: isOverdue ? 'error.main' : deadline.color }}>
                              {countdown.percentUsed}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={countdown.percentUsed}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'grey.100',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: isOverdue ? '#EF4444' : isUrgent ? '#F59E0B' : deadline.color,
                                borderRadius: 4,
                              },
                            }}
                          />
                        </Box>

                        
                          <Button
                            size="small"
                            variant="contained"
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch({ type: 'REFILL_DEADLINE_TASK', id: deadline.id, refillDate: getTodayISO() });
                            }}
                            sx={{
                              bgcolor: isOverdue ? '#EF4444' : deadline.color,
                              '&:hover': { bgcolor: isOverdue ? '#DC2626' : deadline.color, opacity: 0.9 },
                              textTransform: 'none',
                              borderRadius: 1.5,
                              height: 28,
                              fontSize: '0.75rem',
                            }}
                          >
                            {isOverdue ? 'Renew Now' : 'Log Renewal'}
                          </Button>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Last renewed: {deadline.lastRefillDate}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                dispatch({ type: 'UNDO_REFILL_DEADLINE_TASK', id: deadline.id });
                                toast.success('Renewal undone');
                              }}
                              sx={{
                                textTransform: 'none',
                                borderRadius: 1.5,
                                height: 28,
                                fontSize: '0.75rem',
                              }}
                            >
                              Unlog
                            </Button>
                          </Box>
                        </Box>
                      </Card>
                    );
                  }

                  const isUrgent = daysUntil <= 3 && daysUntil >= 0;
                  return (
                    <Box key={deadline.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative', pl: 3 }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 6,
                          top: 16,
                          bottom: -16,
                          width: 2,
                          bgcolor: 'divider',
                        }}
                      />
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: isUrgent ? 'error.main' : deadline.color || 'primary.main',
                          border: '2px solid',
                          borderColor: 'background.paper',
                          boxShadow: '0 0 0 2px #E5E7EB',
                          flexShrink: 0,
                          zIndex: 1,
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{deadline.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {deadline.date}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={daysUntil < 0 ? 'Passed' : daysUntil === 0 ? 'Today' : `in ${daysUntil} days`}
                        color={isUrgent ? 'error' : daysUntil < 0 ? 'default' : 'primary'}
                        variant="outlined"
                        sx={{ height: 24, fontSize: '0.7rem' }}
                      />
                    </Box>
                  );
                })}
                {deadlineTasks.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Clock className="w-10 h-10 mx-auto mb-2" style={{ color: '#9CA3AF' }} />
                    <Typography sx={{ color: 'text.secondary' }}>No deadlines yet</Typography>
                  </Box>
                )}
              </Box>
              <Button
                fullWidth
                variant="text"
                startIcon={<Plus className="w-4 h-4" />}
                onClick={(e) => { e.stopPropagation(); navigate('/add'); }}
                sx={{ mt: 2, textTransform: 'none', color: '#F59E0B' }}
              >
                Add Deadline
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ═══════════════════════════════════════
          BOTTOM ROW (Reminders, Progress)
          ═══════════════════════════════════════ */}
      <Grid container spacing={3}>

        {/* ─── 4. REMINDERS ─── */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card elevation={1} sx={{ cursor: 'pointer' }} onClick={() => goToActivities('reminders')}>
            <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                4. Reminders
              </Typography>
              <Button 
                size="small" 
                onClick={(e) => { e.stopPropagation(); goToActivities('reminders'); }}
                sx={{ textTransform: 'none' }}
              >
                View all
              </Button>
            </Box>
            <CardContent sx={{ pt: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {reminders.filter(r => !r.dismissed).slice(0, 3).map((reminder) => {
                  const reminderDate = new Date(reminder.dateTime);
                  const timeStr = reminderDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                  const isToday = reminderDate.toDateString() === now.toDateString();
                  return (
                    <Card key={reminder.id} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 2 }} onClick={(e) => e.stopPropagation()}>
                      <Avatar sx={{ bgcolor: reminder.color + '20', color: reminder.color, width: 36, height: 36 }}>
                        <Bell className="w-4 h-4" />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{reminder.title}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {isToday ? 'Today' : reminderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {timeStr}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ textTransform: 'none', fontSize: '0.75rem', height: 28 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'SNOOZE_REMINDER_ITEM', id: reminder.id, until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() });
                          }}
                        >
                          Snooze
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          sx={{ textTransform: 'none', fontSize: '0.75rem', height: 28 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch({ type: 'DISMISS_REMINDER_ITEM', id: reminder.id });
                          }}
                        >
                          Done
                        </Button>
                      </Box>
                    </Card>
                  );
                })}
                {reminders.filter(r => !r.dismissed).length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <Typography sx={{ color: 'text.secondary' }}>No active reminders</Typography>
                  </Box>
                )}
              </Box>
              <Button
                fullWidth
                variant="text"
                startIcon={<Plus className="w-4 h-4" />}
                onClick={(e) => { e.stopPropagation(); navigate('/add'); }}
                sx={{ mt: 2, textTransform: 'none', color: '#EC4899' }}
              >
                Add Reminder
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* ─── 5. PROGRESS-BASED TASKS ─── */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card elevation={1} sx={{ cursor: 'pointer' }} onClick={() => goToActivities('progress')}>
            <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                5. Progress-based Tasks
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Daily target</Typography>
                <Switch
                  size="small"
                  checked={dailyTargetEnabled}
                  onChange={(e) => setDailyTargetEnabled(e.target.checked)}
                />
              </Box>
            </Box>
            <CardContent sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                {progressTasks.slice(0, 2).map((task) => {
                  const percentage = Math.round((task.currentProgress / task.targetValue) * 100);
                  const isComplete = percentage >= 100;
                  return (
                    <Grid size={{ xs: 12, md: 6 }} key={task.id}>
                      <Card variant="outlined" sx={{ p: 2 }} onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                          <Avatar sx={{ bgcolor: task.color + '20', color: task.color, width: 32, height: 32 }}>
                            <Target className="w-4 h-4" />
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', flex: 1 }}>{task.title}</Typography>
                          <Typography variant="caption" sx={{ color: task.color, fontWeight: 'bold' }}>
                            {isComplete ? '✓ Done' : `${percentage}%`}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Target: {task.targetValue} {task.unit}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {task.dailyTargetEnabled && `${task.dailyTarget} today`}
                          </Typography>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={Math.min(percentage, 100)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: '#E5E7EB',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: isComplete ? '#10B981' : task.color,
                              borderRadius: 4,
                            },
                            mb: 1.5,
                          }}
                        />

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); handleProgressStep(task, -0.5); }}
                              sx={{ bgcolor: '#F3F4F6', width: 28, height: 28 }}
                            >
                              <Minus className="w-3 h-3" />
                            </IconButton>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 40, textAlign: 'center' }}>
                              {task.currentProgress} {task.unit}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); handleProgressStep(task, 0.5); }}
                              sx={{ bgcolor: '#F3F4F6', width: 28, height: 28 }}
                            >
                              <Plus className="w-3 h-3" />
                            </IconButton>
                          </Box>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Plus className="w-3 h-3" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProgressTask(task);
                              setProgressDialogOpen(true);
                            }}
                            sx={{
                              bgcolor: task.color,
                              '&:hover': { bgcolor: task.color, opacity: 0.9 },
                              textTransform: 'none',
                              borderRadius: 1.5,
                              height: 28,
                            }}
                          >
                            Add Progress
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
              {progressTasks.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Target className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <Typography sx={{ color: 'text.secondary' }}>No progress goals yet</Typography>
                </Box>
              )}
              <Button
                fullWidth
                variant="text"
                startIcon={<Plus className="w-4 h-4" />}
                onClick={(e) => { e.stopPropagation(); navigate('/add'); }}
                sx={{ mt: 2, textTransform: 'none', color: '#10B981' }}
              >
                Add Progress Goal
              </Button>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* ─── DIALOGS ─── */}
      <HabitLogDialog
        open={habitDialogOpen}
        onClose={() => setHabitDialogOpen(false)}
        habit={selectedHabit}
      />
      <ProgressLogDialog
        open={progressDialogOpen}
        onClose={() => setProgressDialogOpen(false)}
        task={selectedProgressTask}
      />
    </Box>
  );
}