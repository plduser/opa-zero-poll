// Users API - zarządzanie użytkownikami z data-provider-api
const DATA_API_BASE_URL = 'http://localhost:8110/api'

export interface User {
  user_id: string
  username: string
  email: string
  full_name: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at?: string
  companies_count?: number
  profiles?: Array<{
    app: string
    name: string
  }>
}

export interface Application {
  app_id: string
  app_name: string
  description: string
  profiles: Array<{
    profile_id: string
    profile_name: string
    description: string
    is_default: boolean
  }>
  status: string
}

// Fetch all users from API
export async function fetchUsers(): Promise<User[]> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/users`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.users || []
  } catch (error) {
    console.error('Error fetching users:', error)
    return []
  }
}

// Fetch single user by ID
export async function fetchUser(userId: string): Promise<User | null> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/users/${userId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.user || null
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

// Fetch all applications
export async function fetchApplications(): Promise<Application[]> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/applications`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.database_applications || []
  } catch (error) {
    console.error('Error fetching applications:', error)
    return []
  }
}

// Create new user
export async function createUser(userData: {
  username: string
  email: string
  full_name: string
  password: string
  tenant_id: string
  role?: 'Administrator' | 'Użytkownik'
}): Promise<User | null> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.user || null
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

// Update user
export async function updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.user || null
  } catch (error) {
    console.error('Error updating user:', error)
    return null
  }
}

// Delete user
export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

// Transform API user to Portal user format
export function transformApiUserToPortalUser(apiUser: User, index: number): any {
  return {
    id: index + 1, // Portal expects numeric ID
    user_id: apiUser.user_id, // Keep original API ID for operations
    name: apiUser.full_name,
    email: apiUser.email,
    phone: "-", // Not available in API response
    companies: apiUser.companies_count || 0,
    permissions: apiUser.user_id.includes('admin') ? 'Administrator' : 'Użytkownik', // Simplified logic
    profiles: apiUser.profiles || [],
    status: apiUser.status === 'active',
  }
} 