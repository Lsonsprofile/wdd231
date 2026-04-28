import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp, useActivityTypes, useActivityLogs } from '@/context/AppContext';
import { getTimeSince, formatDateTime } from '@/lib/utils';
import { CATEGORY_MAP } from '@/types';
import type { ActivityType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IconRenderer } from '@/components/IconRenderer';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Trash2,
  Clock,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

const categoryFilters = ['all', 'health', 'work', 'personal', 'finance', 'other'] as const;

export function Activities() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const activityTypes = useActivityTypes();
  const activityLogs = useActivityLogs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredActivities = activityTypes.filter(at => {
    const matchesSearch = at.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || at.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getLogCount = (atId: string) => activityLogs.filter(l => l.activityTypeId === atId).length;

  const getLastLog = (atId: string) => {
    const logs = activityLogs.filter(l => l.activityTypeId === atId);
    if (logs.length === 0) return null;
    return logs.sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime())[0];
  };

  const handleDelete = () => {
    if (!selectedActivity) return;
    dispatch({ type: 'DELETE_ACTIVITY_TYPE', id: selectedActivity.id });
    toast.success('Activity type deleted');
    setSelectedActivity(null);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and view all your activity types</p>
        </div>
        <Button
          onClick={() => navigate('/add')}
          className="bg-[#6C5CE7] hover:bg-[#5B4BD4] text-white rounded-xl h-11"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Activity Type
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl h-11"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categoryFilters.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                selectedCategory === cat
                  ? 'bg-[#6C5CE7] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              )}
            >
              {cat === 'all' ? 'All' : CATEGORY_MAP[cat]?.label || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActivities.map((at) => {
          const logCount = getLogCount(at.id);
          const lastLog = getLastLog(at.id);
          const elapsed = lastLog ? getTimeSince(lastLog.date, lastLog.time) : null;

          return (
            <div
              key={at.id}
              className="bg-white rounded-2xl p-5 shadow-card hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => setSelectedActivity(at)}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: at.color + '18' }}>
                  <IconRenderer iconName={at.icon} className="w-6 h-6" style={{ color: at.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{at.name}</h3>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-medium rounded-md"
                      style={{ backgroundColor: CATEGORY_MAP[at.category]?.lightColor, color: CATEGORY_MAP[at.category]?.color }}
                    >
                      {CATEGORY_MAP[at.category]?.label || at.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{logCount} log{logCount !== 1 ? 's' : ''}</span>
                    {elapsed && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {elapsed.text} ago
                      </span>
                    )}
                  </div>
                  {lastLog && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last: {formatDateTime(lastLog.date, lastLog.time)}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/add');
                  }}
                >
                  Log Now
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No activities found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or add a new activity type</p>
        </div>
      )}

      {/* Activity Detail Modal */}
      <Dialog open={!!selectedActivity} onOpenChange={() => { setSelectedActivity(null); setShowDeleteConfirm(false); }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl">
          {selectedActivity && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: selectedActivity.color + '18' }}>
                    <IconRenderer iconName={selectedActivity.icon} className="w-6 h-6" style={{ color: selectedActivity.color }} />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selectedActivity.name}</DialogTitle>
                    <Badge
                      variant="secondary"
                      className="text-[10px] mt-1"
                      style={{ backgroundColor: CATEGORY_MAP[selectedActivity.category]?.lightColor, color: CATEGORY_MAP[selectedActivity.category]?.color }}
                    >
                      {CATEGORY_MAP[selectedActivity.category]?.label || selectedActivity.category}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  {selectedActivity.hasAmount && (
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">Amount Label</p>
                      <p className="font-semibold text-sm">{selectedActivity.amountLabel}</p>
                    </div>
                  )}
                  {selectedActivity.hasExpectedDuration && (
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">Expected Duration</p>
                      <p className="font-semibold text-sm">Yes</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">Reminders</p>
                    <p className="font-semibold text-sm">{selectedActivity.reminderEnabled ? 'On' : 'Off'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500">Total Logs</p>
                    <p className="font-semibold text-sm">{getLogCount(selectedActivity.id)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-3">Recent Logs</h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {activityLogs
                      .filter(l => l.activityTypeId === selectedActivity.id)
                      .sort((a, b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime())
                      .slice(0, 10)
                      .map(log => {
                        const elapsed = getTimeSince(log.date, log.time);
                        return (
                          <div key={log.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                            <div>
                              <p className="text-sm font-medium">{formatDateTime(log.date, log.time)}</p>
                              {log.amount && <p className="text-xs text-gray-500">{log.amount} {selectedActivity.amountLabel}</p>}
                              {log.notes && <p className="text-xs text-gray-500">{log.notes}</p>}
                            </div>
                            <span className="text-xs text-gray-400">{elapsed.text} ago</span>
                          </div>
                        );
                      })}
                    {getLogCount(selectedActivity.id) === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No logs yet</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 bg-[#6C5CE7] hover:bg-[#5B4BD4] text-white rounded-xl"
                    onClick={() => {
                      setSelectedActivity(null);
                      navigate('/add');
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log Activity
                  </Button>
                  {!showDeleteConfirm ? (
                    <Button
                      variant="outline"
                      className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      className="rounded-xl"
                      onClick={handleDelete}
                    >
                      Confirm
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
