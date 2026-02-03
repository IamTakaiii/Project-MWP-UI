/**
 * API Services Configuration
 *
 * Centralized configuration for all backend services.
 * Add new services here as your workspace grows.
 */

export interface ServiceConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ServicesConfig {
  jira: ServiceConfig;
  // Add more services here:
  // calendar: ServiceConfig
  // notes: ServiceConfig
  // analytics: ServiceConfig
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, fallback: string): string {
  return import.meta.env[key] || fallback;
}

/**
 * All service configurations
 */
export const services: ServicesConfig = {
  jira: {
    baseUrl: getEnvVar("VITE_JIRA_API_URL", "http://localhost:3000"),
    timeout: 30000,
  },
  // Example: Add more services
  // calendar: {
  //   baseUrl: getEnvVar('VITE_CALENDAR_API_URL', 'http://localhost:3002'),
  //   timeout: 10000,
  // },
};

/**
 * Get a specific service configuration
 */
export function getServiceConfig<K extends keyof ServicesConfig>(
  serviceName: K,
): ServicesConfig[K] {
  const config = services[serviceName];
  if (!config) {
    throw new Error(`Service "${serviceName}" is not configured`);
  }
  return config;
}
