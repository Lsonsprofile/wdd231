import type {
  AppState,
  UserProfile,
  AppSettings,
} from '@/types';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function getNowISO(): string {
  return new Date().toISOString();
}

// ============================================================
// EMPTY DEFAULT STATE — Fresh Start
// ============================================================

const defaultProfile: UserProfile = {
  name: 'User',
  email: '',
  avatar: '',
  birthday: null,
  joinedDate: getTodayISO(),
};

const defaultSettings: AppSettings = {
  theme: 'light',
  weekStartsOn: 1,
  notificationsEnabled: true,
};

export function createDefaultState(): AppState {
  return {
    // All categories — EMPTY
    habits: [],
    oneTimeTasks: [],
    deadlineTasks: [],
    reminders: [],
    progressTasks: [],
    
    // Legacy — EMPTY
    activityTypes: [],
    activityLogs: [],
    birthdays: [],
    
    profile: defaultProfile,
    settings: defaultSettings,
    onboardingComplete: false,
  };
}