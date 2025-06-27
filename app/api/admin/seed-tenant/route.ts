import { NextRequest, NextResponse } from 'next/server'

// ===== ROZSZERZONE TYPY DANYCH =====

interface TenantConfig {
  id: string
  name: string
  companies: number
  users: number
  description: string
  admin_name: string
}

interface CompanyData {
  company_name: string
  company_code: string
  description?: string
}

interface UserData {
  tenant_id: string
  username: string
  email: string
  full_name: string
  metadata?: any
}

interface TeamData {
  team_name: string
  description: string
}

interface TeamMembershipData {
  team_id: string
  user_id: string
}

interface TeamCompanyAccessData {
  team_id: string
  company_id: string
}

interface UserProfileData {
  user_id: string
  app_id: string
  profile_name: string
}

interface UserCompanyAccessData {
  user_id: string
  company_id: string
}

interface TenantStructure {
  tenantConfig: TenantConfig
  companies: CompanyData[]
  users: UserData[]
  teams: TeamData[]
  teamMemberships: TeamMembershipData[]
  teamCompanyAccess: TeamCompanyAccessData[]
  userProfiles: UserProfileData[]
  userCompanyAccess: UserCompanyAccessData[]
}

// ===== AKTUALIZOWANE KONFIGURACJE TENANTÓW =====

const TENANT_CONFIGS: { [key: string]: TenantConfig } = {
  mikro: {
    id: 'tenant_mikro_dzialal',
    name: 'Consulting Services Jan Kowalski',
    admin_name: 'Jan Kowalski',
    companies: 1,
    users: 1,
    description: 'Jednoosobowa działalność gospodarcza'
  },
  mala: {
    id: 'tenant_mala_firma',
    name: 'TechMart Sp. z o.o.',
    admin_name: 'Anna Nowak',
    companies: 1,
    users: 10,
    description: 'Małe przedsiębiorstwo z zespołem'
  },
  duza: {
    id: 'tenant_duza_firma',
    name: 'InnovateTech S.A.',
    admin_name: 'Robert Kowalczyk',
    companies: 1,
    users: 50,
    description: 'Duże przedsiębiorstwo z zespołami funkcjonalnymi'
  },
  grupa: {
    id: 'tenant_grupa_kapital',
    name: 'Capital Group Holdings S.A.',
    admin_name: 'Maria Dąbrowska',
    companies: 5,
    users: 60,
    description: 'Grupa kapitałowa z centrum usług wspólnych'
  },
  biuro_male: {
    id: 'tenant_biuro_rachunk',
    name: 'Biuro Rachunkowe',
    admin_name: 'Piotr Zieliński',
    companies: 40,
    users: 7,
    description: 'Małe biuro rachunkowe'
  },
  biuro_duze: {
    id: 'tenant_biuro_duze',
    name: 'Expert Tax Duże Biuro Rachunkowe Sp. z o.o.',
    admin_name: 'Katarzyna Lewandowska',
    companies: 200,
    users: 30,
    description: 'Duże biuro rachunkowe obsługujące mikro firmy i spółki'
  }
}

// ===== KONFIGURACJA API =====

const PROVISIONING_API_URL = process.env.PROVISIONING_API_URL || 'http://localhost:8010'
const DATA_PROVIDER_API_URL = process.env.DATA_PROVIDER_API_URL || 'http://localhost:8110'

// ===== WALIDACJA I OBSŁUGA BŁĘDÓW =====

interface ValidationErrorItem {
  field: string
  message: string
}

interface SeedingProgress {
  tenant_created: boolean
  companies_created: number
  users_created: number
  teams_created: number
  profiles_assigned: number
  rollback_needed: string[]
}

class ValidationError extends Error {
  public errors: ValidationErrorItem[]
  
  constructor(errors: ValidationErrorItem[]) {
    super(`Validation failed: ${errors.map(e => e.field).join(', ')}`)
    this.errors = errors
    this.name = 'ValidationError'
  }
}

class SeedingError extends Error {
  public progress: SeedingProgress
  public originalError: Error
  
  constructor(message: string, progress: SeedingProgress, originalError?: Error) {
    super(message)
    this.progress = progress
    this.originalError = originalError || this
    this.name = 'SeedingError'
  }
}

// ===== ROZSZERZONA KLASA DATA PROVIDER CLIENT =====

class DataProviderClient {
  private baseUrl: string
  private retryAttempts: number
  private retryDelay: number

