// ============================================================
// TASK MANAGEMENT TYPES — 5 Categories
// ============================================================

export type RepeatType = 'daily' | 'weekly' | 'custom';
export type ReminderRepeat = 'none' | 'daily' | 'weekly';
export type UnitType = 'L' | 'pages' | 'km' | 'kg' | 'minutes' | 'hours' | 'reps' | 'steps' | 'custom';

export type TaskCategory = 'habit' | 'oneTime' | 'deadline' | 'reminder' | 'progress';

// --- 1. HABITS (Recurring) ---
export interface Habit {
  id: string;
  title: string;
  repeatType: RepeatType;
  customInterval: number; // days, only used if repeatType === 'custom'
  lastLoggedDate: string | null; // ISO date string
  streakCount: number;
  optionalTarget?: {
    value: number;
    unit: UnitType;
    customUnit?: string; // if unit === 'custom'
  };
  category: 'health' | 'work' | 'personal' | 'finance' | 'other';
  color: string;
  createdAt: string;
}

// --- 2. ONE-TIME TASKS ---
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface OneTimeTask {
  id: string;
  title: string;
  dueDate: string; // ISO date string
  status: 'pending' | 'completed';
  subtasks: Subtask[];
  category: 'health' | 'work' | 'personal' | 'finance' | 'other';
  color: string;
  createdAt: string;
}

// --- 3. DEADLINE-BASED TASKS ---
export interface DeadlineTask {
  id: string;
  title: string;
  date: string; // ISO date string — ORIGINAL: when it's due
  category: 'health' | 'work' | 'personal' | 'finance' | 'other';
  color: string;
  createdAt: string;
  
  // NEW: Countdown/refill fields (all optional — existing tasks still work)
  lastRefillDate?: string | null; // ISO date — when it was last filled/renewed
  durationDays?: number; // how many days it should last (e.g., 15 for gas)
  reminderDays?: number; // warn this many days before empty (default: 3)
  refillHistory: string[]; // ISO dates — when it was filled/renewed
}

// NEW: Helper type for calculated countdown state
export interface DeadlineCountdown {
  daysSince: number; // days since last refill
  daysLeft: number; // days remaining (0 if overdue)
  percentUsed: number; // 0-100% of duration consumed
  isOverdue: boolean; // true if daysLeft === 0 and daysSince > duration
  isUrgent: boolean; // true if daysLeft <= reminderDays
}

// --- 4. REMINDERS ---
export interface ReminderItem {
  id: string;
  title: string;
  dateTime: string; // ISO datetime string
  repeat: ReminderRepeat;
  snoozedUntil: string | null; // ISO datetime string
  dismissed: boolean;
  category: 'health' | 'work' | 'personal' | 'finance' | 'other';
  color: string;
  createdAt: string;
}

// --- 5. PROGRESS-BASED TASKS ---
export interface ProgressTask {
  id: string;
  title: string;
  targetValue: number;
  currentProgress: number;
  unit: UnitType;
  customUnit?: string; // if unit === 'custom'
  dailyTarget?: number; // optional daily goal
  dailyTargetEnabled: boolean;
  logs: ProgressLog[];
  category: 'health' | 'work' | 'personal' | 'finance' | 'other';
  color: string;
  createdAt: string;
}

export interface ProgressLog {
  id: string;
  date: string; // ISO date string
  amount: number;
  note?: string;
}

// --- LEGACY TYPES (keep for backward compatibility) ---
export type TaskType = 'deadline' | 'habit' | 'birthday';

export interface ActivityType {
  id: string;
  name: string;
  category: 'health' | 'work' | 'personal' | 'finance' | 'other';
  icon: string;
  color: string;
  taskType: TaskType;
  hasExpectedDuration: boolean;
  hasAmount: boolean;
  amountLabel?: string;
  reminderEnabled: boolean;
}

export interface ActivityLog {
  id: string;
  activityTypeId: string;
  date: string;
  time: string;
  amount?: number;
  expectedDuration?: number;
  notes?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  activityTypeId: string;
  dueDate: string;
  message: string;
  dismissed: boolean;
}

export interface BirthdayPerson {
  id: string;
  name: string;
  birthday: string;
  relationship: string;
  notes?: string;
  color?: string;
  icon?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  birthday: string | null;
  joinedDate: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  weekStartsOn: 0 | 1;
  notificationsEnabled: boolean;
}

// --- APP STATE ---
export interface AppState {
  // New task management state
  habits: Habit[];
  oneTimeTasks: OneTimeTask[];
  deadlineTasks: DeadlineTask[];
  reminders: ReminderItem[];
  progressTasks: ProgressTask[];
  
  // Legacy state (keep for migration)
  activityTypes: ActivityType[];
  activityLogs: ActivityLog[];
  birthdays: BirthdayPerson[];
  
  profile: UserProfile;
  settings: AppSettings;
  onboardingComplete: boolean;
}

// --- CATEGORY MAP ---
export type CategoryInfo = {
  label: string;
  color: string;
  lightColor: string;
};

export const CATEGORY_MAP: Record<'health' | 'work' | 'personal' | 'finance' | 'other', CategoryInfo> = {
  health: { label: 'Health', color: '#10B981', lightColor: '#D1FAE5' },
  work: { label: 'Work', color: '#EC4899', lightColor: '#FCE7F3' },
  personal: { label: 'Personal', color: '#F59E0B', lightColor: '#FEF3C7' },
  finance: { label: 'Finance', color: '#3B82F6', lightColor: '#DBEAFE' },
  other: { label: 'Other', color: '#6C5CE7', lightColor: '#EDE9FE' },
};

export const UNIT_OPTIONS: { value: UnitType; label: string }[] = [
  { value: 'L', label: 'Liters (L)' },
  { value: 'pages', label: 'Pages' },
  { value: 'km', label: 'Kilometers (km)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'minutes', label: 'Minutes' },
  { value: 'hours', label: 'Hours' },
  { value: 'reps', label: 'Repetitions' },
  { value: 'steps', label: 'Steps' },
  { value: 'custom', label: 'Custom...' },
];

export const REPEAT_OPTIONS: { value: RepeatType; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom Interval' },
];

export const REMINDER_REPEAT_OPTIONS: { value: ReminderRepeat; label: string }[] = [
  { value: 'none', label: 'No Repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
];

export const TASK_TYPE_LABELS: Record<TaskType, { label: string; description: string; color: string }> = {
  deadline: { label: 'Deadline', description: 'Fixed date or recurring yearly', color: '#EF4444' },
  habit: { label: 'Habit', description: 'Recurring with progress tracking', color: '#10B981' },
  birthday: { label: 'Birthday', description: 'Yearly celebration reminder', color: '#EC4899' },
};