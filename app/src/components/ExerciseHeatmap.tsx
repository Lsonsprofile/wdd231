import { useMemo } from 'react';
import { useActivityTypes, useActivityLogs } from '@/context/AppContext';
import { format, subDays, getDay, isSameDay } from 'date-fns';

export function ExerciseHeatmap() {
  const activityTypes = useActivityTypes();
  const activityLogs = useActivityLogs();

  const exerciseType = activityTypes.find(at => at.name.toLowerCase() === 'workout');

  const { grid, months, exerciseCountThisMonth, exerciseCountThisYear } = useMemo(() => {
    const today = new Date();
    const daysToShow = 180;
    const grid: { date: Date; count: number; week: number; day: number }[] = [];

    const exerciseLogs = exerciseType
      ? activityLogs.filter(l => l.activityTypeId === exerciseType.id)
      : [];

    for (let i = daysToShow; i >= 0; i--) {
      const date = subDays(today, i);
      const count = exerciseLogs.filter(l => isSameDay(new Date(l.date), date)).length;
      const dayIndex = getDay(date);
      const adjustedDay = dayIndex === 0 ? 6 : dayIndex - 1;
      grid.push({
        date,
        count,
        week: Math.floor((daysToShow - i) / 7),
        day: adjustedDay,
      });
    }

    const monthSet = new Map<number, string>();
    grid.forEach(({ date, week }) => {
      if (date.getDate() <= 7 && !monthSet.has(week)) {
        monthSet.set(week, format(date, 'MMM'));
      }
    });
    const months = Array.from(monthSet.entries());

    const thisMonthLogs = exerciseLogs.filter(l => {
      const d = new Date(l.date);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });

    const thisYearLogs = exerciseLogs.filter(l => {
      const d = new Date(l.date);
      return d.getFullYear() === today.getFullYear();
    });

    return {
      grid,
      months,
      exerciseCountThisMonth: thisMonthLogs.length,
      exerciseCountThisYear: thisYearLogs.length,
    };
  }, [activityLogs, activityTypes, exerciseType]);

  const getColor = (count: number): string => {
    if (count === 0) return '#F3F4F6';
    if (count === 1) return '#A7F3D0';
    if (count === 2) return '#34D399';
    return '#059669';
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card">
      <h3 className="font-semibold text-gray-900 mb-4">Exercise Consistency</h3>

      <div className="flex gap-4">
        {/* Heatmap Grid */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[280px]">
            {/* Month labels */}
            <div className="flex ml-7 mb-1">
              {months.map(([week, label]) => (
                <span key={week} className="text-[10px] text-gray-400 w-[14px]" style={{ marginLeft: week === 0 ? 0 : `${(week - (months[months.indexOf(months.find(m => m[0] === week) || [0, '']) - 1]?.[0] || 0)) * 14 - 14}px` }}>
                  {label}
                </span>
              ))}
            </div>

            <div className="flex">
              {/* Day labels */}
              <div className="flex flex-col gap-[3px] mr-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <span key={day} className="text-[9px] text-gray-400 h-[14px] flex items-center">
                    {i % 2 === 0 ? day : ''}
                  </span>
                ))}
              </div>

              {/* Grid cells */}
              <div className="flex gap-[3px]">
                {Array.from({ length: Math.ceil(grid.length / 7) }, (_, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {grid
                      .filter(g => g.week === weekIndex)
                      .map((cell, cellIndex) => (
                        <div
                          key={cellIndex}
                          className="w-[14px] h-[14px] rounded-[3px] transition-colors hover:ring-1 hover:ring-gray-400"
                          style={{ backgroundColor: getColor(cell.count) }}
                          title={`${format(cell.date, 'MMM d, yyyy')}: ${cell.count} exercise${cell.count !== 1 ? 's' : ''}`}
                        />
                      ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col justify-center gap-4 flex-shrink-0 min-w-[80px]">
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-500">{exerciseCountThisMonth}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Days</p>
            <p className="text-[10px] text-gray-400">This Month</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-700">{exerciseCountThisYear}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Days</p>
            <p className="text-[10px] text-gray-400">This Year</p>
          </div>
        </div>
      </div>
    </div>
  );
}
