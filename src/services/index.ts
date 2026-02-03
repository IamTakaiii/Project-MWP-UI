/**
 * Services Index
 *
 * Export all services from a single entry point.
 * Add new services here as your workspace grows.
 */

// Core API utilities
export { ApiClient, ApiError } from "./api";
export type { ServiceConfig, ServicesConfig, RequestOptions } from "./api";

// Jira Service
export { jiraService, JiraService } from "./jira";
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
