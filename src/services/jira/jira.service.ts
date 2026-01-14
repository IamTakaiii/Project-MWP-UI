/**
 * Jira API Service
 * 
 * Handles all Jira-related API calls through the backend proxy.
 */

import { ApiClient, getServiceConfig } from '../api'
import type {
  JiraCredentials,
  JiraSearchResponse,
  WorklogData,
  TaskFilters,
  WorklogHistoryResponse,
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
   */
  async createWorklog(
    credentials: JiraCredentials,
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

    return this.post('/api/worklog', {
      ...credentials,
      taskId,
      payload,
    })
  }

  /**
   * Update an existing worklog
   */
  async updateWorklog(
    credentials: JiraCredentials,
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

    return this.put('/api/worklog', {
      ...credentials,
      issueKey,
      worklogId,
      payload,
    })
  }

  /**
   * Delete a worklog entry
   */
  async deleteWorklog(
    credentials: JiraCredentials,
    issueKey: string,
    worklogId: string
  ): Promise<void> {
    await this.delete('/api/worklog', {
      ...credentials,
      issueKey,
      worklogId,
    })
  }

  /**
   * Fetch tasks assigned to the current user
   */
  async fetchMyTasks(
    credentials: JiraCredentials,
    filters: TaskFilters = { searchText: '', status: 'In Progress' }
  ): Promise<JiraSearchResponse> {
    return this.post<JiraSearchResponse>('/api/my-tasks', {
      ...credentials,
      searchText: filters.searchText,
      status: filters.status,
    })
  }

  /**
   * Fetch worklog history for a date range
   */
  async fetchWorklogHistory(
    credentials: JiraCredentials,
    startDate: string,
    endDate: string
  ): Promise<WorklogHistoryResponse> {
    return this.post<WorklogHistoryResponse>('/api/worklog/history', {
      ...credentials,
      startDate,
      endDate,
    })
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
