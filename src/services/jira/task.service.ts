/**
 * Task Service
 *
 * Handles task-related API calls.
 * Follows Single Responsibility Principle.
 */

import { ApiClient, getServiceConfig } from "../api";
import type { JiraSearchResponse, TaskFilters } from "./jira.types";

/**
 * Task Service Class
 * Handles task fetching operations
 */
class TaskService extends ApiClient {
  constructor() {
    super(getServiceConfig("jira"));
  }

  /**
   * Fetch tasks assigned to the current user
   */
  async getMyTasks(
    filters: TaskFilters = { searchText: "", status: "In Progress" },
  ): Promise<JiraSearchResponse> {
    return this.post<JiraSearchResponse>("/api/v1/my-tasks", {
      searchText: filters.searchText,
      status: filters.status,
    });
  }
}

// Export singleton instance
export const taskService = new TaskService();

// Also export the class for testing
export { TaskService };
