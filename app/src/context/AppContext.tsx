import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, ActivityType, ActivityLog, Reminder, UserProfile, AppSettings } from '@/types';
import { createDefaultState } from '@/lib/seed';

type Action =
  | { type: 'LOAD_STATE'; payload: AppState }
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
  | { type: 'UPDATE_PROFILE'; payload: UserProfile }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'RESET_DATA' }
  | { type: 'IMPORT_STATE'; payload: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;
    case 'ADD_ACTIVITY_TYPE':
      return { ...state, activityTypes: [...state.activityTypes, action.payload] };
    case 'UPDATE_ACTIVITY_TYPE':
      return {
        ...state,
        activityTypes: state.activityTypes.map((at) => (at.id === action.payload.id ? action.payload : at)),
      };
    case 'DELETE_ACTIVITY_TYPE':
      return {
        ...state,
        activityTypes: state.activityTypes.filter((at) => at.id !== action.id),
        activityLogs: state.activityLogs.filter((log) => log.activityTypeId !== action.id),
        reminders: state.reminders.filter((rem) => rem.activityTypeId !== action.id),
      };
    case 'ADD_LOG':
      return { ...state, activityLogs: [action.payload, ...state.activityLogs] };
    case 'UPDATE_LOG':
      return {
        ...state,
        activityLogs: state.activityLogs.map((log) => (log.id === action.payload.id ? action.payload : log)),
      };
    case 'DELETE_LOG':
      return {
        ...state,
        activityLogs: state.activityLogs.filter((log) => log.id !== action.id),
      };
    case 'ADD_REMINDER':
      return { ...state, reminders: [...state.reminders, action.payload] };
    case 'UPDATE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map((rem) => (rem.id === action.payload.id ? action.payload : rem)),
      };
    case 'DISMISS_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map((rem) => (rem.id === action.id ? { ...rem, dismissed: true } : rem)),
      };
    case 'DELETE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.filter((rem) => rem.id !== action.id),
      };
    case 'UPDATE_PROFILE':
      return { ...state, profile: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
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

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = 'lifetrack_state_v1';

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
        <div className="animate-pulse text-[#6C5CE7] font-semibold">Loading LifeTrack...</div>
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

export function useActivityTypes() {
  const { state } = useApp();
  return state.activityTypes;
}

export function useActivityLogs() {
  const { state } = useApp();
  return state.activityLogs;
}

export function useReminders() {
  const { state } = useApp();
  return state.reminders;
}

export function useProfile() {
  const { state } = useApp();
  return state.profile;
}

export function useSettings() {
  const { state } = useApp();
  return state.settings;
}
