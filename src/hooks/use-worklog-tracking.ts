import { useState, useCallback } from "react";
import { jiraService } from "@/services";
import type {
  WorklogTrackingCheckResponse,
  WorklogTrackingSummaryResponse,
  WorklogTrackingFailedResponse,
  WorklogTrackingIssueHistoryResponse,
} from "@/services/jira/jira.types";

/**
 * Custom hook for managing worklog tracking
 */
export function useWorklogTracking() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if worklog was submitted for a specific date
   */
  const checkSubmission = useCallback(
    async (date: string): Promise<WorklogTrackingCheckResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await jiraService.checkWorklogTracking(date);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Get summary for a date range
   */
  const getSummary = useCallback(
    async (
      startDate: string,
      endDate: string,
    ): Promise<WorklogTrackingSummaryResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await jiraService.getWorklogTrackingSummary(
          startDate,
          endDate,
        );
        
        // Handle both response formats
        // Format 1: Direct data object
        if ('totalSubmissions' in response && 'history' in response) {
          return {
            success: true,
            message: 'success',
            data: response as any
          };
        }
        
        // Format 2: Wrapped response
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Get failed submissions for a date range
   */
  const getFailedSubmissions = useCallback(
    async (
      startDate: string,
      endDate: string,
    ): Promise<WorklogTrackingFailedResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await jiraService.getFailedWorklogTracking(
          startDate,
          endDate,
        );
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Get tracking history for a specific issue
   */
  const getIssueHistory = useCallback(
    async (
      issueKey: string,
    ): Promise<WorklogTrackingIssueHistoryResponse | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await jiraService.getIssueTrackingHistory(issueKey);
        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    isLoading,
    error,
    checkSubmission,
    getSummary,
    getFailedSubmissions,
    getIssueHistory,
  };
}