  constructor(baseUrl: string, retryAttempts: number = 3, retryDelay: number = 1000) {
    this.baseUrl = baseUrl
    this.retryAttempts = retryAttempts
    this.retryDelay = retryDelay
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private async makeRequest(endpoint: string, method: string, data?: any, retryCount: number = 0): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`
    const requestId = Math.random().toString(36).substr(2, 9)
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    console.log(`[Data Provider] [${requestId}] ${method} ${url}`, data || '')
    
    try {
      const response = await fetch(url, options)
      const responseText = await response.text()
      
      if (!response.ok) {
        const error = new Error(`Data Provider API error: ${response.status} - ${responseText}`)
        console.error(`[Data Provider] [${requestId}] Error ${response.status}: ${responseText}`)
        
        // Retry on 5xx errors or network issues
        if ((response.status >= 500 || response.status === 0) && retryCount < this.retryAttempts) {
          console.warn(`[Data Provider] [${requestId}] Retrying ${retryCount + 1}/${this.retryAttempts} after ${this.retryDelay}ms...`)
          await this.sleep(this.retryDelay * (retryCount + 1)) // Exponential backoff
          return this.makeRequest(endpoint, method, data, retryCount + 1)
        }
        
        throw error
      }

      try {
        const result = JSON.parse(responseText)
        console.log(`[Data Provider] [${requestId}] Success:`, result)
        return result
      } catch (e) {
        console.log(`[Data Provider] [${requestId}] Success (text):`, responseText)
        return responseText
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error - retry
        if (retryCount < this.retryAttempts) {
          console.warn(`[Data Provider] [${requestId}] Network error, retrying ${retryCount + 1}/${this.retryAttempts}...`)
          await this.sleep(this.retryDelay * (retryCount + 1))
          return this.makeRequest(endpoint, method, data, retryCount + 1)
        }
      }
      
      console.error(`[Data Provider] [${requestId}] Request failed:`, error)
      throw error
    }
  }

  // ===== WALIDACJA PRZED WYKONANIEM =====
  
  private validateUserData(userData: UserData): ValidationErrorItem[] {
    const errors: ValidationErrorItem[] = []
    
    if (!userData.username || userData.username.length < 2) {
      errors.push({ field: 'username', message: 'Username must be at least 2 characters long' })
    }
    
    if (!userData.email || !userData.email.includes('@')) {
      errors.push({ field: 'email', message: 'Valid email address is required' })
    }
    
    if (!userData.full_name || userData.full_name.length < 2) {
      errors.push({ field: 'full_name', message: 'Full name must be at least 2 characters long' })
    }
    
    return errors
  }
  
  private validateCompanyData(companyData: CompanyData): ValidationErrorItem[] {
    const errors: ValidationErrorItem[] = []
    
    if (!companyData.company_name || companyData.company_name.length < 2) {
      errors.push({ field: 'company_name', message: 'Company name must be at least 2 characters long' })
    }
    
    if (!companyData.company_code || companyData.company_code.length < 2) {
      errors.push({ field: 'company_code', message: 'Company code must be at least 2 characters long' })
    }
    
    return errors
  }
  
  private validateTeamData(teamData: TeamData): ValidationErrorItem[] {
    const errors: ValidationErrorItem[] = []
    
    if (!teamData.team_name || teamData.team_name.length < 2) {
      errors.push({ field: 'team_name', message: 'Team name must be at least 2 characters long' })
    }
    
    return errors
  }

  // ===== BEZPIECZNE METODY Z WALIDACJĄ =====

  async createCompany(tenantId: string, companyData: CompanyData): Promise<any> {
    const validationErrors = this.validateCompanyData(companyData)
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors)
    }

    const payload = {
      tenant_id: tenantId,
      company_id: `company_${Math.random().toString(36).substr(2, 9)}`,
      company_name: companyData.company_name,
      company_code: companyData.company_code || `COMP_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      description: companyData.description || '',
      access_level: 'manage'
    }

    try {
      const result = await this.makeRequest('/api/companies', 'POST', payload)
      return result
    } catch (error) {
      // Jeśli firma już istnieje, po prostu ją zwracamy
      if (error instanceof Error && error.message.includes('409')) {
        console.log(`[Data Provider] Company ${companyData.company_name} already exists, skipping...`)
        return { company: { company_id: payload.company_id } }
      }
      throw error
    }
  }

  async createUser(userData: UserData): Promise<any> {
    const validationErrors = this.validateUserData(userData)
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors)
    }
    
    return this.makeRequest('/api/users', 'POST', {
      tenant_id: userData.tenant_id,
      username: userData.username,
      email: userData.email,
      full_name: userData.full_name,
      status: 'active',
      metadata: userData.metadata || {}
    })
  }

  async syncUserProfiles(userId: string): Promise<any> {
    if (!userId || userId.length < 2) {
      throw new ValidationError([{ field: 'user_id', message: 'Valid user ID is required' }])
    }
    
    return this.makeRequest(`/api/users/${userId}/sync-profiles`, 'POST')
  }

  async assignUserToCompany(userId: string, companyId: string): Promise<any> {
    if (!userId || !companyId) {
      throw new ValidationError([
        { field: 'user_id', message: 'User ID is required' },
        { field: 'company_id', message: 'Company ID is required' }
      ])
    }
    
    return this.makeRequest(`/api/users/${userId}/companies`, 'POST', {
      company_id: companyId
    })
  }

  async assignUserProfile(userId: string, profileData: UserProfileData): Promise<any> {
    if (!userId || !profileData.app_id || !profileData.profile_name) {
      throw new ValidationError([
        { field: 'user_id', message: 'User ID is required' },
        { field: 'app_id', message: 'App ID is required' },
        { field: 'profile_name', message: 'Profile name is required' }
      ])
    }
    
    // Krok 1: Znajdź profile_id na podstawie app_id i profile_name
    const profilesResponse = await this.makeRequest(`/api/profiles?application=${profileData.app_id}`, 'GET')
    const profiles = profilesResponse.profiles || []
    
    const matchingProfile = profiles.find((p: any) => 
      p.profile_name === profileData.profile_name && 
      p.applications.includes(profileData.app_id)
    )
    
    if (!matchingProfile) {
      throw new ValidationError([
        { field: 'profile', message: `Profile '${profileData.profile_name}' not found for app '${profileData.app_id}'` }
      ])
    }
    
    // Krok 2: Przypisz profil używając profile_id
    return this.makeRequest(`/api/users/${userId}/application-access`, 'POST', {
      profile_id: matchingProfile.profile_id,
      assigned_by: 'seed-tenant-wizard'
    })
  }

  async createTeam(tenantId: string, teamData: TeamData): Promise<any> {
    const validationErrors = this.validateTeamData(teamData)
    if (validationErrors.length > 0) {
      throw new ValidationError(validationErrors)
    }

    const payload = {
      tenant_id: tenantId,
      team_name: teamData.team_name,
      description: teamData.description || '',
      department: 'General',
      role_in_team: 'member'
    }

    try {
      const result = await this.makeRequest('/api/teams', 'POST', payload)
      return result
    } catch (error) {
      // Jeśli zespół już istnieje, po prostu go zwracamy
      if (error instanceof Error && error.message.includes('409')) {
        console.log(`[Data Provider] Team ${teamData.team_name} already exists, skipping...`)
        return { team: { team_id: `team_${Math.random().toString(36).substr(2, 9)}` } }
      }
      throw error
    }
  }

  async addTeamMember(teamId: string, userId: string): Promise<any> {
    if (!teamId || !userId) {
      throw new ValidationError([
        { field: 'team_id', message: 'Team ID is required' },
        { field: 'user_id', message: 'User ID is required' }
      ])
    }
    
    return this.makeRequest(`/api/teams/${teamId}/members`, 'POST', {
      user_id: userId,
      role: 'member'
    })
  }

  async assignTeamToCompany(teamId: string, companyId: string): Promise<any> {
    if (!teamId || !companyId) {
      throw new ValidationError([
        { field: 'team_id', message: 'Team ID is required' },
        { field: 'company_id', message: 'Company ID is required' }
      ])
    }
    
    return this.makeRequest(`/api/teams/${teamId}/companies`, 'POST', {
      company_id: companyId,
      access_type: 'manage'
    })
  }

  // ===== OPAL NOTIFICATION Z RETRY =====
  async notifyOpalServer(tenantId: string): Promise<void> {
    if (!tenantId) {
      throw new ValidationError([{ field: 'tenant_id', message: 'Tenant ID is required for OPAL notification' }])
    }
    
    try {
      const opalResponse = await fetch('http://localhost:7002/data/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entries: [{
            url: `${this.baseUrl}/tenants/${tenantId}/acl`,
            topics: ["multi_tenant_data"],
            dst_path: `/acl/${tenantId}`,
            config: {
              fetcher: "HttpFetcher",
              auth: null
            }
          }]
        })
      })

      if (!opalResponse.ok) {
        const errorText = await opalResponse.text()
        console.warn(`[OPAL Notification] Warning: ${opalResponse.status} - ${errorText}`)
        // Don't throw - OPAL notification failure shouldn't fail the entire seeding
      } else {
        console.log(`[OPAL Notification] Success for tenant ${tenantId}`)
      }
    } catch (error) {
      console.warn('[OPAL Notification] Warning:', error)
      // Don't throw - OPAL notification failure shouldn't fail the entire seeding
    }
  }
  
  // ===== CLEANUP METHODS FOR ROLLBACK =====
  
  async deleteUser(userId: string): Promise<void> {
    try {
      await this.makeRequest(`/api/users/${userId}`, 'DELETE')
      console.log(`[Cleanup] Deleted user: ${userId}`)
    } catch (error) {
      console.warn(`[Cleanup] Failed to delete user ${userId}:`, error)
    }
  }
  
  async deleteCompany(companyId: string): Promise<void> {
    try {
      await this.makeRequest(`/api/companies/${companyId}`, 'DELETE')
      console.log(`[Cleanup] Deleted company: ${companyId}`)
    } catch (error) {
      console.warn(`[Cleanup] Failed to delete company ${companyId}:`, error)
    }
  }
  
  async deleteTeam(teamId: string): Promise<void> {
    try {
      await this.makeRequest(`/api/teams/${teamId}`, 'DELETE')
      console.log(`[Cleanup] Deleted team: ${teamId}`)
    } catch (error) {
      console.warn(`[Cleanup] Failed to delete team ${teamId}:`, error)
    }
  }
}

