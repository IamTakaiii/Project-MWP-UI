/**
 * Jira Service Types
 */

// ============================================
// Credentials & Auth
// ============================================

export interface JiraCredentials {
  jiraUrl: string
  email: string
  apiToken: string
}

// ============================================
// Issues & Tasks
// ============================================

export interface JiraIssue {
  id: string
  key: string
  fields: {
    summary: string
    status?: {
      name: string
      statusCategory?: {
        key?: string
        name?: string
        colorName?: string
      }
    }
    issuetype?: {
      name: string
      iconUrl?: string
    }
    project?: {
      key: string
      name: string
    }
  }
}

export interface JiraSearchResponse {
  issues: JiraIssue[]
  total: number
  maxResults: number
  startAt: number
}

export interface TaskFilters {
  searchText?: string
  status?: string
}

// ============================================
// Worklogs
// ============================================

export interface WorklogData {
  timeSpent: string
  started: string
  comment?: string
}

export interface WorklogEntry {
  id: string
  issueKey: string
  issueSummary: string
  projectKey?: string
  author?: string
  authorAccountId?: string
  timeSpent: string
  timeSpentSeconds: number
  started: string
  comment: string
  created: string
  updated: string
}

export interface WorklogHistoryResponse {
  worklogs: WorklogEntry[]
  totalIssues: number
}

export interface DailyWorklog {
  date: string
  dayName: string
  worklogs: WorklogEntry[]
  totalSeconds: number
  isComplete: boolean
}

// ============================================
// API Payloads
// ============================================

export interface CreateWorklogPayload extends JiraCredentials {
  taskId: string
  payload: {
    timeSpent: string
    started: string
    comment?: {
      type: 'doc'
      version: number
      content: Array<{
        type: 'paragraph'
        content: Array<{
          type: 'text'
          text: string
        }>
      }>
    }
  }
}

export interface UpdateWorklogPayload extends JiraCredentials {
  issueKey: string
  worklogId: string
  payload: {
    timeSpent: string
    started: string
    comment?: {
      type: 'doc'
      version: number
      content: Array<{
        type: 'paragraph'
        content: Array<{
          type: 'text'
          text: string
        }>
      }>
    }
  }
}

export interface DeleteWorklogPayload extends JiraCredentials {
  issueKey: string
  worklogId: string
}

export interface SearchTasksPayload extends JiraCredentials {
  searchText?: string
  status?: string
}

export interface WorklogHistoryPayload extends JiraCredentials {
  startDate: string
  endDate: string
}
