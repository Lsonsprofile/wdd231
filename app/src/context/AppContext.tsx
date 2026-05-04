import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  AppState,
  Habit,
  OneTimeTask,
  DeadlineTask,
  ReminderItem,
  ProgressTask,
  ActivityType,
  ActivityLog,
  Reminder,
  BirthdayPerson,
  UserProfile,
  AppSettings,
} from '@/types';
import { createDefaultState } from '@/lib/seed';

// ============================================================
// ACTION TYPES
// ============================================================

type Action =
  | { type: 'REFILL_DEADLINE_TASK'; id: string; refillDate: string }
  | { type: 'UNDO_REFILL_DEADLINE_TASK'; id: string }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_THEME'; mode: 'light' | 'dark' }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; id: string }
  | { type: 'LOG_HABIT'; id: string; date: string }
  | { type: 'ADD_ONE_TIME_TASK'; payload: OneTimeTask }
  | { type: 'UPDATE_ONE_TIME_TASK'; payload: OneTimeTask }
  | { type: 'DELETE_ONE_TIME_TASK'; id: string }
  | { type: 'TOGGLE_ONE_TIME_TASK'; id: string }
  | { type: 'TOGGLE_SUBTASK'; taskId: string; subtaskId: string }
  | { type: 'ADD_SUBTASK'; taskId: string; payload: { id: string; title: string } }
  | { type: 'DELETE_SUBTASK'; taskId: string; subtaskId: string }
  | { type: 'ADD_DEADLINE_TASK'; payload: DeadlineTask }
  | { type: 'UPDATE_DEADLINE_TASK'; payload: DeadlineTask }
  | { type: 'DELETE_DEADLINE_TASK'; id: string }
  | { type: 'ADD_REMINDER_ITEM'; payload: ReminderItem }
  | { type: 'UPDATE_REMINDER_ITEM'; payload: ReminderItem }
  | { type: 'DELETE_REMINDER_ITEM'; id: string }
  | { type: 'DISMISS_REMINDER_ITEM'; id: string }
  | { type: 'SNOOZE_REMINDER_ITEM'; id: string; until: string }
  | { type: 'ADD_PROGRESS_TASK'; payload: ProgressTask }
  | { type: 'UPDATE_PROGRESS_TASK'; payload: ProgressTask }
  | { type: 'DELETE_PROGRESS_TASK'; id: string }
  | { type: 'ADD_PROGRESS_LOG'; taskId: string; payload: { id: string; date: string; amount: number; note?: string } }
  | { type: 'ADD_ACTIVITY_TYPE'; payload: ActivityType }
  | { type: 'UPDATE_ACTIVITY_TYPE'; payload: ActivityType }
  | { type: 'DELETE_ACTIVITY_TYPE'; id: string }
  | { type: 'ADD_LOG'; payload: ActivityLog }
  | { type: 'UPDATE_LOG'; payload: ActivityLog }
  | { type: 'DELETE_LOG'; id: string }
  | { type: 'ADD_REMINDER'; payload: Reminder }
  | { type: 'UPDATE_REMINDER'; payload: Reminder }
  | { type: 'DISMISS_REMINDER'; id: string }
  | { type: 'DELETE_REMINDER'; id: string }
  | { type: 'ADD_BIRTHDAY'; payload: BirthdayPerson }
  | { type: 'UPDATE_BIRTHDAY'; payload: BirthdayPerson }
  | { type: 'DELETE_BIRTHDAY'; id: string }
  | { type: 'UPDATE_PROFILE'; payload: UserProfile }
  | { type: 'RESET_DATA' }
  | { type: 'IMPORT_STATE'; payload: AppState };

