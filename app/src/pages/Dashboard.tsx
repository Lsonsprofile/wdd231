import { useNavigate } from 'react-router-dom';
import { useActivityTypes, useActivityLogs, useReminders, useProfile } from '@/context/AppContext';
import { getTimeSince, formatDateTime, getDaysUntil, getBirthdayReminder, getGreeting, isBirthdayToday } from '@/lib/utils';
import { StatCard } from '@/components/StatCard';
import { ActivityPieChart } from '@/components/ActivityPieChart';
import { ExerciseHeatmap } from '@/components/ExerciseHeatmap';
import { IconRenderer } from '@/components/IconRenderer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  Dumbbell,
  Bell,
  Flame,
  CalendarDays,
  Plus,
  PartyPopper,
} from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const activityTypes = useActivityTypes();
  const activityLogs = useActivityLogs();
  const reminders = useReminders();
  const profile = useProfile();
  const greeting = getGreeting();

  // Stats calculations
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const logsThisMonth = activityLogs.filter(log => {
    const d = new Date(log.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const exerciseType = activityTypes.find(at => at.name === 'Workout');
  const exerciseLogsThisMonth = exerciseType
    ? activityLogs.filter(log => {
        const d = new Date(log.date);
        return log.activityTypeId === exerciseType.id && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
    : [];

  const upcomingReminders = reminders.filter(r => !r.dismissed && getDaysUntil(r.dueDate) <= 7);

  // Longest streak
  const sortedLogs = [...activityLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const uniqueDates = [...new Set(sortedLogs.map(l => l.date))].sort().reverse();
  let streak = 0;
  let maxStreak = 0;
  let prevDate: Date | null = null;
  for (const dateStr of uniqueDates) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    if (prevDate) {
      const diff = (prevDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
      } else {
        maxStreak = Math.max(maxStreak, streak);
        streak = 1;
      }
    } else {
      streak = 1;
    }
    prevDate = d;
  }
  maxStreak = Math.max(maxStreak, streak);

  // Recent activities
  const recentLogs = activityLogs.slice(0, 5);

  // Time since last for each activity type
  const timeSinceData = activityTypes
    .map(at => {
      const logs = activityLogs.filter(l => l.activityTypeId === at.id);
      if (logs.length === 0) return null;
      const lastLog = logs.sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime())[0];
      const elapsed = getTimeSince(lastLog.date, lastLog.time);
      return { activityType: at, lastLog, elapsed };
    })
    .filter(Boolean)
    .slice(0, 4);

  // Upcoming reminders
  const activeReminders = reminders
    .filter(r => !r.dismissed)
    .sort((a, b) => getDaysUntil(a.dueDate) - getDaysUntil(b.dueDate))
    .slice(0, 5);

  // Birthday info
  const birthdayInfo = getBirthdayReminder(profile.birthday);

  return (
    <div className="space-y-6">
      {/* Mobile Greeting */}
      <div className="lg:hidden">
        <h1 className="text-xl font-bold text-gray-900">
          {greeting}, {profile.name}! 👋
        </h1>
        <p className="text-sm text-gray-500">Stay on track and keep going!</p>
      </div>

      {/* Birthday Banner */}
      {isBirthdayToday(profile.birthday) && (
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-4 flex items-center gap-3 text-white shadow-lg">
          <PartyPopper className="w-8 h-8" />
          <div>
            <p className="font-bold text-lg">Happy Birthday, {profile.name}! 🎉</p>
            <p className="text-white/80 text-sm">Wishing you a wonderful day ahead!</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Activities Tracked"
          value={logsThisMonth.length}
          subtext="This Month"
          color="#6C5CE7"
          icon={TrendingUp}
        />
        <StatCard
          title="Exercise Days"
          value={exerciseLogsThisMonth.length}
          subtext="This Month"
          color="#10B981"
          icon={Dumbbell}
        />
        <StatCard
          title="Upcoming Reminders"
          value={upcomingReminders.length}
          subtext="Next 7 Days"
          color="#EC4899"
          icon={Bell}
        />
        <StatCard
          title="Longest Streak"
          value={maxStreak}
          subtext="Days"
          color="#F59E0B"
          icon={Flame}
        />
      </div>

      {/* Three Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Activities */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Recent Activities</h3>
            <button onClick={() => navigate('/activities')} className="text-sm text-[#6C5CE7] hover:underline font-medium">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {recentLogs.map((log) => {
              const at = activityTypes.find(a => a.id === log.activityTypeId);
              if (!at) return null;
              const elapsed = getTimeSince(log.date, log.time);
              return (
                <div key={log.id} className="flex items-center gap-3 group cursor-pointer hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: at.color + '18' }}>
                    <IconRenderer iconName={at.icon} className="w-5 h-5" style={{ color: at.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{at.name}</p>
                    <p className="text-xs text-gray-500">
                      {log.amount && `${log.amount} ${at.amountLabel || ''} ${at.amountLabel ? '\u2022 ' : ''}`}
                      {log.expectedDuration && `Expected to last ${log.expectedDuration} days`}
                      {!log.amount && !log.expectedDuration && log.notes}
                    </p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <CalendarDays className="w-3 h-3" />
                      {formatDateTime(log.date, log.time)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold" style={{ color: at.color }}>{elapsed.days}</p>
                    <p className="text-[10px] text-gray-400">days ago</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => navigate('/add')}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl text-[#6C5CE7] font-medium text-sm hover:bg-[#6C5CE7]/5 transition-colors border border-dashed border-[#6C5CE7]/30"
          >
            <Plus className="w-4 h-4" />
            Add New Activity
          </button>
        </div>

        {/* Time Since Last Activity */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h3 className="font-semibold text-gray-900 mb-4">Time Since Last Activity</h3>
          <div className="space-y-4">
            {timeSinceData.map((data) => {
              if (!data) return null;
              const { activityType: at, lastLog, elapsed } = data;
              return (
                <div key={at.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: at.color + '18' }}>
                      <IconRenderer iconName={at.icon} className="w-4 h-4" style={{ color: at.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{at.name}</p>
                      <p className="text-[11px] text-gray-400">{formatDateTime(lastLog.date, lastLog.time)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold" style={{ color: at.color }}>{elapsed.days}</p>
                      <p className="text-[10px] text-gray-400">Days</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-lg py-2 text-center">
                      <p className="text-sm font-semibold text-gray-700">{elapsed.weeks}</p>
                      <p className="text-[10px] text-gray-400">Weeks</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg py-2 text-center">
                      <p className="text-sm font-semibold text-gray-700">{elapsed.months}</p>
                      <p className="text-[10px] text-gray-400">Months</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg py-2 text-center">
                      <p className="text-sm font-semibold text-gray-700">{elapsed.years}</p>
                      <p className="text-[10px] text-gray-400">Years</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => navigate('/activities')}
            className="w-full mt-4 text-center text-sm text-[#6C5CE7] hover:underline font-medium"
          >
            View All Activities
          </button>
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Upcoming Reminders</h3>
            <button onClick={() => navigate('/reminders')} className="text-sm text-[#6C5CE7] hover:underline font-medium">
              View all
            </button>
          </div>
          <div className="space-y-3">
            {/* Birthday reminder */}
            {birthdayInfo && (
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#FCE7F3' }}>
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                  <IconRenderer iconName="Gift" className="w-5 h-5" style={{ color: '#EC4899' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">Birthday</p>
                  <p className="text-xs text-gray-500">{birthdayInfo.nextBirthday}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-pink-600">{birthdayInfo.message}</p>
                  {birthdayInfo.daysUntil === 0 && <p className="text-[10px] text-pink-500">Happy Birthday! 🎉</p>}
                </div>
              </div>
            )}

            {activeReminders.map((reminder) => {
              const at = activityTypes.find(a => a.id === reminder.activityTypeId);
              const daysUntil = getDaysUntil(reminder.dueDate);
              const isOverdue = daysUntil < 0;
              const iconColor = isOverdue ? '#EF4444' : at?.color || '#6C5CE7';

              return (
                <div key={reminder.id} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconColor + '18' }}>
                    <IconRenderer iconName={at?.icon || 'Bell'} className="w-5 h-5" style={{ color: iconColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{reminder.message}</p>
                    <p className="text-xs text-gray-500">{reminder.dueDate}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn(
                      'text-sm font-bold',
                      isOverdue ? 'text-red-500' : daysUntil <= 1 ? 'text-orange-500' : 'text-gray-600'
                    )}>
                      {isOverdue ? `${Math.abs(daysUntil)}d overdue` : daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ExerciseHeatmap />
        <ActivityPieChart />

        {/* Profile & Quick Info */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h3 className="font-semibold text-gray-900 mb-4">Profile & Quick Info</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#A78BFA] flex items-center justify-center text-white font-bold text-xl">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{profile.name} {profile.email.split('@')[0].charAt(0).toUpperCase() + profile.email.split('@')[0].slice(1)}</p>
              <p className="text-xs text-gray-500">{profile.email}</p>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => navigate('/profile')}>
              Edit
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <CalendarDays className="w-4 h-4" />
            Joined {new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>

          {birthdayInfo && (
            <div className="bg-pink-50 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <IconRenderer iconName="Gift" className="w-4 h-4" style={{ color: '#EC4899' }} />
                <span className="text-sm font-medium text-gray-700">Birthday</span>
                <span className="ml-auto text-xs font-bold text-pink-600">{birthdayInfo.message}</span>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {profile.birthday?.split('-')[1]} {new Date(2024, parseInt(profile.birthday?.split('-')[0] || '0') - 1, 1).toLocaleDateString('en-US', { month: 'long' })}
              </p>
              {birthdayInfo.daysUntil === 0 && <p className="text-xs text-pink-500 mt-1">Happy Birthday! 🎉</p>}
            </div>
          )}

          <div className="bg-[#F3F4F8] rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl leading-none">&ldquo;</span>
            <div>
              <p className="text-sm text-gray-600 italic leading-relaxed">Small steps every day lead to big results.</p>
              <span className="text-lg leading-none float-right mt-1">💜</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
