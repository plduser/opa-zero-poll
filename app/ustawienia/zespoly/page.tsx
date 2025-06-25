"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Users, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  MoreHorizontal,
  UserPlus,
  Settings,
  CheckCircle,
  X
} from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { useAppMenu } from "@/hooks/use-app-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchTeams, type Team } from "@/lib/teams-api"
import { CreateTeamDialog } from "./create-team-dialog"
import { EditTeamDialog } from "./edit-team-dialog"

export default function ZespolyPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { menuItems, activeItem, currentApp } = useAppMenu()

  // Load teams data
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true)
        setError(null)
        const teamsData = await fetchTeams("tenant125") // TODO: Get from auth context
        setTeams(teamsData)
      } catch (err) {
        console.error('Error loading teams:', err)
        setError('Nie udało się załadować zespołów')
      } finally {
        setLoading(false)
      }
    }

    loadTeams()
  }, [])

  // Reload teams data
  const reloadTeams = async () => {
    try {
      const teamsData = await fetchTeams("tenant125") // TODO: Get from auth context
      setTeams(teamsData)
    } catch (err) {
      console.error('Error reloading teams:', err)
    }
  }

  // Handle successful team creation
  const handleCreateSuccess = async (team: Team, message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 5000)
    await reloadTeams()
  }

  // Handle team creation error
  const handleCreateError = (message: string) => {
    setErrorMessage(message)
    setTimeout(() => setErrorMessage(null), 5000)
  }

  // Handle team edit
  const handleEditTeam = (team: Team) => {
    setTeamToEdit(team)
    setIsEditDialogOpen(true)
  }

  // Handle successful team edit
  const handleEditSuccess = async (team: Team, message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(null), 5000)
    await reloadTeams()
  }

  // Handle team edit error
  const handleEditError = (message: string) => {
    setErrorMessage(message)
    setTimeout(() => setErrorMessage(null), 5000)
  }

  // Filter teams based on search query
  const filteredTeams = teams.filter(team =>
    team.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Helper function to format team type
  const formatTeamType = (type: string) => {
    switch (type) {
      case 'functional': return 'Funkcjonalny'
      case 'project': return 'Projektowy'
      case 'department': return 'Departament'
      case 'temporary': return 'Tymczasowy'
      default: return type
    }
  }

  // Helper function to get team type color
  const getTeamTypeColor = (type: string) => {
    switch (type) {
      case 'functional': return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'project': return 'bg-green-50 text-green-800 border-green-200'
      case 'department': return 'bg-purple-50 text-purple-800 border-purple-200'
      case 'temporary': return 'bg-orange-50 text-orange-800 border-orange-200'
      default: return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader title={currentApp || "Portal Użytkownika"} />
        <div className="flex">
          <AppSidebar 
            menuItems={menuItems}
            activeItem={activeItem}
          />
          <main className="flex-1 p-8 bg-gray-50">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Zespoły</h1>
                  <p className="text-muted-foreground">
                    Zarządzanie zespołami i ich członkami
                  </p>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
                  <p className="text-gray-600">Ładowanie zespołów...</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <AppHeader title={currentApp || "Portal Użytkownika"} />
        <div className="flex">
          <AppSidebar 
            menuItems={menuItems}
            activeItem={activeItem}
          />
          <main className="flex-1 p-8 bg-gray-50">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Zespoły</h1>
                  <p className="text-muted-foreground">
                    Zarządzanie zespołami i ich członkami
                  </p>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Spróbuj ponownie
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <AppHeader title={currentApp || "Portal Użytkownika"} />
      <div className="flex">
        <AppSidebar 
          menuItems={menuItems}
          activeItem={activeItem}
        />
        <main className="flex-1 p-8 bg-gray-50">
          <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <div className="flex items-center gap-2">
            <X className="h-5 w-5" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zespoły</h1>
          <p className="text-muted-foreground">
            Zarządzanie zespołami i ich członkami w organizacji
          </p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nowy zespół
        </Button>
      </div>

      {/* Search and stats */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Szukaj zespołów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>{filteredTeams.length} z {teams.length} zespołów</span>
        </div>
      </div>

      {/* Teams grid */}
      {filteredTeams.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Brak wyników wyszukiwania' : 'Brak zespołów'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? 'Spróbuj użyć innych słów kluczowych'
                : 'Rozpocznij od utworzenia pierwszego zespołu'
              }
            </p>
            {!searchQuery && (
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Utwórz pierwszy zespół
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <Card key={team.team_id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{team.team_name}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={getTeamTypeColor(team.team_type)}
                    >
                      {formatTeamType(team.team_type)}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/ustawienia/zespoly/${team.team_id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Zobacz szczegóły
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditTeam(team)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edytuj zespół
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Dodaj członka
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Usuń zespół
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {team.description || 'Brak opisu zespołu'}
                </CardDescription>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Członkowie:</span>
                    <span className="font-medium">{team.member_count || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Utworzony:</span>
                    <span className="font-medium">
                      {new Date(team.created_at).toLocaleDateString('pl-PL')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status:</span>
                    <Badge 
                      variant={team.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {team.status === 'active' ? 'Aktywny' : 'Nieaktywny'}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Link href={`/ustawienia/zespoly/${team.team_id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      Zobacz szczegóły
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
          </div>
        </main>
      </div>
      
      {/* Create Team Dialog */}
      <CreateTeamDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        tenantId="tenant125"
        onSuccess={handleCreateSuccess}
        onError={handleCreateError}
      />
      
      {/* Edit Team Dialog */}
      <EditTeamDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        team={teamToEdit}
        onSuccess={handleEditSuccess}
        onError={handleEditError}
      />
    </div>
  )
} 