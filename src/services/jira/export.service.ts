/**
 * Export Service
 *
 * Handles Excel export operations.
 * Follows Single Responsibility Principle.
 */

import { getServiceConfig } from "../api";

/**
 * Export Service Class
 * Handles all Excel export operations
 */
class ExportService {
  private baseUrl: string;

  constructor() {
    const config = getServiceConfig("jira");
    this.baseUrl = config.baseUrl;
  }

  /**
   * Generic export method
   */
  private async exportToExcel(
    endpoint: string,
    body: Record<string, unknown>,
  ): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Failed to export: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Export worklog history to Excel
   */
  async exportWorklogHistory(startDate: string, endDate: string): Promise<Blob> {
    return this.exportToExcel("/api/v1/worklog/export/history", {
      startDate,
      endDate,
    });
  }

  /**
   * Export Epic report to Excel
   */
  async exportEpicReport(epicKey: string): Promise<Blob> {
    return this.exportToExcel("/api/v1/worklog/export/epic-report", {
      epicKey,
    });
  }

  /**
   * Export active epics to Excel
   */
  async exportActiveEpics(startDate: string, endDate: string): Promise<Blob> {
    return this.exportToExcel("/api/v1/worklog/export/active-epics", {
      startDate,
      endDate,
    });
  }

  /**
   * Export monthly report to Excel
   */
  async exportMonthlyReport(startDate: string, endDate: string): Promise<Blob> {
    return this.exportToExcel("/api/v1/worklog/export/monthly-report", {
      startDate,
      endDate,
    });
  }

  /**
   * Export monthly report by project to Excel
   */
  async exportMonthlyReportByProject(
    projectKey: string,
    startDate: string,
    endDate: string,
  ): Promise<Blob> {
    return this.exportToExcel("/api/v1/worklog/export/monthly-report-by-project", {
      projectKey,
      startDate,
      endDate,
    });
  }

  /**
   * Export monthly report by board to Excel
   */
  async exportMonthlyReportByBoard(
    boardId: number,
    startDate: string,
    endDate: string,
  ): Promise<Blob> {
    return this.exportToExcel("/api/v1/worklog/export/monthly-report-by-board", {
      boardId,
      startDate,
      endDate,
    });
  }
}

// Export singleton instance
export const exportService = new ExportService();

// Also export the class for testing
export { ExportService };
