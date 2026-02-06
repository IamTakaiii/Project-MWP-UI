/**
 * Tracking Service
 *
 * Handles worklog tracking API calls.
 * Follows Single Responsibility Principle.
 */

import { ApiClient, getServiceConfig } from "../api";
import type {
  WorklogTrackingCheckResponse,
  WorklogTrackingSummaryResponse,
  WorklogTrackingFailedResponse,
  WorklogTrackingIssueHistoryResponse,
} from "./jira.types";

/**
 * Tracking Service Class
 * Handles all worklog tracking operations
 */
class TrackingService extends ApiClient {
  constructor() {
    super(getServiceConfig("jira"));
  }

  /**
   * Check submission status for a specific date
   */
  async checkStatus(date: string): Promise<WorklogTrackingCheckResponse> {
    return this.get<WorklogTrackingCheckResponse>(
      `/api/v1/worklog/tracking/check/${date}`,
    );
  }

  /**
   * Get tracking summary for a date range
   */
  async getSummary(
    startDate: string,
    endDate: string,
  ): Promise<WorklogTrackingSummaryResponse> {
    return this.get<WorklogTrackingSummaryResponse>(
      `/api/v1/worklog/tracking/summary?startDate=${startDate}&endDate=${endDate}`,
    );
  }

  /**
   * Get failed submissions for a date range
   */
  async getFailedSubmissions(
    startDate: string,
    endDate: string,
  ): Promise<WorklogTrackingFailedResponse> {
    return this.get<WorklogTrackingFailedResponse>(
      `/api/v1/worklog/tracking/failed?startDate=${startDate}&endDate=${endDate}`,
    );
  }

  /**
   * Get tracking history for a specific issue
   */
  async getIssueHistory(
    issueKey: string,
  ): Promise<WorklogTrackingIssueHistoryResponse> {
    return this.get<WorklogTrackingIssueHistoryResponse>(
      `/api/v1/worklog/tracking/issue/${issueKey}`,
    );
  }
}

// Export singleton instance
export const trackingService = new TrackingService();

// Also export the class for testing
export { TrackingService };
