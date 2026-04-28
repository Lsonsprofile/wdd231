import { useApp, useActivityTypes, useReminders, useProfile } from '@/context/AppContext';
import { getDaysUntil, getBirthdayReminder, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IconRenderer } from '@/components/IconRenderer';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PartyPopper,
} from 'lucide-react';
import { toast } from 'sonner';

export function Reminders() {
  const { dispatch } = useApp();
  const activityTypes = useActivityTypes();
  const reminders = useReminders();
  const profile = useProfile();

  const birthdayInfo = getBirthdayReminder(profile.birthday);

  const activeReminders = reminders
    .filter(r => !r.dismissed)
    .map(r => ({
      ...r,
      daysUntil: getDaysUntil(r.dueDate),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const dismissedReminders = reminders.filter(r => r.dismissed);

  const getGroup = (daysUntil: number) => {
    if (daysUntil < 0) return { label: 'Overdue', color: 'text-red-500', bg: 'bg-red-50' };
    if (daysUntil === 0) return { label: 'Today', color: 'text-orange-500', bg: 'bg-orange-50' };
    if (daysUntil === 1) return { label: 'Tomorrow', color: 'text-amber-500', bg: 'bg-amber-50' };
    if (daysUntil <= 7) return { label: 'This Week', color: 'text-blue-500', bg: 'bg-blue-50' };
    return { label: 'Later', color: 'text-gray-500', bg: 'bg-gray-50' };
  };

  const handleDismiss = (id: string) => {
    dispatch({ type: 'DISMISS_REMINDER', id });
    toast.success('Reminder dismissed');
  };

  const handleRestore = (id: string) => {
    const rem = reminders.find(r => r.id === id);
    if (rem) {
      dispatch({ type: 'UPDATE_REMINDER', payload: { ...rem, dismissed: false } });
      toast.success('Reminder restored');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
        <p className="text-sm text-gray-500 mt-0.5">Stay on top of your upcoming events and deadlines</p>
      </div>

      {birthdayInfo && (
        <div className={cn(
          'rounded-2xl p-6 flex items-center gap-4',
          birthdayInfo.daysUntil === 0
            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
            : 'bg-white shadow-card'
        )}>
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0',
            birthdayInfo.daysUntil === 0 ? 'bg-white/20' : 'bg-pink-100'
          )}>
            {birthdayInfo.daysUntil === 0 ? (
              <PartyPopper className="w-7 h-7 text-white" />
            ) : (
              <IconRenderer iconName="Gift" className="w-7 h-7" style={{ color: '#EC4899' }} />
            )}
          </div>
          <div className="flex-1">
            <p className={cn('font-semibold text-lg', birthdayInfo.daysUntil === 0 ? 'text-white' : 'text-gray-900')}>
              {birthdayInfo.daysUntil === 0 ? `Happy Birthday, ${profile.name}!` : `${profile.name}'s Birthday`}
            </p>
            <p className={cn('text-sm', birthdayInfo.daysUntil === 0 ? 'text-white/80' : 'text-gray-500')}>
              {birthdayInfo.nextBirthday}
              {birthdayInfo.daysUntil !== 0 && ` • ${birthdayInfo.message}`}
            </p>
          </div>
          {birthdayInfo.daysUntil === 0 && (
            <span className="text-4xl">🎉</span>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#6C5CE7]" />
            Active Reminders
          </h3>
          <span className="text-sm text-gray-500">{activeReminders.length} pending</span>
        </div>

        {activeReminders.length === 0 ? (
          <div className="text-center py-10">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">All caught up!</p>
            <p className="text-xs text-gray-400 mt-1">No pending reminders</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeReminders.map((reminder) => {
              const at = activityTypes.find(a => a.id === reminder.activityTypeId);
              const group = getGroup(reminder.daysUntil);
              const isOverdue = reminder.daysUntil < 0;

              return (
                <div
                  key={reminder.id}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl transition-colors',
                    isOverdue ? 'bg-red-50' : 'bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: isOverdue ? '#FEE2E2' : (at?.color || '#6C5CE7') + '18' }}
                  >
                    {isOverdue ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : (
                      <IconRenderer iconName={at?.icon || 'Bell'} className="w-5 h-5" style={{ color: at?.color || '#6C5CE7' }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{reminder.message}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{formatDate(reminder.dueDate)}</span>
                      <Badge
                        variant="secondary"
                        className={cn('text-[10px] rounded-md font-medium', group.color, group.bg)}
                      >
                        {group.label}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs flex-shrink-0"
                    onClick={() => handleDismiss(reminder.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {dismissedReminders.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h3 className="font-semibold text-gray-500 mb-4 text-sm">Dismissed</h3>
          <div className="space-y-2 opacity-60">
            {dismissedReminders.map((reminder) => {
              const at = activityTypes.find(a => a.id === reminder.activityTypeId);

              return (
                <div key={reminder.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: (at?.color || '#6C5CE7') + '18' }}>
                    <IconRenderer iconName={at?.icon || 'Bell'} className="w-4 h-4" style={{ color: at?.color || '#6C5CE7' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 line-through">{reminder.message}</p>
                    <p className="text-xs text-gray-400">{formatDate(reminder.dueDate)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs rounded-lg"
                    onClick={() => handleRestore(reminder.id)}
                  >
                    Restore
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