// ============================================================
// REDUCER
// ============================================================

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE': {
      const payload = action.payload as Partial<AppState>;
      // Migrate old data: ensure refillHistory exists on deadline tasks
      const migratedDeadlines = (payload.deadlineTasks ?? []).map((d: any) => ({
        ...d,
        refillHistory: d.refillHistory ?? [],
      }));
      return {
        ...createDefaultState(),
        ...payload,
        settings: {
          ...createDefaultState().settings,
          ...(payload.settings || {}),
        },
        habits: payload.habits ?? [],
        oneTimeTasks: payload.oneTimeTasks ?? [],
        deadlineTasks: migratedDeadlines,
        reminders: payload.reminders ?? [],
        progressTasks: payload.progressTasks ?? [],
        birthdays: payload.birthdays ?? [],
      };
    }

    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] };
    case 'UPDATE_HABIT':
      return { ...state, habits: state.habits.map((h) => (h.id === action.payload.id ? action.payload : h)) };
    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter((h) => h.id !== action.id) };
    case 'LOG_HABIT': {
      const today = action.date;
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== action.id) return h;
          const lastDate = h.lastLoggedDate;
          let newStreak = h.streakCount;
          if (lastDate) {
            const last = new Date(lastDate);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) newStreak = h.streakCount + 1;
            else if (diffDays > 1) newStreak = 1;
          } else {
            newStreak = 1;
          }
          return { ...h, lastLoggedDate: today, streakCount: newStreak };
        }),
      };
    }

    case 'ADD_ONE_TIME_TASK':
      return { ...state, oneTimeTasks: [...state.oneTimeTasks, action.payload] };
    case 'UPDATE_ONE_TIME_TASK':
      return { ...state, oneTimeTasks: state.oneTimeTasks.map((t) => (t.id === action.payload.id ? action.payload : t)) };
    case 'DELETE_ONE_TIME_TASK':
      return { ...state, oneTimeTasks: state.oneTimeTasks.filter((t) => t.id !== action.id) };
    case 'TOGGLE_ONE_TIME_TASK':
      return {
        ...state,
        oneTimeTasks: state.oneTimeTasks.map((t) =>
          t.id === action.id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' as const } : t
        ),
      };
    case 'TOGGLE_SUBTASK':
      return {
        ...state,
        oneTimeTasks: state.oneTimeTasks.map((t) =>
          t.id === action.taskId
            ? { ...t, subtasks: t.subtasks.map((st) => (st.id === action.subtaskId ? { ...st, completed: !st.completed } : st)) }
            : t
        ),
      };
    case 'ADD_SUBTASK':
      return {
        ...state,
        oneTimeTasks: state.oneTimeTasks.map((t) =>
          t.id === action.taskId ? { ...t, subtasks: [...t.subtasks, { ...action.payload, completed: false }] } : t
        ),
      };
    case 'DELETE_SUBTASK':
      return {
        ...state,
        oneTimeTasks: state.oneTimeTasks.map((t) =>
          t.id === action.taskId ? { ...t, subtasks: t.subtasks.filter((st) => st.id !== action.subtaskId) } : t
        ),
      };

    case 'ADD_DEADLINE_TASK':
      return { ...state, deadlineTasks: [...state.deadlineTasks, action.payload] };
    case 'UPDATE_DEADLINE_TASK':
      return { ...state, deadlineTasks: state.deadlineTasks.map((t) => (t.id === action.payload.id ? action.payload : t)) };
    case 'DELETE_DEADLINE_TASK':
      return { ...state, deadlineTasks: state.deadlineTasks.filter((t) => t.id !== action.id) };

    // ─── REFILL WITH HISTORY ───
    case 'REFILL_DEADLINE_TASK':
      return {
        ...state,
        deadlineTasks: state.deadlineTasks.map((t) =>
          t.id === action.id
            ? {
                ...t,
                refillHistory: t.lastRefillDate
                  ? [...(t.refillHistory || []), t.lastRefillDate]
                  : (t.refillHistory || []),
                lastRefillDate: action.refillDate,
              }
            : t
        ),
      };

    // ─── UNDO REFILL (revert to previous) ───
    case 'UNDO_REFILL_DEADLINE_TASK':
      return {
        ...state,
        deadlineTasks: state.deadlineTasks.map((t) => {
          if (t.id !== action.id) return t;
          const history = t.refillHistory || [];
          const previousRefill = history.length > 0 ? history[history.length - 1] : null;
          return {
            ...t,
            lastRefillDate: previousRefill,
            refillHistory: history.slice(0, -1),
          };
        }),
      };

    case 'ADD_REMINDER_ITEM':
      return { ...state, reminders: [...state.reminders, action.payload] };
    case 'UPDATE_REMINDER_ITEM':
      return { ...state, reminders: state.reminders.map((r) => (r.id === action.payload.id ? action.payload : r)) };
    case 'DELETE_REMINDER_ITEM':
      return { ...state, reminders: state.reminders.filter((r) => r.id !== action.id) };
    case 'DISMISS_REMINDER_ITEM':
      return { ...state, reminders: state.reminders.map((r) => (r.id === action.id ? { ...r, dismissed: true } : r)) };
    case 'SNOOZE_REMINDER_ITEM':
      return { ...state, reminders: state.reminders.map((r) => (r.id === action.id ? { ...r, snoozedUntil: action.until } : r)) };

    case 'ADD_PROGRESS_TASK':
      return { ...state, progressTasks: [...state.progressTasks, action.payload] };
    case 'UPDATE_PROGRESS_TASK':
      return { ...state, progressTasks: state.progressTasks.map((t) => (t.id === action.payload.id ? action.payload : t)) };
    case 'DELETE_PROGRESS_TASK':
      return { ...state, progressTasks: state.progressTasks.filter((t) => t.id !== action.id) };
    case 'ADD_PROGRESS_LOG':
      return {
        ...state,
        progressTasks: state.progressTasks.map((t) => {
          if (t.id !== action.taskId) return t;
          const newProgress = t.currentProgress + action.payload.amount;
          return { ...t, currentProgress: Math.min(newProgress, t.targetValue), logs: [...t.logs, action.payload] };
        }),
      };

    case 'ADD_ACTIVITY_TYPE':
      return { ...state, activityTypes: [...state.activityTypes, action.payload] };
    case 'UPDATE_ACTIVITY_TYPE':
      return { ...state, activityTypes: state.activityTypes.map((at) => (at.id === action.payload.id ? action.payload : at)) };
    case 'DELETE_ACTIVITY_TYPE':
      return { ...state, activityTypes: state.activityTypes.filter((at) => at.id !== action.id), activityLogs: state.activityLogs.filter((log) => log.activityTypeId !== action.id) };
    case 'ADD_LOG':
      return { ...state, activityLogs: [action.payload, ...state.activityLogs] };
    case 'UPDATE_LOG':
      return { ...state, activityLogs: state.activityLogs.map((log) => (log.id === action.payload.id ? action.payload : log)) };
    case 'DELETE_LOG':
      return { ...state, activityLogs: state.activityLogs.filter((log) => log.id !== action.id) };
    case 'ADD_REMINDER':
      return { ...state, reminders: [...state.reminders, action.payload as unknown as ReminderItem] };
    case 'UPDATE_REMINDER':
      return { ...state, reminders: state.reminders.map((rem) => (rem.id === action.payload.id ? (action.payload as unknown as ReminderItem) : rem)) };
    case 'DISMISS_REMINDER':
      return { ...state, reminders: state.reminders.map((rem) => (rem.id === action.id ? { ...rem, dismissed: true } : rem)) };
    case 'DELETE_REMINDER':
      return { ...state, reminders: state.reminders.filter((rem) => rem.id !== action.id) };
    case 'ADD_BIRTHDAY':
      return { ...state, birthdays: [...(state.birthdays || []), action.payload] };
    case 'UPDATE_BIRTHDAY':
      return { ...state, birthdays: (state.birthdays || []).map((b) => (b.id === action.payload.id ? action.payload : b)) };
    case 'DELETE_BIRTHDAY':
      return { ...state, birthdays: (state.birthdays || []).filter((b) => b.id !== action.id) };
    case 'UPDATE_PROFILE':
      return { ...state, profile: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_THEME':
      return { ...state, settings: { ...state.settings, theme: action.mode } };
    case 'COMPLETE_ONBOARDING':
      return { ...state, onboardingComplete: true };
    case 'RESET_DATA':
      return createDefaultState();
    case 'IMPORT_STATE':
      return { ...action.payload, onboardingComplete: true };
    default:
      return state;
  }
}

