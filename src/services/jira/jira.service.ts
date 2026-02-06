/**
 * Jira API Service (Facade)
 *
 * Main entry point for Jira-related API calls.
 * Delegates to specialized services for better separation of concerns.
 *
 * For new code, prefer using the specialized services directly:
 * - worklogService: Worklog CRUD operations
 * - taskService: Task fetching
 * - reportService: Reports and analytics
 * - exportService: Excel exports
 * - trackingService: Worklog tracking
 */

import { ApiClient, getServiceConfig } from "../api";
import { worklogService } from "./worklog.service";
import { taskService } from "./task.service";
import { reportService } from "./report.service";
import { exportService } from "./export.service";
import { trackingService } from "./tracking.service";
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
  WorklogTrackingCheckResponse,
  WorklogTrackingSummaryResponse,
  WorklogTrackingFailedResponse,
  WorklogTrackingIssueHistoryResponse,
} from "./jira.types";

/**
 * Jira Service Class (Facade)
 *
 * Maintains backward compatibility while delegating to specialized services.
 * @deprecated For new code, use specialized services directly
 */
class JiraService extends ApiClient {
  constructor() {
    super(getServiceConfig("jira"));
  }

  // ============================================
  // Worklog Operations (delegates to worklogService)
  // ============================================

  async createWorklog(taskId: string, worklogData: WorklogData): Promise<unknown> {
    return worklogService.create(taskId, worklogData);
  }

  async updateWorklog(
    issueKey: string,
    worklogId: string,
    worklogData: WorklogData,
  ): Promise<unknown> {
    return worklogService.update(issueKey, worklogId, worklogData);
  }

  async deleteWorklog(issueKey: string, worklogId: string): Promise<void> {
    return worklogService.remove(issueKey, worklogId);
  }

  async fetchWorklogHistory(
    startDate: string,
    endDate: string,
  ): Promise<WorklogHistoryResponse> {
    return worklogService.getHistory(startDate, endDate);
  }

  // ============================================
  // Task Operations (delegates to taskService)
  // ============================================

  async fetchMyTasks(
    filters: TaskFilters = { searchText: "", status: "In Progress" },
  ): Promise<JiraSearchResponse> {
    return taskService.getMyTasks(filters);
  }

  // ============================================
  // Report Operations (delegates to reportService)
  // ============================================

  async fetchEpicWorklogReport(epicKey: string): Promise<EpicWorklogReportResponse> {
    return reportService.getEpicWorklogReport(epicKey);
  }

  async fetchActiveEpics(
    startDate: string,
    endDate: string,
  ): Promise<ActiveEpicResponse[]> {
    return reportService.getActiveEpics(startDate, endDate);
  }

  async fetchMonthlyReport(
    startDate: string,
    endDate: string,
  ): Promise<MonthlyReportResponse> {
    return reportService.getMonthlyReport(startDate, endDate);
  }

  async fetchMonthlyReportByProject(
    projectKey: string,
    startDate: string,
    endDate: string,
  ): Promise<MonthlyReportResponse> {
    return reportService.getMonthlyReportByProject(projectKey, startDate, endDate);
  }

  async fetchMonthlyReportByBoard(
    boardId: number,
    startDate: string,
    endDate: string,
  ): Promise<MonthlyReportResponse> {
    return reportService.getMonthlyReportByBoard(boardId, startDate, endDate);
  }

  async fetchMyProjects(): Promise<ProjectResponse[]> {
    return reportService.getMyProjects();
  }

  async fetchBoards(): Promise<BoardResponse[]> {
    return reportService.getBoards();
  }

  // ============================================
  // Export Operations (delegates to exportService)
  // ============================================

  async exportWorklogHistory(startDate: string, endDate: string): Promise<Blob> {
    return exportService.exportWorklogHistory(startDate, endDate);
  }

  async exportEpicReport(epicKey: string): Promise<Blob> {
    return exportService.exportEpicReport(epicKey);
  }

  async exportActiveEpics(startDate: string, endDate: string): Promise<Blob> {
    return exportService.exportActiveEpics(startDate, endDate);
  }

  async exportMonthlyReport(startDate: string, endDate: string): Promise<Blob> {
    return exportService.exportMonthlyReport(startDate, endDate);
  }

  async exportMonthlyReportByProject(
    projectKey: string,
    startDate: string,
    endDate: string,
  ): Promise<Blob> {
    return exportService.exportMonthlyReportByProject(projectKey, startDate, endDate);
  }

  async exportMonthlyReportByBoard(
    boardId: number,
    startDate: string,
    endDate: string,
  ): Promise<Blob> {
    return exportService.exportMonthlyReportByBoard(boardId, startDate, endDate);
  }

  // ============================================
  // Tracking Operations (delegates to trackingService)
  // ============================================

  async checkWorklogTracking(date: string): Promise<WorklogTrackingCheckResponse> {
    return trackingService.checkStatus(date);
  }

  async getWorklogTrackingSummary(
    startDate: string,
    endDate: string,
  ): Promise<WorklogTrackingSummaryResponse> {
    return trackingService.getSummary(startDate, endDate);
  }

  async getFailedWorklogTracking(
    startDate: string,
    endDate: string,
  ): Promise<WorklogTrackingFailedResponse> {
    return trackingService.getFailedSubmissions(startDate, endDate);
  }

  async getIssueTrackingHistory(
    issueKey: string,
  ): Promise<WorklogTrackingIssueHistoryResponse> {
    return trackingService.getIssueHistory(issueKey);
  }

  // ============================================
  // Health Check
  // ============================================

  async healthCheck(): Promise<{ status: string }> {
    return this.get<{ status: string }>("/api/health");
  }
}

// Export singleton instance
export const jiraService = new JiraService();

// Also export the class for testing or custom instances
export { JiraService };
