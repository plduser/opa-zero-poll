"use client"

import { Menu, ChevronDown, User } from "lucide-react"
import { useState, useEffect } from "react"
import { AppSwitcher } from "./app-switcher"
import { PortalSettingsDropdown } from "./portal-settings-dropdown"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title: string
}

interface Company {
  company_id: string
  company_name: string
  nip?: string
  tenant_id: string
}

interface Tenant {
  tenant_id: string
  tenant_name: string
}

interface UserTenant {
  tenant_id: string
  tenant_name?: string
  is_default?: boolean
}

interface User {
  id: string
  name: string
  username: string
  email: string
  initials: string
  role: string
  tenant_id: string
  department: string
  tenants?: UserTenant[]
  status?: string
}

// Fallback użytkownicy dla sytuacji gdy API nie działa - POPRAWIONE ID z department
const fallbackUsers: User[] = [
  { id: "user42", name: "Jan Kowalski", username: "admin_user", email: "admin@symfonia.pl", initials: "JK", role: "administrator", tenant_id: "tenant125", department: "IT" },
  { id: "user99", name: "Anna Nowak", username: "hr_manager", email: "hr@symfonia.pl", initials: "AN", role: "hr_manager", tenant_id: "tenant125", department: "Kadry" },
  { id: "user500", name: "Agnieszka Kosz", username: "ksef_admin", email: "ksef@symfonia.pl", initials: "AK", role: "ksef_admin", tenant_id: "tenant125", department: "Księgowość" },
  { id: "user700", name: "Joanna Wiśniewska", username: "ebiuro_user", email: "ebiuro@symfonia.pl", initials: "JW", role: "ebiuro_user", tenant_id: "tenant125", department: "Administracja" },
]

