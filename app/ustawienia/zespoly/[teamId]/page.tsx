"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { useAppMenu } from "@/hooks/use-app-menu"
import { 
  ArrowLeft,
  Users, 
  Plus, 
  Search, 
  Trash2,
  Crown,
  User,
  Shield,
  MoreHorizontal,
  UserMinus,
  Settings,
  AlertTriangle,
  Layers,
  Building2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  fetchTeamDetails, 
  removeTeamMember,
  updateTeamMemberRole,
  formatTeamType,
  formatTeamRole,
  fetchTeamApplications,
  fetchTeamCompanies,
  removeTeamApplication,
  removeTeamCompany,
  type TeamDetails, 
  type TeamMember,
  type TeamRole,
  type TeamCompany
} from "@/lib/teams-api"
import { AddMemberDialog } from "./add-member-dialog"
import { TeamApplicationAccessDialog } from "./team-application-access-dialog"
import { TeamCompanyAccessDialog } from "./team-company-access-dialog"

export default function ZespolSzczegoly() {
  const { menuItems, activeItem, currentApp } = useAppMenu()
  const params = useParams()
  const router = useRouter()
  const teamId = params.teamId as string
  
  const [team, setTeam] = useState<TeamDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null)
  const [removing, setRemoving] = useState(false)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)
  
  // Stan dla dostępu do aplikacji
  const [teamApplications, setTeamApplications] = useState<TeamRole[]>([])
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [showApplicationDialog, setShowApplicationDialog] = useState(false)
  
  // Stan dla dostępu do firm
  const [teamCompanies, setTeamCompanies] = useState<TeamCompany[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [showCompanyDialog, setShowCompanyDialog] = useState(false)
  const [companySearchQuery, setCompanySearchQuery] = useState("")

  // Wczytaj szczegóły zespołu
  useEffect(() => {
    if (!teamId) return
    
    const loadTeamDetails = async () => {
      setLoading(true)
      setLoadingApplications(true)
      setLoadingCompanies(true)
      
      try {
        // Ładuj szczegóły zespołu
        const teamData = await fetchTeamDetails(teamId)
        setTeam(teamData)
        
        // Ładuj aplikacje zespołu
        const applications = await fetchTeamApplications(teamId)
        setTeamApplications(applications)
        
        // Ładuj firmy zespołu
        const companies = await fetchTeamCompanies(teamId)
        setTeamCompanies(companies)
        
      } catch (error) {
        console.error("Błąd wczytywania szczegółów zespołu:", error)
      } finally {
        setLoading(false)
        setLoadingApplications(false)
        setLoadingCompanies(false)
      }
    }
    
    loadTeamDetails()
  }, [teamId])

  // Obsługa usuwania członka
  const handleRemoveMember = async (member: TeamMember) => {
    if (!team) return
    
    setRemoving(true)
    try {
      const success = await removeTeamMember(team.team_id, member.user_id)
      
      if (success) {
        // Aktualizuj lokalny stan - usuń członka z listy
        setTeam(prevTeam => {
          if (!prevTeam) return null
          return {
            ...prevTeam,
            members: prevTeam.members.filter(m => m.user_id !== member.user_id),
            member_count: (prevTeam.member_count || 0) - 1
          }
        })
        
        console.log(`✅ Usunięto ${member.full_name} z zespołu ${team.team_name}`)
      } else {
        console.error("❌ Błąd podczas usuwania członka zespołu")
      }
    } catch (error) {
      console.error("Błąd usuwania członka:", error)
    } finally {
      setRemoving(false)
      setMemberToRemove(null)
    }
  }

  // Obsługa zmiany roli członka
  const handleRoleChange = async (userId: string, newRole: 'member' | 'lead' | 'admin') => {
    if (!team) return
    
    setUpdatingRole(userId)
    try {
      const success = await updateTeamMemberRole(team.team_id, userId, newRole)
      
      if (success) {
        // Aktualizuj lokalny stan - zmień rolę członka
        setTeam(prevTeam => {
          if (!prevTeam) return null
          return {
            ...prevTeam,
            members: prevTeam.members.map(member => 
              member.user_id === userId 
                ? { ...member, role_in_team: newRole }
                : member
            )
          }
        })
        
        const member = team.members.find(m => m.user_id === userId)
        console.log(`✅ Zmieniono rolę ${member?.full_name} na ${newRole}`)
      } else {
        console.error("❌ Błąd podczas zmiany roli członka zespołu")
      }
    } catch (error) {
      console.error("Błąd zmiany roli:", error)
    } finally {
      setUpdatingRole(null)
    }
  }

  // Obsługa dodawania członka (callback z dialogu)
  const handleMemberAdded = () => {
    // Odśwież dane zespołu po dodaniu członka
    const refreshTeam = async () => {
      if (!teamId) return
      const teamData = await fetchTeamDetails(teamId)
      setTeam(teamData)
    }
    refreshTeam()
  }

  // Obsługa dodawania dostępu do aplikacji
  const handleApplicationAdded = async () => {
    if (!teamId) return
    const applications = await fetchTeamApplications(teamId)
    setTeamApplications(applications)
  }

  // Obsługa usuwania dostępu do aplikacji
  const handleRemoveApplication = async (appId: string, roleName: string) => {
    if (!teamId) return
    const success = await removeTeamApplication(teamId, appId, roleName)
    if (success) {
      setTeamApplications(prev => prev.filter(app => !(app.app_id === appId && app.role_name === roleName)))
    } else {
      alert('Nie udało się usunąć dostępu do aplikacji')
    }
  }

  // Obsługa dodawania dostępu do firmy
  const handleCompanyAdded = async () => {
    if (!teamId) return
    const companies = await fetchTeamCompanies(teamId)
    setTeamCompanies(companies)
  }

  // Obsługa usuwania dostępu do firmy
  const handleRemoveCompany = async (companyId: string) => {
    if (!teamId) return
    const success = await removeTeamCompany(teamId, companyId)
    if (success) {
      setTeamCompanies(prev => prev.filter(company => company.company_id !== companyId))
    } else {
      alert('Nie udało się usunąć dostępu do firmy')
    }
  }

  // Filtrowanie członków
  const filteredMembers = team?.members.filter(member =>
    member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.username.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  // Ikon dla ról
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-600" />
      case 'lead': return <Shield className="h-4 w-4 text-blue-600" />
      default: return <User className="h-4 w-4 text-gray-600" />
    }
  }

  // Kolor badge dla ról
  const getRoleVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'admin': return "default"
      case 'lead': return "secondary" 
      default: return "outline"
    }
  }

  // Filtrowanie firm na podstawie wyszukiwarki
  const filteredCompanies = teamCompanies.filter(company =>
    company.company_name.toLowerCase().includes(companySearchQuery.toLowerCase()) ||
    (company.nip && company.nip.includes(companySearchQuery))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Wczytywanie szczegółów zespołu...</p>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Zespół nie znaleziony</h3>
        <p className="text-gray-600 mb-4">Nie udało się wczytać szczegółów tego zespołu.</p>
        <Link href="/ustawienia/zespoly">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót do zespołów
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader title={currentApp} />
      
      <div className="flex">
        <AppSidebar menuItems={menuItems} activeItem={activeItem} />
        
        <main className="flex-1 p-8 bg-gray-50">
          <div className="space-y-6">
      {/* Nagłówek z nawigacją */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/ustawienia/zespoly">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zespoły
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{team.team_name}</h1>
            <p className="text-gray-600">
              {formatTeamType(team.team_type)} • {team.members.length} członków
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj osobę do zespołu
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Ustawienia zespołu
          </Button>
        </div>
      </div>

      {/* Informacje o zespole */}
      {team.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">{team.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Sekcja członków */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Członkowie zespołu
              </CardTitle>
              <CardDescription>
                Zarządzaj członkami i ich rolami w zespole
              </CardDescription>
            </div>
            
            {/* Wyszukiwarka członków */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Szukaj członków..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {searchQuery ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak wyników</h3>
                  <p className="text-gray-600">Nie znaleziono członków pasujących do wyszukiwanej frazy.</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak członków</h3>
                  <p className="text-gray-600">Ten zespół nie ma jeszcze żadnych członków.</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMembers.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-blue-600" />
                    <div>
                      <span className="font-medium text-gray-900">{member.full_name}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <Badge variant={getRoleVariant(member.role_in_team)} className="inline-flex items-center gap-1">
                        {getRoleIcon(member.role_in_team)}
                        {formatTeamRole(member.role_in_team)}
                      </Badge>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-sm text-gray-600">{member.email}</span>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Opcje zmiany roli */}
                      <DropdownMenuItem className="font-medium text-gray-500 pointer-events-none">
                        <Settings className="h-4 w-4 mr-2" />
                        Zmień rolę na:
                      </DropdownMenuItem>
                      
                      {(['member', 'lead', 'admin'] as const).filter(role => role !== member.role_in_team).map(role => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => handleRoleChange(member.user_id, role)}
                          className="pl-6"
                          disabled={updatingRole === member.user_id}
                        >
                          {updatingRole === member.user_id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                          ) : (
                            getRoleIcon(role)
                          )}
                          <span className="ml-2">{formatTeamRole(role)}</span>
                        </DropdownMenuItem>
                      ))}
                      
                      <DropdownMenuSeparator />
                      
                      {/* Opcja usunięcia */}
                      <DropdownMenuItem 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setMemberToRemove(member)}
                        disabled={updatingRole === member.user_id}
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Usuń z zespołu
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sekcja dostępu do aplikacji */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Layers className="h-5 w-5 mr-2" />
                Dostęp do aplikacji
              </CardTitle>
              <CardDescription>
                Zarządzaj dostępem zespołu do aplikacji i systemów
              </CardDescription>
            </div>
            
            <Button 
              onClick={() => setShowApplicationDialog(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nadaj dostęp do aplikacji
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {loadingApplications ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-4"></div>
              <p className="text-gray-600">Ładowanie dostępu do aplikacji...</p>
            </div>
          ) : teamApplications.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak dostępu do aplikacji</h3>
              <p className="text-gray-600">Ten zespół nie ma jeszcze dostępu do żadnych aplikacji.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {teamApplications.map((role, index) => (
                <div
                  key={`${role.app_id}-${role.role_name}-${index}`}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Layers className="h-4 w-4 text-blue-600" />
                    <div>
                      <span className="font-medium text-gray-900">{role.app_name}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="text-sm text-gray-600">{role.role_name}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveApplication(role.app_id, role.role_name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sekcja dostępu do firm */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Dostęp do firm
              </CardTitle>
              <CardDescription>
                Zarządzaj dostępem zespołu do firm i organizacji
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Szukaj po nazwie lub NIP..."
                  value={companySearchQuery}
                  onChange={(e) => setCompanySearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button 
                onClick={() => setShowCompanyDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nadaj dostęp
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loadingCompanies ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-4"></div>
              <p className="text-gray-600">Ładowanie dostępu do firm...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {companySearchQuery ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak wyników</h3>
                  <p className="text-gray-600">Nie znaleziono firm pasujących do wyszukiwanej frazy.</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak dostępu do firm</h3>
                  <p className="text-gray-600">Ten zespół nie ma jeszcze dostępu do żadnych firm.</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCompanies.map((company, index) => (
                <div
                  key={`${company.company_id}-${index}`}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-4 w-4 text-orange-600" />
                    <div>
                      <span className="font-medium text-gray-900">{company.company_name}</span>
                      {company.nip && (
                        <>
                          <span className="text-gray-400 mx-2">•</span>
                          <span className="text-sm text-gray-600">NIP: {company.nip}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCompany(company.company_id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog dodawania członka */}
      <AddMemberDialog
        open={showAddDialog}
        onOpenChange={(open: boolean) => setShowAddDialog(open)}
        teamId={team.team_id}
        teamName={team.team_name}
        existingMemberIds={team.members.map(member => member.user_id)}
        onSuccess={(message: string) => {
          console.log("✅ Dodano członka do zespołu:", message)
          handleMemberAdded()
        }}
        onError={(message: string) => {
          console.error("❌ Błąd dodawania członka:", message)
        }}
      />

      {/* Dialog dostępu do aplikacji */}
      <TeamApplicationAccessDialog
        open={showApplicationDialog}
        onOpenChange={setShowApplicationDialog}
        teamId={team.team_id}
        teamName={team.team_name}
        existingApplications={teamApplications.map(app => `${app.app_id}_${app.role_name}`)}
        onSuccess={(message: string) => {
          console.log("✅ Nadano dostęp do aplikacji:", message)
          handleApplicationAdded()
        }}
        onError={(message: string) => {
          console.error("❌ Błąd nadawania dostępu:", message)
        }}
      />

      {/* Dialog dostępu do firm */}
      <TeamCompanyAccessDialog
        open={showCompanyDialog}
        onOpenChange={setShowCompanyDialog}
        teamId={team.team_id}
        teamName={team.team_name}
        existingCompanies={teamCompanies.map(company => company.company_id)}
        onSuccess={(message: string) => {
          console.log("✅ Nadano dostęp do firmy:", message)
          handleCompanyAdded()
        }}
        onError={(message: string) => {
          console.error("❌ Błąd nadawania dostępu:", message)
        }}
      />

      {/* Dialog potwierdzenia usunięcia */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Usuń członka z zespołu
            </AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć <strong>{memberToRemove?.full_name}</strong> z zespołu{" "}
              <strong>{team.team_name}</strong>?
              <br /><br />
              Ta akcja jest nieodwracalna. Członek straci dostęp do wszystkich zasobów zespołu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>
              Anuluj
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToRemove && handleRemoveMember(memberToRemove)}
              disabled={removing}
              className="bg-red-600 hover:bg-red-700"
            >
              {removing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Usuwanie...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Usuń członka
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
          </div>
        </main>
      </div>
    </div>
  )
} 