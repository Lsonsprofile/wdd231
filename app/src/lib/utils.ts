import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { DeadlineTask, DeadlineCountdown } from '@/types';
import { format, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears, parseISO, isSameDay, addYears, isBefore } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTimeSince(dateStr: string, timeStr?: string): { text: string; days: number; weeks: number; months: number; years: number } {
  const dateTime = timeStr ? new Date(`${dateStr}T${timeStr}`) : parseISO(dateStr);
  const now = new Date();
  const days = Math.max(0, differenceInDays(now, dateTime));
  const weeks = Math.max(0, differenceInWeeks(now, dateTime));
  const months = Math.max(0, differenceInMonths(now, dateTime));
  const years = Math.max(0, differenceInYears(now, dateTime));

  let text = '';
  if (years > 0) text = `${years} Year${years !== 1 ? 's' : ''}`;
  else if (months > 0) text = `${months} Month${months !== 1 ? 's' : ''}`;
  else if (weeks > 0) text = `${weeks} Week${weeks !== 1 ? 's' : ''}`;
  else text = `${days} Day${days !== 1 ? 's' : ''}`;

  return { text, days, weeks, months, years };
}

export function getDaysUntil(dateStr: string): number {
  const date = parseISO(dateStr);
  const now = new Date();
  return differenceInDays(date, now);
}

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

export function formatDateTime(dateStr: string, timeStr?: string): string {
  const date = timeStr ? new Date(`${dateStr}T${timeStr}`) : parseISO(dateStr);
  return format(date, 'MMM d, yyyy \'at\' h:mm a');
}

export function getBirthdayReminder(birthdayStr: string | null): { daysUntil: number; nextBirthday: string; message: string } | null {
  if (!birthdayStr || birthdayStr.length !== 5) return null;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const [monthStr, dayStr] = birthdayStr.split('-');
  
  const month = parseInt(monthStr);
  const day = parseInt(dayStr);
  
  if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  
  let nextBirthday = new Date(currentYear, month - 1, day);
  
  if (isNaN(nextBirthday.getTime())) {
    return null;
  }
  
  if (isBefore(nextBirthday, now) && !isSameDay(nextBirthday, now)) {
    nextBirthday = addYears(nextBirthday, 1);
  }
  
  const daysUntil = differenceInDays(nextBirthday, now);
  const message = daysUntil === 0 ? 'Happy Birthday!' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;
  
  return {
    daysUntil,
    nextBirthday: format(nextBirthday, 'MMMM d'),
    message,
  };
}

export function isBirthdayToday(birthdayStr: string | null): boolean {
  if (!birthdayStr || birthdayStr.length !== 5) return false;
  
  const now = new Date();
  const [monthStr, dayStr] = birthdayStr.split('-');
  const month = parseInt(monthStr);
  const day = parseInt(dayStr);
  
  if (isNaN(month) || isNaN(day)) return false;
  
  return now.getMonth() === month - 1 && now.getDate() === day;
}

export function getPersonBirthdayInfo(birthdayStr: string): { daysUntil: number; nextBirthday: string; message: string; isToday: boolean } | null {
  if (!birthdayStr || birthdayStr.length !== 5) return null;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const [monthStr, dayStr] = birthdayStr.split('-');
  
  const month = parseInt(monthStr);
  const day = parseInt(dayStr);
  
  if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  
  let nextBirthday = new Date(currentYear, month - 1, day);
  
  if (isNaN(nextBirthday.getTime())) {
    return null;
  }
  
  const isToday = isSameDay(nextBirthday, now);
  
  if (isBefore(nextBirthday, now) && !isToday) {
    nextBirthday = addYears(nextBirthday, 1);
  }
  
  const daysUntil = differenceInDays(nextBirthday, now);
  let message = '';
  if (isToday) message = 'Today! 🎉';
  else if (daysUntil === 1) message = 'Tomorrow';
  else if (daysUntil <= 7) message = `In ${daysUntil} days`;
  else if (daysUntil <= 30) message = `In ${daysUntil} days`;
  else message = `${format(nextBirthday, 'MMMM d')}`;
  
  return {
    daysUntil,
    nextBirthday: format(nextBirthday, 'MMMM d'),
    message,
    isToday,
  };
}

export function sortBirthdaysByUpcoming<T extends { birthday: string; id?: string; name?: string; relationship?: string; color?: string; icon?: string; notes?: string }>(
  birthdays: T[] | null | undefined
): (T & { info: NonNullable<ReturnType<typeof getPersonBirthdayInfo>> })[] {
  if (!birthdays || !Array.isArray(birthdays)) return [];
  
  return birthdays
    .map((b) => {
      const info = getPersonBirthdayInfo(b.birthday);
      return info ? { ...b, info } : null;
    })
    .filter((b): b is NonNullable<typeof b> => b !== null)
    .sort((a, b) => a.info.daysUntil - b.info.daysUntil);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getCountdown(dateStr: string): { days: number; hours: number; minutes: number } {
  const target = new Date(dateStr + 'T23:59:59');
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
}

export function calculateDeadlineCountdown(task: DeadlineTask): DeadlineCountdown | null {
  // If no refill tracking set up, return null (falls back to normal deadline display)
  if (!task.lastRefillDate || !task.durationDays || task.durationDays <= 0) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastRefill = new Date(task.lastRefillDate);
  lastRefill.setHours(0, 0, 0, 0);
  
  const duration = task.durationDays;
  const reminder = task.reminderDays ?? 3;
  
  const diffTime = today.getTime() - lastRefill.getTime();
  const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(duration - daysSince, 0);
  const percentUsed = Math.min(Math.round((daysSince / duration) * 100), 100);
  const isOverdue = daysSince > duration;
  const isUrgent = daysLeft <= reminder && daysLeft > 0;

  return {
    daysSince,
    daysLeft,
    percentUsed,
    isOverdue,
    isUrgent,
  };
}