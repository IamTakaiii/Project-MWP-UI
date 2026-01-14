/**
 * Application Types
 * 
 * Re-exports service types and defines app-specific types
 */

// Re-export Jira types from services
export type {
  JiraCredentials,
  JiraIssue,
  JiraSearchResponse,
  TaskFilters,
  WorklogData,
  WorklogEntry,
  WorklogHistoryResponse,
  DailyWorklog,
} from '@/services/jira'

// ============================================
// App-specific Types (not from services)
// ============================================

// Worklog creation result
export interface WorklogResult {
  success: number
  failed: number
}

// Log panel types
export type LogType = 'info' | 'success' | 'error'

export interface LogEntry {
  id: number
  message: string
  type: LogType
  timestamp: string
}

// Form types
export interface WorklogFormData {
  taskId: string
  accountId: string
  startDate: string
  endDate: string
  startTime: string
  timeSpent: string
  skipWeekends: boolean
  comment: string
}