// ===== POMOCNICZE FUNKCJE WALIDACYJNE =====

function validateTenantType(tenantType: string): ValidationErrorItem[] {
  const validTypes = ['mikro', 'mala', 'duza', 'grupa', 'biuro_male', 'biuro_duze']
  const errors: ValidationErrorItem[] = []
  
  if (!tenantType) {
    errors.push({ field: 'tenantType', message: 'Tenant type is required' })
  } else if (!validTypes.includes(tenantType)) {
    errors.push({ field: 'tenantType', message: `Invalid tenant type. Must be one of: ${validTypes.join(', ')}` })
  }
  
  return errors
}

function validateTenantId(tenantId: string): ValidationErrorItem[] {
  const errors: ValidationErrorItem[] = []
  
  if (!tenantId) {
    errors.push({ field: 'tenantId', message: 'Tenant ID is required' })
  } else if (tenantId.length < 3) {
    errors.push({ field: 'tenantId', message: 'Tenant ID must be at least 3 characters long' })
  } else if (!/^[a-zA-Z0-9_-]+$/.test(tenantId)) {
    errors.push({ field: 'tenantId', message: 'Tenant ID can only contain letters, numbers, underscores and hyphens' })
  }
  
  return errors
}

async function performRollback(progress: SeedingProgress, dataClient: DataProviderClient, tenantId: string): Promise<void> {
  console.log('[Rollback] Starting cleanup process...', progress)
  
  // Note: Provisioning API rollback would need to be implemented separately
  // For now, we only clean up Data Provider API resources
  
  if (progress.rollback_needed.length === 0) {
    console.log('[Rollback] No cleanup needed')
    return
  }
  
  for (const item of progress.rollback_needed) {
    const [type, id] = item.split(':')
    
    try {
      switch (type) {
        case 'user':
          await dataClient.deleteUser(id)
          break
        case 'company':
          await dataClient.deleteCompany(id)
          break
        case 'team':
          await dataClient.deleteTeam(id)
          break
        default:
          console.warn(`[Rollback] Unknown item type: ${type}`)
      }
    } catch (error) {
      console.warn(`[Rollback] Failed to cleanup ${item}:`, error)
    }
  }
  
  console.log('[Rollback] Cleanup completed')
}

// ===== SZCZEGÓŁOWE WORKFLOW SEEDOWANIA =====

async function seedTenantMikro(dataClient: DataProviderClient, tenantId: string): Promise<any> {
  console.log('[Seed Mikro] Rozpoczynanie seedowania TENANT_MIKRO...')
  
  // TENANT_MIKRO ma już wszystko co potrzeba z Provisioning API:
  // - 1 tenant, 1 firma, 1 admin z profilami Administrator dla wszystkich aplikacji
  
  // Dodajemy tylko specyficzne profile dla Jan Kowalski zgodnie z PRD:
  const adminUserId = `admin_${tenantId}`
  
  // Przypisz specyficzne profile aplikacji zgodnie z PRD
  await dataClient.assignUserProfile(adminUserId, {
    user_id: adminUserId,
    app_id: 'ksef',
    profile_name: 'Właściciel'
  })
  
  // Synchronizuj profile z rolami
  await dataClient.syncUserProfiles(adminUserId)
  
  console.log('[Seed Mikro] ✅ Zakończono - jednoosobowa działalność gotowa')
  
  return {
    companies_created: 0, // już istnieje 1 z Provisioning
    users_created: 0, // już istnieje admin z Provisioning  
    teams_created: 0,
    profiles_assigned: 1
  }
}

