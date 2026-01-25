import { useState, useCallback, useMemo, useEffect } from 'react'
import { STORAGE_KEYS } from '@/lib/constants'
import type { JiraIssue } from '@/types'

const MAX_RECENT_TASKS = 4
const MAX_FAVORITE_TASKS = 20

interface TaskUsage {
  taskKey: string
  summary: string
  lastUsed: number // timestamp
  useCount: number
  isFavorite: boolean
}

export function useFavoriteTasks() {
  const [tasks, setTasks] = useState<TaskUsage[]>([])

  // Load tasks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.FAVORITE_TASKS)
    if (stored) {
      try {
        setTasks(JSON.parse(stored))
      } catch {
        setTasks([])
      }
    }
  }, [])

  // Save to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem(STORAGE_KEYS.FAVORITE_TASKS, JSON.stringify(tasks))
    }
  }, [tasks])

  // Record task usage
  const recordTaskUsage = useCallback((task: JiraIssue) => {
    setTasks((prev) => {
      const existingIndex = prev.findIndex((t) => t.taskKey === task.key)
      const now = Date.now()

      if (existingIndex >= 0) {
        // Update existing task
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastUsed: now,
          useCount: updated[existingIndex].useCount + 1,
          summary: task.fields.summary, // Update summary in case it changed
        }
        // Sort by lastUsed (most recent first)
        return updated.sort((a, b) => b.lastUsed - a.lastUsed)
      } else {
        // Add new task
        const newTask: TaskUsage = {
          taskKey: task.key,
          summary: task.fields.summary,
          lastUsed: now,
          useCount: 1,
          isFavorite: false,
        }
        const updated = [newTask, ...prev]
        // Keep only MAX_RECENT_TASKS
        return updated.slice(0, MAX_RECENT_TASKS).sort((a, b) => b.lastUsed - a.lastUsed)
      }
    })
  }, [])

  // Toggle favorite status
  const toggleFavorite = useCallback((taskKey: string) => {
    setTasks((prev) => {
      const updated = prev.map((task) =>
        task.taskKey === taskKey
          ? { ...task, isFavorite: !task.isFavorite }
          : task
      )
      return updated.sort((a, b) => {
        // Favorites first, then by lastUsed
        if (a.isFavorite !== b.isFavorite) {
          return a.isFavorite ? -1 : 1
        }
        return b.lastUsed - a.lastUsed
      })
    })
  }, [])

  // Remove task from list
  const removeTask = useCallback((taskKey: string) => {
    setTasks((prev) => prev.filter((task) => task.taskKey !== taskKey))
  }, [])

  // Get favorite tasks
  const favoriteTasks = useMemo(() => {
    return tasks.filter((task) => task.isFavorite).slice(0, MAX_FAVORITE_TASKS)
  }, [tasks])

  // Get recent tasks (non-favorites, sorted by lastUsed)
  const recentTasks = useMemo(() => {
    return tasks
      .filter((task) => !task.isFavorite)
      .sort((a, b) => b.lastUsed - a.lastUsed)
      .slice(0, MAX_RECENT_TASKS)
  }, [tasks])

  // Get all tasks sorted (favorites first, then by lastUsed)
  const allTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) {
        return a.isFavorite ? -1 : 1
      }
      return b.lastUsed - a.lastUsed
    })
  }, [tasks])

  return {
    favoriteTasks,
    recentTasks,
    allTasks,
    recordTaskUsage,
    toggleFavorite,
    removeTask,
  }
}
