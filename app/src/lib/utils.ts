import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
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
  if (!birthdayStr) return null;
  const now = new Date();
  const currentYear = now.getFullYear();
  const [monthStr, dayStr] = birthdayStr.split('-');
  let nextBirthday = new Date(currentYear, parseInt(monthStr) - 1, parseInt(dayStr));
  
  if (isBefore(nextBirthday, now) && !isSameDay(nextBirthday, now)) {
    nextBirthday = addYears(nextBirthday, 1);
  }
  
  const daysUntil = differenceInDays(nextBirthday, now);
  const message = daysUntil === 0 ? 'Happy Birthday!' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`;
  
  return {
    daysUntil,
    nextBirthday: format(nextBirthday, 'MMM d, yyyy'),
    message,
  };
}

export function isBirthdayToday(birthdayStr: string | null): boolean {
  if (!birthdayStr) return false;
  const now = new Date();
  const [monthStr, dayStr] = birthdayStr.split('-');
  return now.getMonth() === parseInt(monthStr) - 1 && now.getDate() === parseInt(dayStr);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
