/**
 * Error Utilities
 *
 * Centralized error handling utilities.
 * Provides consistent error message extraction across the app.
 */

/**
 * Extract error message from unknown error type
 * Handles Error instances, strings, and unknown types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error occurred";
}

/**
 * Create a standardized error response
 */
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

export function createErrorResponse(
  error: unknown,
  code?: string,
): ErrorResponse {
  return {
    message: getErrorMessage(error),
    code,
    details: error instanceof Error ? error.stack : undefined,
  };
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch") ||
      error.name === "TypeError"
    );
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("401") ||
      error.message.includes("unauthorized") ||
      error.message.includes("authentication")
    );
  }
  return false;
}
