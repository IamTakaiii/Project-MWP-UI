/**
 * Jira Authentication Service
 * 
 * Handles Jira authentication via session-based auth
 */

import { ApiClient, getServiceConfig } from './api'
import type { JiraCredentials } from './jira/jira.types'

export interface LoginResponse {
  success: boolean
  message: string
}

export interface SessionInfo {
  authenticated: boolean
  jiraUrl?: string
  email?: string
  sessionInfo?: {
    createdAt: number
    lastAccessed: number
    age: number
    idleTime: number
  }
}

/**
 * Jira Auth Service Class
 */
class JiraAuthService extends ApiClient {
  constructor() {
    super(getServiceConfig('jira'))
  }

  /**
   * Login with Jira credentials
   */
  async login(credentials: JiraCredentials): Promise<LoginResponse> {
    return this.post<LoginResponse>('/api/auth/login', credentials)
  }

  /**
   * Logout - end current session
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    return this.post<{ success: boolean; message: string }>('/api/auth/logout', {})
  }

  /**
   * Get current session info
   */
  async getCurrentSession(): Promise<SessionInfo> {
    return this.get<SessionInfo>('/api/auth/me')
  }
}

// Export singleton instance
export const jiraAuthService = new JiraAuthService()

// Also export the class for testing or custom instances
export { JiraAuthService }