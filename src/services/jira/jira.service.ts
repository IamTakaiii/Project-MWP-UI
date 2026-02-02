/**
 * Jira API Service
 * 
 * Handles all Jira-related API calls through the backend proxy.
 */

import { ApiClient, getServiceConfig } from '../api'
import type {
  JiraSearchResponse,
  WorklogData,
  TaskFilters,
  WorklogHistoryResponse,
  EpicWorklogReportResponse,
  ActiveEpicResponse,
  MonthlyReportResponse,
  ProjectResponse,
  BoardResponse,
} from './jira.types'

/**
 * Build Atlassian Document Format comment
 */
function buildCommentPayload(comment: string) {
  return {
    type: 'doc' as const,
    version: 1,
    content: [
      {
        type: 'paragraph' as const,
        content: [
          {
            type: 'text' as const,
            text: comment,
          },
        ],
      },
    ],
  }
}

/**
 * Jira Service Class
 */
class JiraService extends ApiClient {
  constructor() {
    super(getServiceConfig('jira'))
  }

  /**
   * Create a worklog entry for a Jira issue
   * Uses session-based authentication (no credentials needed)
   */
  async createWorklog(
    taskId: string,
    worklogData: WorklogData
  ): Promise<unknown> {
    const payload = {
      timeSpent: worklogData.timeSpent,
      started: worklogData.started,
      ...(worklogData.comment && {
        comment: buildCommentPayload(worklogData.comment),
      }),
    }

    return this.post('/api/v1/worklog', {
      taskId,
      payload,
    })
  }

  /**
   * Update an existing worklog
   * Uses session-based authentication (no credentials needed)
   */
  async updateWorklog(
    issueKey: string,
    worklogId: string,
    worklogData: WorklogData
  ): Promise<unknown> {
    const payload = {
      timeSpent: worklogData.timeSpent,
      started: worklogData.started,
      ...(worklogData.comment !== undefined && {
        comment: worklogData.comment
          ? buildCommentPayload(worklogData.comment)
          : undefined,
      }),
    }

    return this.put('/api/v1/worklog', {
      issueKey,
      worklogId,
      payload,
    })
  }

  /**
   * Delete a worklog entry
   * Uses session-based authentication (no credentials needed)
   */
  async deleteWorklog(
    issueKey: string,
    worklogId: string
  ): Promise<void> {
    await this.delete('/api/v1/worklog', {
      issueKey,
      worklogId,
    })
  }

  /**
   * Fetch tasks assigned to the current user
   * Uses session-based authentication (no credentials needed)
   */
  async fetchMyTasks(
    filters: TaskFilters = { searchText: '', status: 'In Progress' }
  ): Promise<JiraSearchResponse> {
    return this.post<JiraSearchResponse>('/api/v1/my-tasks', {
      searchText: filters.searchText,
      status: filters.status,
    })
  }

  /**
   * Fetch worklog history for a date range
   * Uses session-based authentication (no credentials needed)
   */
  async fetchWorklogHistory(
    startDate: string,
    endDate: string
  ): Promise<WorklogHistoryResponse> {
    return this.post<WorklogHistoryResponse>('/api/v1/worklog/history', {
      startDate,
      endDate,
    })
  }

  /**
   * Fetch worklog report for an Epic
   */
  async fetchEpicWorklogReport(epicKey: string): Promise<EpicWorklogReportResponse> {
    return this.post<EpicWorklogReportResponse>('/api/v1/worklog/epic-report', {
      epicKey,
    })
  }

  /**
   * Fetch active Epics within date range
   */
  async fetchActiveEpics(startDate: string, endDate: string): Promise<ActiveEpicResponse[]> {
    return this.post<ActiveEpicResponse[]>('/api/v1/worklog/active-epics', {
      startDate,
      endDate,
    })
  }

  /**
   * Export worklog history to Excel
   */
  async exportWorklogHistory(startDate: string, endDate: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/v1/worklog/export/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ startDate, endDate }),
    })
    if (!response.ok) throw new Error('Failed to export worklog history')
    return response.blob()
  }

  /**
   * Export Epic report to Excel
   */
  async exportEpicReport(epicKey: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/v1/worklog/export/epic-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ epicKey }),
    })
    if (!response.ok) throw new Error('Failed to export epic report')
    return response.blob()
  }

  /**
   * Export active epics to Excel
   */
  async exportActiveEpics(startDate: string, endDate: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/v1/worklog/export/active-epics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ startDate, endDate }),
    })
    if (!response.ok) throw new Error('Failed to export active epics')
    return response.blob()
  }

  /**
   * Fetch monthly report
   */
  async fetchMonthlyReport(startDate: string, endDate: string): Promise<MonthlyReportResponse> {
    return this.post<MonthlyReportResponse>('/api/v1/worklog/monthly-report', {
      startDate,
      endDate,
    })
  }

  /**
   * Fetch monthly report by project
   */
  async fetchMonthlyReportByProject(projectKey: string, startDate: string, endDate: string): Promise<MonthlyReportResponse> {
    return this.post<MonthlyReportResponse>('/api/v1/worklog/monthly-report-by-project', {
      projectKey,
      startDate,
      endDate,
    })
  }

  /**
   * Fetch monthly report by board
   */
  async fetchMonthlyReportByBoard(boardId: number, startDate: string, endDate: string): Promise<MonthlyReportResponse> {
    return this.post<MonthlyReportResponse>('/api/v1/worklog/monthly-report-by-board', {
      boardId,
      startDate,
      endDate,
    })
  }

  /**
   * Export monthly report to Excel
   */
  async exportMonthlyReport(startDate: string, endDate: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/v1/worklog/export/monthly-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ startDate, endDate }),
    })
    if (!response.ok) throw new Error('Failed to export monthly report')
    return response.blob()
  }

  /**
   * Export monthly report by project to Excel
   */
  async exportMonthlyReportByProject(projectKey: string, startDate: string, endDate: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/v1/worklog/export/monthly-report-by-project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ projectKey, startDate, endDate }),
    })
    if (!response.ok) throw new Error('Failed to export monthly report by project')
    return response.blob()
  }

  /**
   * Fetch user's projects
   */
  async fetchMyProjects(): Promise<ProjectResponse[]> {
    return this.get<ProjectResponse[]>('/api/v1/worklog/projects')
  }

  /**
   * Fetch boards
   */
  async fetchBoards(): Promise<BoardResponse[]> {
    return this.get<BoardResponse[]>('/api/v1/worklog/boards')
  }

  /**
   * Export monthly report by board to Excel
   */
  async exportMonthlyReportByBoard(boardId: number, startDate: string, endDate: string): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/api/v1/worklog/export/monthly-report-by-board`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ boardId, startDate, endDate }),
    })
    if (!response.ok) throw new Error('Failed to export monthly report by board')
    return response.blob()
  }

  /**
   * Check if the API server is healthy
   */
  async healthCheck(): Promise<{ status: string }> {
    return this.get<{ status: string }>('/api/health')
  }
}

// Export singleton instance
export const jiraService = new JiraService()

// Also export the class for testing or custom instances
export { JiraService }
