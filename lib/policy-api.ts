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

export interface ConnectionInfo {
  activeConnections: number
  lastSync?: string
  uptime?: number
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
      {
        id: '2',
        name: 'KSEF Access Policy',
        description: 'Kontrola dostępu do funkcji KSEF',
        content: `package ksef

default allow = false

allow {
    input.user.permissions[_] == "ksef:read"
    input.action == "read"
}

allow {
    input.user.permissions[_] == "ksef:write"
    input.action == "write"
}`,
        status: 'draft',
        version: '0.1.0',
        tests: 8,
        testsStatus: 'failed',
        createdAt: '2024-01-18T09:00:00Z',
        updatedAt: '2024-01-18T16:45:00Z',
      },
    ]
  }

  async getPolicy(id: string): Promise<Policy | null> {
    const policies = await this.getPolicies()
    return policies.find(p => p.id === id) || null
  }

  async createPolicy(policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>): Promise<Policy> {
    // Mock implementation
    const newPolicy: Policy = {
      ...policy,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return newPolicy
  }

  async updatePolicy(id: string, policy: Partial<Policy>): Promise<Policy> {
    // Mock implementation
    const existingPolicy = await this.getPolicy(id)
    if (!existingPolicy) {
      throw new Error('Policy not found')
    }
    
    const updatedPolicy: Policy = {
      ...existingPolicy,
      ...policy,
      updatedAt: new Date().toISOString(),
    }
    return updatedPolicy
  }

  async deletePolicy(id: string): Promise<void> {
    // Mock implementation
    console.log(`Deleting policy ${id}`)
  }

  // OPAL Health Check Methods
  async healthCheckOpalServer(): Promise<HealthCheckResponse> {
    const startTime = Date.now()
    const timestamp = new Date().toISOString()

    try {
      // Tworzymy AbortController dla timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${OPAL_SERVER_URL}/healthcheck`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      if (!response.ok) {
        return {
          status: 'unhealthy',
          timestamp,
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime,
        }
      }

      const data = await response.json()
      
      return {
        status: data.status === 'ok' ? 'healthy' : 'unhealthy',
        timestamp,
        responseTime,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      console.error('OPAL Server health check failed:', error)
      
      return {
        status: 'unhealthy',
        timestamp,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      }
    }
  }

  async healthCheckOpalClients(): Promise<HealthCheckResponse> {
    const startTime = Date.now()
    const timestamp = new Date().toISOString()

    try {
      // Tworzymy AbortController dla timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${OPAL_CLIENT_URL}/healthcheck`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const responseTime = Date.now() - startTime

      if (!response.ok) {
        return {
          status: 'unhealthy',
          timestamp,
          error: `HTTP ${response.status}: ${response.statusText}`,
          responseTime,
        }
      }

      const data = await response.json()
      
      // OPAL Client może zwracać różne statusy
      const isHealthy = data.status === 'ok' || data.status === 'available'
      
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp,
        responseTime,
        error: !isHealthy ? `Client status: ${data.status}` : undefined,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      console.error('OPAL Client health check failed:', error)
      
      return {
        status: 'unhealthy',
        timestamp,
        error: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
      }
    }
  }

  async getSystemStatus(): Promise<SystemStatusResponse> {
    const timestamp = new Date().toISOString()

    // Wykonaj health check dla obu serwisów równolegle
    const [opalServer, opalClients] = await Promise.all([
      this.healthCheckOpalServer(),
      this.healthCheckOpalClients(),
    ])

    // Określ ogólny status systemu
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy'
    
    if (opalServer.status === 'healthy' && opalClients.status === 'healthy') {
      overallStatus = 'healthy'
    } else if (opalServer.status === 'healthy' || opalClients.status === 'healthy') {
      overallStatus = 'degraded'
    } else {
      overallStatus = 'unhealthy'
    }

    return {
      opalServer,
      opalClients,
      timestamp,
      overallStatus,
    }
  }

  async getOpalStats(): Promise<OpalStatsResponse> {
    const timestamp = new Date().toISOString()

    try {
      // Tworzymy AbortController dla timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${OPAL_SERVER_URL}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return {
          stats: null,
          timestamp,
          error: `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const stats = await response.json()
      
      return {
        stats,
        timestamp,
      }
    } catch (error) {
      console.error('OPAL Stats request failed:', error)
      
      return {
        stats: null,
        timestamp,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

export const policyAPI = new PolicyAPI()

// Eksportuj funkcje health check dla łatwiejszego importu
export const healthCheckOpalServer = () => policyAPI.healthCheckOpalServer()
export const healthCheckOpalClients = () => policyAPI.healthCheckOpalClients()
export const getSystemStatus = () => policyAPI.getSystemStatus()
export const getOpalStats = () => policyAPI.getOpalStats() 