export function Header({ title }: HeaderProps) {
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User>(fallbackUsers[0]) // Zmieniony na user42
  const [users, setUsers] = useState<User[]>(fallbackUsers)
  const [isClient, setIsClient] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  
  // Stan dla firm
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)

  // Stan dla tenantów i filtru
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>("")
  const [isLoadingTenants, setIsLoadingTenants] = useState(false)

  // Pobierz listę tenantów
  useEffect(() => {
    const fetchTenants = async () => {
      setIsLoadingTenants(true)
      try {
        console.log('[Header] Pobieranie tenantów...')
        const response = await fetch('/api/tenants')
        const data = await response.json()
        
        if (data.success && data.tenants?.length > 0) {
          setTenants(data.tenants)
          // Ustaw domyślny tenant na tenant125 lub pierwszy dostępny
          const defaultTenant = data.tenants.find((t: Tenant) => t.tenant_id === 'tenant125') || data.tenants[0]
          setSelectedTenantFilter(defaultTenant.tenant_id)
          console.log('[Header] Pobrano tenantów:', data.tenants)
        }
      } catch (error) {
        console.error('[Header] Błąd pobierania tenantów:', error)
        // Fallback - ustaw tenant125 jako domyślny
        setTenants([{ tenant_id: 'tenant125', tenant_name: 'Symfonia Sp. z o.o.' }])
        setSelectedTenantFilter('tenant125')
      } finally {
        setIsLoadingTenants(false)
      }
    }

    fetchTenants()
  }, [])

  // Pobierz prawdziwych użytkowników z API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('[Header] Pobieranie użytkowników z API...')
        const response = await fetch('/api/users')
        const data = await response.json()
        
        if (data.success && data.users?.length > 0) {
          console.log('[Header] Pobrano prawdziwych użytkowników:', data.users)
          
          // Użyj danych z API i dodaj department z metadata lub wygeneruj z roli
          const usersWithDepartment = data.users.map((user: any) => {
            // Wyciągnij department z metadata lub ustaw na podstawie roli
            let department = user.metadata?.department || user.department
            
            // Jeśli nie ma department, wygeneruj na podstawie roli
            if (!department) {
              const roleMap: { [key: string]: string } = {
                'admin': 'IT',
                'administrator': 'IT', 
                'hr_manager': 'Kadry',
                'ksef_admin': 'Księgowość',
                'accountant': 'Księgowość',
                'ebiuro_user': 'Administracja',
                'edok_specialist': 'Sekretariat',
                'sales_rep': 'Sprzedaż',
                'test_developer': 'IT'
              }
              department = roleMap[user.role] || roleMap[user.username] || 'Ogólny'
            }
            
            return {
              ...user,
              department
              // tenant_id pochodzi już z API i nie jest nadpisywane
            }
          })
          
          setUsers(usersWithDepartment)
          
          // Jeśli aktualny użytkownik nie istnieje w nowej liście, ustaw pierwszego
          const currentStored = localStorage.getItem('currentUser')
          if (currentStored) {
            const storedUser = JSON.parse(currentStored)
            const existingUser = usersWithDepartment.find((u: any) => u.id === storedUser.id)
            if (existingUser) {
              setCurrentUser(existingUser)
            } else {
              const defaultUser = usersWithDepartment[0]
              setCurrentUser(defaultUser)
              localStorage.setItem('currentUser', JSON.stringify(defaultUser))
            }
          } else {
            const defaultUser = usersWithDepartment[0]
            setCurrentUser(defaultUser)
            localStorage.setItem('currentUser', JSON.stringify(defaultUser))
          }
        } else {
          console.log('[Header] Brak użytkowników z API, używam fallback')
        }
      } catch (error) {
        console.error('[Header] Błąd pobierania użytkowników:', error)
      } finally {
        setIsLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  // Pobierz firmy dla aktualnego użytkownika
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!currentUser?.id) return
      
      setIsLoadingCompanies(true)
      try {
        console.log(`[Header] Pobieranie firm dla użytkownika: ${currentUser.id}`)
        const response = await fetch(`/api/users/${currentUser.id}/companies`)
        const data = await response.json()
        
        if (data.companies?.length > 0) {
          console.log('[Header] Pobrano firmy:', data.companies)
          setCompanies(data.companies)
          
          // Ustaw pierwszą firmę jako domyślną jeśli nie ma wybranej
          const storedCompany = localStorage.getItem('selectedCompany')
          if (storedCompany) {
            try {
              const parsedCompany = JSON.parse(storedCompany)
              const existingCompany = data.companies.find((c: Company) => c.company_id === parsedCompany.company_id)
              const companyToSet = existingCompany || data.companies[0]
              setSelectedCompany(companyToSet)
              
              // Zapisz do localStorage i wyślij event jeśli firma się zmieniła
              if (!existingCompany) {
                console.log('[Header] Automatyczne ustawienie pierwszej firmy:', companyToSet)
                localStorage.setItem('selectedCompany', JSON.stringify(companyToSet))
                
                // Emit custom event dla komponentów które nasłuchują zmian firmy
                window.dispatchEvent(new CustomEvent('companyChanged', { 
                  detail: { company: companyToSet } 
                }))
              }
            } catch {
              const companyToSet = data.companies[0]
              setSelectedCompany(companyToSet)
              console.log('[Header] Automatyczne ustawienie pierwszej firmy (błąd parsowania):', companyToSet)
              localStorage.setItem('selectedCompany', JSON.stringify(companyToSet))
              
              // Emit custom event dla komponentów które nasłuchują zmian firmy
              window.dispatchEvent(new CustomEvent('companyChanged', { 
                detail: { company: companyToSet } 
              }))
            }
          } else {
            const companyToSet = data.companies[0]
            setSelectedCompany(companyToSet)
            console.log('[Header] Automatyczne ustawienie pierwszej firmy (brak w localStorage):', companyToSet)
            localStorage.setItem('selectedCompany', JSON.stringify(companyToSet))
            
            // Emit custom event dla komponentów które nasłuchują zmian firmy
            window.dispatchEvent(new CustomEvent('companyChanged', { 
              detail: { company: companyToSet } 
            }))
          }
        } else {
          console.log('[Header] Brak firm dla tego tenanta')
          setCompanies([])
          setSelectedCompany(null)
        }
      } catch (error) {
        console.error('[Header] Błąd pobierania firm:', error)
        setCompanies([])
        setSelectedCompany(null)
      } finally {
        setIsLoadingCompanies(false)
      }
    }

    if (currentUser) {
      fetchCompanies()
    }
  }, [currentUser])

  // Ładuj dane z localStorage tylko po stronie klienta
  useEffect(() => {
    setIsClient(true)
    const stored = localStorage.getItem('currentUser')
    if (stored && !isLoadingUsers) {
      try {
        const storedUser = JSON.parse(stored)
        // Sprawdź czy użytkownik istnieje w aktualnej liście
        const existingUser = users.find(u => u.id === storedUser.id)
        if (existingUser) {
          setCurrentUser(existingUser)
        }
      } catch (e) {
        console.error('Błąd parsowania użytkownika z localStorage:', e)
      }
    }
  }, [users, isLoadingUsers])

  const handleUserChange = (user: typeof fallbackUsers[0]) => {
    console.log('[Header] Zmiana użytkownika:', user)
    setCurrentUser(user)
    setIsUserDialogOpen(false)
    
    // Zapisz wybranego użytkownika w localStorage (oba formaty dla kompatybilności)
    localStorage.setItem('currentUser', JSON.stringify(user))
    localStorage.setItem('currentUserId', user.id)  // Dla strony KSEF
    
    // Wyczyść wybraną firmę - zostanie ponownie pobrana dla nowego użytkownika
    setSelectedCompany(null)
    localStorage.removeItem('selectedCompany')
    
    // Odświeżenie strony dla zastosowania nowych uprawnień
    window.location.reload()
  }

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value
    const company = companies.find(c => c.company_id === companyId)
    if (company) {
      console.log('[Header] Zmiana firmy:', company)
      setSelectedCompany(company)
      localStorage.setItem('selectedCompany', JSON.stringify(company))
      
      // Emit custom event dla komponentów które nasłuchują zmian firmy
      window.dispatchEvent(new CustomEvent('companyChanged', { 
        detail: { company } 
      }))
      
      // Tutaj można dodać dodatkową logikę dla aktualizacji kontekstu firmy
      // np. wywołanie callback'a lub dispatch do store'a globalnego
    }
  }

  // Filtruj użytkowników według wybranego tenanta
  const filteredUsers = selectedTenantFilter 
    ? users.filter(user => user.tenants?.some((t: UserTenant) => t.tenant_id === selectedTenantFilter))
    : users

  // Grupuj użytkowników według działów i sortuj alfabetycznie
  const usersByDepartment = filteredUsers.reduce((groups: { [key: string]: User[] }, user) => {
    const department = user.department || 'Ogólny'
    if (!groups[department]) {
      groups[department] = []
    }
    groups[department].push(user)
    return groups
  }, {})

  // Sortuj działy i użytkowników w działach alfabetycznie
  const sortedDepartments = Object.entries(usersByDepartment)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([department, departmentUsers]: [string, User[]]) => ({
      department,
      users: departmentUsers.sort((a, b) => a.name.localeCompare(b.name))
    }))

  return (
    <>
      <header className="flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <button className="p-1">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <img src="/symfonia-logo.png" alt="Symfonia" className="h-10 relative top-[3px]" />
            <span className="text-lg font-medium font-quicksand ml-4">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Przełącznik firm */}
          <div className="relative">
            <select 
              className="flex items-center gap-2 px-4 py-2 border rounded-md font-quicksand appearance-none cursor-pointer pr-10 min-w-[200px]"
              value={selectedCompany?.company_id || ''}
              onChange={handleCompanyChange}
              disabled={isLoadingCompanies || companies.length === 0}
            >
              {isLoadingCompanies ? (
                <option>Ładowanie firm...</option>
              ) : companies.length === 0 ? (
                <option>Brak dostępnych firm</option>
              ) : (
                companies.map((company) => (
                  <option key={company.company_id} value={company.company_id}>
                    {company.company_name}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="h-5 w-5 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          <PortalSettingsDropdown />
          <AppSwitcher />
          <button 
            onClick={() => setIsUserDialogOpen(true)}
            className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-800 hover:bg-green-200 transition-colors"
            title={`${currentUser.name} (${currentUser.role})`}
          >
            {currentUser.initials}
          </button>
        </div>
      </header>

      {/* Dialog wyboru użytkownika */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Wybierz użytkownika ({filteredUsers.length})</DialogTitle>
          </DialogHeader>
          
          {/* Dropdown wyboru tenanta */}
          <div className="mt-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtruj według tenanta:
            </label>
            <div className="relative">
              <select 
                className="w-full px-3 py-2 border rounded-md font-quicksand appearance-none cursor-pointer pr-10"
                value={selectedTenantFilter}
                onChange={(e) => setSelectedTenantFilter(e.target.value)}
                disabled={isLoadingTenants}
              >
                <option value="">Wszystkie tenenty</option>
                {tenants.map((tenant) => (
                  <option key={tenant.tenant_id} value={tenant.tenant_id}>
                    {tenant.tenant_name} ({tenant.tenant_id})
                  </option>
                ))}
              </select>
              <ChevronDown className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto pr-2">
            {/* Grupowanie użytkowników według działów */}
            {sortedDepartments.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Brak użytkowników dla wybranego tenanta
              </div>
            ) : (
              sortedDepartments.map(({ department, users: departmentUsers }) => (
                <div key={department} className="mb-4">
                  {/* Nagłówek grupy dział */}
                  <div className="sticky top-0 bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 uppercase tracking-wide border-b">
                    👥 {department}
                    <span className="ml-2 text-blue-500">({departmentUsers.length} użytkownik{departmentUsers.length !== 1 ? 'ów' : ''})</span>
                  </div>
                  
                  {/* Lista użytkowników w grupie */}
                  <div className="space-y-1 mt-2">
                    {departmentUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 p-3 mx-2 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
                          currentUser.id === user.id ? "border-green-500 bg-green-50" : "border-gray-200"
                        }`}
                        onClick={() => handleUserChange(user)}
                      >
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-800">
                          {user.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium font-quicksand text-gray-900">
                            {user.name}
                            {user.username && (
                              <span className="ml-2 text-sm font-normal text-gray-600">({user.username})</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate">{user.email}</div>
                          <div className="text-xs text-gray-400 capitalize flex gap-2">
                            <span>{user.role}</span>
                            {user.tenants?.[0]?.tenant_id && (
                              <span className="text-blue-600">• {user.tenants[0].tenant_id}</span>
                            )}
                          </div>
                        </div>
                        {currentUser.id === user.id && (
                          <div className="text-green-600 text-sm font-medium flex-shrink-0">✓ Aktualny</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Anuluj
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
