"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, Users, Building2, Shield, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { fetchTeams, fetchTeamDetails, addTeamMember, type Team, type TeamDetails } from "@/lib/teams-api"

interface TeamAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    user_id?: string
    name: string
    email: string
  } | null
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function TeamAssignmentDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
  onError
}: TeamAssignmentDialogProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [selectedTeamDetails, setSelectedTeamDetails] = useState<TeamDetails | null>(null)
  const [selectedRole, setSelectedRole] = useState<'member' | 'leader' | 'admin'>('member')
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [loadingTeamDetails, setLoadingTeamDetails] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Ładowanie zespołów gdy dialog się otwiera
  useEffect(() => {
    if (open) {
      loadTeams()
    } else {
      resetDialog()
    }
  }, [open])

  useEffect(() => {
    console.log('🔄 selectedTeam zmienił się:', selectedTeam?.team_name || 'null')
    if (selectedTeam && selectedTeam.team_id) {
      loadTeamDetails(selectedTeam.team_id)
    } else {
      setSelectedTeamDetails(null)
    }
  }, [selectedTeam])

  // Debug informacje dla przycisków
  useEffect(() => {
    if (open) {
      console.log('🔍 Debug przycisku "Dodaj do zespołu":', {
        selectedTeam: !!selectedTeam,
        selectedTeamName: selectedTeam?.team_name,
        selectedRole: selectedRole,
        user_id: user?.user_id,
        userName: user?.name,
        submitting,
        buttonEnabled: !!(selectedTeam && selectedRole && user?.user_id && !submitting)
      })
    }
  }, [selectedTeam, selectedRole, user?.user_id, submitting, open])

  const loadTeams = async () => {
    setLoadingTeams(true)
    try {
      const teamsData = await fetchTeams('tenant125') // Using default tenant
      setTeams(teamsData)
    } catch (error) {
      console.error('Error loading teams:', error)
      onError('Nie udało się załadować zespołów')
    } finally {
      setLoadingTeams(false)
    }
  }

  const loadTeamDetails = async (teamId: string) => {
    setLoadingTeamDetails(true)
    try {
      const teamDetails = await fetchTeamDetails(teamId)
      setSelectedTeamDetails(teamDetails)
    } catch (error) {
      console.error('Error loading team details:', error)
      setSelectedTeamDetails(null)
    } finally {
      setLoadingTeamDetails(false)
    }
  }

  const handleSubmit = async () => {
    if (!user?.user_id || !selectedTeam) {
      onError('Brak wybranego zespołu lub danych użytkownika')
      return
    }

    setSubmitting(true)
    try {
      const result = await addTeamMember(selectedTeam.team_id, {
        user_id: user.user_id,
        role_in_team: selectedRole
      })

      if (result) {
        onSuccess(`Dodano użytkownika ${user.name} do zespołu "${selectedTeam.team_name}" z rolą ${getRoleLabel(selectedRole)}`)
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
    console.log('🔄 Resetowanie dialogu')
    setSelectedTeam(null)
    setSelectedTeamDetails(null)
    setSelectedRole('member')
    setSearchQuery("")
  }

  const handleClose = () => {
    resetDialog()
    onOpenChange(false)
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator'
      case 'leader': return 'Lider'
      case 'member': return 'Członek'
      default: return role
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'functional': return 'Funkcjonalny'
      case 'project': return 'Projektowy'
      case 'department': return 'Departament'
      case 'temporary': return 'Tymczasowy'
      default: return type
    }
  }

  // Filtrowanie zespołów
  const filteredTeams = teams.filter(team =>
    team.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-quicksand">
            <Users className="h-5 w-5 text-purple-600" />
            Dodaj użytkownika do zespołu
          </DialogTitle>
          {user && (
            <p className="text-sm text-gray-600 font-quicksand">
              Dodajesz użytkownika: <strong>{user.name}</strong> ({user.email})
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Wyszukiwanie zespołów */}
          <div className="space-y-3">
            <Label htmlFor="team-search" className="font-medium font-quicksand">
              Wybierz zespół
            </Label>
            <div className="relative">
              <Input
                id="team-search"
                type="text"
                placeholder="Wyszukaj zespół..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-quicksand"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Lista zespołów */}
          <div className="space-y-3">
            {loadingTeams ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600 font-quicksand">Ładowanie zespołów...</span>
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="text-center py-8 text-gray-500 font-quicksand">
                {searchQuery ? 'Nie znaleziono zespołów pasujących do wyszukiwania' : 'Brak dostępnych zespołów'}
              </div>
            ) : (
              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {filteredTeams.map((team) => (
                  <div
                    key={team.team_id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTeam?.team_id === team.team_id 
                        ? 'border-purple-300 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      console.log('🎯 Kliknięto zespół:', team.team_name, team.team_id)
                      setSelectedTeam(team)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium font-quicksand">{team.team_name}</h4>
                        {team.description && (
                          <p className="text-sm text-gray-600 font-quicksand">{team.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-800 border-purple-100">
                            {getTypeLabel(team.team_type)}
                          </Badge>
                          <span className="text-xs text-gray-500 font-quicksand">
                            {team.member_count || 0} członków
                          </span>
                          <span className="text-xs text-gray-500 font-quicksand">
                            {team.company_count || 0} firm
                          </span>
                        </div>
                      </div>
                      {selectedTeam?.team_id === team.team_id && (
                        <CheckCircle className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wybór roli */}
          {selectedTeam && (
            <div className="space-y-3">
              <Label htmlFor="role-select" className="font-medium font-quicksand">
                Rola w zespole
              </Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as any)}>
                <SelectTrigger id="role-select" className="font-quicksand">
                  <SelectValue placeholder="Wybierz rolę..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member" className="font-quicksand">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-gray-400"></div>
                      Członek - podstawowe uprawnienia
                    </div>
                  </SelectItem>
                  <SelectItem value="leader" className="font-quicksand">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-blue-400"></div>
                      Lider - zarządzanie zespołem
                    </div>
                  </SelectItem>
                  <SelectItem value="admin" className="font-quicksand">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-400"></div>
                      Administrator - pełne uprawnienia
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Szczegóły wybranego zespołu */}
          {selectedTeam && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium font-quicksand flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                Podgląd zespołu: {selectedTeam.team_name}
              </h3>
              
              {loadingTeamDetails ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-quicksand">Ładowanie szczegółów zespołu...</span>
                </div>
              ) : selectedTeamDetails ? (
                <div className="space-y-3">
                  {/* Role zespołu */}
                  {selectedTeamDetails.roles && selectedTeamDetails.roles.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 font-quicksand mb-2">Role w aplikacjach:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTeamDetails.roles.map((role, index) => (
                          <Badge 
                            key={`${role.app_id}-${role.role_name}-${index}`}
                            variant="outline" 
                            className="text-xs bg-blue-50 text-blue-800 border-blue-100"
                          >
                            {role.app_name}: {role.role_name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Firmy zespołu */}
                  {selectedTeamDetails.companies && selectedTeamDetails.companies.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 font-quicksand mb-2">
                        <Building2 className="h-4 w-4 inline mr-1" />
                        Dostęp do firm:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTeamDetails.companies.map((company, index) => (
                          <Badge 
                            key={`${company.company_id}-${index}`}
                            variant="outline" 
                            className="text-xs bg-green-50 text-green-800 border-green-100"
                          >
                            {company.company_name} ({company.access_type})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ostrzeżenie jeśli brak szczegółów */}
                  {(!selectedTeamDetails.roles?.length && !selectedTeamDetails.companies?.length) && (
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-quicksand">Ten zespół nie ma jeszcze przypisanych ról ani firm</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 font-quicksand">
                  Nie udało się załadować szczegółów zespołu
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2">
          {/* Debug informacji - usuń po naprawieniu */}
          {open && (
            <div className="text-xs text-gray-500 font-mono bg-gray-100 p-2 rounded">
              Debug: selectedTeam={!!selectedTeam ? '✅' : '❌'} | selectedRole={selectedRole} | user_id={!!user?.user_id ? '✅' : '❌'} | submitting={submitting ? '⏳' : '✅'}
            </div>
          )}
          
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              disabled={submitting}
              className="font-quicksand"
            >
              Anuluj
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!selectedTeam || !selectedRole || !user?.user_id || submitting}
              className={`font-quicksand transition-all duration-200 ${
                !selectedTeam || !selectedRole || !user?.user_id || submitting
                  ? 'bg-gray-400 hover:bg-gray-400 text-gray-700 cursor-not-allowed opacity-70 border border-gray-300'
                  : 'bg-green-600 hover:bg-green-700 text-white border border-green-600'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Dodawanie...
                </>
              ) : !selectedTeam ? (
                'Wybierz zespół'
              ) : !selectedRole ? (
                'Wybierz rolę'
              ) : (
                'Dodaj do zespołu'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 