async function seedTenantMaly(dataClient: DataProviderClient, tenantId: string): Promise<any> {
  console.log('[Seed Maly] Rozpoczynanie seedowania TENANT_MALY...')
  
  const companyId = `company_${tenantId}` // Firma już istnieje z Provisioning
  const results = {
    companies_created: 0,
    users_created: 0,
    teams_created: 0,
    profiles_assigned: 0
  }
  
  // Mapowanie ról na działy dla metadata
  const roleToDepartmentMap: {[key: string]: string} = {
    'Prezes': 'Zarząd',
    'Księgowy': 'Księgowość',
    'HR Manager': 'Kadry',
    'Sales Manager': 'Sprzedaż',
    'Handlowiec': 'Sprzedaż',
    'Asystent': 'Administracja',
    'Magazynier': 'Magazyn',
    'Recepcja': 'Administracja',
    'Praktykant': 'Ogólny'
  }
  
  // Lista użytkowników zgodnie z PRD
  const users = [
    { username: 'anna.nowak', email: 'anna.nowak@techmart.pl', full_name: 'Anna Nowak-Kowalska', role: 'Prezes' },
    { username: 'piotr.wisniewski', email: 'piotr.wisniewski@techmart.pl', full_name: 'Piotr Wiśniewski', role: 'Księgowy' },
    { username: 'maria.kowalczyk', email: 'maria.kowalczyk@techmart.pl', full_name: 'Maria Kowalczyk', role: 'HR Manager' },
    { username: 'tomasz.dabrowski', email: 'tomasz.dabrowski@techmart.pl', full_name: 'Tomasz Dąbrowski', role: 'Sales Manager' },
    { username: 'katarzyna.lewandowska', email: 'katarzyna.lewandowska@techmart.pl', full_name: 'Katarzyna Lewandowska', role: 'Handlowiec' },
    { username: 'marcin.wojcik', email: 'marcin.wojcik@techmart.pl', full_name: 'Marcin Wójcik', role: 'Handlowiec' },
    { username: 'agnieszka.kaminska', email: 'agnieszka.kaminska@techmart.pl', full_name: 'Agnieszka Kamińska', role: 'Asystent' },
    { username: 'michal.zielinski', email: 'michal.zielinski@techmart.pl', full_name: 'Michał Zieliński', role: 'Magazynier' },
    { username: 'joanna.szymanska', email: 'joanna.szymanska@techmart.pl', full_name: 'Joanna Szymańska', role: 'Recepcja' },
    { username: 'pawel.wozniak', email: 'pawel.wozniak@techmart.pl', full_name: 'Paweł Woźniak', role: 'Praktykant' }
  ]
  
  // Tworzenie użytkowników (pomijamy pierwszego - to admin już istnieje)
  for (let i = 1; i < users.length; i++) {
    const user = users[i]
    const department = roleToDepartmentMap[user.role] || 'Ogólny'
    
    const createUserResponse = await dataClient.createUser({
      tenant_id: tenantId,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      metadata: {
        department: department,
        role: user.role
      }
    })
    
    // Przechwycenie user_id z odpowiedzi API
    const userId = createUserResponse.user.user_id
    
    // Przypisz dostęp do firmy
    await dataClient.assignUserToCompany(userId, companyId)
    
    // Przypisz profile aplikacji na podstawie roli
    const profiles = getUserProfilesByRole(user.role)
    for (const profile of profiles) {
      await dataClient.assignUserProfile(userId, {
        user_id: userId,
        app_id: profile.app_id,
        profile_name: profile.profile_name
      })
      results.profiles_assigned++
    }
    
    // Synchronizuj profile z rolami
    await dataClient.syncUserProfiles(userId)
    
    results.users_created++
  }
  
  console.log('[Seed Maly] ✅ Zakończono seedowanie')
  return results
}

async function seedTenantDuzy(dataClient: DataProviderClient, tenantId: string): Promise<any> {
  try {
    console.log('[Seed Duzy] Rozpoczynanie seedowania TENANT_DUZY...')
    
    const companyId = `company_${tenantId}`
    const results = {
      companies_created: 1, // Utworzymy podstawową firmę
      users_created: 0,
      teams_created: 5,
      profiles_assigned: 0
    }
    
    // KROK 1: Tworzenie podstawowej firmy (może nie istnieć z Provisioning)
    try {
      await dataClient.createCompany(tenantId, {
        company_name: 'InnovateTech S.A.',
        company_code: 'INNOVATE_TECH',
        description: 'Główna firma - duże przedsiębiorstwo technologiczne'
      })
      console.log('[Seed Duzy] ✅ Utworzono podstawową firmę')
    } catch (error) {
      if (error instanceof Error && error.message.includes('409')) {
        console.log('[Seed Duzy] Podstawowa firma już istnieje, kontynuujemy...')
        results.companies_created = 0 // Nie liczymy jako nowo utworzoną
      } else {
        throw error
      }
    }
    
    // KROK 2: Zespoły zgodnie z PRD
    const teams = [
      { name: 'Księgowość', description: 'Zespół księgowości', userCount: 12, startUser: 1 },
      { name: 'Kadry', description: 'Zespół kadr', userCount: 8, startUser: 13 },
      { name: 'Sales & Marketing', description: 'Zespół sprzedaży i marketingu', userCount: 15, startUser: 21 },
      { name: 'IT', description: 'Zespół informatyczny', userCount: 10, startUser: 36 },
      { name: 'Zarząd', description: 'Zespół zarządzający', userCount: 5, startUser: 46 }
    ]
    
    // Tworzenie zespołów i użytkowników
    for (const team of teams) {
      // Tworzenie zespołu
      const teamResponse = await dataClient.createTeam(tenantId, {
        team_name: team.name,
        description: team.description
      })
      const teamId = teamResponse.team.team_id
      
      // Przypisanie zespołu do firmy
      await dataClient.assignTeamToCompany(teamId, companyId)
      
      // Tworzenie użytkowników zespołu
      for (let i = 0; i < team.userCount; i++) {
        const userNumber = team.startUser + i
        const username = `user_${userNumber}_${tenantId.replace('tenant_', '')}`
        
        // Tworzenie użytkownika z metadata departmentu
        const userResponse = await dataClient.createUser({
          tenant_id: tenantId,
          username: username,
          email: `${username}@innovatetech.pl`,
          full_name: `Użytkownik ${userNumber}`,
          metadata: {
            department: team.name,
            role: getGenericRoleByTeam(team.name)
          }
        })
        const userId = userResponse.user.user_id
        
        // Dodanie do zespołu
        await dataClient.addTeamMember(teamId, userId)
        
        // Przypisanie do firmy
        await dataClient.assignUserToCompany(userId, companyId)
        
        // Przypisanie profili na podstawie zespołu
        const profiles = getTeamProfiles(team.name)
        for (const profile of profiles) {
          await dataClient.assignUserProfile(userId, {
            user_id: userId,
            app_id: profile.app_id,
            profile_name: profile.profile_name
          })
          results.profiles_assigned++
        }
        
        // Synchronizacja profili
        await dataClient.syncUserProfiles(userId)
      
        results.users_created++
      }
    }
    
    console.log('[Seed Duzy] ✅ Zakończono seedowanie')
    return results
    
  } catch (error) {
    console.error('[Seed Duzy] ERROR in function:', error)
    throw error
  }
}

