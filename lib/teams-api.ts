// Teams Management API - typy i funkcje dla zespołów
const DATA_API_BASE_URL = "/api"

// Typ zespołu
export interface Team {
  team_id: string
  tenant_id: string
  team_name: string
  description?: string
  team_type: 'functional' | 'project' | 'department' | 'temporary'
  status: 'active' | 'inactive' | 'archived'
  created_at: string
  updated_at?: string
  member_count?: number
  company_count?: number
}

// Szczegółowy zespół z rolami, firmami i członkami
export interface TeamDetails extends Team {
  roles: TeamRole[]
  companies: TeamCompany[]
  members: TeamMember[]
}

// Rola zespołu
export interface TeamRole {
  team_id: string
  app_id: string
  app_name: string
  role_name: string
  assigned_at: string
}

// Firma zespołu
export interface TeamCompany {
  team_id: string
  company_id: string
  company_name: string
  nip: string
  access_type: 'view' | 'edit' | 'manage' | 'admin'
  assigned_at: string
}

// Członek zespołu
export interface TeamMember {
  user_id: string
  username: string
  full_name: string
  email: string
  role_in_team: 'member' | 'lead' | 'admin'
  joined_at: string
}

// Zespoły użytkownika
export interface UserTeam {
  team_id: string
  team_name: string
  description?: string
  team_type: 'functional' | 'project' | 'department' | 'temporary'
  tenant_id: string
  role_in_team: 'member' | 'lead' | 'admin'
  joined_at: string
}

// Dane do tworzenia zespołu
export interface CreateTeamData {
  team_name: string
  tenant_id: string
  description?: string
  team_type?: 'functional' | 'project' | 'department' | 'temporary'
}

// Dane do aktualizacji zespołu
export interface UpdateTeamData {
  team_name?: string
  description?: string
  team_type?: 'functional' | 'project' | 'department' | 'temporary'
  status?: 'active' | 'inactive' | 'archived'
}

// Dane do dodania członka zespołu
export interface AddTeamMemberData {
  user_id: string
  role_in_team?: 'member' | 'lead' | 'admin'
  joined_by?: string
}

// Response typu API
export interface TeamsResponse {
  teams: Team[]
  total_count: number
  tenant_id: string
  timestamp: string
}

export interface TeamResponse {
  team: TeamDetails
  timestamp: string
}

export interface TeamMembersResponse {
  team_id: string
  team_name: string
  members: TeamMember[]
  total_members: number
  timestamp: string
}

export interface UserTeamsResponse {
  user_id: string
  user_name: string
  teams: UserTeam[]
  total_teams: number
  timestamp: string
}

// === FUNKCJE API ===

// Pobierz wszystkie zespoły dla tenanta
export async function fetchTeams(tenantId: string): Promise<Team[]> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/teams?tenant_id=${tenantId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: TeamsResponse = await response.json()
    return data.teams || []
  } catch (error) {
    console.error('Error fetching teams:', error)
    return []
  }
}

// Pobierz szczegóły zespołu
export async function fetchTeam(teamId: string): Promise<TeamDetails | null> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/teams/${teamId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: TeamResponse = await response.json()
    return data.team || null
  } catch (error) {
    console.error('Error fetching team:', error)
    return null
  }
}

// Utwórz nowy zespół
export async function createTeam(teamData: CreateTeamData): Promise<Team | null> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.team || null
  } catch (error) {
    console.error('Error creating team:', error)
    return null
  }
}

// Aktualizuj zespół
export async function updateTeam(teamId: string, teamData: UpdateTeamData): Promise<Team | null> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/teams/${teamId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.team || null
  } catch (error) {
    console.error('Error updating team:', error)
    return null
  }
}

// Usuń zespół
export async function deleteTeam(teamId: string): Promise<boolean> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/teams/${teamId}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Error deleting team:', error)
    return false
  }
}

// === FUNKCJE CZŁONKÓW ZESPOŁU ===

