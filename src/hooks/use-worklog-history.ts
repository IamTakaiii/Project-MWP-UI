import { useState, useCallback, useMemo } from 'react'
import { jiraService, type JiraCredentials, type WorklogEntry, type DailyWorklog } from '@/services'
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns'

const EIGHT_HOURS_SECONDS = 8 * 60 * 60

/**
 * Custom hook for managing worklog history
 */
export function useWorklogHistory() {
  const [worklogs, setWorklogs] = useState<WorklogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  // Computed date range (current week by default)
  const dateRange = useMemo(() => {
    // Use selectedDate to calculate week range
    const date = new Date(selectedDate)
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate Monday of the week containing selectedDate
    // If selectedDate is Monday (1), use it as start date
    // Otherwise, use startOfWeek which will give us Monday of that week
    let start: Date
    if (dayOfWeek === 1) {
      // selectedDate is Monday, use it as start
      start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      start.setHours(0, 0, 0, 0)
    } else {
      // Use startOfWeek to get Monday of the week containing selectedDate
      start = startOfWeek(date, { weekStartsOn: 1 })
    }
    
    // Always use endOfWeek to get Sunday of the week containing selectedDate
    const end = endOfWeek(date, { weekStartsOn: 1 })
    
    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
      start,
      end,
    }
  }, [selectedDate])

  // Group worklogs by date
  const dailyWorklogs = useMemo((): DailyWorklog[] => {
    const grouped: Record<string, WorklogEntry[]> = {}

    for (const worklog of worklogs) {
      const date = worklog.started.split('T')[0]
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(worklog)
    }

    return Object.entries(grouped)
      .map(([date, logs]) => {
        const totalSeconds = logs.reduce((sum, log) => sum + log.timeSpentSeconds, 0)
        const dayName = format(parseISO(date), 'EEEE')
        // Sort worklogs by started time (earliest first)
        const sortedLogs = logs.sort((a, b) => new Date(a.started).getTime() - new Date(b.started).getTime())
        return {
          date,
          dayName,
          worklogs: sortedLogs,
          totalSeconds,
          isComplete: totalSeconds >= EIGHT_HOURS_SECONDS,
        }
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [worklogs])

  // Total hours for the week
  const weekSummary = useMemo(() => {
    const totalSeconds = worklogs.reduce((sum, log) => sum + log.timeSpentSeconds, 0)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const expectedHours = 40 // 5 days * 8 hours
    const completionPercent = Math.min(100, Math.round((totalSeconds / (expectedHours * 3600)) * 100))
    
    return {
      totalSeconds,
      hours,
      minutes,
      expectedHours,
      completionPercent,
      isComplete: totalSeconds >= expectedHours * 3600,
    }
  }, [worklogs])

  const fetchHistory = useCallback(async (_credentials?: JiraCredentials) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await jiraService.fetchWorklogHistory(
        dateRange.startDate,
        dateRange.endDate
      )
      setWorklogs(data.worklogs || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setWorklogs([])
    } finally {
      setIsLoading(false)
    }
  }, [dateRange.startDate, dateRange.endDate])

  const goToPreviousWeek = useCallback(() => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() - 7)
      return newDate
    })
  }, [])

  const goToNextWeek = useCallback(() => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() + 7)
      return newDate
    })
  }, [])

  const goToCurrentWeek = useCallback(() => {
    setSelectedDate(new Date())
  }, [])

  return {
    worklogs,
    dailyWorklogs,
    weekSummary,
    dateRange,
    isLoading,
    error,
    fetchHistory,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
  }
}

/**
 * Format seconds to human readable string
 */
export function formatTimeSpent(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours === 0) {
    return `${minutes}m`
  }
  if (minutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${minutes}m`
}
