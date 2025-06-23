"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, UserPlus, CheckCircle, Loader2, Users } from "lucide-react"
import { addTeamMember } from "@/lib/teams-api"
import { fetchUsers, type User } from "@/lib/users-api"

interface AddMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  teamName: string
  existingMemberIds: string[]
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function AddMemberDialog({
  
  open,
  onOpenChange,
  teamId,
  teamName,
  existingMemberIds,
  onSuccess,
  onError
}: AddMemberDialogProps) {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole] = useState<'member' | 'lead' | 'admin'>('member') // Domyślnie wszyscy jako member
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Ładowanie użytkowników gdy dialog się otwiera
  useEffect(() => {
    if (open) {
      loadUsers()
    } else {
      resetDialog()
    }
  }, [open])

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const usersData = await fetchUsers() // Function doesn't take parameters
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading users:', error)
      onError('Nie udało się załadować użytkowników')
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedUser?.user_id || !teamId) {
      onError('Brak wybranego użytkownika')
      return
    }

    setSubmitting(true)
    try {
      const result = await addTeamMember(teamId, {
        user_id: selectedUser.user_id,
        role_in_team: selectedRole
      })

      if (result) {
        onSuccess(`Dodano ${selectedUser.full_name} do zespołu "${teamName}"`)
        resetDialog()
        onOpenChange(false)
      } else {
        onError('Nie udało się dodać użytkownika do zespołu')
      }
    } catch (error) {
      console.error('Error adding user to team:', error)
      onError(error instanceof Error ? error.message : 'Błąd podczas dodawania użytkownika do zespołu')
    } finally {
      setSubmitting(false)
    }
  }

  const resetDialog = () => {
    setSelectedUser(null)
    setSearchQuery("")
  }

  const handleClose = () => {
    resetDialog()
    onOpenChange(false)
  }



  // Filtrowanie użytkowników - wykluczamy tych już w zespole
  const availableUsers = users.filter(user => 
    !existingMemberIds.includes(user.user_id) && 
    (user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.username.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-600" />
            Dodaj osobę do zespołu
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Dodajesz nowego członka do zespołu: <strong>{teamName}</strong>
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Wyszukiwanie użytkowników */}
          <div className="space-y-3">
            <Label htmlFor="user-search" className="font-medium">
              Wybierz osobę do dodania
            </Label>
            <div className="relative">
              <Input
                id="user-search"
                type="text"
                placeholder="Wyszukaj użytkownika po nazwie, emailu lub nazwie użytkownika..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Lista dostępnych użytkowników */}
          <div className="space-y-3">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Ładowanie użytkowników...</span>
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {searchQuery ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak wyników</h3>
                    <p>Nie znaleziono użytkowników pasujących do wyszukiwanej frazy</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Wszyscy użytkownicy już w zespole</h3>
                    <p>Wszystkie dostępne osoby są już członkami tego zespołu</p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {availableUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.user_id === user.user_id 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {user.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <h4 className="font-medium text-gray-900">{user.full_name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-xs text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                      
                      {selectedUser?.user_id === user.user_id && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>



          {/* Podsumowanie wyboru */}
          {selectedUser && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Gotowy do dodania</h4>
                                     <p className="text-sm text-green-700">
                     <strong>{selectedUser.full_name}</strong> zostanie dodany do zespołu{" "}
                     <strong>{teamName}</strong>
                   </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 justify-end">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={submitting}
          >
            Anuluj
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedUser || submitting}
            className={`transition-all duration-200 ${
              !selectedUser || submitting
                ? 'bg-gray-400 hover:bg-gray-400 text-gray-700 cursor-not-allowed opacity-70'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Dodawanie...
              </>
            ) : !selectedUser ? (
              'Wybierz osobę'
            ) : (
              'Dodaj do zespołu'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 