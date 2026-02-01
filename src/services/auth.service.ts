/**
 * Jira Authentication Service
 * 
 * Handles Jira authentication via session-based auth with auto-login support
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

const CREDENTIALS_STORAGE_KEY = 'jira_credentials'

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
    const response = await this.post<LoginResponse>('/api/v1/auth/login', credentials)
    
    // Save credentials to localStorage for auto-login after refresh
    // Response is already unwrapped by ApiClient
    this.saveCredentials(credentials)
    
    return response
  }

  /**
   * Logout - end current session
   */
  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await this.post<{ success: boolean; message: string }>('/api/v1/auth/logout', {})
    
    // Clear saved credentials
    this.clearCredentials()
    
    return response
  }

  /**
   * Get current session info
   */
  async getCurrentSession(): Promise<SessionInfo> {
    return this.get<SessionInfo>('/api/v1/auth/me')
  }

  /**
   * Try to restore session or auto-login with saved credentials
   */
  async restoreSession(): Promise<SessionInfo> {
    try {
      // First, check if there's an active session
      const session = await this.getCurrentSession()
      
      if (session.authenticated) {
        return session
      }
      
      // If no active session, try auto-login with saved credentials
      const savedCredentials = this.getSavedCredentials()
      if (savedCredentials) {
        await this.login(savedCredentials)
        return await this.getCurrentSession()
      }
      
      return session
    } catch (error) {
      // If session check fails, try auto-login
      const savedCredentials = this.getSavedCredentials()
      if (savedCredentials) {
        try {
          await this.login(savedCredentials)
          return await this.getCurrentSession()
        } catch {
          // Auto-login failed, clear invalid credentials
          this.clearCredentials()
          throw error
        }
      }
      throw error
    }
  }

  /**
   * Save credentials to localStorage
   */
  private saveCredentials(credentials: JiraCredentials): void {
    try {
      localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(credentials))
    } catch (error) {
      console.warn('Failed to save credentials:', error)
    }
  }

  /**
   * Get saved credentials from localStorage
   */
  private getSavedCredentials(): JiraCredentials | null {
    try {
      const saved = localStorage.getItem(CREDENTIALS_STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.warn('Failed to load credentials:', error)
      return null
    }
  }

  /**
   * Clear saved credentials from localStorage
   */
  private clearCredentials(): void {
    try {
      localStorage.removeItem(CREDENTIALS_STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear credentials:', error)
    }
  }

  /**
   * Check if credentials are saved
   */
  hasSavedCredentials(): boolean {
    return !!this.getSavedCredentials()
  }
}

// Export singleton instance
export const jiraAuthService = new JiraAuthService()

// Also export the class for testing or custom instances
export { JiraAuthService }
