// Policy API - zarządzanie polisami OPA i integracja z OPA/OPAL
const API_BASE_URL = 'http://localhost:8001'

// OPAL endpoints
const OPAL_SERVER_URL = 'http://localhost:7002'
const OPAL_CLIENT_URL = 'http://localhost:7001'

export interface Policy {
  id: string
  name: string
  description: string
  content: string
  status: 'active' | 'draft' | 'inactive'
  version: string
  tests: number
  testsStatus: 'passed' | 'failed' | 'pending'
  createdAt: string
  updatedAt: string
}

export interface TestRequest {
  policy: string
  input: Record<string, any>
}

export interface TestResponse {
  result: boolean
  allowed: boolean
  errors?: string[]
}

export interface ValidateRequest {
  policy: string
}

export interface ValidateResponse {
  valid: boolean
  errors?: string[]
}

// OPAL Health Check Interfaces
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  error?: string
  responseTime?: number
}

export interface SystemStatusResponse {
  opalServer: HealthCheckResponse
  opalClients: HealthCheckResponse
  timestamp: string
  overallStatus: 'healthy' | 'degraded' | 'unhealthy'
}

export interface OpalStatsResponse {
  stats: any
  timestamp: string
  error?: string
}

class PolicyAPI {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health')
  }

  // Validate policy syntax
  async validatePolicy(request: ValidateRequest): Promise<ValidateResponse> {
    return this.request('/validate', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // Test policy
  async testPolicy(request: TestRequest): Promise<TestResponse> {
    return this.request('/test', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // Mock methods for policy CRUD operations
  // TODO: Implement actual backend endpoints for these

  async getPolicies(): Promise<Policy[]> {
    // Mock data - will be replaced with real API calls
    return [
      {
        id: '1',
        name: 'RBAC Policy',
        description: 'Role-Based Access Control dla aplikacji eBiuro',
        content: `package rbac

default allow = false

allow {
    user_roles[_] == "admin"
}

allow {
    user_roles[_] == "user"
    input.resource == "read"
}

user_roles = input.user.roles`,
        status: 'active',
        version: '1.2.0',
        tests: 15,
        testsStatus: 'passed',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
      },
    ]
  }
}

export const policyAPI = new PolicyAPI()

// Eksportuj funkcje dla łatwiejszego importu
export const healthCheckOpalServer = () => policyAPI.healthCheck()
export const getSystemStatus = () => policyAPI.healthCheck()