import { useState } from 'react';
import { useApp, useReminderItems, useProfile } from '../context/AppContext';
import { getBirthdayReminder } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PartyPopper,
  Gift,
  RotateCcw,
} from 'lucide-react';

// MUI Components
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from '@mui/material';

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function Reminders() {
  const { dispatch } = useApp();
  const reminders = useReminderItems();
  const profile = useProfile();
  const [activeTab, setActiveTab] = useState<'active' | 'dismissed' | 'all'>('active');
  const [showSnoozed, setShowSnoozed] = useState(true);

  const now = new Date();
  const birthdayInfo = getBirthdayReminder(profile.birthday);

  const filteredReminders = reminders.filter((r) => {
    if (activeTab === 'active') return !r.dismissed;
    if (activeTab === 'dismissed') return r.dismissed;
    return true;
  }).filter((r) => {
    if (!showSnoozed && r.snoozedUntil && new Date(r.snoozedUntil) > now) return false;
    return true;
  });

  const getReminderStatus = (reminder: typeof reminders[0]) => {
    const reminderDate = new Date(reminder.dateTime);
    const diffMs = reminderDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffHours / 24);

    if (reminder.dismissed) {
      return { label: 'Dismissed', color: 'default', bg: '#F3F4F6' };
    }
    if (reminder.snoozedUntil && new Date(reminder.snoozedUntil) > now) {
      return { label: 'Snoozed', color: 'warning', bg: '#FEF3C7' };
    }
    if (diffHours < 0) {
      return { label: 'Overdue', color: 'error', bg: '#FEE2E2' };
    }
    if (diffHours <= 24) {
      return { label: 'Today', color: 'error', bg: '#FEE2E2' };
    }
    if (diffDays <= 1) {
      return { label: 'Tomorrow', color: 'warning', bg: '#FEF3C7' };
    }
    if (diffDays <= 7) {
      return { label: 'This Week', color: 'info', bg: '#DBEAFE' };
    }
    return { label: 'Later', color: 'default', bg: '#F3F4F6' };
  };

  const handleDismiss = (id: string) => {
    dispatch({ type: 'DISMISS_REMINDER_ITEM', id });
    toast.success('Reminder dismissed');
  };

  const handleRestore = (id: string) => {
    dispatch({
      type: 'UPDATE_REMINDER_ITEM',
      payload: { ...reminders.find((r) => r.id === id)!, dismissed: false },
    });
    toast.success('Reminder restored');
  };

  const handleSnooze = (id: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dispatch({ type: 'SNOOZE_REMINDER_ITEM', id, until: tomorrow.toISOString() });
    toast.success('Reminder snoozed for 24 hours');
  };

  const handleUnsnooze = (id: string) => {
    dispatch({
      type: 'UPDATE_REMINDER_ITEM',
      payload: { ...reminders.find((r) => r.id === id)!, snoozedUntil: null },
    });
    toast.success('Reminder unsnoozed');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Reminders
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Stay on top of your upcoming events and deadlines
        </Typography>
      </Box>

      {/* Birthday Banner */}
      {birthdayInfo && (
        <Card
          sx={{
            background:
              birthdayInfo.daysUntil === 0
                ? 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)'
                : 'white',
            color: birthdayInfo.daysUntil === 0 ? 'white' : 'inherit',
          }}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor:
                  birthdayInfo.daysUntil === 0
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(236,72,153,0.1)',
                color: birthdayInfo.daysUntil === 0 ? 'white' : '#EC4899',
                width: 56,
                height: 56,
              }}
            >
              {birthdayInfo.daysUntil === 0 ? (
                <PartyPopper className="w-7 h-7" />
              ) : (
                <Gift className="w-7 h-7" />
              )}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {birthdayInfo.daysUntil === 0
                  ? `Happy Birthday, ${profile.name}!`
                  : `${profile.name}'s Birthday`}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: birthdayInfo.daysUntil === 0 ? 0.9 : 1,
                  color: birthdayInfo.daysUntil === 0 ? 'inherit' : 'text.secondary',
                }}
              >
                {birthdayInfo.nextBirthday}
                {birthdayInfo.daysUntil !== 0 && ` • ${birthdayInfo.message}`}
              </Typography>
            </Box>
            {birthdayInfo.daysUntil === 0 && (
              <Typography variant="h3" sx={{ lineHeight: 1 }}>
                🎉
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              sx={{ minHeight: 40 }}
            >
              <Tab
                label={`Active (${reminders.filter((r) => !r.dismissed).length})`}
                value="active"
              />
              <Tab
                label={`Dismissed (${reminders.filter((r) => r.dismissed).length})`}
                value="dismissed"
              />
              <Tab label="All" value="all" />
            </Tabs>
            <FormControlLabel
              control={
                <Switch
                  checked={showSnoozed}
                  onChange={(e) => setShowSnoozed(e.target.checked)}
                  size="small"
                />
              }
              label="Show snoozed"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Reminders List */}
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Bell className="w-5 h-5" style={{ color: '#6C5CE7' }} />
              <Typography variant="h6">Reminders</Typography>
            </Box>
          }
          subheader={`${filteredReminders.length} reminder${filteredReminders.length !== 1 ? 's' : ''}`}
        />
        <CardContent>
          {filteredReminders.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
                All caught up!
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No {activeTab} reminders
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {filteredReminders.map((reminder) => {
                const reminderDate = new Date(reminder.dateTime);
                const status = getReminderStatus(reminder);
                const isOverdue = reminderDate < now && !reminder.dismissed && !reminder.snoozedUntil;
                const timeStr = reminderDate.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <Card
                    key={reminder.id}
                    variant="outlined"
                    sx={{
                      opacity: reminder.dismissed ? 0.6 : 1,
                      bgcolor: isOverdue ? 'rgba(239,68,68,0.04)' : 'inherit',
                      borderColor: isOverdue ? 'error.light' : 'divider',
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: isOverdue
                              ? 'rgba(239,68,68,0.1)'
                              : reminder.color + '20',
                            color: isOverdue ? 'error.main' : reminder.color,
                            width: 44,
                            height: 44,
                          }}
                        >
                          {isOverdue ? (
                            <AlertTriangle className="w-5 h-5" />
                          ) : (
                            <Bell className="w-5 h-5" />
                          )}
                        </Avatar>

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 'bold',
                              textDecoration: reminder.dismissed
                                ? 'line-through'
                                : 'none',
                              color: reminder.dismissed
                                ? 'text.disabled'
                                : 'text.primary',
                            }}
                          >
                            {reminder.title}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mt: 0.5,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Chip
                              size="small"
                              label={status.label}
                              sx={{
                                bgcolor: status.bg,
                                color:
                                  status.color === 'error'
                                    ? '#EF4444'
                                    : status.color === 'warning'
                                      ? '#F59E0B'
                                      : status.color === 'info'
                                        ? '#3B82F6'
                                        : '#6B7280',
                                fontSize: '0.7rem',
                                height: 22,
                              }}
                            />
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {reminderDate.toLocaleDateString()} at {timeStr}
                            </Typography>
                            {reminder.repeat !== 'none' && (
                              <Chip
                                size="small"
                                label={`Repeats ${reminder.repeat}`}
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 22 }}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Actions */}
                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                          {!reminder.dismissed && (
                            <>
                              {reminder.snoozedUntil &&
                              new Date(reminder.snoozedUntil) > now ? (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<RotateCcw className="w-3 h-3" />}
                                  onClick={() => handleUnsnooze(reminder.id)}
                                >
                                  Unsnooze
                                </Button>
                              ) : (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Clock className="w-3 h-3" />}
                                  onClick={() => handleSnooze(reminder.id)}
                                >
                                  Snooze
                                </Button>
                              )}
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<CheckCircle2 className="w-3 h-3" />}
                                onClick={() => handleDismiss(reminder.id)}
                              >
                                Dismiss
                              </Button>
                            </>
                          )}
                          {reminder.dismissed && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<RotateCcw className="w-3 h-3" />}
                              onClick={() => handleRestore(reminder.id)}
                            >
                              Restore
                            </Button>
                          )}
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
  );
}