async function seedTenantGrupa(dataClient: DataProviderClient, tenantId: string): Promise<any> {
  console.log('[Seed Grupa] Rozpoczynanie seedowania TENANT_GRUPA...')
  
  const results = {
    companies_created: 4, // +4 do już istniejącej z Provisioning
    users_created: 0,
    teams_created: 8,
    profiles_assigned: 0
  }
  
  // Dodatkowe firmy (pierwsza już istnieje z Provisioning)
  const additionalCompanies = [
    { name: 'Tech Solutions Sp. z o.o.', code: 'TECH_SOL', id: `tech_solutions_${tenantId}` },
    { name: 'Manufacturing Plus Sp. z o.o.', code: 'MANUF_PLUS', id: `manufacturing_${tenantId}` },
    { name: 'Logistics Express Sp. z o.o.', code: 'LOG_EXPRESS', id: `logistics_${tenantId}` },
    { name: 'Retail Chain Sp. z o.o.', code: 'RETAIL_CHAIN', id: `retail_${tenantId}` }
  ]
  
  const companyIds = [`company_${tenantId}`] // Pierwsza firma z Provisioning
  
  // Tworzenie dodatkowych firm
  for (const company of additionalCompanies) {
    await dataClient.createCompany(tenantId, {
      company_name: company.name,
      company_code: company.code,
      description: `Spółka zależna grupy kapitałowej`
    })
    companyIds.push(company.id)
  }
  
  // Zespoły i ich konfiguracje
  const teamsConfig = [
    { name: 'Zarząd - Holdings', companies: [companyIds[0]], userCount: 5, profiles: ['edokumenty:Administrator', 'fk:Administrator'] },
    { name: 'Zarząd - Tech Solutions', companies: [companyIds[1]], userCount: 3, profiles: ['edokumenty:Administrator'] },
    { name: 'Zarząd - Manufacturing', companies: [companyIds[2]], userCount: 3, profiles: ['edokumenty:Administrator'] },
    { name: 'Zarząd - Logistics', companies: [companyIds[3]], userCount: 3, profiles: ['edokumenty:Administrator'] },
    { name: 'Zarząd - Retail', companies: [companyIds[4]], userCount: 3, profiles: ['edokumenty:Administrator'] },
    { name: 'Księgowość CUW', companies: companyIds, userCount: 15, profiles: ['ksef:Księgowa', 'edeklaracje:Edytor', 'fk:Księgowy'] },
    { name: 'IT CUW', companies: companyIds, userCount: 10, profiles: ['ebiuro:Administrator', 'edokumenty:Administrator'] },
    { name: 'Kadry CUW', companies: companyIds, userCount: 12, profiles: ['hr:HR Manager', 'edokumenty:Księgowa'] },
    { name: 'Księgowość - Matka', companies: [companyIds[0]], userCount: 6, profiles: ['ksef:Administrator', 'edeklaracje:Administrator', 'fk:Administrator'] }
  ]
  
  let userCounter = 1
  
  // Tworzenie zespołów
  for (const teamConfig of teamsConfig) {
    // Tworzenie zespołu
    const teamResponse = await dataClient.createTeam(tenantId, {
      team_name: teamConfig.name,
      description: `Zespół funkcjonalny - ${teamConfig.name}`
    })
    const teamId = teamResponse.team_id
    
    // Przypisanie zespołu do firm
    for (const companyId of teamConfig.companies) {
      await dataClient.assignTeamToCompany(teamId, companyId)
    }
    
    // Tworzenie użytkowników zespołu
    for (let i = 0; i < teamConfig.userCount; i++) {
      const username = `user_${userCounter}`
      userCounter++
      
      // Tworzenie użytkownika
      await dataClient.createUser({
        tenant_id: tenantId,
        username: username,
        email: `${username}@capitalgroup.pl`,
        full_name: `Użytkownik ${username.split('_')[1]}`
      })
      
      // Dodanie do zespołu
      await dataClient.addTeamMember(teamId, username)
      
      // Przypisanie do firm zespołu
      for (const companyId of teamConfig.companies) {
        await dataClient.assignUserToCompany(username, companyId)
      }
      
      // Przypisanie profili
      for (const profileStr of teamConfig.profiles) {
        const [app_id, profile_name] = profileStr.split(':')
        await dataClient.assignUserProfile(username, {
          user_id: username,
          app_id: app_id,
          profile_name: profile_name
        })
        results.profiles_assigned++
      }
      
      // Synchronizacja profili
      await dataClient.syncUserProfiles(username)
      
      results.users_created++
    }
  }
  
  console.log('[Seed Grupa] ✅ Zakończono seedowanie')
  return results
}

