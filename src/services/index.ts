/**
 * Services Index
 *
 * Export all services from a single entry point.
 * Add new services here as your workspace grows.
 */

// Core API utilities
export { ApiClient, ApiError } from "./api";
export type { ServiceConfig, ServicesConfig, RequestOptions } from "./api";

// Jira Service (Facade - for backward compatibility)
export { jiraService, JiraService } from "./jira";

// Specialized Jira Services (preferred for new code)
export { worklogService, WorklogService } from "./jira/worklog.service";
export { taskService, TaskService } from "./jira/task.service";
export { reportService, ReportService } from "./jira/report.service";
export { exportService, ExportService } from "./jira/export.service";
export { trackingService, TrackingService } from "./jira/tracking.service";

// Jira Types
export type {
  JiraCredentials,
  JiraIssue,
  JiraSearchResponse,
  TaskFilters,
  WorklogData,
  WorklogEntry,
  WorklogHistoryResponse,
  DailyWorklog,
} from "./jira";

// Auth Service
export { jiraAuthService, JiraAuthService } from "./auth.service";
export type { LoginResponse, SessionInfo } from "./auth.service";

// Note: Calendar Service temporarily disabled
// TODO: Re-enable when Google Calendar integration is ready
