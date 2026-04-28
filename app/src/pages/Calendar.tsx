import { useState, useMemo } from 'react';
import { useActivityTypes, useActivityLogs } from '../context/AppContext';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, subMonths, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { IconRenderer } from '@/components/IconRenderer';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

export function Calendar() {
  const activityTypes = useActivityTypes();
  const activityLogs = useActivityLogs();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const selectedDateLogs = useMemo(() => {
    if (!selectedDate) return [];
    return activityLogs
      .filter(l => isSameDay(new Date(l.date), selectedDate))
      .sort((a, b) => b.time.localeCompare(a.time));
  }, [selectedDate, activityLogs]);

  const getDayLogs = (date: Date) => {
    return activityLogs.filter(l => isSameDay(new Date(l.date), date));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-sm text-gray-500 mt-0.5">View your activities by date</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((date, i) => {
              const dayLogs = getDayLogs(date);
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isToday = isSameDay(date, new Date());
              const isSelected = selectedDate && isSameDay(date, selectedDate);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    'aspect-square rounded-xl flex flex-col items-center justify-start pt-2 transition-all relative',
                    !isCurrentMonth && 'opacity-30',
                    isSelected ? 'bg-[#6C5CE7] text-white' : 'hover:bg-gray-50',
                    isToday && !isSelected && 'ring-2 ring-[#6C5CE7] ring-offset-1'
                  )}
                >
                  <span className={cn(
                    'text-sm font-medium',
                    isSelected ? 'text-white' : 'text-gray-700'
                  )}>
                    {format(date, 'd')}
                  </span>
                  {dayLogs.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-1">
                      {dayLogs.slice(0, 4).map((log, j) => {
                        const at = activityTypes.find(a => a.id === log.activityTypeId);
                        return (
                          <div
                            key={j}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: at?.color || '#6C5CE7' }}
                          />
                        );
                      })}
                      {dayLogs.length > 4 && (
                        <span className="text-[8px] leading-none">+</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-card">
          <h3 className="font-semibold text-gray-900 mb-4">
            {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
          </h3>

          {selectedDateLogs.length === 0 ? (
            <div className="text-center py-10">
              <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">
                {selectedDate ? 'No activities on this day' : 'Click a date to view activities'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateLogs.map(log => {
                const at = activityTypes.find(a => a.id === log.activityTypeId);
                if (!at) return null;
                return (
                  <div key={log.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: at.color + '18' }}>
                      <IconRenderer iconName={at.icon} className="w-4 h-4" style={{ color: at.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{at.name}</p>
                      <p className="text-xs text-gray-500">{log.time}</p>
                      {log.amount && <p className="text-xs text-gray-400">{log.amount} {at.amountLabel}</p>}
                      {log.notes && <p className="text-xs text-gray-400 truncate">{log.notes}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