async function seedTenantBiuro(dataClient: DataProviderClient, tenantId: string): Promise<any> {
  console.log('[Seed Biuro] Rozpoczynanie seedowania TENANT_BIURO...')
  
  const results = {
    companies_created: 39, // +39 do już istniejącej z Provisioning
    users_created: 6, // +6 do już istniejącego admina
    teams_created: 6,
    profiles_assigned: 0
  }
  
  // Tworzenie 39 dodatkowych firm klientów
  for (let i = 2; i <= 40; i++) {
    await dataClient.createCompany(tenantId, {
      company_name: `Firma Klient ${i} Sp. z o.o.`,
      company_code: `CLIENT${i}`,
      description: `Firma kliencka obsługiwana przez biuro rachunkowe`
    })
  }
  
  // Pobranie ID wszystkich firm
  const companyIds = []
  for (let i = 1; i <= 40; i++) {
    if (i === 1) {
      companyIds.push(`company_${tenantId}`) // Pierwsza firma z Provisioning
    } else {
      companyIds.push(`client${i}_${tenantId}`)
    }
  }
  
  // Zespoły i ich konfiguracje
  const teamsConfig = [
    { name: 'Zarząd', users: ['user_1'], companies: companyIds, profiles: ['ksef:Administrator', 'edeklaracje:Administrator', 'fk:Administrator', 'ebiuro:Administrator', 'edokumenty:Administrator', 'hr:Administrator'] },
    { name: 'Główni Księgowi', users: ['user_2'], companies: companyIds, profiles: ['ksef:Administrator', 'edeklaracje:Administrator', 'fk:Administrator', 'ebiuro:Administrator'] },
    { name: 'Księgowi KPIR', users: ['user_3', 'user_4'], companies: companyIds.slice(0, 15), profiles: ['ksef:Księgowa', 'edeklaracje:Edytor', 'fk:Księgowy', 'ebiuro:Specjalista'] },
    { name: 'Księgowi Spółki', users: ['user_5', 'user_6'], companies: companyIds.slice(15, 40), profiles: ['ksef:Księgowa', 'edeklaracje:Edytor', 'fk:Księgowy', 'ebiuro:Specjalista'] },
    { name: 'HR', users: ['user_7'], companies: companyIds, profiles: ['hr:HR Manager', 'edokumenty:Księgowa'] },
    { name: 'Specjaliści Branżowi', users: ['user_3', 'user_4'], companies: companyIds.slice(30, 40), profiles: ['ksef:Administrator', 'edeklaracje:Administrator', 'fk:Administrator'] }
  ]
  
  // Tworzenie użytkowników (user_1 to admin, już istnieje)
  for (let i = 2; i <= 7; i++) {
    const username = `user_${i}`
    await dataClient.createUser({
      tenant_id: tenantId,
      username: username,
      email: `${username}@biurorachunkowe.pl`,
      full_name: `Księgowy ${i}`
    })
    results.users_created++
  }
  
  // Tworzenie zespołów
  for (const teamConfig of teamsConfig) {
    const teamResponse = await dataClient.createTeam(tenantId, {
      team_name: teamConfig.name,
      description: `Zespół specjalistyczny - ${teamConfig.name}`
    })
    const teamId = teamResponse.team_id
    
    // Przypisanie zespołu do firm
    for (const companyId of teamConfig.companies) {
      await dataClient.assignTeamToCompany(teamId, companyId)
    }
    
    // Dodanie członków zespołu
    for (const username of teamConfig.users) {
      await dataClient.addTeamMember(teamId, username)
      
      // Przypisanie do firm zespołu (jeśli jeszcze nie ma dostępu)
      for (const companyId of teamConfig.companies) {
        await dataClient.assignUserToCompany(username, companyId)
      }
      
      // Przypisanie profili
      for (const profileStr of teamConfig.profiles) {
        const [app_id, profile_name] = profileStr.split(':')
        await dataClient.assignUserProfile(username, {
          user_id: username,
          app_id: app_id,
          profile_name: profile_name
        })
        results.profiles_assigned++
      }
      
      // Synchronizacja profili
      await dataClient.syncUserProfiles(username)
    }
  }
  
  console.log('[Seed Biuro] ✅ Zakończono seedowanie')
  return results
}

async function seedTenantBiuroDuze(dataClient: DataProviderClient, tenantId: string): Promise<any> {
  console.log('[Seed Biuro Duze] Rozpoczynanie seedowania TENANT_BIURO_DUZE...')
  
  const results = {
    companies_created: 199, // +199 do już istniejącej z Provisioning
    users_created: 29, // +29 do już istniejącego admina
    teams_created: 5,
    profiles_assigned: 0
  }
  
  // Tworzenie 150 firm mikro + 50 spółek
  for (let i = 2; i <= 201; i++) {
    const isMikro = i <= 151
    const companyType = isMikro ? 'mikro' : 'spółka'
    const companyName = isMikro 
      ? `Mikro Firma ${i} JDG`
      : `Spółka ${i-150} Sp. z o.o.`
    
    await dataClient.createCompany(tenantId, {
      company_name: companyName,
      company_code: `${companyType.toUpperCase()}${i}`,
      description: `${companyType} obsługiwana przez duże biuro rachunkowe`
    })
  }
  
  // Zespoły i ich konfiguracje
  const teamsConfig = [
    { name: 'Zarząd', userCount: 3, companyRange: 'all', profiles: ['edokumenty:Administrator', 'ksef:Administrator', 'edeklaracje:Administrator', 'fk:Administrator', 'ebiuro:Administrator', 'hr:Administrator'] },
    { name: 'Główni Księgowi', userCount: 5, companyRange: 'all', profiles: ['edokumenty:Administrator', 'ksef:Administrator', 'edeklaracje:Administrator', 'fk:Administrator', 'ebiuro:Administrator'] },
    { name: 'Księgowi - KPIR', userCount: 10, companyRange: 'mikro', profiles: ['ebiuro:Specjalista', 'edeklaracje:Edytor', 'ksef:Księgowa'] },
    { name: 'Księgowi - Spółki', userCount: 7, companyRange: 'spółki', profiles: ['edokumenty:Księgowa', 'ksef:Księgowa', 'fk:Księgowy', 'edeklaracje:Edytor'] },
    { name: 'HR', userCount: 5, companyRange: 'hr_spółki', profiles: ['hr:HR Manager', 'edeklaracje:Edytor'] }
  ]
  
  let userCounter = 2 // user_1 to admin już istnieje
  
  // Tworzenie zespołów i użytkowników
  for (const teamConfig of teamsConfig) {
    const teamResponse = await dataClient.createTeam(tenantId, {
      team_name: teamConfig.name,
      description: `Zespół specjalistyczny - ${teamConfig.name}`
    })
    const teamId = teamResponse.team_id
    
    // Określenie firm dla zespołu
    let companyIds: string[] = []
    if (teamConfig.companyRange === 'all') {
      companyIds = Array.from({length: 200}, (_, i) => i === 0 ? `company_${tenantId}` : `client${i+1}_${tenantId}`)
    } else if (teamConfig.companyRange === 'mikro') {
      companyIds = Array.from({length: 150}, (_, i) => i === 0 ? `company_${tenantId}` : `mikro${i+1}_${tenantId}`)
    } else if (teamConfig.companyRange === 'spółki') {
      companyIds = Array.from({length: 50}, (_, i) => `spolka${i+1}_${tenantId}`)
    } else if (teamConfig.companyRange === 'hr_spółki') {
      companyIds = Array.from({length: 30}, (_, i) => `spolka${i+1}_${tenantId}`) // 30 z 50 spółek
    }
    
    // Przypisanie zespołu do firm
    for (const companyId of companyIds) {
      await dataClient.assignTeamToCompany(teamId, companyId)
    }
    
    // Tworzenie użytkowników zespołu
    for (let i = 0; i < teamConfig.userCount; i++) {
      const username = `user_${userCounter}`
      userCounter++
      
      // Tworzenie użytkownika
      await dataClient.createUser({
        tenant_id: tenantId,
        username: username,
        email: `${username}@expertax.pl`,
        full_name: `Specjalista ${username.split('_')[1]}`
      })
      
      // Dodanie do zespołu
      await dataClient.addTeamMember(teamId, username)
      
      // Przypisanie do firm zespołu
      for (const companyId of companyIds) {
        await dataClient.assignUserToCompany(username, companyId)
      }
      
      // Przypisanie profili
      for (const profileStr of teamConfig.profiles) {
        const [app_id, profile_name] = profileStr.split(':')
        await dataClient.assignUserProfile(username, {
          user_id: username,
          app_id: app_id,
          profile_name: profile_name
        })
        results.profiles_assigned++
      }
      
      // Synchronizacja profili
      await dataClient.syncUserProfiles(username)
      
      results.users_created++
    }
  }
  
  console.log('[Seed Biuro Duze] ✅ Zakończono seedowanie')
  return results
}

