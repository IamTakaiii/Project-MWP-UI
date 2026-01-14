import { useState, useCallback } from 'react'
import { jiraService, type JiraIssue, type TaskFilters } from '@/services'
import { DEFAULT_VALUES } from '@/lib/constants'

/**
 * Custom hook for managing JIRA tasks
 * Uses session-based authentication (no credentials needed)
 */
export function useTasks() {
  const [tasks, setTasks] = useState<JiraIssue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(DEFAULT_VALUES.STATUS_FILTER)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async (
    filters?: Partial<TaskFilters>
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await jiraService.fetchMyTasks({
        searchText: filters?.searchText ?? searchText,
        status: filters?.status ?? statusFilter,
      })
      setTasks(data.issues || [])
      setIsOpen(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setTasks([])
    } finally {
      setIsLoading(false)
    }
  }, [searchText, statusFilter])

  const closePicker = useCallback(() => {
    setIsOpen(false)
  }, [])

  const reset = useCallback(() => {
    setTasks([])
    setIsOpen(false)
    setSearchText('')
    setStatusFilter(DEFAULT_VALUES.STATUS_FILTER)
    setError(null)
  }, [])

  const updateSearchText = useCallback((text: string) => {
    setSearchText(text)
  }, [])

  const updateStatusFilter = useCallback((status: string) => {
    setStatusFilter(status)
  }, [])

  return {
    tasks,
    isLoading,
    isOpen,
    searchText,
    statusFilter,
    error,
    fetchTasks,
    closePicker,
    reset,
    updateSearchText,
    updateStatusFilter,
  }
}
