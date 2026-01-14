import { useState, useCallback } from 'react'
import { jiraService, type JiraCredentials, type JiraIssue, type TaskFilters } from '@/services'
import { DEFAULT_VALUES } from '@/lib/constants'

/**
 * Custom hook for managing JIRA tasks
 */
export function useTasks() {
  const [tasks, setTasks] = useState<JiraIssue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(DEFAULT_VALUES.STATUS_FILTER)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async (
    credentials: JiraCredentials,
    filters?: Partial<TaskFilters>
  ) => {
    const { jiraUrl, email, apiToken } = credentials

    if (!jiraUrl || !email || !apiToken) {
      setError('กรุณากรอก JIRA URL, Email และ API Token ก่อน')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const data = await jiraService.fetchMyTasks(credentials, {
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
