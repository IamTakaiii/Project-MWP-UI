/**
 * Jira Service Types
 */

// ============================================
// Credentials & Auth
// ============================================

export interface JiraCredentials {
  jiraUrl: string;
  email: string;
  apiToken: string;
}

// ============================================
// Issues & Tasks
// ============================================

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status?: {
      name: string;
      statusCategory?: {
        key?: string;
        name?: string;
        colorName?: string;
      };
    };
    issuetype?: {
      name: string;
      iconUrl?: string;
    };
    project?: {
      key: string;
      name: string;
    };
  };
}

export interface JiraSearchResponse {
  issues: JiraIssue[];
  total: number;
  maxResults: number;
  startAt: number;
}

export interface TaskFilters {
  searchText?: string;
  status?: string;
}

// ============================================
// Worklogs
// ============================================

export interface WorklogData {
  timeSpent: string;
  started: string;
  comment?: string;
}

export interface WorklogEntry {
  id: string;
  issueKey: string;
  issueSummary: string;
  projectKey?: string;
  author?: string;
  authorAccountId?: string;
  timeSpent: string;
  timeSpentSeconds: number;
  started: string;
  comment: string;
  created: string;
  updated: string;
}

export interface WorklogHistoryResponse {
  worklogs: WorklogEntry[];
  totalIssues: number;
}

export interface UserWorklogSummary {
  accountId: string;
  displayName: string;
  totalTimeSeconds: number;
  issues: string[];
}

export interface EpicWorklogReportResponse {
  totalIssues: number;
  totalTimeSeconds: number;
  users: UserWorklogSummary[];
}

export interface ActiveEpicResponse {
  key: string;
  summary: string;
  issuesCount: number;
}

// Monthly Report Types
export interface MonthlyIssueWorklog {
  issueKey: string;
  issueSummary: string;
  timeSpentSeconds: number;
}

export interface MonthlyUserEpicWorklog {
  accountId: string;
  displayName: string;
  totalTimeSeconds: number;
  issues: MonthlyIssueWorklog[];
}

export interface MonthlyEpicReport {
  epicKey: string;
  epicSummary: string;
  totalTimeSeconds: number;
  users: MonthlyUserEpicWorklog[];
}

export interface MonthlyReportResponse {
  startDate: string;
  endDate: string;
  totalTimeSeconds: number;
  epics: MonthlyEpicReport[];
}

export interface DailyWorklog {
  date: string;
  dayName: string;
  worklogs: WorklogEntry[];
  totalSeconds: number;
  isComplete: boolean;
}

// ============================================
// API Payloads
// ============================================

export interface CreateWorklogPayload extends JiraCredentials {
  taskId: string;
  payload: {
    timeSpent: string;
    started: string;
    comment?: {
      type: "doc";
      version: number;
      content: Array<{
        type: "paragraph";
        content: Array<{
          type: "text";
          text: string;
        }>;
      }>;
    };
  };
}

export interface UpdateWorklogPayload extends JiraCredentials {
  issueKey: string;
  worklogId: string;
  payload: {
    timeSpent: string;
    started: string;
    comment?: {
      type: "doc";
      version: number;
      content: Array<{
        type: "paragraph";
        content: Array<{
          type: "text";
          text: string;
        }>;
      }>;
    };
  };
}

export interface DeleteWorklogPayload extends JiraCredentials {
  issueKey: string;
  worklogId: string;
}

export interface SearchTasksPayload extends JiraCredentials {
  searchText?: string;
  status?: string;
}

export interface WorklogHistoryPayload extends JiraCredentials {
  startDate: string;
  endDate: string;
}

export interface ProjectResponse {
  key: string;
  name: string;
}

export interface BoardResponse {
  id: number;
  name: string;
  projectKey?: string;
}

// ============================================
// Worklog Tracking
// ============================================

export interface WorklogTrackingEntry {
  id: string;
  userId: string;
  sessionId: string;
  jiraIssueKey: string;
  worklogId: string | null;
  worklogDate: string;
  executionTimestamp: string;
  status: "success" | "failed";
  httpStatusCode: number | null;
  timeSpentSeconds: number | null;
  requestPayload: string | null;
  responsePayload: string | null;
  errorMessage: string | null;
  errorCode: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorklogTrackingCheckResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    worklogDate: string;
    isSubmitted: boolean;
    submissions: Array<{
      jiraIssueKey: string;
      status: "success" | "failed";
      executionTimestamp: string;
      timeSpentSeconds: number;
    }>;
  };
}

export interface WorklogTrackingSummaryResponse {
  success: boolean;
  message: string;
  data: {
    totalSubmissions: number;
    successCount: number;
    failedCount: number;
    successRate: number;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    failedDates: string[];
    history: WorklogTrackingEntry[];
  };
}

export interface WorklogTrackingFailedResponse {
  success: boolean;
  message: string;
  data: WorklogTrackingEntry[];
}

export interface WorklogTrackingIssueHistoryResponse {
  success: boolean;
  message: string;
  data: WorklogTrackingEntry[];
}
