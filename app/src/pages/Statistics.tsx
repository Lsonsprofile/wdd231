import { useMemo } from 'react';
import {
  useHabits,
  useOneTimeTasks,
  useDeadlineTasks,
  useReminderItems,
  useProgressTasks,
  useActivityLogs,
  useActivityTypes,
} from '../context/AppContext';
import { getDaysUntil } from '@/lib/utils';
import {
  Flame,
  CheckCircle2,
  Clock,
  Bell,
  Target,
  Zap,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react';

// MUI Components
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Avatar,
  Grid,
  useTheme,
} from '@mui/material';

// Recharts
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6C5CE7', '#3B82F6', '#EC4899'];

export function Statistics() {
  const habits = useHabits();
  const tasks = useOneTimeTasks();
  const deadlines = useDeadlineTasks();
  const reminders = useReminderItems();
  const progressTasks = useProgressTasks();
  const activityLogs = useActivityLogs();
  const activityTypes = useActivityTypes();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    [...habits, ...tasks, ...deadlines, ...reminders, ...progressTasks].forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [habits, tasks, deadlines, reminders, progressTasks]);

  const typeData = [
    { name: 'Habits', value: habits.length, color: '#10B981' },
    { name: 'Tasks', value: tasks.length, color: '#F59E0B' },
    { name: 'Deadlines', value: deadlines.length, color: '#EF4444' },
    { name: 'Reminders', value: reminders.length, color: '#6C5CE7' },
    { name: 'Progress', value: progressTasks.length, color: '#3B82F6' },
  ].filter(d => d.value > 0);

  const habitStreakData = useMemo(() => {
    return habits
      .sort((a, b) => b.streakCount - a.streakCount)
      .slice(0, 5)
      .map(h => ({ name: h.title, streak: h.streakCount, color: h.color }));
  }, [habits]);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const urgentDeadlines = deadlines.filter(d => {
    const days = getDaysUntil(d.date);
    return days >= 0 && days <= 7;
  }).sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));

  const progressOverview = useMemo(() => {
    return progressTasks.map(task => {
      const percentage = Math.round((task.currentProgress / task.targetValue) * 100);
      return {
        name: task.title,
        percentage: Math.min(percentage, 100),
        current: task.currentProgress,
        target: task.targetValue,
        unit: task.unit,
        color: task.color,
      };
    });
  }, [progressTasks]);

  const activeReminders = reminders.filter(r => !r.dismissed).length;
  const dismissedReminders = reminders.filter(r => r.dismissed).length;
  const snoozedReminders = reminders.filter(r => r.snoozedUntil && new Date(r.snoozedUntil) > now).length;

  const monthlyLogs = useMemo(() => {
    const months: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      months[d.toLocaleString('en-US', { month: 'short' })] = 0;
    }
    activityLogs.forEach(log => {
      const d = new Date(log.date);
      const key = d.toLocaleString('en-US', { month: 'short' });
      if (months[key] !== undefined) months[key]++;
    });
    return Object.entries(months).map(([name, value]) => ({ name, value }));
  }, [activityLogs, currentMonth, currentYear]);

  const totalItems = habits.length + tasks.length + deadlines.length + reminders.length + progressTasks.length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Statistics</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Overview of all your tasks, habits, and goals
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: '#10B98120', color: '#10B981' }}>
                  <Flame className="w-5 h-5" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{habits.length}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Habits</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: '#F59E0B20', color: '#F59E0B' }}>
                  <CheckCircle2 className="w-5 h-5" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{tasks.length}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Tasks</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: '#EF444420', color: '#EF4444' }}>
                  <Clock className="w-5 h-5" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{deadlines.length}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Deadlines</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: '#3B82F620', color: '#3B82F6' }}>
                  <Target className="w-5 h-5" />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{progressTasks.length}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Goals</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 400 }}>
            <CardHeader title="Task Type Distribution" />
            <CardContent>
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#2D2D3A' : '#E5E7EB'}`,
                        borderRadius: 8,
                        color: isDark ? '#E5E7EB' : '#1F2937',
                      }}
                    />
                    <Legend
                      wrapperStyle={{ color: theme.palette.text.primary }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography sx={{ color: 'text.secondary' }}>No data yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 400 }}>
            <CardHeader title="By Category" />
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#2D2D3A' : '#E5E7EB'}`,
                        borderRadius: 8,
                        color: isDark ? '#E5E7EB' : '#1F2937',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography sx={{ color: 'text.secondary' }}>No data yet</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Task Completion & Reminders */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              title="Task Completion"
              subheader={`${completedTasks} of ${tasks.length} completed`}
            />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Completion Rate</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{taskCompletionRate}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={taskCompletionRate}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'grey.100',
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Chip
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  label={`${completedTasks} Done`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<Clock className="w-4 h-4" />}
                  label={`${pendingTasks} Pending`}
                  color="warning"
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              title="Reminder Status"
              subheader={`${reminders.length} total reminders`}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#6C5CE720', color: '#6C5CE7', width: 36, height: 36 }}>
                    <Bell className="w-4 h-4" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Active</Typography>
                    <LinearProgress variant="determinate" value={reminders.length > 0 ? (activeReminders / reminders.length) * 100 : 0} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{activeReminders}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#F59E0B20', color: '#F59E0B', width: 36, height: 36 }}>
                    <Zap className="w-4 h-4" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Snoozed</Typography>
                    <LinearProgress variant="determinate" value={reminders.length > 0 ? (snoozedReminders / reminders.length) * 100 : 0} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{snoozedReminders}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: '#9CA3AF20', color: '#9CA3AF', width: 36, height: 36 }}>
                    <CheckCircle2 className="w-4 h-4" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Dismissed</Typography>
                    <LinearProgress variant="determinate" value={reminders.length > 0 ? (dismissedReminders / reminders.length) * 100 : 0} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{dismissedReminders}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Progress Goals */}
      <Card>
        <CardHeader
          title="Progress Goals"
          subheader={`${progressTasks.length} active goals`}
        />
        <CardContent>
          {progressOverview.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Target className="w-12 h-12 mx-auto mb-2" style={{ color: isDark ? '#4B5563' : '#D1D5DB' }} />
              <Typography sx={{ color: 'text.secondary' }}>No progress goals yet</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {progressOverview.map((goal) => (
                <Box key={goal.name}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{goal.name}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: goal.color }}>
                      {goal.current} / {goal.target} {goal.unit} ({goal.percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={goal.percentage}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'grey.100',
                      '& .MuiLinearProgress-bar': { bgcolor: goal.color, borderRadius: 5 }
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Habit Streaks */}
      <Card>
        <CardHeader
          title="Top Habit Streaks"
          subheader="Your longest running habits"
        />
        <CardContent>
          {habitStreakData.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Flame className="w-12 h-12 mx-auto mb-2" style={{ color: isDark ? '#4B5563' : '#D1D5DB' }} />
              <Typography sx={{ color: 'text.secondary' }}>No habits yet</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {habitStreakData.map((habit) => (
                <Box key={habit.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: habit.color + '20', color: habit.color, width: 40, height: 40 }}>
                    <Flame className="w-5 h-5" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{habit.name}</Typography>
                  </Box>
                  <Chip
                    label={`🔥 ${habit.streak} days`}
                    sx={{ bgcolor: habit.color + '15', color: habit.color, fontWeight: 'bold' }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader
          title="Urgent Deadlines"
          subheader="Next 7 days"
        />
        <CardContent>
          {urgentDeadlines.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AlertTriangle className="w-12 h-12 mx-auto mb-2" style={{ color: isDark ? '#4B5563' : '#D1D5DB' }} />
              <Typography sx={{ color: 'text.secondary' }}>No urgent deadlines</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {urgentDeadlines.map((deadline) => {
                const days = getDaysUntil(deadline.date);
                return (
                  <Box key={deadline.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#EF444420', color: '#EF4444', width: 36, height: 36 }}>
                      <Clock className="w-4 h-4" />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{deadline.title}</Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={days === 0 ? 'Today' : `${days} days`}
                      color={days <= 2 ? 'error' : 'warning'}
                      variant="outlined"
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Monthly Activity (Legacy) */}
      <Card>
        <CardHeader
          title="Monthly Activity"
          subheader="Last 6 months"
        />
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyLogs}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#2D2D3A' : '#E5E7EB'}
              />
              <XAxis
                dataKey="name"
                tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: theme.palette.text.primary, fontSize: 12 }}
                axisLine={{ stroke: theme.palette.divider }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1A1A2E' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#2D2D3A' : '#E5E7EB'}`,
                  borderRadius: 8,
                  color: isDark ? '#E5E7EB' : '#1F2937',
                }}
              />
              <Bar dataKey="value" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Total Summary */}
      <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total Items</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Across all categories
              </Typography>
            </Box>
            <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
              {totalItems}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}