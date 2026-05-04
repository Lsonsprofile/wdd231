// src/lib/dateUtils.ts
// Robust date calculations that handle leap years, month boundaries, and DST

/**
 * Parse an ISO date string (YYYY-MM-DD) safely
 */
export function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in JS
}

/**
 * Get ISO string (YYYY-MM-DD) from Date
 */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as ISO string
 */
export function getTodayISO(): string {
  return toISODate(new Date());
}

/**
 * Check if a year is a leap year (Gregorian calendar rules)
 * Rules: divisible by 4, except divisible by 100 unless also by 400
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Get days in a specific month (handles leap years for February)
 */
export function getDaysInMonth(year: number, month: number): number {
  // month is 1-12
  return new Date(year, month, 0).getDate();
}

/**
 * Calculate exact calendar days between two dates (leap-year aware, DST-safe)
 * Uses UTC to avoid daylight saving time issues
 */
export function getDaysBetween(startDate: string | Date, endDate: string | Date): number {
  const d1 = typeof startDate === 'string' ? parseISODate(startDate) : startDate;
  const d2 = typeof endDate === 'string' ? parseISODate(endDate) : endDate;
  
  // Use UTC to avoid DST boundary issues [^2^]
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

/**
 * Calculate days until a target date from today
 * Negative if date is in the past
 */
export function getDaysUntil(targetDate: string | Date): number {
  return getDaysBetween(getTodayISO(), targetDate);
}

/**
 * Calculate exact calendar months between two dates
 * This accounts for varying month lengths and leap years
 */
export function getMonthsBetween(startDate: string | Date, endDate: string | Date): number {
  const d1 = typeof startDate === 'string' ? parseISODate(startDate) : startDate;
  const d2 = typeof endDate === 'string' ? parseISODate(endDate) : endDate;
  
  const yearsDiff = d2.getFullYear() - d1.getFullYear();
  const monthsDiff = d2.getMonth() - d1.getMonth();
  const daysDiff = d2.getDate() - d1.getDate();
  
  let totalMonths = yearsDiff * 12 + monthsDiff;
  
  // Adjust if end day is before start day (incomplete month)
  if (daysDiff < 0) {
    totalMonths -= 1;
  }
  
  return totalMonths;
}

/**
 * Calculate exact calendar years between two dates
 * Accounts for leap years (e.g., Feb 29 to Feb 28 next year = 0 years, not 1)
 */
export function getYearsBetween(startDate: string | Date, endDate: string | Date): number {
  const d1 = typeof startDate === 'string' ? parseISODate(startDate) : startDate;
  const d2 = typeof endDate === 'string' ? parseISODate(endDate) : endDate;
  
  let years = d2.getFullYear() - d1.getFullYear();
  
  // Adjust if anniversary hasn't occurred yet this year
  const monthDiff = d2.getMonth() - d1.getMonth();
  const dayDiff = d2.getDate() - d1.getDate();
  
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years -= 1;
  }
  
  return years;
}

/**
 * Calculate weeks between two dates (using exact day count / 7)
 */
export function getWeeksBetween(startDate: string | Date, endDate: string | Date): number {
  const days = getDaysBetween(startDate, endDate);
  return Math.floor(days / 7);
}

/**
 * Get a detailed breakdown: years, months, days between dates
 * This is calendar-accurate and handles leap years properly
 */
export function getDetailedDuration(startDate: string | Date, endDate: string | Date) {
  const d1 = typeof startDate === 'string' ? parseISODate(startDate) : startDate;
  const d2 = typeof endDate === 'string' ? parseISODate(endDate) : endDate;
  
  // Ensure d1 <= d2
  if (d1 > d2) {
    return getDetailedDuration(d2, d1);
  }
  
  let years = d2.getFullYear() - d1.getFullYear();
  let months = d2.getMonth() - d1.getMonth();
  let days = d2.getDate() - d1.getDate();
  
  // Adjust for negative days
  if (days < 0) {
    months -= 1;
    // Add days from the previous month
    const prevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0);
    days += prevMonth.getDate();
  }
  
  // Adjust for negative months
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  
  // Calculate total days for reference
  const totalDays = getDaysBetween(d1, d2);
  
  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
  };
}

/**
 * Get countdown to a target date (for deadlines)
 */
export function getCountdown(targetDate: string | Date) {
  const days = getDaysUntil(targetDate);
  const now = new Date();
  const target = typeof targetDate === 'string' ? parseISODate(targetDate) : targetDate;
  
  if (days < 0) return { days: 0, hours: 0, minutes: 0, isOverdue: true };
  
  // Calculate remaining hours/minutes for today
  const endOfToday = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 23, 59, 59);
  const msRemaining = endOfToday.getTime() - now.getTime();
  
  const hours = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60)));
  
  return {
    days: Math.max(0, days),
    hours,
    minutes,
    isOverdue: false,
  };
}

/**
 * Add N days to a date (handles month/year boundaries and leap years)
 */
export function addDays(date: string | Date, days: number): Date {
  const d = typeof date === 'string' ? parseISODate(date) : new Date(date);
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add N months to a date (handles month-end and leap years)
 */
export function addMonths(date: string | Date, months: number): Date {
  const d = typeof date === 'string' ? parseISODate(date) : new Date(date);
  const result = new Date(d);
  result.setMonth(result.getMonth() + months);
  
  // If the day rolled over (e.g., Jan 31 + 1 month = Mar 3, not Feb 31),
  // JS automatically handles this, but we clamp to month-end if desired
  return result;
}

/**
 * Check if a date is today
 */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayISO();
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISODate(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get time since a past date (for "time ago" displays)
 */
export function getTimeSince(dateStr: string, timeStr?: string) {
  const date = parseISODate(dateStr);
  const [hours = 0, minutes = 0] = timeStr ? timeStr.split(':').map(Number) : [0, 0];
  date.setHours(hours, minutes, 0, 0);
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const duration = getDetailedDuration(date, now);
  
  return {
    ...duration,
    isPast: diffMs > 0,
  };
}