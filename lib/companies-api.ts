// Companies API - zarządzanie firmami z data-provider-api
const DATA_API_BASE_URL = 'http://localhost:8110/api'

export interface Company {
  company_id: string
  tenant_id: string
  company_name: string
  company_code: string
  description: string
  parent_company_id?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at?: string
  users_count?: number
  nip?: string
}

export interface CompanyUser {
  user_id: string
  username: string
  email: string
  full_name: string
  status: string
  access_type: string
  granted_at: string
  granted_by: string
}

// Fetch all companies from API
export async function fetchCompanies(tenantId?: string): Promise<Company[]> {
  try {
    const url = tenantId 
      ? `${DATA_API_BASE_URL}/companies?tenant_id=${tenantId}`
      : `${DATA_API_BASE_URL}/companies`
    
    const response = await fetch(url)
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

// Fetch single company by ID
export async function fetchCompany(companyId: string): Promise<Company | null> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/companies/${companyId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.company || null
  } catch (error) {
    console.error('Error fetching company:', error)
    return null
  }
}

// Fetch users for a specific company
export async function fetchCompanyUsers(companyId: string): Promise<CompanyUser[]> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/companies/${companyId}/users`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.users || []
  } catch (error) {
    console.error('Error fetching company users:', error)
    return []
  }
}

// Create new company
export async function createCompany(companyData: {
  tenant_id: string
  company_name: string
  company_code?: string
  description?: string
  parent_company_id?: string
  status?: 'active' | 'inactive'
}): Promise<Company | null> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.company || null
  } catch (error) {
    console.error('Error creating company:', error)
    return null
  }
}

// Update company
export async function updateCompany(companyId: string, companyData: Partial<Company>): Promise<Company | null> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/companies/${companyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.company || null
  } catch (error) {
    console.error('Error updating company:', error)
    return null
  }
}

// Delete company
export async function deleteCompany(companyId: string): Promise<boolean> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/companies/${companyId}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting company:', error)
    return false
  }
}

// Grant user access to company
export async function grantUserAccess(
  companyId: string, 
  userId: string, 
  accessData: {
    access_type: string
    granted_by: string
  }
): Promise<boolean> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/companies/${companyId}/users/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(accessData),
    })
    return response.ok
  } catch (error) {
    console.error('Error granting user access:', error)
    return false
  }
}

// Revoke user access from company
export async function revokeUserAccess(companyId: string, userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/companies/${companyId}/users/${userId}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Error revoking user access:', error)
    return false
  }
}

// Transform API company to Portal company format
export function transformApiCompanyToPortalCompany(apiCompany: Company, index: number): any {
  return {
    id: index + 1, // Portal expects numeric ID
    company_id: apiCompany.company_id, // Keep original API ID for operations
    name: apiCompany.company_name,
    code: apiCompany.company_code,
    nip: apiCompany.nip || 'Brak NIP', // Use real NIP from API or fallback
    address: 'Brak danych adresowych', // Default address - will be updated when we add this field to API
    tenant: apiCompany.tenant_id,
    description: apiCompany.description,
    users: apiCompany.users_count || 0,
    isDemo: false, // Default to false - will be updated when we add this field to API
    status: apiCompany.status === 'active',
    created: new Date(apiCompany.created_at).toLocaleDateString('pl-PL'),
    activeServices: [] // Default empty array - will be updated when we add this field to API
  }
} 