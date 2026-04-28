export interface ActivityType {
  id: string;
  name: string;
  category: 'health' | 'work' | 'personal' | 'finance' | 'other';
  icon: string;
  color: string;
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
  isBirthday?: boolean;
  dismissed: boolean;
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

export interface AppState {
  activityTypes: ActivityType[];
  activityLogs: ActivityLog[];
  reminders: Reminder[];
  profile: UserProfile;
  settings: AppSettings;
  onboardingComplete: boolean;
}

export type CategoryInfo = {
  label: string;
  color: string;
  lightColor: string;
};

export const CATEGORY_MAP: Record<ActivityType['category'], CategoryInfo> = {
  health: { label: 'Health', color: '#10B981', lightColor: '#D1FAE5' },
  work: { label: 'Work', color: '#EC4899', lightColor: '#FCE7F3' },
  personal: { label: 'Personal', color: '#F59E0B', lightColor: '#FEF3C7' },
  finance: { label: 'Finance', color: '#3B82F6', lightColor: '#DBEAFE' },
  other: { label: 'Other', color: '#6C5CE7', lightColor: '#EDE9FE' },
};
