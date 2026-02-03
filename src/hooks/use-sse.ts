import { useState, useEffect, useCallback, useRef } from "react";

export interface SSEEvent {
  id: string;
  type: string;
  data: unknown;
  timestamp: Date;
  raw: string;
}

export interface SSEAuthConfig {
  type: "none" | "bearer" | "basic" | "apikey";
  token?: string;
  username?: string;
  password?: string;
  headerName?: string; // For API key auth
}

interface UseSSEOptions {
  autoConnect?: boolean;
  auth?: SSEAuthConfig;
  headers?: Record<string, string>; // Custom headers to include in the request
}

// Helper to create auth header
function createAuthHeader(auth: SSEAuthConfig): Record<string, string> {
  switch (auth.type) {
    case "bearer":
      return auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
    case "basic":
      if (auth.username && auth.password) {
        const encoded = btoa(`${auth.username}:${auth.password}`);
        return { Authorization: `Basic ${encoded}` };
      }
      return {};
    case "apikey":
      if (auth.token && auth.headerName) {
        return { [auth.headerName]: auth.token };
      }
      return {};
    default:
      return {};
  }
}

// Fallback for browsers that don't support crypto.randomUUID
function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback using Math.random
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Helper to add event
function createEvent(type: string, data: unknown, raw?: string): SSEEvent {
  return {
    id: generateId(),
    type,
    data,
    timestamp: new Date(),
    raw: raw || JSON.stringify(data),
  };
}

export function useSSE(url: string, options: UseSSEOptions = {}) {
  const { autoConnect = false, headers: customHeaders } = options;
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionTime, setConnectionTime] = useState<Date | null>(null);

  const urlRef = useRef(url);
  const authRef = useRef<SSEAuthConfig | undefined>(options.auth);
  const headersRef = useRef<Record<string, string> | undefined>(customHeaders);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update refs when they change
  useEffect(() => {
    urlRef.current = url;
  }, [url]);

  useEffect(() => {
    authRef.current = options.auth;
  }, [options.auth]);

  useEffect(() => {
    headersRef.current = customHeaders;
  }, [customHeaders]);

  const connect = useCallback(async () => {
    // Abort existing connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentUrl = urlRef.current;
    const auth = authRef.current;
    const customHeaders = headersRef.current;

    if (!currentUrl) {
      setError("Please enter a valid URL");
      return;
    }

    // Check if auth is required but not configured
    const needsAuth = auth && auth.type !== "none";
    const hasAuthCredentials =
      auth &&
      ((auth.type === "bearer" && auth.token) ||
        (auth.type === "basic" && auth.username && auth.password) ||
        (auth.type === "apikey" && auth.token && auth.headerName));

    if (needsAuth && !hasAuthCredentials) {
      setError("Authentication configured but credentials are missing");
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const headers: Record<string, string> = {
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
      };

      // Add custom headers first (can be overridden by auth headers)
      if (customHeaders) {
        Object.assign(headers, customHeaders);
      }

      // Add auth headers if configured (will override custom headers if same key)
      if (auth && auth.type !== "none") {
        Object.assign(headers, createAuthHeader(auth));
      }

      // Log headers being sent (for debugging)
      if (import.meta.env.DEV) {
        const loggedHeaders = Object.fromEntries(
          Object.entries(headers).map(([k, v]) => {
            const lowerKey = k.toLowerCase();
            if (
              lowerKey.includes("token") ||
              lowerKey.includes("secret") ||
              lowerKey.includes("password") ||
              lowerKey.includes("authorization")
            ) {
              return [k, v ? `${String(v).substring(0, 10)}...` : ""];
            }
            return [k, v];
          }),
        );
        console.log("[useSSE] Connecting to:", currentUrl);
        console.log("[useSSE] Headers:", loggedHeaders);
        console.log(
          "[useSSE] Using credentials: include (cookies should be sent automatically)",
        );
        // Note: Cookies are sent automatically by browser when credentials: 'include' is set
        // They won't appear in the headers object, but will be in the request
      }

      const response = await fetch(currentUrl, {
        method: "GET",
        headers,
        credentials: "include", // Include cookies for services that require them
        signal: controller.signal,
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `${response.status}: ${response.statusText}`;
        try {
          const errorText = await response.clone().text();
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorJson.error || errorText;
            } catch {
              errorMessage = errorText.substring(0, 200);
            }
          }
        } catch {
          // Ignore error reading response
        }

        if (response.status === 401) {
          throw new Error(
            `Unauthorized - Check your authentication credentials. ${errorMessage}`,
          );
        } else if (response.status === 403) {
          throw new Error(
            `Forbidden - You do not have access to this resource. ${errorMessage}`,
          );
        } else if (response.status === 400) {
          throw new Error(`Bad Request - ${errorMessage}`);
        }
        throw new Error(`HTTP ${errorMessage}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      setIsConnected(true);
      setError(null);
      setConnectionTime(new Date());

      setEvents((prev) => [
        ...prev,
        createEvent("connected", {
          message: `Connected to ${currentUrl}`,
          authenticated: needsAuth,
        }),
      ]);

      // Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          setIsConnected(false);
          setConnectionTime(null);
          setEvents((prev) => [
            ...prev,
            createEvent("disconnected", { message: "Stream ended" }),
          ]);
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete events (separated by double newlines)
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || ""; // Keep incomplete part in buffer

        for (const part of parts) {
          if (!part.trim()) continue;

          // Parse SSE format
          let eventType = "message";
          let eventData = "";

          for (const line of part.split("\n")) {
            if (line.startsWith("event:")) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              eventData += line.slice(5).trim();
            } else if (line.startsWith(":")) {
              // Comment, ignore
              continue;
            }
          }

          if (eventData) {
            let parsedData: unknown = eventData;
            try {
              parsedData = JSON.parse(eventData);
              // Extract type from data if available
              if (
                typeof parsedData === "object" &&
                parsedData !== null &&
                "type" in parsedData
              ) {
                eventType = String(
                  (parsedData as Record<string, unknown>).type,
                );
              }
            } catch {
              // Keep as string
            }

            setEvents((prev) => [
              ...prev,
              createEvent(eventType, parsedData, eventData),
            ]);
          }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        // User disconnected, don't show error
        return;
      }

      const errorMessage = e instanceof Error ? e.message : "Failed to connect";
      setError(errorMessage);
      setIsConnected(false);
      setConnectionTime(null);
      setEvents((prev) => [
        ...prev,
        createEvent("error", { message: errorMessage }),
      ]);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;

      setEvents((prev) => [
        ...prev,
        createEvent("disconnected", { message: "Disconnected by user" }),
      ]);
    }
    setIsConnected(false);
    setConnectionTime(null);
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && url) {
      connect();
    }
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [autoConnect]);

  return {
    events,
    isConnected,
    error,
    connectionTime,
    connect,
    disconnect,
    clearEvents,
  };
}