// ===== FUNKCJE POMOCNICZE =====

function getUserProfilesByRole(role: string): Array<{app_id: string, profile_name: string}> {
  const profileMap: {[key: string]: Array<{app_id: string, profile_name: string}>} = {
    'Prezes': [
      {app_id: 'ksef', profile_name: 'Administrator'},
      {app_id: 'edeklaracje', profile_name: 'Administrator'},
      {app_id: 'fk', profile_name: 'Administrator'},
      {app_id: 'edokumenty', profile_name: 'Administrator'},
      {app_id: 'hr', profile_name: 'Administrator'},
      {app_id: 'crm', profile_name: 'Administrator'}
    ],
    'Księgowy': [
      {app_id: 'ksef', profile_name: 'Księgowa'},
      {app_id: 'edeklaracje', profile_name: 'Edytor'},
      {app_id: 'fk', profile_name: 'Księgowy'}
    ],
    'HR Manager': [
      {app_id: 'hr', profile_name: 'HR Manager'},
      {app_id: 'edokumenty', profile_name: 'Użytkownik'}
    ],
    'Sales Manager': [
      {app_id: 'crm', profile_name: 'Sales Manager'},
      {app_id: 'edokumenty', profile_name: 'Użytkownik'}
    ],
    'Handlowiec': [
      {app_id: 'ksef', profile_name: 'Handlowiec'},
      {app_id: 'crm', profile_name: 'Użytkownik'}
    ],
    'Asystent': [
      {app_id: 'edokumenty', profile_name: 'Użytkownik'},
      {app_id: 'ebiuro', profile_name: 'Użytkownik'}
    ],
    'Magazynier': [
      {app_id: 'ebiuro', profile_name: 'Użytkownik'}
    ],
    'Recepcja': [
      {app_id: 'ebiuro', profile_name: 'Użytkownik'}
    ],
    'Praktykant': [
      {app_id: 'ebiuro', profile_name: 'Użytkownik'}
    ]
  }
  
  return profileMap[role] || []
}

function getTeamProfiles(teamName: string): Array<{app_id: string, profile_name: string}> {
  const teamProfileMap: {[key: string]: Array<{app_id: string, profile_name: string}>} = {
    'Księgowość': [
      {app_id: 'ksef', profile_name: 'Księgowa'},
      {app_id: 'edeklaracje', profile_name: 'Edytor'},
      {app_id: 'fk', profile_name: 'Księgowy'}
    ],
    'Kadry': [
      {app_id: 'hr', profile_name: 'HR Manager'},
      {app_id: 'edokumenty', profile_name: 'Księgowa'}
    ],
    'Sales & Marketing': [
      {app_id: 'crm', profile_name: 'Sales Manager'},
      {app_id: 'edokumenty', profile_name: 'Użytkownik'}
    ],
    'IT': [
      {app_id: 'ebiuro', profile_name: 'Administrator'},
      {app_id: 'edokumenty', profile_name: 'Administrator'}
    ],
    'Zarząd': [
      {app_id: 'ksef', profile_name: 'Administrator'},
      {app_id: 'edeklaracje', profile_name: 'Administrator'},
      {app_id: 'fk', profile_name: 'Administrator'},
      {app_id: 'edokumenty', profile_name: 'Administrator'},
      {app_id: 'hr', profile_name: 'Administrator'},
      {app_id: 'crm', profile_name: 'Administrator'}
    ]
  }
  
  return teamProfileMap[teamName] || []
}

function getGenericRoleByTeam(teamName: string): string {
  switch(teamName) {
    case 'Księgowość':
      return 'Księgowy'
    case 'Kadry':
      return 'Specjalista HR'
    case 'Sales & Marketing':
      return 'Specjalista Sprzedaży'
    case 'IT':
      return 'Specjalista IT'
    case 'Zarząd':
      return 'Manager'
    default:
      return 'Specjalista'
  }
}

// ===== GŁÓWNA FUNKCJA ENDPOINTU =====

