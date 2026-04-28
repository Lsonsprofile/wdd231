import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useActivityTypes, useActivityLogs } from '@/context/AppContext';
import { CATEGORY_MAP } from '@/types';
import { useMemo } from 'react';

export function ActivityPieChart() {
  const activityTypes = useActivityTypes();
  const activityLogs = useActivityLogs();
  const currentYear = new Date().getFullYear();

  const data = useMemo(() => {
    const yearLogs = activityLogs.filter(log => new Date(log.date).getFullYear() === currentYear);
    const categoryCounts: Record<string, number> = {};

    yearLogs.forEach(log => {
      const at = activityTypes.find(a => a.id === log.activityTypeId);
      if (at) {
        categoryCounts[at.category] = (categoryCounts[at.category] || 0) + 1;
      }
    });

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({
        name: CATEGORY_MAP[category as keyof typeof CATEGORY_MAP]?.label || category,
        value: count,
        color: CATEGORY_MAP[category as keyof typeof CATEGORY_MAP]?.color || '#6C5CE7',
      }))
      .filter(d => d.value > 0);
  }, [activityLogs, activityTypes, currentYear]);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card">
      <h3 className="font-semibold text-gray-900 mb-4">Activity Overview (This Year)</h3>
      <div className="flex flex-col items-center">
        <div className="w-44 h-44 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.length > 0 ? data : [{ name: 'No Data', value: 1, color: '#E5E7EB' }]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {(data.length > 0 ? data : [{ name: 'No Data', value: 1, color: '#E5E7EB' }]).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
        </div>

        <div className="w-full mt-4 space-y-2">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-gray-600">{entry.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{entry.value}</span>
                <span className="text-xs text-gray-400">({total > 0 ? Math.round((entry.value / total) * 100) : 0}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
