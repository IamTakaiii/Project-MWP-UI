/**
 * Base API Client
 *
 * A reusable HTTP client that can be extended for different services.
 * Provides common functionality like error handling, timeouts, and retries.
 */

import type { ServiceConfig } from "./config";

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Standard API error class
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly response?: unknown;

  constructor(
    message: string,
    status: number,
    code: string,
    response?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.response = response;
  }
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Base API Client class
 * Extend this class to create service-specific clients
 */
export class ApiClient {
  protected baseUrl: string;
  protected defaultTimeout: number;
  protected defaultHeaders: Record<string, string>;

  constructor(config: ServiceConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.defaultTimeout = config.timeout || 30000;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    };
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  /**
   * Make a POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("POST", endpoint, data, options);
  }

  /**
   * Make a PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("PUT", endpoint, data, options);
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("DELETE", endpoint, data, options);
  }

  /**
   * Core request method
   */
  protected async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = options?.timeout || this.defaultTimeout;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...this.defaultHeaders,
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: options?.signal || controller.signal,
        credentials: "include", // Include cookies for session management
      });

      clearTimeout(timeoutId);

      // Handle response
      const text = await response.text();

      // Check for HTML error pages
      if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
        throw new ApiError(
          "Server returned HTML instead of JSON. Is the backend running?",
          503,
          "SERVICE_UNAVAILABLE",
        );
      }

      // Parse JSON
      let result: unknown;
      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new ApiError(
          `Invalid JSON response: ${text.substring(0, 100)}`,
          500,
          "INVALID_RESPONSE",
        );
      }

      // Handle error responses
      if (!response.ok) {
        const errorResult = result as {
          error?: string;
          details?: string;
          message?: string;
        };
        const message =
          errorResult.details ||
          errorResult.error ||
          errorResult.message ||
          `HTTP ${response.status}`;
        throw new ApiError(message, response.status, "API_ERROR", result);
      }

      // Unwrap API response if it has the standard format
      const apiResponse = result as ApiResponse<T>;
      if (
        apiResponse &&
        typeof apiResponse === "object" &&
        "data" in apiResponse
      ) {
        return apiResponse.data as T;
      }

      // Return raw result if not wrapped
      return result as T;
    } catch (error) {
      clearTimeout(timeoutId);

      // Re-throw ApiError as-is
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle abort/timeout
      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError("Request timeout", 408, "TIMEOUT");
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new ApiError(
          "Network error. Is the server running?",
          0,
          "NETWORK_ERROR",
        );
      }

      // Unknown error
      throw new ApiError(
        error instanceof Error ? error.message : "Unknown error",
        500,
        "UNKNOWN_ERROR",
      );
    }
  }
}
