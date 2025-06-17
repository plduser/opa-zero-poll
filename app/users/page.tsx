"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Info,
  CheckCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Key,
  Home,
  AppWindowIcon as Apps,
  HelpCircle,
  UserIcon,
  Settings,
  ChevronDown,
  Menu,
  Building2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AppSwitcher } from "@/components/app-switcher"
// Importuj komponent EditUserDialog
import { EditUserDialog } from "./edit-user-dialog"
// Importuj dialogi dostępu
import { ApplicationAccessDialog } from "./application-access-dialog"
import { CompanyAccessDialog } from "./company-access-dialog"
// Import API functions
import { 
  fetchUsers, 
  fetchApplications, 
  createUser,
  updateUser,
  deleteUser,
  transformApiUserToPortalUser,
  fetchUserApplicationAccess,
  deleteUserApplicationAccess,
  fetchUserCompanies,
  deleteUserCompany,
  type User, 
  type Application,
  type UserApplicationAccess,
  type UserCompanyAccess
} from "@/lib/users-api"

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showErrorMessage, setShowErrorMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [isAddAppAccessDialogOpen, setIsAddAppAccessDialogOpen] = useState(false)
  const [isAddCompanyAccessDialogOpen, setIsAddCompanyAccessDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<string>("")
  const [selectedProfile, setSelectedProfile] = useState<string>("")
  const [companySearchQuery, setCompanySearchQuery] = useState("")
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  // Dodaj stan dla dialogu edycji użytkownika
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [userToEdit, setUserToEdit] = useState<UserType | null>(null)
  
  // Stan dla dialogów dostępu - dodaj wybranego użytkownika
  const [userForAppAccess, setUserForAppAccess] = useState<UserType | null>(null)
  const [userForCompanyAccess, setUserForCompanyAccess] = useState<UserType | null>(null)
  
  // State for real application access data from API
  const [userApplicationAccess, setUserApplicationAccess] = useState<UserApplicationAccess[]>([])
  const [loadingApplicationAccess, setLoadingApplicationAccess] = useState(false)
  
  // State for real company access data from API
  const [userCompanyAccess, setUserCompanyAccess] = useState<UserCompanyAccess[]>([])
  const [loadingCompanyAccess, setLoadingCompanyAccess] = useState(false)
  
  // State for API data
  const [users, setUsers] = useState<UserType[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State for Add User Dialog
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    role: "Użytkownik" as "Administrator" | "Użytkownik"
  })

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch users and applications concurrently
        const [apiUsers, apiApplications] = await Promise.all([
          fetchUsers(),
          fetchApplications()
        ])
        
        // Transform API users to Portal format
        const transformedUsers = apiUsers.map((user, index) => 
          transformApiUserToPortalUser(user, index)
        )
        
        // Transform API applications to Portal format  
        const transformedApplications = apiApplications.map(app => ({
          id: app.app_id,
          name: app.app_name,
          profiles: app.profiles.map(p => p.profile_name)
        }))
        
        setUsers(transformedUsers)
        setApplications(transformedApplications)
        
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Nie udało się załadować danych z API')
        
        // Fallback to mock data on error
        setUsers(mockUsers)
        setApplications(mockApplications)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Helper function to refresh data
  const refreshData = async () => {
    try {
      const [apiUsers, apiApplications] = await Promise.all([
        fetchUsers(),
        fetchApplications()
      ])
      
      const transformedUsers = apiUsers.map((user, index) => 
        transformApiUserToPortalUser(user, index)
      )
      
      setUsers(transformedUsers)
    } catch (err) {
      console.error('Error refreshing data:', err)
      showError('Nie udało się odświeżyć danych')
    }
  }

  // Helper functions for messages
  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 5000)
  }

  const showError = (message: string) => {
    setErrorMessage(message)
    setShowErrorMessage(true)
    setTimeout(() => setShowErrorMessage(false), 5000)
  }

  // Mock data as fallback (keep the original mock data here)
  const mockUsers = [
    {
      id: 1,
      name: "Jan Kowalski",
      email: "jan.kowalski@nazwafirmy.pl",
      phone: "+48 500 500 500",
      companies: 2,
      permissions: "Administrator",
      profiles: [
        { app: "eBiuro", name: "Administrator" },
        { app: "KSEF", name: "Administrator" },
        { app: "eDeklaracje", name: "Edytor" },
      ],
      status: true,
    },
    {
      id: 2,
      name: "Adam Nowak",
      email: "adam.nowak@nazwafirmy.pl",
      phone: "-",
      companies: 0,
      permissions: "Użytkownik",
      profiles: [{ app: "eBiuro", name: "Użytkownik" }],
      status: false,
    },
    {
      id: 3,
      name: "Anna Wiśniewska",
      email: "anna.wisniewska@nazwafirmy.pl",
      phone: "+48 600 600 600",
      companies: 3,
      permissions: "Użytkownik",
      profiles: [
        { app: "eBiuro", name: "Użytkownik" },
        { app: "KSEF", name: "Księgowa" },
        { app: "eDokumenty", name: "Edytor" },
      ],
      status: true,
    },
    {
      id: 4,
      name: "Piotr Zieliński",
      email: "piotr.zielinski@nazwafirmy.pl",
      phone: "+48 700 700 700",
      companies: 1,
      permissions: "Administrator",
      profiles: [
        { app: "eBiuro", name: "Administrator" },
        { app: "KSEF", name: "Właściciel" },
        { app: "eDeklaracje", name: "Administrator" },
      ],
      status: true,
    },
  ]

  // Przykładowe dane aplikacji i profili
  const mockApplications = [
    {
      id: "ebiuro",
      name: "eBiuro",
      profiles: ["Administrator", "Kierownik", "Pracownik", "Przeglądający"],
    },
    {
      id: "ksef",
      name: "KSEF",
      profiles: ["Księgowa", "Handlowiec", "Zakupowiec", "Administrator", "Właściciel"],
    },
    {
      id: "edokumenty",
      name: "eDokumenty",
      profiles: [
        "Administrator",
        "Zarząd",
        "Księgowa",
        "Główna Księgowa",
        "Sekretariat",
        "Użytkownik",
        "Przeglądający",
      ],
    },
    {
      id: "edeklaracje",
      name: "eDeklaracje",
      profiles: ["Administrator", "Księgowa", "Główna Księgowa", "Kadrowy", "Przeglądający"],
    },
    {
      id: "eplace",
      name: "ePłace",
      profiles: ["Administrator", "Kadrowy", "Księgowy", "Główny Księgowy", "Przeglądający"],
    },
    {
      id: "fk",
      name: "Finanse i Księgowość",
      profiles: ["Administrator", "Księgowy", "Główny Księgowy", "Właściciel", "Przeglądający"],
    },
    {
      id: "handel",
      name: "Handel",
      profiles: ["Administrator", "Kierownik", "Sprzedawca", "Magazynier", "Przeglądający"],
    },
    {
      id: "hr",
      name: "HR",
      profiles: ["Administrator", "Kierownik HR", "Specjalista HR", "Rekruter", "Przeglądający"],
    },
  ]

  // Przykładowe dane firm
  const companies = [
    {
      id: 1,
      name: "CD Projekt Red S.A.",
      nip: "7342867148",
    },
    {
      id: 2,
      name: "Platige Image S.A.",
      nip: "5242014184",
    },
    {
      id: 3,
      name: "Techland Sp. z o.o.",
      nip: "9542214164",
    },
    {
      id: 4,
      name: "11 bit studios S.A.",
      nip: "1182017282",
    },
    {
      id: 5,
      name: "Bloober Team S.A.",
      nip: "6762385512",
    },
    {
      id: 6,
      name: "Comarch S.A.",
      nip: "6771046741",
    },
    {
      id: 7,
      name: "Asseco Poland S.A.",
      nip: "5220001666",
    },
    {
      id: 8,
      name: "Transition Technologies S.A.",
      nip: "5241022097",
    },
    {
      id: 9,
      name: "Sygnity S.A.",
      nip: "5260001538",
    },
    {
      id: 10,
      name: "Symfonia S.A.",
      nip: "5261027808",
    },
  ]

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(companySearchQuery.toLowerCase()) || company.nip.includes(companySearchQuery),
  )

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.full_name || !newUser.password) {
      showError('Wszystkie pola są wymagane')
      return
    }

    setIsSubmitting(true)
    try {
      const userData = {
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
        password: newUser.password,
        tenant_id: "default", // For now, use default tenant
        role: newUser.role
      }

      const createdUser = await createUser(userData)
      
      if (createdUser) {
        showSuccess(`Pomyślnie utworzono użytkownika: ${newUser.email}`)
        setIsAddUserDialogOpen(false)
        setNewUser({
          username: "",
          email: "",
          full_name: "",
          password: "",
          role: "Użytkownik"
        })
        await refreshData() // Refresh the user list
      } else {
        showError('Nie udało się utworzyć użytkownika')
      }
    } catch (err) {
      console.error('Error creating user:', err)
      showError('Błąd podczas tworzenia użytkownika')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (user: UserType) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete?.user_id) {
      showError('Nie można usunąć użytkownika - brak ID')
      return
    }

    setIsSubmitting(true)
    try {
      const success = await deleteUser(userToDelete.user_id)
      
      if (success) {
        showSuccess(`Pomyślnie usunięto użytkownika: ${userToDelete.email}`)
        setIsDeleteDialogOpen(false)
        setUserToDelete(null)
        await refreshData() // Refresh the user list
      } else {
        showError('Nie udało się usunąć użytkownika')
      }
    } catch (err) {
      console.error('Error deleting user:', err)
      showError('Błąd podczas usuwania użytkownika')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleManagePermissions = async (user: UserType) => {
    setSelectedUser(user)
    setIsPermissionsDialogOpen(true)
    
    // Load real application access data from API
    if (user.user_id) {
      setLoadingApplicationAccess(true)
      setLoadingCompanyAccess(true)
      
      try {
        // Load both application and company access data concurrently
        const [applicationAccess, companyAccess] = await Promise.all([
          fetchUserApplicationAccess(user.user_id),
          fetchUserCompanies(user.user_id)
        ])
        
        console.log('Loaded access data for user:', user.email, {
          applications: applicationAccess,
          companies: companyAccess
        })
        
        setUserApplicationAccess(applicationAccess)
        setUserCompanyAccess(companyAccess)
      } catch (error) {
        console.error('Error loading access data:', error)
        showError('Nie udało się załadować danych dostępów')
        setUserApplicationAccess([])
        setUserCompanyAccess([])
      } finally {
        setLoadingApplicationAccess(false)
        setLoadingCompanyAccess(false)
      }
    } else {
      console.warn('User has no user_id, cannot load access data')
      setUserApplicationAccess([])
      setUserCompanyAccess([])
    }
  }

  const handleAddAppAccess = (user: UserType) => {
    setUserForAppAccess(user)
    setIsAddAppAccessDialogOpen(true)
  }

  const handleAddCompanyAccess = (user: UserType) => {
    setUserForCompanyAccess(user)
    setIsAddCompanyAccessDialogOpen(true)
  }

  const handleApplicationChange = (value: string) => {
    setSelectedApplication(value)
    setSelectedProfile("")
  }

  const handleAddCompanyAccessSubmit = () => {
    if (selectedCompanyId) {
      // W rzeczywistej aplikacji tutaj byłoby API call
      showSuccess('Nadano dostęp do firmy')
      setIsAddCompanyAccessDialogOpen(false)
      setSelectedCompanyId("")
    }
  }

  // Dodaj funkcję obsługującą edycję użytkownika
  const handleEditUser = async (user: UserType) => {
    setUserToEdit(user)
    setIsEditUserDialogOpen(true)
    
    // Load user's company and application access data
    if (user.user_id) {
      try {
        const [companyData, applicationData] = await Promise.all([
          fetchUserCompanies(user.user_id),
          fetchUserApplicationAccess(user.user_id)
        ])
        
        setUserCompanyAccess(companyData)
        setUserApplicationAccess(applicationData)
      } catch (error) {
        console.error('Error loading user access data:', error)
        showError('Nie udało się załadować danych dostępu użytkownika')
      }
    }
  }

  const handleSaveUser = async (updatedUser: any) => {
    // Check if this is the UserType from Portal or User from EditUserDialog
    const userIdToUpdate = updatedUser.user_id || users.find(u => u.id === updatedUser.id)?.user_id
    
    if (!userIdToUpdate) {
      showError('Nie można zaktualizować użytkownika - brak ID')
      return
    }

    setIsSubmitting(true)
    try {
      const updateData = {
        username: updatedUser.name.toLowerCase().replace(/\s+/g, '_'), // Simple username generation
        email: updatedUser.email,
        full_name: updatedUser.name,
        status: (updatedUser.status === 'active' || updatedUser.status === true ? 'active' : 'inactive') as 'active' | 'inactive'
      }

      const success = await updateUser(userIdToUpdate, updateData)
      
      if (success) {
        showSuccess(`Pomyślnie zaktualizowano użytkownika: ${updatedUser.email}`)
        setIsEditUserDialogOpen(false)
        setUserToEdit(null)
        await refreshData() // Refresh the user list
      } else {
        showError('Nie udało się zaktualizować użytkownika')
      }
    } catch (err) {
      console.error('Error updating user:', err)
      showError('Błąd podczas aktualizacji użytkownika')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to delete application access
  const handleDeleteApplicationAccess = async (access: UserApplicationAccess) => {
    if (!selectedUser?.user_id) {
      showError('Brak danych użytkownika')
      return
    }

    try {
      console.log('Deleting application access:', access)
      
      // Show confirmation (simple confirm for now, can be replaced with custom dialog)
      const confirmed = window.confirm(
        `Czy na pewno chcesz usunąć dostęp do aplikacji "${access.app_name}" z profilem "${access.profile_name}" dla użytkownika ${selectedUser.name}?`
      )
      
      if (!confirmed) {
        return
      }

      await deleteUserApplicationAccess(selectedUser.user_id, access.profile_id)
      
      showSuccess(`Usunięto dostęp do aplikacji ${access.app_name}`)
      
      // Refresh application access data
      await refreshUserApplicationAccess()
      
    } catch (error) {
      console.error('Error deleting application access:', error)
      showError(error instanceof Error ? error.message : 'Nie udało się usunąć dostępu do aplikacji')
    }
  }

  // Function to refresh application access for currently selected user
  const refreshUserApplicationAccess = async () => {
    if (!selectedUser?.user_id) return
    
    try {
      setLoadingApplicationAccess(true)
      const accessData = await fetchUserApplicationAccess(selectedUser.user_id)
      setUserApplicationAccess(accessData)
    } catch (error) {
      console.error('Error refreshing user application access:', error)
      showError('Nie udało się odświeżyć dostępów do aplikacji')
    } finally {
      setLoadingApplicationAccess(false)
    }
  }

  // Function to refresh user company access data
  const refreshUserCompanyAccess = async () => {
    if (!selectedUser?.user_id) return
    
    try {
      setLoadingCompanyAccess(true)
      const accessData = await fetchUserCompanies(selectedUser.user_id)
      setUserCompanyAccess(accessData)
    } catch (error) {
      console.error('Error refreshing user company access:', error)
      showError('Nie udało się odświeżyć dostępów do firm')
    } finally {
      setLoadingCompanyAccess(false)
    }
  }

  // Function to delete company access
  const handleDeleteCompanyAccess = async (access: UserCompanyAccess) => {
    if (!selectedUser?.user_id) {
      showError('Brak danych użytkownika')
      return
    }

    try {
      console.log('Deleting company access:', access)
      
      // Show confirmation
      const confirmed = window.confirm(
        `Czy na pewno chcesz usunąć dostęp do firmy "${access.company_name}" dla użytkownika ${selectedUser.name}?`
      )
      
      if (!confirmed) {
        return
      }

      await deleteUserCompany(selectedUser.user_id, access.company_id)
      
      showSuccess(`Usunięto dostęp do firmy ${access.company_name}`)
      
      // Refresh company access data
      await refreshUserCompanyAccess()
    } catch (error) {
      console.error('Error deleting company access:', error)
      showError(error instanceof Error ? error.message : 'Nie udało się usunąć dostępu do firmy')
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nagłówek */}
      <header className="flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <button className="p-1">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <img src="/symfonia-logo.png" alt="Symfonia" className="h-10 relative top-[5px]" />
            <span className="text-lg font-medium font-quicksand ml-4">Portal Użytkownika</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <select className="flex items-center gap-2 px-4 py-2 border rounded-md font-quicksand appearance-none cursor-pointer pr-10">
              <option>ECM3 Jacek Paszek</option>
              <option>CD Projekt Red S.A.</option>
              <option>Platige Image S.A.</option>
              <option>Techland Sp. z o.o.</option>
              <option>11 bit studios S.A.</option>
              <option>Bloober Team S.A.</option>
            </select>
            <ChevronDown className="h-5 w-5 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          <button className="p-1">
            <Settings className="h-6 w-6" />
          </button>
          <AppSwitcher />
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-800">
            JP
          </div>
        </div>
      </header>

      {/* Menu boczne i zawartość */}
      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-64px)] border-r border-gray-200 bg-white">
          <nav className="py-4">
            <ul className="space-y-1">
              <li>
                <a href="#" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <Home className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Strona główna</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <Apps className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Aplikacje i usługi</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <HelpCircle className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Centrum wsparcia</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Panel klienta</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center justify-between px-6 py-3 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-green-600" />
                    <span className="text-base font-medium font-quicksand text-green-600">Ustawienia</span>
                  </div>
                  <ChevronDown className="h-5 w-5 text-green-600" />
                </a>
                <ul className="pl-6 border-l-2 border-green-600 ml-6">
                  <li>
                    <a href="/users" className="flex items-center gap-3 px-6 py-2 bg-gray-50">
                      <span className="text-base font-medium text-green-600 font-quicksand">Użytkownicy</span>
                    </a>
                  </li>
                  <li>
                    <a href="/firmy" className="flex items-center gap-3 px-6 py-2 hover:bg-gray-50">
                      <span className="text-base font-medium font-quicksand text-gray-800">Firmy</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center gap-3 px-6 py-2 hover:bg-gray-50">
                      <span className="text-base font-medium text-gray-800 font-quicksand">Klucze API</span>
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Zawartość główna */}
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 font-quicksand">
            <UserIcon className="h-6 w-6" />
            Użytkownicy
          </h1>

          {showSuccessMessage && (
            <div className="flex items-start gap-4 p-4 mb-6 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-800 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-800">{successMessage}</p>
              </div>
              <button className="ml-auto text-green-800" onClick={() => setShowSuccessMessage(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                    fill="#26590E"
                  />
                </svg>
              </button>
            </div>
          )}

          {showErrorMessage && (
            <div className="flex items-start gap-4 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-800 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-800">{errorMessage}</p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <div className="relative w-[280px]">
              <Input
                type="text"
                placeholder="Wyszukaj na liście"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
            </div>
            <Button onClick={() => setIsAddUserDialogOpen(true)} className="bg-green-600 hover:bg-green-700 text-white">
              Dodaj użytkownika <Plus className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Loading i Error State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Ładowanie użytkowników...</p>
            </div>
          )}
          
          {error && (
            <div className="flex items-start gap-4 p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-800 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-800">Błąd ładowania danych</p>
                <p className="text-sm text-red-800">{error}</p>
                <p className="text-sm text-red-600">Używam danych zastępczych.</p>
              </div>
            </div>
          )}

          {/* Tabela użytkowników */}
          {!loading && (
            <div className="border rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 p-4 text-left">
                    <Checkbox />
                  </th>
                  <th className="p-4 text-left font-bold text-sm">
                    <div className="flex items-center gap-2">
                      Adres e-mail
                      <ChevronDown className="h-5 w-5 text-green-600" />
                    </div>
                  </th>
                  <th className="p-4 text-left font-bold text-sm">Firmy</th>
                  <th className="p-4 text-left font-bold text-sm">Uprawnienia</th>
                  <th className="p-4 text-right font-bold text-sm">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-gray-100">
                    <td className="p-4">
                      <Checkbox />
                    </td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4">{user.companies}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {user.profiles.map((profile, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-green-50 text-green-800 border-green-100 text-xs py-1"
                          >
                            {profile.app}: {profile.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleManagePermissions(user)}>
                          <Key className="h-5 w-5 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                          <Edit className="h-5 w-5 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user)}>
                          <Trash2 className="h-5 w-5 text-green-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {/* Footer */}
          <footer className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500">
            <div className="flex justify-between items-center">
              <div>System version: 3.0.0</div>
              <div className="flex gap-4">
                <a href="#" className="hover:text-gray-700">
                  Regulamin
                </a>
                <a href="#" className="hover:text-gray-700">
                  Polityka prywatności i cookies
                </a>
                <a href="#" className="hover:text-gray-700">
                  Dokumentacja online
                </a>
                <a href="#" className="hover:text-gray-700">
                  Kontakt
                </a>
              </div>
            </div>
            <div className="mt-2">
              <p>
                Ta strona jest chroniona przez reCAPTCHA. Obowiązują{" "}
                <a href="#" className="text-green-600 hover:underline">
                  Polityka Prywatności
                </a>{" "}
                i{" "}
                <a href="#" className="text-green-600 hover:underline">
                  Warunki korzystania
                </a>{" "}
                z usługi Google.
              </p>
            </div>
          </footer>
        </main>
      </div>

      {/* Dialog dodawania użytkownika */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-quicksand">Dodaj nowego użytkownika</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium font-quicksand">
                Imię i nazwisko
              </Label>
              <Input
                id="full_name"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                placeholder="Jan Kowalski"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium font-quicksand">
                Nazwa użytkownika
              </Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="jan.kowalski"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium font-quicksand">
                Adres e-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="jan.kowalski@firma.pl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium font-quicksand">
                Hasło tymczasowe
              </Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium font-quicksand">
                Rola
              </Label>
              <Select 
                value={newUser.role} 
                onValueChange={(value: "Administrator" | "Użytkownik") => 
                  setNewUser({ ...newUser, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz rolę" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Użytkownik">Użytkownik</SelectItem>
                  <SelectItem value="Administrator">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-green-600 text-green-600 font-quicksand"
              onClick={() => setIsAddUserDialogOpen(false)}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
              onClick={handleAddUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Dodawanie...' : 'Dodaj użytkownika'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog usuwania użytkownika */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-quicksand">Usuń użytkownika</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 font-quicksand">
              Czy na pewno chcesz usunąć użytkownika <strong>{userToDelete?.name}</strong>?
            </p>
            <p className="text-gray-600 text-sm mt-2 font-quicksand">
              Ta operacja jest nieodwracalna.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 font-quicksand"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white font-quicksand"
              onClick={confirmDeleteUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Usuwanie...' : 'Usuń użytkownika'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog zarządzania dostępem */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
                            <DialogTitle className="text-xl font-bold font-quicksand">Zarządzanie dostępem</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg font-quicksand">{selectedUser.name}</h3>
                  <p className="text-gray-600 font-quicksand">{selectedUser.email}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm font-medium font-quicksand">Status:</span>
                  <div className="flex items-center gap-2">
                    <Switch checked={selectedUser.status} className="data-[state=checked]:bg-green-600" />
                    <span className="text-sm font-quicksand">{selectedUser.status ? "Aktywny" : "Nieaktywny"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2 font-quicksand">
                  <Info className="h-5 w-5 text-blue-600" />
                  Dostęp do aplikacji
                </h3>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left font-bold text-sm font-quicksand">Aplikacja</th>
                        <th className="p-4 text-left font-bold text-sm font-quicksand">Profil</th>
                        <th className="p-4 text-left font-bold text-sm font-quicksand">Przypisano</th>
                        <th className="p-4 text-right font-bold text-sm font-quicksand">Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingApplicationAccess ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-500 font-quicksand">
                            Ładowanie dostępów do aplikacji...
                          </td>
                        </tr>
                      ) : userApplicationAccess.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-500 font-quicksand">
                            Brak przypisanych dostępów do aplikacji
                          </td>
                        </tr>
                      ) : (
                        userApplicationAccess.map((access, index) => (
                          <tr key={`${access.app_id}-${access.profile_id}-${index}`} className="border-t border-gray-100">
                            <td className="p-4">
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-800 border-green-100 font-quicksand"
                              >
                                {access.app_name}
                              </Badge>
                            </td>
                            <td className="p-4 font-quicksand">{access.profile_name}</td>
                            <td className="p-4 font-quicksand text-sm text-gray-600">
                              {new Date(access.assigned_at).toLocaleDateString('pl-PL', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="p-4">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" title="Edytuj dostęp" onClick={() => handleEditUser(selectedUser)}>
                                  <Edit className="h-5 w-5 text-green-600" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Usuń dostęp" onClick={() => handleDeleteApplicationAccess(access)}>
                                  <Trash2 className="h-5 w-5 text-green-600" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
                    onClick={() => handleAddAppAccess(selectedUser)}
                  >
                    Nadaj dostęp do aplikacji <Plus className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4 mt-8">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg flex items-center gap-2 font-quicksand">
                    <Building2 className="h-5 w-5 text-green-600" />
                    Firmy
                  </h3>
                  <div className="relative w-[280px]">
                    <Input
                      type="text"
                      placeholder="Wyszukaj firmę"
                      value={companySearchQuery}
                      onChange={(e) => setCompanySearchQuery(e.target.value)}
                      className="pl-10 border-gray-300 font-quicksand"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left font-bold text-sm font-quicksand">Nazwa firmy</th>
                        <th className="p-4 text-left font-bold text-sm font-quicksand">NIP</th>
                        <th className="p-4 text-center font-bold text-sm font-quicksand">Data przypisania</th>
                        <th className="p-4 text-right font-bold text-sm font-quicksand">Akcje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingCompanyAccess ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                            <p className="mt-2 text-gray-600 font-quicksand">Ładowanie dostępów do firm...</p>
                          </td>
                        </tr>
                      ) : userCompanyAccess.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-500 font-quicksand">
                            Brak przypisanych dostępów do firm
                          </td>
                        </tr>
                      ) : (
                        userCompanyAccess.map((access, index) => (
                          <tr key={`${access.company_id}-${index}`} className="border-t border-gray-100">
                            <td className="p-4 font-quicksand">{access.company_name}</td>
                            <td className="p-4 font-quicksand">{access.nip || '-'}</td>
                            <td className="p-4 text-center">
                              {new Date(access.assigned_date).toLocaleDateString('pl-PL', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="p-4">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" title="Edytuj dostęp" onClick={() => handleEditUser(selectedUser)}>
                                  <Edit className="h-5 w-5 text-green-600" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Usuń dostęp" onClick={() => handleDeleteCompanyAccess(access)}>
                                  <Trash2 className="h-5 w-5 text-green-600" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
                    onClick={() => handleAddCompanyAccess(selectedUser)}
                  >
                    Nadaj dostęp do firm <Plus className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2 font-quicksand">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Historia zmian uprawnień
                </h3>

                <div className="border rounded-lg overflow-hidden overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 text-left font-bold text-sm font-quicksand">Data</th>
                        <th className="p-4 text-left font-bold text-sm font-quicksand">Użytkownik</th>
                        <th className="p-4 text-left font-bold text-sm font-quicksand">Zmiana</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-gray-100">
                        <td className="p-4 font-quicksand">2023-10-15 14:32</td>
                        <td className="p-4 font-quicksand">admin@symfonia.pl</td>
                        <td className="p-4 font-quicksand">Dodano profil Administrator dla aplikacji eBiuro</td>
                      </tr>
                      <tr className="border-t border-gray-100">
                        <td className="p-4 font-quicksand">2023-10-12 10:25</td>
                        <td className="p-4 font-quicksand">admin@symfonia.pl</td>
                        <td className="p-4 font-quicksand">Nadano dostęp do firmy CD Projekt Red S.A.</td>
                      </tr>
                      <tr className="border-t border-gray-100">
                        <td className="p-4 font-quicksand">2023-10-10 09:15</td>
                        <td className="p-4 font-quicksand">admin@symfonia.pl</td>
                        <td className="p-4 font-quicksand">Dodano profil Pełny dostęp dla aplikacji KSEF</td>
                      </tr>
                      <tr className="border-t border-gray-100">
                        <td className="p-4 font-quicksand">2023-10-05 14:18</td>
                        <td className="p-4 font-quicksand">admin@symfonia.pl</td>
                        <td className="p-4 font-quicksand">Nadano dostęp do firmy Platige Image S.A.</td>
                      </tr>
                      <tr className="border-t border-gray-100">
                        <td className="p-4 font-quicksand">2023-09-28 11:45</td>
                        <td className="p-4 font-quicksand">admin@symfonia.pl</td>
                        <td className="p-4 font-quicksand">Utworzono użytkownika</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
              onClick={() => setIsPermissionsDialogOpen(false)}
            >
              Zamknij
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nowe dialogi dostępu - zastępują stare */}
      {userForAppAccess && (
        <ApplicationAccessDialog
          open={isAddAppAccessDialogOpen}
          onOpenChange={setIsAddAppAccessDialogOpen}
          user={userForAppAccess}
          onSuccess={async (message) => {
            showSuccess(message)
            setUserForAppAccess(null)
            // Refresh application access data for currently selected user in permissions dialog
            await refreshUserApplicationAccess()
          }}
          onError={(message) => {
            showError(message)
          }}
        />
      )}

      {userForCompanyAccess && (
        <CompanyAccessDialog
          open={isAddCompanyAccessDialogOpen}
          onOpenChange={setIsAddCompanyAccessDialogOpen}
          user={userForCompanyAccess}
          onSuccess={async (message) => {
            showSuccess(message)
            setUserForCompanyAccess(null)
            // Refresh company access data for currently selected user in permissions dialog
            await refreshUserCompanyAccess()
          }}
          onError={(message) => {
            showError(message)
          }}
        />
      )}

      {userToEdit && (
        <EditUserDialog
          open={isEditUserDialogOpen}
          onOpenChange={setIsEditUserDialogOpen}
          user={userToEdit}
          onSave={handleSaveUser}
          // Company access props
          userCompanyAccess={userCompanyAccess}
          loadingCompanyAccess={loadingCompanyAccess}
          onAddCompanyAccess={() => handleAddCompanyAccess(userToEdit)}
          onDeleteCompanyAccess={handleDeleteCompanyAccess}
          // Application access props 
          userApplicationAccess={userApplicationAccess}
          loadingApplicationAccess={loadingApplicationAccess}
          onAddAppAccess={() => handleAddAppAccess(userToEdit)}
          onDeleteApplicationAccess={handleDeleteApplicationAccess}
        />
      )}
    </div>
  )
}

// Typy
type UserType = {
  id: number
  user_id?: string // API ID for backend operations
  name: string
  email: string
  phone: string
  companies: number
  permissions: string
  profiles: { app: string; name: string }[]
  status: boolean
}
