import { useMemo } from 'react';
import { useActivityTypes, useActivityLogs } from '@/context/AppContext';
// useReminders removed - not needed for stats
import { CATEGORY_MAP } from '@/types';
import { format, subDays } from 'date-fns';
import { TrendingUp, Activity, Clock, CheckCircle2, BarChart3, Calendar } from 'lucide-react';

export function Statistics() {
  const activityTypes = useActivityTypes();
  const activityLogs = useActivityLogs();

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Total logs
    const totalLogs = activityLogs.length;

    // This month
    const thisMonthLogs = activityLogs.filter(log => {
      const d = new Date(log.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // This year
    const thisYearLogs = activityLogs.filter(log => {
      const d = new Date(log.date);
      return d.getFullYear() === currentYear;
    });

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    thisYearLogs.forEach(log => {
      const at = activityTypes.find(a => a.id === log.activityTypeId);
      if (at) {
        categoryCounts[at.category] = (categoryCounts[at.category] || 0) + 1;
      }
    });

    // Most active activity
    const activityCounts: Record<string, number> = {};
    activityLogs.forEach(log => {
      activityCounts[log.activityTypeId] = (activityCounts[log.activityTypeId] || 0) + 1;
    });
    const mostActiveId = Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0];
    const mostActive = mostActiveId ? activityTypes.find(a => a.id === mostActiveId[0]) : null;

    // Average logs per week (this month)
    const weeksInMonth = 4;
    const avgPerWeek = thisMonthLogs.length / weeksInMonth;

    // Active days (unique dates with logs)
    const uniqueDates = new Set(activityLogs.map(l => l.date)).size;

    // Completion rate (days with activity / days in current month so far)
    const daysSoFar = now.getDate();
    const completionRate = Math.round((uniqueDates / daysSoFar) * 100);

    return {
      totalLogs,
      thisMonth: thisMonthLogs.length,
      thisYear: thisYearLogs.length,
      categoryCounts,
      mostActive,
      mostActiveCount: mostActiveId ? mostActiveId[1] : 0,
      avgPerWeek: Math.round(avgPerWeek * 10) / 10,
      uniqueDates,
      completionRate,
    };
  }, [activityLogs, activityTypes]);

  // Weekly trend (last 8 weeks)
  const weeklyTrend = useMemo(() => {
    const weeks: { label: string; count: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekEnd = subDays(new Date(), i * 7);
      const weekStart = subDays(weekEnd, 6);
      const count = activityLogs.filter(log => {
        const d = new Date(log.date);
        return d >= weekStart && d <= weekEnd;
      }).length;
      weeks.push({
        label: format(weekStart, 'MMM d'),
        count,
      });
    }
    return weeks;
  }, [activityLogs]);

  const maxWeekly = Math.max(...weeklyTrend.map(w => w.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Insights into your activity tracking</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalLogs}</p>
          <p className="text-xs text-gray-500 mt-1">Total Activities Logged</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
          <p className="text-xs text-gray-500 mt-1">This Month</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.avgPerWeek}</p>
          <p className="text-xs text-gray-500 mt-1">Avg per Week</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.completionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Active Days Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly Trend */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#6C5CE7]" />
            Weekly Activity Trend
          </h3>
          <div className="flex items-end gap-2 h-48">
            {weeklyTrend.map((week, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 mb-1">{week.count}</span>
                  <div
                    className="w-full max-w-[40px] rounded-t-lg bg-[#6C5CE7] transition-all duration-500"
                    style={{ height: `${(week.count / maxWeekly) * 120}px` }}
                  />
                </div>
                <span className="text-[9px] text-gray-400">{week.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h3 className="font-semibold text-gray-900 mb-4">Category Breakdown (This Year)</h3>
          <div className="space-y-4">
            {Object.entries(stats.categoryCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => {
                const info = CATEGORY_MAP[category as keyof typeof CATEGORY_MAP];
                const total = stats.thisYear || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: info?.color }} />
                        <span className="text-sm font-medium text-gray-700">{info?.label || category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                        <span className="text-xs text-gray-400">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: info?.color }}
                      />
                    </div>
                  </div>
                );
              })}
            {Object.keys(stats.categoryCounts).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No activity data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Most Active */}
      {stats.mostActive && (
        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h3 className="font-semibold text-gray-900 mb-3">Most Tracked Activity</h3>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: stats.mostActive.color + '18' }}
            >
              <Clock className="w-7 h-7" style={{ color: stats.mostActive.color }} />
            </div>
            <div>
              <p className="font-semibold text-lg text-gray-900">{stats.mostActive.name}</p>
              <p className="text-sm text-gray-500">
                Logged {stats.mostActiveCount} times • {CATEGORY_MAP[stats.mostActive.category]?.label}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
