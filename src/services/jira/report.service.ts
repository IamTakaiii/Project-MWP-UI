/**
 * Report Service
 *
 * Handles report-related API calls.
 * Follows Single Responsibility Principle.
 */

import { ApiClient, getServiceConfig } from "../api";
import type {
  EpicWorklogReportResponse,
  ActiveEpicResponse,
  MonthlyReportResponse,
  ProjectResponse,
  BoardResponse,
} from "./jira.types";

/**
 * Report Service Class
 * Handles all reporting operations
 */
class ReportService extends ApiClient {
  constructor() {
    super(getServiceConfig("jira"));
  }

  /**
   * Fetch worklog report for an Epic
   */
  async getEpicWorklogReport(epicKey: string): Promise<EpicWorklogReportResponse> {
    return this.post<EpicWorklogReportResponse>("/api/v1/worklog/epic-report", {
      epicKey,
    });
  }

  /**
   * Fetch active Epics within date range
   */
  async getActiveEpics(
    startDate: string,
    endDate: string,
  ): Promise<ActiveEpicResponse[]> {
    return this.post<ActiveEpicResponse[]>("/api/v1/worklog/active-epics", {
      startDate,
      endDate,
    });
  }

  /**
   * Fetch monthly report
   */
  async getMonthlyReport(
    startDate: string,
    endDate: string,
  ): Promise<MonthlyReportResponse> {
    return this.post<MonthlyReportResponse>("/api/v1/worklog/monthly-report", {
      startDate,
      endDate,
    });
  }

  /**
   * Fetch monthly report by project
   */
  async getMonthlyReportByProject(
    projectKey: string,
    startDate: string,
    endDate: string,
  ): Promise<MonthlyReportResponse> {
    return this.post<MonthlyReportResponse>(
      "/api/v1/worklog/monthly-report-by-project",
      {
        projectKey,
        startDate,
        endDate,
      },
    );
  }

  /**
   * Fetch monthly report by board
   */
  async getMonthlyReportByBoard(
    boardId: number,
    startDate: string,
    endDate: string,
  ): Promise<MonthlyReportResponse> {
    return this.post<MonthlyReportResponse>(
      "/api/v1/worklog/monthly-report-by-board",
      {
        boardId,
        startDate,
        endDate,
      },
    );
  }

  /**
   * Fetch user's projects
   */
  async getMyProjects(): Promise<ProjectResponse[]> {
    return this.get<ProjectResponse[]>("/api/v1/worklog/projects");
  }

  /**
   * Fetch boards
   */
  async getBoards(): Promise<BoardResponse[]> {
    return this.get<BoardResponse[]>("/api/v1/worklog/boards");
  }
}

// Export singleton instance
export const reportService = new ReportService();

// Also export the class for testing
export { ReportService };
