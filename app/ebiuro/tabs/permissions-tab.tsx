"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Lock, Edit, Trash2, Upload, UserPlus, Users, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function PermissionsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPermissionsTab, setSelectedPermissionsTab] = useState("users")
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isProfileMappingDialogOpen, setIsProfileMappingDialogOpen] = useState(false)
  const [isUserPermissionsDialogOpen, setIsUserPermissionsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
  const [showSyncSuccessMessage, setShowSyncSuccessMessage] = useState(false)

  // Przykładowi użytkownicy
  const users = [
    {
      id: 1,
      name: "Jan Kowalski",
      email: "jan.kowalski@firma.pl",
      role: "Administrator",
      profile: "Administrator systemu",
      status: true,
      lastLogin: "2023-05-10 14:32",
      source: "Portal użytkownika",
    },
    {
      id: 2,
      name: "Anna Nowak",
      email: "anna.nowak@firma.pl",
      role: "Księgowa",
      profile: "Księgowy",
      status: true,
      lastLogin: "2023-05-08 09:15",
      source: "Portal użytkownika",
    },
    {
      id: 3,
      name: "Piotr Wiśniewski",
      email: "piotr.wisniewski@firma.pl",
      role: "Asystent księgowego",
      profile: "Asystent księgowego",
      status: true,
      lastLogin: "2023-05-05 11:20",
      source: "Portal użytkownika",
    },
    {
      id: 4,
      name: "Magdalena Kowalska",
      email: "magdalena.kowalska@firma.pl",
      role: "Kierownik biura",
      profile: "Kierownik",
      status: false,
      lastLogin: "2023-04-28 16:45",
      source: "eBiuro",
    },
    {
      id: 5,
      name: "Tomasz Zieliński",
      email: "tomasz.zielinski@firma.pl",
      role: "Praktykant",
      profile: "Praktykant",
      status: true,
      lastLogin: "2023-05-09 10:30",
      source: "eBiuro",
    },
  ]

  // Przykładowe grupy
  const groups = [
    {
      id: 1,
      name: "Administratorzy",
      description: "Pełne uprawnienia do systemu",
      usersCount: 1,
      permissionsCount: 15,
    },
    {
      id: 2,
      name: "Księgowi",
      description: "Uprawnienia do pełnej księgowości",
      usersCount: 2,
      permissionsCount: 10,
    },
    {
      id: 3,
      name: "Asystenci księgowych",
      description: "Ograniczone uprawnienia księgowe",
      usersCount: 1,
      permissionsCount: 6,
    },
    {
      id: 4,
      name: "Kierownicy",
      description: "Uprawnienia zarządcze i raportowe",
      usersCount: 1,
      permissionsCount: 8,
    },
    {
      id: 5,
      name: "Praktykanci",
      description: "Minimalne uprawnienia, tylko odczyt",
      usersCount: 1,
      permissionsCount: 3,
    },
  ]

  // Przykładowe profile
  const profiles = [
    {
      id: 1,
      name: "Administrator systemu",
      description: "Profil z pełnymi uprawnieniami administracyjnymi",
      usersCount: 1,
      publishedToPortal: true,
      lastPublished: "2023-05-01 10:15",
    },
    {
      id: 2,
      name: "Księgowy",
      description: "Profil dla księgowych z pełnymi uprawnieniami księgowymi",
      usersCount: 1,
      publishedToPortal: true,
      lastPublished: "2023-05-01 10:15",
    },
    {
      id: 3,
      name: "Asystent księgowego",
      description: "Profil dla asystentów księgowych z ograniczonymi uprawnieniami",
      usersCount: 1,
      publishedToPortal: true,
      lastPublished: "2023-05-01 10:15",
    },
    {
      id: 4,
      name: "Kierownik",
      description: "Profil dla kierowników z uprawnieniami zarządczymi",
      usersCount: 1,
      publishedToPortal: true,
      lastPublished: "2023-05-01 10:15",
    },
    {
      id: 5,
      name: "Praktykant",
      description: "Profil dla praktykantów z minimalnymi uprawnieniami",
      usersCount: 1,
      publishedToPortal: false,
      lastPublished: "-",
    },
  ]

  // Przykładowe mapowania profili na grupy uprawnień
  const profileMappings = [
    {
      id: 1,
      profile: "Administrator systemu",
      mappedTo: "Administratorzy",
      type: "Grupa",
      lastUpdated: "2023-05-01",
    },
    {
      id: 2,
      profile: "Księgowy",
      mappedTo: "Księgowi",
      type: "Grupa",
      lastUpdated: "2023-05-01",
    },
    {
      id: 3,
      profile: "Asystent księgowego",
      mappedTo: "Asystenci księgowych",
      type: "Grupa",
      lastUpdated: "2023-05-01",
    },
    {
      id: 4,
      profile: "Kierownik",
      mappedTo: "Kierownicy",
      type: "Grupa",
      lastUpdated: "2023-05-01",
    },
    {
      id: 5,
      profile: "Praktykant",
      mappedTo: "Praktykanci",
      type: "Grupa",
      lastUpdated: "2023-05-09",
    },
  ]

  // Przykładowe uprawnienia
  const permissions = [
    { id: 1, name: "Przeglądanie dokumentów", category: "Dokumenty" },
    { id: 2, name: "Dodawanie dokumentów", category: "Dokumenty" },
    { id: 3, name: "Edycja dokumentów", category: "Dokumenty" },
    { id: 4, name: "Usuwanie dokumentów", category: "Dokumenty" },
    { id: 5, name: "Księgowanie dokumentów", category: "Księgowość" },
    { id: 6, name: "Generowanie deklaracji", category: "Deklaracje" },
    { id: 7, name: "Wysyłanie deklaracji", category: "Deklaracje" },
    { id: 8, name: "Przeglądanie raportów", category: "Raporty" },
    { id: 9, name: "Tworzenie raportów", category: "Raporty" },
    { id: 10, name: "Zarządzanie użytkownikami", category: "Administracja" },
    { id: 11, name: "Zarządzanie uprawnieniami", category: "Administracja" },
    { id: 12, name: "Konfiguracja systemu", category: "Administracja" },
    { id: 13, name: "Zarządzanie klientami", category: "Klienci" },
    { id: 14, name: "Przeglądanie klientów", category: "Klienci" },
    { id: 15, name: "Zarządzanie rozliczeniami", category: "Rozliczenia" },
  ]

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredProfileMappings = profileMappings.filter(
    (mapping) =>
      mapping.profile.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mapping.mappedTo.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    setIsUserDialogOpen(true)
  }

  const handleEditGroup = (group: any) => {
    setSelectedGroup(group)
    setIsGroupDialogOpen(true)
  }

  const handleEditProfile = (profile: any) => {
    setSelectedProfile(profile)
    setIsProfileDialogOpen(true)
  }

  const handleEditProfileMapping = (mapping: any) => {
    const profile = profiles.find((p) => p.name === mapping.profile)
    setSelectedProfile(profile)
    setIsProfileMappingDialogOpen(true)
  }

  const handleManageUserPermissions = (user: any) => {
    setSelectedUser(user)
    setIsUserPermissionsDialogOpen(true)
  }

  const handlePublishToPortal = () => {
    setSyncStatus("syncing")
    // Symulacja publikacji
    setTimeout(() => {
      setSyncStatus("success")
      setShowSyncSuccessMessage(true)
      setTimeout(() => {
        setSyncStatus("idle")
        setShowSyncSuccessMessage(false)
      }, 5000)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Uprawnienia</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePublishToPortal}
            disabled={syncStatus === "syncing"}
            className="flex items-center gap-2"
          >
            <Upload className={`h-4 w-4 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
            {syncStatus === "syncing"
              ? "Publikowanie..."
              : syncStatus === "success"
                ? "Opublikowano"
                : "Publikuj profile do Portalu"}
          </Button>
        </div>
      </div>

      {showSyncSuccessMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Profile zostały pomyślnie opublikowane do Portalu użytkownika. Są teraz dostępne do przypisania użytkownikom
            w Portalu.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Zarządzanie uprawnieniami</CardTitle>
          <CardDescription>
            Zarządzaj użytkownikami, grupami i uprawnieniami w systemie eBiuro. Profile zdefiniowane w eBiuro mogą być
            publikowane do Portalu użytkownika.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedPermissionsTab} onValueChange={setSelectedPermissionsTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">Użytkownicy</TabsTrigger>
              <TabsTrigger value="groups">Grupy</TabsTrigger>
              <TabsTrigger value="profiles">Profile</TabsTrigger>
              <TabsTrigger value="mappings">Mapowanie profili</TabsTrigger>
            </TabsList>

            {/* Zakładka Użytkownicy */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Szukaj użytkowników..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button
                  onClick={() => {
                    setSelectedUser(null)
                    setIsUserDialogOpen(true)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Dodaj użytkownika
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Użytkownik</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rola</TableHead>
                      <TableHead>Profil</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Źródło</TableHead>
                      <TableHead>Ostatnie logowanie</TableHead>
                      <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.profile}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.status
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-gray-100 text-gray-800 border-gray-200"
                            }
                          >
                            {user.status ? "Aktywny" : "Nieaktywny"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.source === "Portal użytkownika"
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-green-100 text-green-800 border-green-200"
                            }
                          >
                            {user.source}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleManageUserPermissions(user)}
                              title="Zarządzaj uprawnieniami"
                            >
                              <Lock className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditUser(user)}
                              title="Edytuj użytkownika"
                              disabled={user.source === "Portal użytkownika"}
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Usuń użytkownika"
                              disabled={user.source === "Portal użytkownika"}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                          Brak wyników wyszukiwania
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Zakładka Grupy */}
            <TabsContent value="groups" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Szukaj grup..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button
                  onClick={() => {
                    setSelectedGroup(null)
                    setIsGroupDialogOpen(true)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Dodaj grupę
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nazwa grupy</TableHead>
                      <TableHead>Opis</TableHead>
                      <TableHead>Liczba użytkowników</TableHead>
                      <TableHead>Liczba uprawnień</TableHead>
                      <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>{group.description}</TableCell>
                        <TableCell>{group.usersCount}</TableCell>
                        <TableCell>{group.permissionsCount}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditGroup(group)}
                              title="Edytuj grupę"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Usuń grupę">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredGroups.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          Brak wyników wyszukiwania
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Zakładka Profile */}
            <TabsContent value="profiles" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Szukaj profili..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button
                  onClick={() => {
                    setSelectedProfile(null)
                    setIsProfileDialogOpen(true)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Dodaj profil
                </Button>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Profile zdefiniowane w eBiuro mogą być publikowane do Portalu użytkownika, aby były dostępne do
                  przypisania użytkownikom w Portalu. Użyj przycisku "Publikuj profile do Portalu" po wprowadzeniu
                  zmian.
                </AlertDescription>
              </Alert>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nazwa profilu</TableHead>
                      <TableHead>Opis</TableHead>
                      <TableHead>Liczba użytkowników</TableHead>
                      <TableHead>Status publikacji</TableHead>
                      <TableHead>Ostatnia publikacja</TableHead>
                      <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.name}</TableCell>
                        <TableCell>{profile.description}</TableCell>
                        <TableCell>{profile.usersCount}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              profile.publishedToPortal
                                ? "bg-green-100 text-green-800 border-green-200"
                                : "bg-amber-100 text-amber-800 border-amber-200"
                            }
                          >
                            {profile.publishedToPortal ? "Opublikowany" : "Nieopublikowany"}
                          </Badge>
                        </TableCell>
                        <TableCell>{profile.lastPublished}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditProfile(profile)}
                              title="Edytuj profil"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Usuń profil">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredProfiles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                          Brak wyników wyszukiwania
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Zakładka Mapowanie profili */}
            <TabsContent value="mappings" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Szukaj mapowań..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button
                  onClick={() => {
                    setSelectedProfile(null)
                    setIsProfileMappingDialogOpen(true)
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Dodaj mapowanie
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profil</TableHead>
                      <TableHead>Mapowanie na</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Ostatnia aktualizacja</TableHead>
                      <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfileMappings.map((mapping) => (
                      <TableRow key={mapping.id}>
                        <TableCell className="font-medium">{mapping.profile}</TableCell>
                        <TableCell>{mapping.mappedTo}</TableCell>
                        <TableCell>{mapping.type}</TableCell>
                        <TableCell>{mapping.lastUpdated}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditProfileMapping(mapping)}
                              title="Edytuj mapowanie"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Usuń mapowanie">
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredProfileMappings.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                          Brak wyników wyszukiwania
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog edycji użytkownika */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Edytuj użytkownika" : "Dodaj użytkownika"}</DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Edytuj dane użytkownika w systemie eBiuro."
                : "Dodaj nowego użytkownika do systemu eBiuro."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Imię i nazwisko
              </Label>
              <Input
                id="name"
                defaultValue={selectedUser?.name}
                className="col-span-3"
                disabled={selectedUser?.source === "Portal użytkownika"}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                defaultValue={selectedUser?.email}
                className="col-span-3"
                disabled={selectedUser?.source === "Portal użytkownika"}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rola
              </Label>
              <Select defaultValue={selectedUser?.role}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Wybierz rolę" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrator">Administrator</SelectItem>
                  <SelectItem value="Księgowa">Księgowa</SelectItem>
                  <SelectItem value="Asystent księgowego">Asystent księgowego</SelectItem>
                  <SelectItem value="Kierownik biura">Kierownik biura</SelectItem>
                  <SelectItem value="Praktykant">Praktykant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="profile" className="text-right">
                Profil
              </Label>
              <Select defaultValue={selectedUser?.profile}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Wybierz profil" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.name}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Checkbox id="status" defaultChecked={selectedUser?.status} />
                <label
                  htmlFor="status"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Aktywny
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => setIsUserDialogOpen(false)}>
              {selectedUser ? "Zapisz zmiany" : "Dodaj użytkownika"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog edycji grupy */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedGroup ? "Edytuj grupę" : "Dodaj grupę"}</DialogTitle>
            <DialogDescription>
              {selectedGroup
                ? "Edytuj dane grupy i przypisane uprawnienia."
                : "Dodaj nową grupę i przypisz jej uprawnienia."}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="general">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">Dane ogólne</TabsTrigger>
              <TabsTrigger value="permissions">Uprawnienia</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group-name" className="text-right">
                  Nazwa grupy
                </Label>
                <Input id="group-name" defaultValue={selectedGroup?.name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="group-description" className="text-right">
                  Opis
                </Label>
                <Input id="group-description" defaultValue={selectedGroup?.description} className="col-span-3" />
              </div>
            </TabsContent>
            <TabsContent value="permissions" className="py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {["Dokumenty", "Księgowość", "Deklaracje", "Raporty", "Administracja", "Klienci", "Rozliczenia"].map(
                    (category) => (
                      <div key={category} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{category}</h4>
                        <div className="space-y-2">
                          {permissions
                            .filter((perm) => perm.category === category)
                            .map((perm) => (
                              <div key={perm.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`perm-${perm.id}`}
                                  defaultChecked={
                                    selectedGroup?.name === "Administratorzy" ||
                                    (selectedGroup?.name === "Księgowi" &&
                                      ["Dokumenty", "Księgowość", "Deklaracje", "Raporty"].includes(perm.category)) ||
                                    (selectedGroup?.name === "Asystenci księgowych" &&
                                      ["Dokumenty", "Księgowość"].includes(perm.category) &&
                                      !perm.name.includes("Usuwanie")) ||
                                    (selectedGroup?.name === "Kierownicy" &&
                                      ["Raporty", "Klienci"].includes(perm.category)) ||
                                    (selectedGroup?.name === "Praktykanci" && perm.name.includes("Przeglądanie"))
                                  }
                                />
                                <Label htmlFor={`perm-${perm.id}`} className="text-sm">
                                  {perm.name}
                                </Label>
                              </div>
                            ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button type="submit" onClick={() => setIsGroupDialogOpen(false)}>
              {selectedGroup ? "Zapisz zmiany" : "Dodaj grupę"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog edycji profilu */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedProfile ? "Edytuj profil" : "Dodaj profil"}</DialogTitle>
            <DialogDescription>
              {selectedProfile
                ? "Edytuj dane profilu w systemie eBiuro."
                : "Dodaj nowy profil do systemu eBiuro. Profile mogą być publikowane do Portalu użytkownika."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-12 items-center gap-4">
              <Label htmlFor="profile-name" className="text-right col-span-3">
                Nazwa profilu
              </Label>
              <div className="col-span-9">
                <Input id="profile-name" defaultValue={selectedProfile?.name} />
              </div>
            </div>
            <div className="grid grid-cols-12 items-start gap-4">
              <Label htmlFor="profile-description" className="text-right col-span-3 pt-2">
                Opis
              </Label>
              <div className="col-span-9">
                <Textarea
                  id="profile-description"
                  defaultValue={selectedProfile?.description}
                  className="min-h-[80px]"
                />
              </div>
            </div>
            <div className="grid grid-cols-12 items-center gap-4">
              <Label htmlFor="publish-to-portal" className="text-right col-span-3">
                Publikacja
              </Label>
              <div className="flex items-center space-x-2 col-span-9">
                <Checkbox id="publish-to-portal" defaultChecked={selectedProfile?.publishedToPortal} />
                <label
                  htmlFor="publish-to-portal"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Publikuj do Portalu użytkownika
                </label>
              </div>
            </div>
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 text-sm">
                Publikacja profilu do Portalu użytkownika umożliwi przypisanie tego profilu użytkownikom w Portalu.
                Zmiany w profilu będą widoczne w Portalu po kliknięciu przycisku "Publikuj profile do Portalu".
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => setIsProfileDialogOpen(false)}>
              {selectedProfile ? "Zapisz zmiany" : "Dodaj profil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog mapowania profilu */}
      <Dialog open={isProfileMappingDialogOpen} onOpenChange={setIsProfileMappingDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Mapowanie profilu</DialogTitle>
            <DialogDescription>
              Określ, jak profil ma być mapowany na uprawnienia w systemie eBiuro. To mapowanie określa, jakie
              uprawnienia otrzymają użytkownicy z danym profilem.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mapping-profile" className="text-right">
                Profil
              </Label>
              <Select defaultValue={selectedProfile?.name}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Wybierz profil" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.name}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mapping-type" className="text-right">
                Typ mapowania
              </Label>
              <Select defaultValue="group">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Wybierz typ mapowania" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="group">Grupa</SelectItem>
                  <SelectItem value="permissions">Bezpośrednie uprawnienia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mapping-target" className="text-right">
                Mapuj na grupę
              </Label>
              <Select defaultValue={profileMappings.find((m) => m.profile === selectedProfile?.name)?.mappedTo}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Wybierz grupę" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.name}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-amber-50 p-3 rounded-md text-amber-800 text-sm">
              <p className="font-medium">Uwaga:</p>
              <p>
                Mapowanie profilu określa, jakie uprawnienia w systemie eBiuro otrzymają użytkownicy z danym profilem.
                Zmiany w mapowaniu wpłyną na wszystkich użytkowników z tym profilem.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => setIsProfileMappingDialogOpen(false)}>
              Zapisz mapowanie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog uprawnień użytkownika */}
      <Dialog open={isUserPermissionsDialogOpen} onOpenChange={setIsUserPermissionsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Uprawnienia użytkownika: {selectedUser?.name}</DialogTitle>
            <DialogDescription>Zarządzaj indywidualnymi uprawnieniami użytkownika w systemie eBiuro.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Informacje</TabsTrigger>
                <TabsTrigger value="groups">Grupy</TabsTrigger>
                <TabsTrigger value="permissions">Uprawnienia</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4 py-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {selectedUser?.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{selectedUser?.name}</h3>
                    <p className="text-sm text-gray-500">{selectedUser?.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge
                        variant="outline"
                        className={
                          selectedUser?.status
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }
                      >
                        {selectedUser?.status ? "Aktywny" : "Nieaktywny"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          selectedUser?.source === "Portal użytkownika"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-green-100 text-green-800 border-green-200"
                        }
                      >
                        {selectedUser?.source}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Profil</h4>
                    <p>{selectedUser?.profile}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {profiles.find((p) => p.name === selectedUser?.profile)?.description}
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Rola</h4>
                    <p>{selectedUser?.role}</p>
                    <p className="text-sm text-gray-500 mt-1">Rola określa funkcję użytkownika w systemie eBiuro.</p>
                  </div>
                </div>

                {selectedUser?.source === "Portal użytkownika" && (
                  <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm mt-4">
                    <p className="font-medium">Informacja:</p>
                    <p>
                      Ten użytkownik jest zarządzany przez Portal użytkownika. Podstawowe dane użytkownika oraz
                      przypisany profil są synchronizowane z Portalem. Możesz jednak zarządzać dodatkowymi uprawnieniami
                      użytkownika w systemie eBiuro.
                    </p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="groups" className="py-4">
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Członkostwo</TableHead>
                          <TableHead>Nazwa grupy</TableHead>
                          <TableHead>Opis</TableHead>
                          <TableHead>Źródło</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groups
                          .filter(
                            (group) =>
                              (selectedUser?.profile === "Administrator systemu" && group.name === "Administratorzy") ||
                              (selectedUser?.profile === "Księgowy" && group.name === "Księgowi") ||
                              (selectedUser?.profile === "Asystent księgowego" &&
                                group.name === "Asystenci księgowych") ||
                              (selectedUser?.profile === "Kierownik" && group.name === "Kierownicy") ||
                              (selectedUser?.profile === "Praktykant" && group.name === "Praktykanci"),
                          )
                          .map((group) => (
                            <TableRow key={group.id}>
                              <TableCell>
                                <Checkbox defaultChecked disabled={selectedUser?.source === "Portal użytkownika"} />
                              </TableCell>
                              <TableCell className="font-medium">{group.name}</TableCell>
                              <TableCell>{group.description}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                                  Z profilu
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        <TableRow>
                          <TableCell>
                            <Checkbox />
                          </TableCell>
                          <TableCell className="font-medium">Obsługa klientów</TableCell>
                          <TableCell>Uprawnienia do obsługi klientów</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              Indywidualne
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-md text-amber-800 text-sm">
                    <p className="font-medium">Uwaga:</p>
                    <p>
                      Grupy oznaczone jako "Z profilu" są przypisane automatycznie na podstawie profilu użytkownika i
                      mapowania profili. Aby zmienić te grupy, należy zmienić mapowanie profilu.
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="permissions" className="py-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      "Dokumenty",
                      "Księgowość",
                      "Deklaracje",
                      "Raporty",
                      "Administracja",
                      "Klienci",
                      "Rozliczenia",
                    ].map((category) => (
                      <div key={category} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{category}</h4>
                        <div className="space-y-2">
                          {permissions
                            .filter((perm) => perm.category === category)
                            .map((perm) => (
                              <div key={perm.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`user-perm-${perm.id}`}
                                  defaultChecked={
                                    selectedUser?.profile === "Administrator systemu" ||
                                    (selectedUser?.profile === "Księgowy" &&
                                      ["Dokumenty", "Księgowość", "Deklaracje", "Raporty"].includes(perm.category)) ||
                                    (selectedUser?.profile === "Asystent księgowego" &&
                                      ["Dokumenty", "Księgowość"].includes(perm.category) &&
                                      !perm.name.includes("Usuwanie")) ||
                                    (selectedUser?.profile === "Kierownik" &&
                                      ["Raporty", "Klienci"].includes(perm.category)) ||
                                    (selectedUser?.profile === "Praktykant" && perm.name.includes("Przeglądanie"))
                                  }
                                />
                                <Label htmlFor={`user-perm-${perm.id}`} className="text-sm">
                                  {perm.name}
                                </Label>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-amber-50 p-3 rounded-md text-amber-800 text-sm">
                    <p className="font-medium">Uwaga:</p>
                    <p>
                      Uprawnienia użytkownika są sumą uprawnień z przypisanych grup oraz indywidualnie nadanych
                      uprawnień. Zmiany dokonane tutaj będą miały wpływ tylko na tego użytkownika.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={() => setIsUserPermissionsDialogOpen(false)}>
              Zapisz uprawnienia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
