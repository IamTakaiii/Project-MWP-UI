/**
 * Worklog Service
 *
 * Handles worklog-related API calls (CRUD operations).
 * Follows Single Responsibility Principle.
 */

import { ApiClient, getServiceConfig } from "../api";
import type { WorklogData, WorklogHistoryResponse } from "./jira.types";

/**
 * Build Atlassian Document Format comment
 */
function buildCommentPayload(comment: string) {
  return {
    type: "doc" as const,
    version: 1,
    content: [
      {
        type: "paragraph" as const,
        content: [
          {
            type: "text" as const,
            text: comment,
          },
        ],
      },
    ],
  };
}

/**
 * Worklog Service Class
 * Handles all worklog CRUD operations
 */
class WorklogService extends ApiClient {
  constructor() {
    super(getServiceConfig("jira"));
  }

  /**
   * Create a worklog entry for a Jira issue
   */
  async create(taskId: string, worklogData: WorklogData): Promise<unknown> {
    const payload = {
      timeSpent: worklogData.timeSpent,
      started: worklogData.started,
      ...(worklogData.comment && {
        comment: buildCommentPayload(worklogData.comment),
      }),
    };

    return this.post("/api/v1/worklog", {
      taskId,
      payload,
    });
  }

  /**
   * Update an existing worklog
   */
  async update(
    issueKey: string,
    worklogId: string,
    worklogData: WorklogData,
  ): Promise<unknown> {
    const payload = {
      timeSpent: worklogData.timeSpent,
      started: worklogData.started,
      ...(worklogData.comment !== undefined && {
        comment: worklogData.comment
          ? buildCommentPayload(worklogData.comment)
          : undefined,
      }),
    };

    return this.put("/api/v1/worklog", {
      issueKey,
      worklogId,
      payload,
    });
  }

  /**
   * Delete a worklog entry
   */
  async remove(issueKey: string, worklogId: string): Promise<void> {
    await this.delete("/api/v1/worklog", {
      issueKey,
      worklogId,
    });
  }

  /**
   * Fetch worklog history for a date range
   */
  async getHistory(
    startDate: string,
    endDate: string,
  ): Promise<WorklogHistoryResponse> {
    return this.post<WorklogHistoryResponse>("/api/v1/worklog/history", {
      startDate,
      endDate,
    });
  }
}

// Export singleton instance
export const worklogService = new WorklogService();

// Also export the class for testing
export { WorklogService };
