import { useState, useMemo } from 'react';
import {
  useHabits,
  useOneTimeTasks,
  useDeadlineTasks,
  useReminderItems,
  useProgressTasks,
  useActivityTypes,
  useActivityLogs,
} from '../context/AppContext';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  subMonths,
  addMonths,
  parseISO,
} from 'date-fns';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Flame,
  CheckCircle2,
  Clock,
  Bell,
  Target,
} from 'lucide-react';

// MUI Components
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Tabs,
  Tab,
  useTheme,
  Button,
} from '@mui/material';

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  type: 'habit' | 'task' | 'deadline' | 'reminder' | 'progress' | 'legacy';
  color: string;
  details?: string;
};

const typeConfig = {
  habit: { label: 'Habit', icon: Flame, color: '#10B981' },
  task: { label: 'Task', icon: CheckCircle2, color: '#F59E0B' },
  deadline: { label: 'Deadline', icon: Clock, color: '#EF4444' },
  reminder: { label: 'Reminder', icon: Bell, color: '#6C5CE7' },
  progress: { label: 'Progress', icon: Target, color: '#3B82F6' },
  legacy: { label: 'Activity', icon: CalendarDays, color: '#9CA3AF' },
};

export function Calendar() {
  const habits = useHabits();
  const tasks = useOneTimeTasks();
  const deadlines = useDeadlineTasks();
  const reminders = useReminderItems();
  const progressTasks = useProgressTasks();
  const activityTypes = useActivityTypes();
  const activityLogs = useActivityLogs();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Build all calendar events
  const allEvents = useMemo<CalendarEvent[]>(() => {
    const events: CalendarEvent[] = [];

    habits.forEach((habit) => {
      if (habit.lastLoggedDate) {
        events.push({
          id: `habit-${habit.id}`,
          title: habit.title,
          date: habit.lastLoggedDate,
          type: 'habit',
          color: habit.color,
          details: `${habit.streakCount} day streak`,
        });
      }
    });

    tasks.forEach((task) => {
      events.push({
        id: `task-${task.id}`,
        title: task.title,
        date: task.dueDate,
        type: 'task',
        color: task.color,
        details: task.status === 'completed' ? 'Completed' : 'Pending',
      });
    });

    deadlines.forEach((deadline) => {
      events.push({
        id: `deadline-${deadline.id}`,
        title: deadline.title,
        date: deadline.date,
        type: 'deadline',
        color: deadline.color,
      });
    });

    reminders.forEach((reminder) => {
      const date = reminder.dateTime.split('T')[0];
      events.push({
        id: `reminder-${reminder.id}`,
        title: reminder.title,
        date,
        type: 'reminder',
        color: reminder.color,
        details: reminder.repeat !== 'none' ? `Repeats ${reminder.repeat}` : undefined,
      });
    });

    progressTasks.forEach((task) => {
      task.logs.forEach((log) => {
        events.push({
          id: `progress-${task.id}-${log.id}`,
          title: task.title,
          date: log.date,
          type: 'progress',
          color: task.color,
          details: `+${log.amount} ${task.unit}`,
        });
      });
    });

    activityLogs.forEach((log) => {
      const at = activityTypes.find((a) => a.id === log.activityTypeId);
      events.push({
        id: `legacy-${log.id}`,
        title: at?.name || 'Activity',
        date: log.date,
        type: 'legacy',
        color: at?.color || '#9CA3AF',
        details: log.time,
      });
    });

    return events;
  }, [habits, tasks, deadlines, reminders, progressTasks, activityLogs, activityTypes]);

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'all') return allEvents;
    return allEvents.filter((e) => e.type === activeFilter);
  }, [allEvents, activeFilter]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return filteredEvents
      .filter((e) => isSameDay(parseISO(e.date), selectedDate))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedDate, filteredEvents]);

  const getDayEvents = (date: Date) => {
    return filteredEvents.filter((e) => isSameDay(parseISO(e.date), date));
  };

  const getEventDots = (date: Date) => {
    const dayEvents = getDayEvents(date);
    const typeCounts = dayEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).slice(0, 4);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Calendar
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          View all your tasks, habits, deadlines, and reminders
        </Typography>
      </Box>

      {/* Filter Tabs */}
      <Card>
        <Tabs
          value={activeFilter}
          onChange={(_, val) => setActiveFilter(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ '& .MuiTabs-flexContainer': { gap: 1, p: 1 } }}
        >
          <Tab label="All" value="all" />
          {Object.entries(typeConfig).map(([key, config]) => (
            <Tab
              key={key}
              value={key}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <config.icon className="w-3 h-3" />
                  {config.label}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Calendar Grid */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {format(currentMonth, 'MMMM yyyy')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  sx={{
                    minWidth: 40,
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    color: 'text.secondary',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => setCurrentMonth(new Date())}
                  variant="contained"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'medium',
                    borderRadius: 2,
                    bgcolor: 'action.selected',
                    color: 'text.primary',
                    '&:hover': { bgcolor: 'action.focus' },
                  }}
                >
                  Today
                </Button>
                <Button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  sx={{
                    minWidth: 40,
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    color: 'text.secondary',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Box>
            </Box>

            {/* Weekday headers */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1 }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <Box key={d} sx={{ textAlign: 'center', py: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                    {d}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Days */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
              {days.map((date, i) => {
                const isCurrentMonth = isSameMonth(date, currentMonth);
                const isToday = isSameDay(date, new Date());
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const dots = getEventDots(date);

                return (
                  <Box
                    key={i}
                    onClick={() => setSelectedDate(date)}
                    sx={{
                      aspectRatio: '1',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      pt: 1,
                      cursor: 'pointer',
                      position: 'relative',
                      opacity: isCurrentMonth ? 1 : 0.3,
                      bgcolor: isSelected ? 'primary.main' : 'transparent',
                      color: isSelected ? 'primary.contrastText' : 'text.primary',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                      },
                      outline: isToday && !isSelected ? `2px solid ${theme.palette.primary.main}` : 'none',
                      outlineOffset: isToday && !isSelected ? '2px' : 0,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 'medium',
                        color: isSelected ? 'primary.contrastText' : 'text.primary',
                      }}
                    >
                      {format(date, 'd')}
                    </Typography>
                    {dots.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap', justifyContent: 'center', px: 0.5 }}>
                        {dots.map(([type, count], j) => (
                          <Box
                            key={j}
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: typeConfig[type as keyof typeof typeConfig]?.color || '#6C5CE7',
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>

        {/* Selected Date Panel */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
            </Typography>

            {selectedDateEvents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CalendarDays className="w-12 h-12 mx-auto mb-3" style={{ color: isDark ? '#4B5563' : '#D1D5DB' }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {selectedDate ? 'No events on this day' : 'Click a date to view events'}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {selectedDateEvents.map((event) => {
                  const config = typeConfig[event.type];
                  const Icon = config.icon;
                  return (
                    <Card key={event.id} variant="outlined">
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: event.color + '20', color: event.color, width: 36, height: 36 }}>
                            <Icon className="w-4 h-4" />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {event.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip
                                size="small"
                                label={config.label}
                                sx={{
                                  bgcolor: event.color + '15',
                                  color: event.color,
                                  fontSize: '0.65rem',
                                  height: 20,
                                }}
                              />
                              {event.details && (
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {event.details}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}