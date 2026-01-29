// Status options for JIRA tasks
export const STATUS_OPTIONS = [
  { value: 'all', label: 'ทุก Status' },
  { value: 'Open', label: 'Open' },
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'In Review', label: 'In Review' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Done', label: 'Done' },
] as const

// Time spent options for worklog
export const TIME_SPENT_OPTIONS = [
  { value: '5m', label: '5 นาที' },
  { value: '10m', label: '10 นาที' },
  { value: '15m', label: '15 นาที' },
  { value: '30m', label: '30 นาที' },
  { value: '45m', label: '45 นาที' },
  { value: '1h', label: '1 ชั่วโมง' },
  { value: '1h 30m', label: '1 ชั่วโมง 30 นาที' },
  { value: '2h', label: '2 ชั่วโมง' },
  { value: '3h', label: '3 ชั่วโมง' },
  { value: '4h', label: '4 ชั่วโมง' },
  { value: '6h', label: '6 ชั่วโมง' },
  { value: '8h', label: '8 ชั่วโมง' },
] as const

// Local storage keys
export const STORAGE_KEYS = {
  JIRA_URL: 'jira_url',
  EMAIL: 'jira_email',
  API_TOKEN: 'jira_token',
  TASK_ID: 'jira_taskId',
  COPIED_WORKLOG: 'jira_copiedWorklog',
  FAVORITE_TASKS: 'jira_favoriteTasks',
} as const

// Default form values
export const DEFAULT_VALUES = {
  TIME_SPENT: '15m',
  START_TIME: '09:30',
  STATUS_FILTER: 'In Progress',
  SKIP_WEEKENDS: true,
} as const

// Admin/Recurring tasks - predefined tasks for common activities
export const ADMIN_TASKS = [
  { key: 'ADM-6', summary: 'General Admin' },
  { key: 'ADM-7', summary: 'Training' },
  { key: 'ADM-8', summary: 'Sprint Ceremonies' },
  { key: 'ADM-9', summary: 'Recruitment / Interview / Public Speaking' },
  { key: 'ADM-10', summary: 'Release Support / On Call' },
  { key: 'ADM-13', summary: 'General Meetings' },
  { key: 'ADM-14', summary: 'TEST - Release Support / On Call' },
  { key: 'ADM-15', summary: 'TEST - Training' },
  { key: 'ADM-16', summary: 'Sprint Planning' },
  { key: 'ADM-49', summary: 'Stand-up Meeting' },
  { key: 'ADM-18', summary: 'Sprint Review / Retrospective' },
  { key: 'ADM-19', summary: 'Backlog Refinement / Grooming' },
  { key: 'ADM-20', summary: 'Knowledge Sharing' },
] as const
