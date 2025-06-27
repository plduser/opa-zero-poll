"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

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

interface Tenant {
  tenant_id: string
  tenant_name: string
}

interface UserSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  currentUser: User | null
  onUserChange: (user: User) => void
}

export function UserSelectionDialog({
  isOpen,
  onClose,
  currentUser,
  onUserChange
}: UserSelectionDialogProps) {
  const [users, setUsers] = useState<User[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenantFilter, setSelectedTenantFilter] = useState<string>("")
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [isLoadingTenants, setIsLoadingTenants] = useState(true)

  // Pobierz tenantów
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setIsLoadingTenants(true)
        const response = await fetch('/api/tenants')
        if (!response.ok) throw new Error('Failed to fetch tenants')
        const data = await response.json()
        setTenants(data.tenants || [])
      } catch (error) {
        console.error('Error fetching tenants:', error)
      } finally {
        setIsLoadingTenants(false)
      }
    }

    if (isOpen) {
      fetchTenants()
    }
  }, [isOpen])

  // Pobierz użytkowników
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true)
        const response = await fetch('/api/users')
        if (!response.ok) throw new Error('Failed to fetch users')
        const data = await response.json()
        
        // Przetwórz dane użytkowników - dodaj tenant_id z pierwszego tenanta jako fallback
        const processedUsers = data.users?.map((user: any) => ({
          id: user.id,
          name: user.full_name || user.name,
          username: user.username,
          email: user.email,
          initials: user.initials,
          role: user.role || 'użytkownik',
          tenant_id: user.tenants?.[0]?.tenant_id || user.tenant_id,
          department: user.department || 'Ogólny',
          tenants: user.tenants,
          status: user.status
        })) || []
        
        setUsers(processedUsers)
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setIsLoadingUsers(false)
      }
    }

    if (isOpen) {
      fetchUsers()
    }
  }, [isOpen])

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

  const handleUserSelection = (user: User) => {
    onUserChange(user)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          {isLoadingUsers ? (
            <div className="text-center text-gray-500 py-8">
              Ładowanie użytkowników...
            </div>
          ) : sortedDepartments.length === 0 ? (
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
                        currentUser?.id === user.id ? "border-green-500 bg-green-50" : "border-gray-200"
                      }`}
                      onClick={() => handleUserSelection(user)}
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
                      {currentUser?.id === user.id && (
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
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 