export async function POST(request: NextRequest) {
  const dataClient = new DataProviderClient(DATA_PROVIDER_API_URL, 3, 1000) // 3 retries, 1s delay
  
  let progress: SeedingProgress = {
    tenant_created: false,
    companies_created: 0,
    users_created: 0,
    teams_created: 0,
    profiles_assigned: 0,
    rollback_needed: []
  }
  
  let requestData: any = null
  
  try {
    console.log('[API Seed Tenant] Przetwarzanie żądania seedowania tenanta...')
    
    // ===== WALIDACJA DANYCH WEJŚCIOWYCH =====
    
    try {
      requestData = await request.json()
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON in request body',
        details: error instanceof Error ? error.message : 'Unknown parsing error'
      }, { status: 400 })
    }
    
    const { tenantType, tenantId } = requestData
    
    // Walidacja podstawowych parametrów
    const validationErrors = [
      ...validateTenantType(tenantType),
      ...validateTenantId(tenantId)
    ]
    
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        validation_errors: validationErrors
      }, { status: 400 })
    }

    const config = TENANT_CONFIGS[tenantType]
    if (!config) {
      return NextResponse.json({
        success: false,
        error: `Nieznany typ tenanta: ${tenantType}`,
        available_types: Object.keys(TENANT_CONFIGS)
      }, { status: 400 })
    }

    console.log(`[API Seed Tenant] Seedowanie tenanta typu: ${tenantType}`, config)

    // ===== KROK 1: PODSTAWOWA STRUKTURA (Provisioning API) =====
    
    console.log('[API Seed Tenant] Krok 1: Tworzenie podstawowej struktury...')
    
    let provisioningResult: any = null
    
    const provisioningResponse = await fetch(`${PROVISIONING_API_URL}/provision-tenant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tenant_id: config.id,
        tenant_name: config.name,
        admin_email: `admin@${config.id.replace('tenant_', '')}.test.pl`,
        admin_name: config.admin_name,
        metadata: {
          tenant_type: tenantType,
          config: {
            companies: config.companies,
            users: config.users,
            description: config.description
          },
          created_by: 'seed-tenant-wizard',
          created_at: new Date().toISOString()
        }
      }),
    })

    if (!provisioningResponse.ok) {
      const errorData = await provisioningResponse.text()
      console.error('[API Seed Tenant] Błąd Provisioning API:', errorData)
      
      // Sprawdź czy błąd to "tenant already exists" (409)
      if (provisioningResponse.status === 409 && errorData.includes('already exists')) {
        console.log(`[API Seed Tenant] Tenant ${config.id} już istnieje, kontynuujemy z seedowaniem...`)
        progress.tenant_created = true // Oznacz jako "utworzony" (już istniał)
        provisioningResult = { message: 'Tenant już istniał', tenant_id: config.id }
      } else {
        return NextResponse.json({
          success: false,
          error: `Błąd Provisioning API: ${provisioningResponse.status}`,
          details: errorData
        }, { status: 500 })
      }
    } else {
      provisioningResult = await provisioningResponse.json()
      console.log('[API Seed Tenant] Provisioning API sukces:', provisioningResult)
      progress.tenant_created = true
    }

    // ===== KROK 2: SZCZEGÓŁOWA STRUKTURA (Data Provider API) =====
    
    console.log('[API Seed Tenant] Krok 2: Rozpoczynanie szczegółowego seedowania...')
    
    let detailedResults: any = {}
    
    // Wybór odpowiedniego workflow na podstawie typu tenanta
    switch (tenantType) {
      case 'mikro':
        detailedResults = await seedTenantMikro(dataClient, config.id)
        break
      case 'mala':
        detailedResults = await seedTenantMaly(dataClient, config.id)
        break
      case 'duza':
        console.log('[API Seed Tenant] Przed wywołaniem seedTenantDuzy, config.id:', config.id)
        detailedResults = await seedTenantDuzy(dataClient, config.id)
        console.log('[API Seed Tenant] Po seedTenantDuzy, detailedResults:', detailedResults)
        break
      case 'grupa':
        detailedResults = await seedTenantGrupa(dataClient, config.id)
        break
      case 'biuro_male':
        detailedResults = await seedTenantBiuro(dataClient, config.id)
        break
      case 'biuro_duze':
        detailedResults = await seedTenantBiuroDuze(dataClient, config.id)
        break
      default:
        console.log('[API Seed Tenant] Nieznany typ tenanta, pomijanie szczegółowego seedowania')
        detailedResults = { note: 'Typ tenanta nie jest obsługiwany' }
    }
    
    // Aktualizuj progress z wyników
    if (detailedResults.companies_created) progress.companies_created = detailedResults.companies_created
    if (detailedResults.users_created) progress.users_created = detailedResults.users_created
    if (detailedResults.teams_created) progress.teams_created = detailedResults.teams_created
    if (detailedResults.profiles_assigned) progress.profiles_assigned = detailedResults.profiles_assigned
    
    // Powiadomienie OPAL Server
    await dataClient.notifyOpalServer(config.id)
    
    console.log('[API Seed Tenant] ✅ Seedowanie zakończone sukcesem!')

    return NextResponse.json({
      success: true,
      message: `Tenant ${config.name} został pomyślnie utworzony ze szczegółową strukturą`,
      details: {
        tenant_id: config.id,
        tenant_name: config.name,
        companies: config.companies,
        users: config.users,
        provisioning_result: provisioningResult,
        seeding_results: detailedResults,
        progress: progress
      }
    })

  } catch (error) {
    console.error('[API Seed Tenant] Błąd podczas seedowania:', error)
    
    // Wykonaj rollback jeśli to możliwe
    if (progress.companies_created > 0 || progress.users_created > 0 || progress.teams_created > 0) {
      console.log('[API Seed Tenant] Wykonywanie rollback...')
             try {
         const tenantId = (requestData as any)?.tenantType ? TENANT_CONFIGS[(requestData as any).tenantType]?.id : 'unknown'
         await performRollback(progress, dataClient, tenantId)
       } catch (rollbackError) {
         console.error('[API Seed Tenant] Błąd podczas rollback:', rollbackError)
       }
    }
    
    // Określ typ błędu i odpowiedni status code
    let statusCode = 500
    let errorMessage = 'Błąd wewnętrzny serwera podczas seedowania tenanta'
    let errorDetails: any = error instanceof Error ? error.message : 'Nieznany błąd'
    
    if (error instanceof ValidationError) {
      statusCode = 400
      errorMessage = 'Walidacja danych nie powiodła się'
      errorDetails = {
        validation_errors: error.errors,
        message: error.message
      }
    } else if (error instanceof SeedingError) {
      statusCode = 500
      errorMessage = 'Błąd podczas tworzenia struktury tenanta'
      errorDetails = {
        seeding_progress: error.progress,
        original_error: error.originalError?.message,
        message: error.message
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorDetails,
      progress: progress,
      rollback_attempted: progress.companies_created > 0 || progress.users_created > 0 || progress.teams_created > 0
    }, { status: statusCode })
  }
} 