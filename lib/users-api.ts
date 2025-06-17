// Use Next.js API routes as proxy to backend
const DATA_API_BASE_URL = "/api"

// User interface
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

// Application interface
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

// Profile interface
export interface Profile {
  profile_id: string
  app_id: string
  profile_name: string
  description: string
  is_default: boolean
  app_name: string
  created_at: string
  role_mappings: Array<{
    role_id: string
    role_name: string
    description: string
    permissions: Array<{
      permission_id: string
      permission_name: string
      description: string
    }>
  }>
}

// User Profile interface
export interface UserProfile {
  user_id: string
  profile_id: string
  app_id: string
  assigned_at: string
  assigned_by?: string
}

export interface Company {
  company_id: string
  company_name: string
  nip: string
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
    
    // Handle both API format variants
    if (data.users) {
      // Transform from portal format to User interface format
      return data.users.map((user: any) => ({
        user_id: user.id || user.user_id,
        username: user.name || user.username || user.full_name,
        email: user.email,
        full_name: user.name || user.full_name,
        status: user.status === 'active' ? 'active' : 'inactive',
        created_at: new Date().toISOString(), // Not available in portal format
        companies_count: user.tenants?.length || 0,
        profiles: user.profiles || []
      }))
    }
    
    return []
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

// === NOWE FUNKCJE DLA PROFILI ===

// Fetch all profiles (optionally filtered by application)
export async function fetchProfiles(applicationId?: string): Promise<Profile[]> {
  try {
    const url = applicationId 
      ? `${DATA_API_BASE_URL}/profiles?application=${applicationId}`
      : `${DATA_API_BASE_URL}/profiles`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.profiles || []
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return []
  }
}

// Fetch single profile with role mappings
export async function fetchProfile(profileId: string): Promise<Profile | null> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/profiles/${profileId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.profile || null
  } catch (error) {
    console.error('Error fetching profile:', error)
    return null
  }
}

// Fetch companies for user access management
export async function fetchCompaniesForUsers(): Promise<Company[]> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/companies`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.companies || []
  } catch (error) {
    console.error('Error fetching companies:', error)
    return []
  }
}

// Assign profile to user
export async function assignProfileToUser(userId: string, profileId: string): Promise<boolean> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/users/${userId}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile_id: profileId
      }),
    })
    return response.ok
  } catch (error) {
    console.error('Error assigning profile to user:', error)
    return false
  }
}

// Remove profile from user
export async function removeProfileFromUser(userId: string, profileId: string): Promise<boolean> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/users/${userId}/profiles/${profileId}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Error removing profile from user:', error)
    return false
  }
}

// Assign company to user
export async function assignCompanyToUser(userId: string, companyId: string): Promise<boolean> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/users/${userId}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_id: companyId
      }),
    })
    return response.ok
  } catch (error) {
    console.error('Error assigning company to user:', error)
    return false
  }
}

// Remove company from user
export async function removeCompanyFromUser(userId: string, companyId: string): Promise<boolean> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/users/${userId}/companies/${companyId}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Error removing company from user:', error)
    return false
  }
}

// Fetch user's assigned profiles
export async function fetchUserProfiles(userId: string): Promise<Profile[]> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/users/${userId}/profiles`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.profiles || []
  } catch (error) {
    console.error('Error fetching user profiles:', error)
    return []
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

// Interface for user application access
export interface UserApplicationAccess {
  user_id: string
  app_id: string  
  app_name: string
  profile_id: string
  profile_name: string
  assigned_at: string
  assigned_by?: string
}

// Fetch user's application access (real data from API)
export async function fetchUserApplicationAccess(userId: string): Promise<UserApplicationAccess[]> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/users/${userId}/application-access`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    
    // Przekształć zagnieżdżone dane API na płaską listę
    const applications = data.applications || []
    const flattenedAccess: UserApplicationAccess[] = []
    
    applications.forEach((app: any) => {
      app.profiles?.forEach((profile: any) => {
        flattenedAccess.push({
          user_id: userId,
          app_id: app.app_id,
          app_name: app.app_name,
          profile_id: profile.profile_id,
          profile_name: profile.profile_name,
          assigned_at: profile.assigned_at,
          assigned_by: profile.assigned_by
        })
      })
    })
    
    return flattenedAccess
  } catch (error) {
    console.error('Error fetching user application access:', error)
    throw error
  }
}

// Delete user application access by profile_id
export async function deleteUserApplicationAccess(userId: string, profileId: string): Promise<void> {
  try {
    console.log('Deleting application access:', { userId, profileId })
    
    const response = await fetch(`${DATA_API_BASE_URL}/users/${userId}/application-access/${profileId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Delete response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || errorData.detail || 'Failed to delete application access')
    }

    const result = await response.json()
    console.log('Delete success:', result)
  } catch (error) {
    console.error('Error deleting user application access:', error)
    throw error
  }
}

// User company access interface
export interface UserCompanyAccess {
  company_id: string
  company_name: string
  assigned_date: string
  nip?: string
}

// Fetch user companies
export async function fetchUserCompanies(userId: string): Promise<UserCompanyAccess[]> {
  try {
    console.log('Fetching user companies for user:', userId)
    
    const response = await fetch(`${DATA_API_BASE_URL}/users/${userId}/companies`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('User companies response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || errorData.detail || 'Failed to fetch user companies')
    }

    const data = await response.json()
    console.log('User companies fetched:', data)
    
    // Map API response to UserCompanyAccess format
    const companies = data.companies || []
    return companies.map((company: any) => ({
      company_id: company.company_id,
      company_name: company.company_name,
      assigned_date: company.assigned_at,
      nip: company.nip
    }))
  } catch (error) {
    console.error('Error fetching user companies:', error)
    throw error
  }
}

// Delete user company access
export async function deleteUserCompany(userId: string, companyId: string): Promise<void> {
  try {
    console.log('Deleting user company access:', { userId, companyId })
    
    const response = await fetch(`${DATA_API_BASE_URL}/users/${userId}/companies/${companyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('Delete company response status:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || errorData.detail || 'Failed to delete user company access')
    }

    console.log('User company access deleted successfully')
  } catch (error) {
    console.error('Error deleting user company access:', error)
    throw error
  }
} 