// Pobierz członków zespołu
export async function fetchTeamMembers(teamId: string): Promise<TeamMember[]> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/teams/${teamId}/members`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: TeamMembersResponse = await response.json()
    return data.members || []
  } catch (error) {
    console.error('Error fetching team members:', error)
    return []
  }
}

// Dodaj członka do zespołu
export async function addTeamMember(teamId: string, memberData: AddTeamMemberData): Promise<boolean> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/teams/${teamId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    })
    return response.ok
  } catch (error) {
    console.error('Error adding team member:', error)
    return false
  }
}

// Usuń członka z zespołu
export async function removeTeamMember(teamId: string, userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Error removing team member:', error)
    return false
  }
}

// Aktualizuj rolę członka zespołu
export async function updateTeamMemberRole(
  teamId: string, 
  userId: string, 
  newRole: 'member' | 'lead' | 'admin'
): Promise<boolean> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/teams/${teamId}/members/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role_in_team: newRole }),
    })
    return response.ok
  } catch (error) {
    console.error('Error updating team member role:', error)
    return false
  }
}

// === FUNKCJE ZESPOŁÓW UŻYTKOWNIKA ===

// Pobierz zespoły użytkownika
export async function fetchUserTeams(userId: string, tenantId?: string): Promise<UserTeam[]> {
  try {
    const url = tenantId 
      ? `${DATA_API_BASE_URL}/users/${userId}/teams?tenant_id=${tenantId}`
      : `${DATA_API_BASE_URL}/users/${userId}/teams`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: UserTeamsResponse = await response.json()
    return data.teams || []
  } catch (error) {
    console.error('Error fetching user teams:', error)
    return []
  }
}

// Alias dla funkcji fetchTeam - zgodność z importami
export const fetchTeamDetails = fetchTeam

// === FUNKCJE POMOCNICZE ===

// Sprawdź czy użytkownik jest członkiem zespołu
export function isUserTeamMember(members: TeamMember[], userId: string): boolean {
  return members.some(member => member.user_id === userId)
}

// Sprawdź czy użytkownik jest liderem zespołu
export function isUserTeamLeader(members: TeamMember[], userId: string): boolean {
  const member = members.find(member => member.user_id === userId)
  return member?.role_in_team === 'lead' || member?.role_in_team === 'admin'
}

// Pobierz rolę użytkownika w zespole
export function getUserTeamRole(members: TeamMember[], userId: string): string | null {
  const member = members.find(member => member.user_id === userId)
  return member?.role_in_team || null
}

// Formatuj typ zespołu dla wyświetlania
export function formatTeamType(teamType: string): string {
  const types: Record<string, string> = {
    'functional': 'Funkcjonalny',
    'project': 'Projektowy',
    'department': 'Departament',
    'temporary': 'Tymczasowy'
  }
  return types[teamType] || teamType
}

// Formatuj rolę w zespole dla wyświetlania
export function formatTeamRole(role: string): string {
  const roles: Record<string, string> = {
    'member': 'Członek',
    'lead': 'Lider',
    'admin': 'Administrator'
  }
  return roles[role] || role
}

// Formatuj status zespołu dla wyświetlania
export function formatTeamStatus(status: string): string {
  const statuses: Record<string, string> = {
    'active': 'Aktywny',
    'inactive': 'Nieaktywny',
    'archived': 'Zarchiwizowany'
  }
  return statuses[status] || status
}

// === APLIKACJE ZESPOŁU ===

// Pobierz role zespołu w aplikacjach
export async function fetchTeamApplications(teamId: string): Promise<TeamRole[]> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/teams/${teamId}/applications`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.applications || []
  } catch (error) {
    console.error('Error fetching team applications:', error)
    return []
  }
}

// Nadaj zespołowi dostęp do aplikacji
export async function addTeamApplication(teamId: string, applicationData: {
  app_id: string
  role_name: string
}): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    console.log('Wywołanie addTeamApplication:', { teamId, applicationData })
    
    const response = await fetch(`${DATA_API_BASE_URL}/teams/${teamId}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('addTeamApplication error:', response.status, errorData)
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorData}`
      }
    }

    const data = await response.json()
    console.log('addTeamApplication success:', data)
    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('addTeamApplication network error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    }
  }
}

// Usuń dostęp zespołu do aplikacji
export async function removeTeamApplication(teamId: string, appId: string, roleName: string): Promise<boolean> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/teams/${teamId}/applications?app_id=${appId}&role_name=${roleName}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Error removing team application:', error)
    return false
  }
}

// === FIRMY ZESPOŁU ===

// Pobierz firmy zespołu
export async function fetchTeamCompanies(teamId: string): Promise<TeamCompany[]> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/teams/${teamId}/companies`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.companies || []
  } catch (error) {
    console.error('Error fetching team companies:', error)
    return []
  }
}

// Nadaj zespołowi dostęp do firmy
export async function addTeamCompany(teamId: string, companyData: {
  company_id: string
  access_type: 'view' | 'edit' | 'manage' | 'admin'
}): Promise<boolean> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/teams/${teamId}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(companyData),
    })
    return response.ok
  } catch (error) {
    console.error('Error adding team company:', error)
    return false
  }
}

// Usuń dostęp zespołu do firmy
export async function removeTeamCompany(teamId: string, companyId: string): Promise<boolean> {
  try {
    const response = await fetch(`${DATA_API_BASE_URL}/teams/${teamId}/companies?company_id=${companyId}`, {
      method: 'DELETE',
    })
    return response.ok
  } catch (error) {
    console.error('Error removing team company:', error)
    return false
  }
}