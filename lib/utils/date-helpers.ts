import { addWeeks, differenceInDays, startOfWeek, endOfWeek, addDays, parseISO, format } from 'date-fns'

/**
 * Calculate cycle end date (12 weeks from start)
 */
export function calculateCycleEndDate(startDate: Date): Date {
  return addWeeks(startDate, 12)
}

/**
 * Calculate week number within cycle (1-12)
 */
export function getWeekNumber(cycleStartDate: Date, currentDate: Date): number {
  const daysDiff = differenceInDays(currentDate, cycleStartDate)
  const weekNumber = Math.floor(daysDiff / 7) + 1
  return Math.max(1, Math.min(12, weekNumber))
}

/**
 * Get week start and end dates for a specific week in the cycle
 */
export function getWeekDates(cycleStartDate: Date, weekNumber: number): { start: Date; end: Date } {
  const weekOffset = weekNumber - 1
  const weekStart = addWeeks(cycleStartDate, weekOffset)
  const weekEnd = addDays(weekStart, 6)

  return {
    start: weekStart,
    end: weekEnd
  }
}

/**
 * Check if a date is within the cycle
 */
export function isWithinCycle(date: Date, cycleStartDate: Date, cycleEndDate: Date): boolean {
  return date >= cycleStartDate && date <= cycleEndDate
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

/**
 * Format date for input field (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy-MM-dd')
}

/**
 * Get current week number in active cycle
 */
export function getCurrentWeek(cycleStartDate: string): number {
  return getWeekNumber(parseISO(cycleStartDate), new Date())
}