// ============================================================
// CONTEXT
// ============================================================

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'taskmanager_state_v2';

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, createDefaultState());
  const [loaded, setLoaded] = React.useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: AppState = JSON.parse(stored);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch {
        dispatch({ type: 'LOAD_STATE', payload: createDefaultState() });
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, loaded]);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F8]">
        <div className="animate-pulse text-[#6C5CE7] font-semibold">Loading Task Manager...</div>
      </div>
    );
  }

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// ============================================================
// HOOKS
// ============================================================

export function useHabits() { const { state } = useApp(); return state.habits; }
export function useOneTimeTasks() { const { state } = useApp(); return state.oneTimeTasks; }
export function useDeadlineTasks() { const { state } = useApp(); return state.deadlineTasks; }
export function useReminderItems() { const { state } = useApp(); return state.reminders; }
export function useProgressTasks() { const { state } = useApp(); return state.progressTasks; }
export function useActivityTypes() { const { state } = useApp(); return state.activityTypes; }
export function useActivityLogs() { const { state } = useApp(); return state.activityLogs; }
export function useReminders() { const { state } = useApp(); return state.reminders; }
export function useBirthdays() { const { state } = useApp(); return state.birthdays ?? []; }
export function useProfile() { const { state } = useApp(); return state.profile; }
export function useSettings() { const { state } = useApp(); return state.settings; }

export function useThemeMode() {
  const { state, dispatch } = useApp();
  const mode = (state.settings.theme as 'light' | 'dark') || 'light';
  const setMode = (newMode: 'light' | 'dark') => dispatch({ type: 'SET_THEME', mode: newMode });
  const toggleMode = () => setMode(mode === 'light' ? 'dark' : 'light');
  return { mode, setMode, toggleMode, isDark: mode === 'dark' };
}

export type { Action };