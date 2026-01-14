import { eachDayOfInterval, parse, isWeekend, format } from 'date-fns'

/**
 * Generate array of dates between start and end
 */
export function generateDateRange(
  startDate: string,
  endDate: string,
  skipWeekends: boolean = true
): Date[] {
  if (!startDate || !endDate) return []

  try {
    const start = parse(startDate, 'yyyy-MM-dd', new Date())
    const end = parse(endDate, 'yyyy-MM-dd', new Date())

    let dates = eachDayOfInterval({ start, end })

    if (skipWeekends) {
      dates = dates.filter(date => !isWeekend(date))
    }

    return dates
  } catch (error) {
    console.error('Error generating date range:', error)
    return []
  }
}

/**
 * Create ISO timestamp for JIRA worklog
 */
export function createWorklogTimestamp(date: Date, time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const worklogDate = new Date(date)
  worklogDate.setHours(hours, minutes, 0, 0)
  return worklogDate.toISOString().replace('Z', '+0000')
}

/**
 * Format date for display
 */
export function formatDate(date: Date, formatStr: string = 'dd MMM yyyy'): string {
  return format(date, formatStr)
}

/**
 * Format date for display in task picker
 */
export function formatDateTag(date: Date): string {
  return format(date, 'EEE dd MMM')
}

/**
 * Format time spent string for JIRA
 * Examples: 
 * - "2h15m" → "2h 15m"
 * - "1d1h" → "1d 1h"
 * - "1d1h30m" → "1d 1h 30m"
 * - "1w2d" → "1w 2d"
 */
export function formatTimeSpent(input: string): string {
  if (!input) return input
  
  // Remove all spaces first
  const cleaned = input.replace(/\s+/g, '').toLowerCase()
  
  // Match patterns like "1w2d3h15m", "2h15m", "1d1h", etc.
  const match = cleaned.match(/^(\d+w)?(\d+d)?(\d+h)?(\d+m)?$/)
  
  if (!match) return input // Return original if doesn't match pattern
  
  const weeks = match[1] || ''
  const days = match[2] || ''
  const hours = match[3] || ''
  const minutes = match[4] || ''
  
  // Build formatted string with spaces between parts
  const parts = [weeks, days, hours, minutes].filter(Boolean)
  
  if (parts.length === 0) return input
  
  return parts.join(' ')
}
