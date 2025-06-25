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

// Fallback użytkownicy dla sytuacji gdy API nie działa - POPRAWIONE ID
const fallbackUsers = [
  { id: "user42", name: "Jan Kowalski", username: "admin_user", email: "admin@symfonia.pl", initials: "JK", role: "administrator", tenant_id: "tenant125" },
  { id: "user99", name: "Anna Nowak", username: "hr_manager", email: "hr@symfonia.pl", initials: "AN", role: "hr_manager", tenant_id: "tenant125" },
  { id: "user500", name: "Agnieszka Kosz", username: "ksef_admin", email: "ksef@symfonia.pl", initials: "AK", role: "ksef_admin", tenant_id: "tenant125" },
  { id: "user700", name: "Joanna Wiśniewska", username: "ebiuro_user", email: "ebiuro@symfonia.pl", initials: "JW", role: "ebiuro_user", tenant_id: "tenant125" },
]

export function Header({ title }: HeaderProps) {
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(fallbackUsers[0]) // Zmieniony na user42
  const [users, setUsers] = useState(fallbackUsers)
  const [isClient, setIsClient] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  
  // Stan dla firm
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)

  // Pobierz prawdziwych użytkowników z API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('[Header] Pobieranie użytkowników z API...')
        const response = await fetch('/api/users')
        const data = await response.json()
        
        if (data.success && data.users?.length > 0) {
          console.log('[Header] Pobrano prawdziwych użytkowników:', data.users)
          
          // Przypisz tenant_id do użytkowników jeśli nie mają
          const usersWithTenant = data.users.map((user: any) => ({
            ...user,
            tenant_id: user.tenant_id || 'tenant125' // Domyślny tenant
          }))
          
          setUsers(usersWithTenant)
          
          // Jeśli aktualny użytkownik nie istnieje w nowej liście, ustaw pierwszego
          const currentStored = localStorage.getItem('currentUser')
          if (currentStored) {
            const storedUser = JSON.parse(currentStored)
            const existingUser = usersWithTenant.find((u: any) => u.id === storedUser.id)
            if (existingUser) {
              setCurrentUser(existingUser)
            } else {
              const defaultUser = usersWithTenant[0]
              setCurrentUser(defaultUser)
              localStorage.setItem('currentUser', JSON.stringify(defaultUser))
            }
          } else {
            const defaultUser = usersWithTenant[0]
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
      if (!currentUser?.tenant_id) return
      
      setIsLoadingCompanies(true)
      try {
        console.log(`[Header] Pobieranie firm dla tenant: ${currentUser.tenant_id}`)
        const response = await fetch(`/api/companies?tenant_id=${currentUser.tenant_id}`)
        const data = await response.json()
        
        if (data.success && data.companies?.length > 0) {
          console.log('[Header] Pobrano firmy:', data.companies)
          setCompanies(data.companies)
          
          // Ustaw pierwszą firmę jako domyślną jeśli nie ma wybranej
          const storedCompany = localStorage.getItem('selectedCompany')
          if (storedCompany) {
            try {
              const parsedCompany = JSON.parse(storedCompany)
              const existingCompany = data.companies.find((c: Company) => c.company_id === parsedCompany.company_id)
              setSelectedCompany(existingCompany || data.companies[0])
            } catch {
              setSelectedCompany(data.companies[0])
            }
          } else {
            setSelectedCompany(data.companies[0])
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
    
    // Zapisz wybranego użytkownika w localStorage
    localStorage.setItem('currentUser', JSON.stringify(user))
    
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
            <DialogTitle>Wybierz użytkownika ({users.length})</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto space-y-2 mt-4 pr-2">
            {users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${
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
                  <div className="text-xs text-gray-400 capitalize">{user.role}</div>
                  <div className="text-xs text-green-600">Tenant: {user.tenant_id || 'tenant125'}</div>
                </div>
                {currentUser.id === user.id && (
                  <div className="text-green-600 text-sm font-medium flex-shrink-0">✓ Aktualny</div>
                )}
              </div>
            ))}
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
