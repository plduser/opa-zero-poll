"use client"

import { useState, useEffect } from "react"
import {
  Search,
  CheckCircle,
  Home,
  Settings,
  ChevronDown,
  FileText,
  Lock,
  FileSpreadsheet,
  FileBarChart,
  X,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/app/components/header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

// Importuj komponent AccessDialog
import { AccessDialog } from "@/app/users/access-dialog"
import { UserPermissionsDialog } from "./user-permissions-dialog"

interface KsefUser {
  user_id: string
  username: string
  email: string
  full_name: string
  status: string
  profile_name: string
  profile_id: string
  role_mappings: any[]
  assigned_at: string
  assigned_by: string
}

export default function KSEFPermissionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isAccessGrantDialogOpen, setIsAccessGrantDialogOpen] = useState(false)
  const [accessDialogTitle, setAccessDialogTitle] = useState("")
  const [accessDialogItems, setAccessDialogItems] = useState<any[]>([])
  const [isUserPermissionsDialogOpen, setIsUserPermissionsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [ksefUsers, setKsefUsers] = useState<KsefUser[]>([])
  const [loading, setLoading] = useState(true)

  // Funkcja do pobierania użytkowników KSEF z bazy danych
  const fetchKsefUsers = async () => {
    try {
      setLoading(true)
      
      // Pobierz wszystkich użytkowników
      const usersResponse = await fetch('http://localhost:8110/api/users')
      const usersData = await usersResponse.json()
      
      const ksefUsersData: KsefUser[] = []
      
      // Dla każdego użytkownika sprawdź czy ma dostęp do KSEF
      for (const user of usersData.users) {
        try {
          const accessResponse = await fetch(`http://localhost:8110/api/users/${user.user_id}/application-access`)
          const accessData = await accessResponse.json()
          
          // Znajdź dostęp do aplikacji KSEF
          const ksefAccess = accessData.application_access?.find((access: any) => access.app_name === 'KSEF')
          
          if (ksefAccess) {
            ksefUsersData.push({
              user_id: user.user_id,
              username: user.username,
              email: user.email,
              full_name: user.full_name,
              status: user.status,
              profile_name: ksefAccess.profile_name,
              profile_id: ksefAccess.profile_id,
              role_mappings: ksefAccess.role_mappings || [],
              assigned_at: ksefAccess.assigned_at,
              assigned_by: ksefAccess.assigned_by
            })
          }
        } catch (error) {
          console.error(`Błąd pobierania dostępów dla użytkownika ${user.user_id}:`, error)
        }
      }
      
      setKsefUsers(ksefUsersData)
    } catch (error) {
      console.error('Błąd pobierania użytkowników KSEF:', error)
    } finally {
      setLoading(false)
    }
  }

  // Pobierz dane przy załadowaniu komponentu
  useEffect(() => {
    fetchKsefUsers()
  }, [])

  const filteredUsers = ksefUsers.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleGrantAccess = () => {
    setAccessDialogTitle("Nadaj dostęp do KSEF")
    setAccessDialogItems(ksefUsers)
    setIsAccessGrantDialogOpen(true)
  }

  const handleManageUserPermissions = (user: KsefUser) => {
    console.log("Zarządzanie uprawnieniami użytkownika:", user)
    setSelectedUser({
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      role: user.profile_name,
      profile: user.profile_name,
      profile_id: user.profile_id,
      status: user.status === 'active' ? 'Aktywny' : 'Nieaktywny',
      directPermissions: [],
      rolePermissions: user.role_mappings
    })
    setIsUserPermissionsDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Używamy komponentu Header zamiast bezpośredniego kodu nagłówka */}
      <Header title="KSEF" />

      {/* Menu boczne i zawartość */}
      <div className="flex">
        <aside className="w-[220px] min-h-[calc(100vh-64px)] border-r border-gray-200 bg-white">
          <nav className="py-4">
            <ul className="space-y-1">
              <li>
                <a href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                  <Home className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Pulpit</span>
                </a>
              </li>
              <li>
                <Link href="/ksef" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Faktury</span>
                </Link>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                  <FileSpreadsheet className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Raporty</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                  <FileBarChart className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Deklaracje</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center justify-between px-4 py-2 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-green-600" />
                    <span className="text-base font-medium font-quicksand text-green-600">Ustawienia</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-green-600" />
                </a>
                <ul className="pl-4 border-l-2 border-green-600 ml-4">
                  <li>
                    <Link href="/ksef/permissions" className="flex items-center gap-2 px-4 py-2 bg-gray-50">
                      <span className="text-base font-medium text-green-600 font-quicksand">Uprawnienia</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/ksef/configuration" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                      <span className="text-base font-medium font-quicksand text-gray-800">Konfiguracja</span>
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Zawartość główna */}
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 font-quicksand">
            <Lock className="h-6 w-6" />
            Zarządzanie uprawnieniami
          </h1>

          {showSuccessMessage && (
            <div className="flex items-start gap-4 p-4 mb-6 bg-purple-50 border border-purple-200 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-800 flex-shrink-0" />
              <div>
                <p className="font-bold text-purple-800">Zaktualizowano uprawnienia</p>
                <p className="text-sm text-purple-800">Zmiany zostały zapisane pomyślnie</p>
              </div>
              <button className="ml-auto text-purple-800" onClick={() => setShowSuccessMessage(false)}>
                <X className="h-5 w-5" />
              </button>
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
            <Button onClick={handleGrantAccess} className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
              Nadaj dostęp <Plus className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">Ładowanie użytkowników KSEF...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Użytkownik</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Profil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Przypisany</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {searchQuery ? 'Brak użytkowników pasujących do wyszukiwania' : 'Brak użytkowników z dostępem do KSEF'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell className="font-medium">{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className="bg-purple-50 text-purple-800 border-purple-100">{user.profile_name}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={user.status === 'active' ? 'bg-green-50 text-green-800 border-green-100' : 'bg-red-50 text-red-800 border-red-100'}>
                            {user.status === 'active' ? 'Aktywny' : 'Nieaktywny'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {new Date(user.assigned_at).toLocaleDateString('pl-PL')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleManageUserPermissions(user)}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Stopka */}
          <footer className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500">
            <div className="flex justify-between items-center">
              <div>Wersja systemu: 2.5.0</div>
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
          </footer>
        </main>
      </div>

      {/* Dialog zarządzania uprawnieniami użytkownika */}
      <UserPermissionsDialog
        open={isUserPermissionsDialogOpen}
        onOpenChange={setIsUserPermissionsDialogOpen}
        user={selectedUser}
        onSave={() => {
          setShowSuccessMessage(true)
          setIsUserPermissionsDialogOpen(false)
          setTimeout(() => setShowSuccessMessage(false), 5000)
          // Odśwież dane po zapisaniu
          fetchKsefUsers()
        }}
      />

      {/* Dodaj komponent AccessDialog na końcu komponentu */}
      <AccessDialog
        open={isAccessGrantDialogOpen}
        onOpenChange={setIsAccessGrantDialogOpen}
        title={accessDialogTitle}
        items={accessDialogItems}
        onSave={() => {
          setShowSuccessMessage(true)
          setTimeout(() => setShowSuccessMessage(false), 5000)
          // Odśwież dane po nadaniu dostępu
          fetchKsefUsers()
        }}
      />
    </div>
  )
}
