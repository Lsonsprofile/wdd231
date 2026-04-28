import type { ActivityType, ActivityLog, Reminder, UserProfile, AppState, AppSettings } from '@/types';

const now = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex',
  email: 'alex.johnson@email.com',
  avatar: '',
  birthday: '05-25',
  joinedDate: '2024-03-15',
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  weekStartsOn: 1,
  notificationsEnabled: true,
};

export const DEFAULT_ACTIVITY_TYPES: ActivityType[] = [
  {
    id: 'at-1',
    name: 'Refilled Gas',
    category: 'finance',
    icon: 'Fuel',
    color: '#3B82F6',
    hasExpectedDuration: true,
    hasAmount: true,
    amountLabel: 'Liters',
    reminderEnabled: true,
  },
  {
    id: 'at-2',
    name: 'Workout',
    category: 'health',
    icon: 'Dumbbell',
    color: '#10B981',
    hasExpectedDuration: false,
    hasAmount: true,
    amountLabel: 'Minutes',
    reminderEnabled: false,
  },
  {
    id: 'at-3',
    name: 'Doctor Appointment',
    category: 'health',
    icon: 'Stethoscope',
    color: '#EC4899',
    hasExpectedDuration: false,
    hasAmount: false,
    reminderEnabled: true,
  },
  {
    id: 'at-4',
    name: 'Project Deadline',
    category: 'work',
    icon: 'Flag',
    color: '#F59E0B',
    hasExpectedDuration: false,
    hasAmount: false,
    reminderEnabled: true,
  },
  {
    id: 'at-5',
    name: 'Meditation',
    category: 'personal',
    icon: 'Brain',
    color: '#6C5CE7',
    hasExpectedDuration: false,
    hasAmount: true,
    amountLabel: 'Minutes',
    reminderEnabled: false,
  },
  {
    id: 'at-6',
    name: 'Birthday',
    category: 'personal',
    icon: 'Gift',
    color: '#EC4899',
    hasExpectedDuration: false,
    hasAmount: false,
    reminderEnabled: true,
  },
];

const d = (daysAgo: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  return date;
};

export const DEFAULT_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    activityTypeId: 'at-1',
    date: formatDate(d(3)),
    time: '08:45',
    amount: 40,
    expectedDuration: 15,
    notes: 'Full tank at Shell station',
    createdAt: d(3).toISOString(),
  },
  {
    id: 'log-2',
    activityTypeId: 'at-2',
    date: formatDate(d(1)),
    time: '07:15',
    amount: 45,
    notes: 'Morning cardio session',
    createdAt: d(1).toISOString(),
  },
  {
    id: 'log-3',
    activityTypeId: 'at-3',
    date: formatDate(d(0)),
    time: '10:00',
    notes: 'General checkup with Dr. Smith',
    createdAt: d(0).toISOString(),
  },
  {
    id: 'log-4',
    activityTypeId: 'at-4',
    date: formatDate(d(-8)),
    time: '14:00',
    notes: 'Website redesign project due',
    createdAt: d(-8).toISOString(),
  },
  {
    id: 'log-5',
    activityTypeId: 'at-5',
    date: formatDate(d(5)),
    time: '06:30',
    amount: 20,
    notes: 'Morning meditation',
    createdAt: d(5).toISOString(),
  },
  {
    id: 'log-6',
    activityTypeId: 'at-2',
    date: formatDate(d(2)),
    time: '18:00',
    amount: 60,
    notes: 'Evening strength training',
    createdAt: d(2).toISOString(),
  },
  {
    id: 'log-7',
    activityTypeId: 'at-2',
    date: formatDate(d(4)),
    time: '07:00',
    amount: 30,
    notes: 'Morning run',
    createdAt: d(4).toISOString(),
  },
  {
    id: 'log-8',
    activityTypeId: 'at-1',
    date: formatDate(d(18)),
    time: '09:15',
    amount: 35,
    expectedDuration: 14,
    notes: 'City gas station',
    createdAt: d(18).toISOString(),
  },
  {
    id: 'log-9',
    activityTypeId: 'at-5',
    date: formatDate(d(2)),
    time: '06:15',
    amount: 15,
    notes: 'Quick breathing exercise',
    createdAt: d(2).toISOString(),
  },
  {
    id: 'log-10',
    activityTypeId: 'at-2',
    date: formatDate(d(7)),
    time: '07:30',
    amount: 40,
    notes: 'Yoga session',
    createdAt: d(7).toISOString(),
  },
  {
    id: 'log-11',
    activityTypeId: 'at-2',
    date: formatDate(d(9)),
    time: '08:00',
    amount: 50,
    notes: 'HIIT workout',
    createdAt: d(9).toISOString(),
  },
  {
    id: 'log-12',
    activityTypeId: 'at-2',
    date: formatDate(d(10)),
    time: '07:45',
    amount: 35,
    notes: 'Morning jog',
    createdAt: d(10).toISOString(),
  },
  {
    id: 'log-13',
    activityTypeId: 'at-3',
    date: formatDate(d(30)),
    time: '11:00',
    notes: 'Dental cleaning',
    createdAt: d(30).toISOString(),
  },
  {
    id: 'log-14',
    activityTypeId: 'at-4',
    date: formatDate(d(-15)),
    time: '16:00',
    notes: 'Q2 report deadline',
    createdAt: d(-15).toISOString(),
  },
];

export const DEFAULT_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    activityTypeId: 'at-6',
    dueDate: formatDate(d(-1)),
    message: 'Birthday',
    isBirthday: true,
    dismissed: false,
  },
  {
    id: 'rem-2',
    activityTypeId: 'at-1',
    dueDate: formatDate(d(10)),
    message: 'Refill Gas (Estimated)',
    dismissed: false,
  },
  {
    id: 'rem-3',
    activityTypeId: 'at-3',
    dueDate: formatDate(d(2)),
    message: 'Team Meeting',
    dismissed: false,
  },
  {
    id: 'rem-4',
    activityTypeId: 'at-4',
    dueDate: formatDate(d(-8)),
    message: 'Project Deadline',
    dismissed: false,
  },
];

export const createDefaultState = (): AppState => ({
  activityTypes: DEFAULT_ACTIVITY_TYPES,
  activityLogs: DEFAULT_LOGS,
  reminders: DEFAULT_REMINDERS,
  profile: DEFAULT_PROFILE,
  settings: DEFAULT_SETTINGS,
  onboardingComplete: false,
});
