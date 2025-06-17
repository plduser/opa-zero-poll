"use client"

import { useState } from "react"
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
  UserPlus,
  UserCircle,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/app/components/header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

export default function KSEFConfigurationPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [selectedTab, setSelectedTab] = useState("groups")
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isGroupPermissionsDialogOpen, setIsGroupPermissionsDialogOpen] = useState(false)
  const [isProfilePermissionsDialogOpen, setIsProfilePermissionsDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [selectedProfile, setSelectedProfile] = useState<any>(null)

  // Przykładowe uprawnienia
  const permissions = [
    { id: 1, name: "Zarządzanie uprawnieniami", description: "Możliwość zarządzania uprawnieniami użytkowników" },
    { id: 2, name: "Odczyt uprawnień", description: "Możliwość przeglądania uprawnień użytkowników" },
    { id: 3, name: "Wystawianie faktur", description: "Możliwość wystawiania faktur w systemie KSEF" },
    { id: 4, name: "Odbieranie faktur", description: "Możliwość odbierania faktur z systemu KSEF" },
  ]

  // Przykładowe grupy
  const groups = [
    {
      id: 1,
      name: "Administrator KSEF",
      description: "Pełne uprawnienia do zarządzania systemem KSEF",
      permissions: [1, 2, 3, 4],
    },
    {
      id: 2,
      name: "Wystawiający faktury",
      description: "Uprawnienia do wystawiania faktur w systemie KSEF",
      permissions: [2, 3],
    },
    {
      id: 3,
      name: "Odbierający faktury",
      description: "Uprawnienia do odbierania faktur z systemu KSEF",
      permissions: [2, 4],
    },
    {
      id: 4,
      name: "Przeglądający",
      description: "Uprawnienia tylko do przeglądania danych w systemie KSEF",
      permissions: [2],
    },
  ]

  // Przykładowe profile
  const profiles = [
    {
      id: 1,
      name: "Administrator",
      description: "Profil administratora systemu KSEF",
      groups: [1],
    },
    {
      id: 2,
      name: "Księgowy",
      description: "Profil księgowego z uprawnieniami do wystawiania i odbierania faktur",
      groups: [2, 3],
    },
    {
      id: 3,
      name: "Asystent księgowego",
      description: "Profil asystenta księgowego z ograniczonymi uprawnieniami",
      groups: [3, 4],
    },
    {
      id: 4,
      name: "Audytor",
      description: "Profil audytora z uprawnieniami tylko do przeglądania",
      groups: [4],
    },
  ]

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

  const handleAddGroup = () => {
    setIsGroupDialogOpen(true)
  }

  const handleAddProfile = () => {
    setIsProfileDialogOpen(true)
  }

  const handleManageGroupPermissions = (group: any) => {
    setSelectedGroup(group)
    setIsGroupPermissionsDialogOpen(true)
  }

  const handleManageProfilePermissions = (profile: any) => {
    setSelectedProfile(profile)
    setIsProfilePermissionsDialogOpen(true)
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
                    <Link href="/ksef/permissions" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                      <span className="text-base font-medium font-quicksand text-gray-800">Uprawnienia</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/ksef/configuration" className="flex items-center gap-2 px-4 py-2 bg-gray-50">
                      <span className="text-base font-medium text-green-600 font-quicksand">Konfiguracja</span>
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
            <Settings className="h-6 w-6" />
            Konfiguracja uprawnień
          </h1>

          {showSuccessMessage && (
            <div className="flex items-start gap-4 p-4 mb-6 bg-purple-50 border border-purple-200 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-800 flex-shrink-0" />
              <div>
                <p className="font-bold text-purple-800">Zaktualizowano konfigurację</p>
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
            {selectedTab === "groups" ? (
              <Button onClick={handleAddGroup} className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
                Dodaj grupę <Plus className="ml-2 h-5 w-5" />
              </Button>
            ) : selectedTab === "profiles" ? (
              <Button onClick={handleAddProfile} className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
                Dodaj profil <Plus className="ml-2 h-5 w-5" />
              </Button>
            ) : null}
          </div>

          <Tabs defaultValue="groups" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="groups" className="font-quicksand">
                <UserPlus className="h-4 w-4 mr-2" />
                Grupy
              </TabsTrigger>
              <TabsTrigger value="profiles" className="font-quicksand">
                <UserCircle className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="definitions" className="font-quicksand">
                <Shield className="h-4 w-4 mr-2" />
                Definicje uprawnień
              </TabsTrigger>
            </TabsList>

            <TabsContent value="groups">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nazwa grupy</TableHead>
                      <TableHead>Opis</TableHead>
                      <TableHead>Uprawnienia</TableHead>
                      <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>{group.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {group.permissions.map((permId) => (
                              <Badge key={permId} className="bg-green-50 text-green-800 border-green-100">
                                {permissions.find((p) => p.id === permId)?.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleManageGroupPermissions(group)}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="profiles">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nazwa profilu</TableHead>
                      <TableHead>Opis</TableHead>
                      <TableHead>Grupy</TableHead>
                      <TableHead className="text-right">Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.name}</TableCell>
                        <TableCell>{profile.description}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {profile.groups.map((groupId) => (
                              <Badge key={groupId} className="bg-blue-50 text-blue-800 border-blue-100">
                                {groups.find((g) => g.id === groupId)?.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleManageProfilePermissions(profile)}
                          >
                            <Lock className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="definitions">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nazwa uprawnienia</TableHead>
                      <TableHead>Opis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell>{permission.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>

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

      {/* Dialog zarządzania uprawnieniami grupy */}
      <Dialog open={isGroupPermissionsDialogOpen} onOpenChange={setIsGroupPermissionsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-quicksand">
              Zarządzanie uprawnieniami grupy: {selectedGroup?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedGroup?.name}</p>
                  <p className="text-sm text-gray-500">{selectedGroup?.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Uprawnienia grupy</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Aktywne</TableHead>
                      <TableHead>Uprawnienie</TableHead>
                      <TableHead>Opis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((permission) => (
                      <TableRow key={permission.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            defaultChecked={selectedGroup?.permissions.includes(permission.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{permission.name}</TableCell>
                        <TableCell>{permission.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGroupPermissionsDialogOpen(false)}>
              Anuluj
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
              onClick={() => {
                setShowSuccessMessage(true)
                setIsGroupPermissionsDialogOpen(false)
                setTimeout(() => setShowSuccessMessage(false), 5000)
              }}
            >
              Zapisz zmiany
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog zarządzania uprawnieniami profilu */}
      <Dialog open={isProfilePermissionsDialogOpen} onOpenChange={setIsProfilePermissionsDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-quicksand">
              Zarządzanie profilem: {selectedProfile?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedProfile?.name}</p>
                  <p className="text-sm text-gray-500">{selectedProfile?.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Grupy w profilu</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Aktywne</TableHead>
                      <TableHead>Grupa</TableHead>
                      <TableHead>Opis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            defaultChecked={selectedProfile?.groups.includes(group.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>{group.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfilePermissionsDialogOpen(false)}>
              Anuluj
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
              onClick={() => {
                setShowSuccessMessage(true)
                setIsProfilePermissionsDialogOpen(false)
                setTimeout(() => setShowSuccessMessage(false), 5000)
              }}
            >
              Zapisz zmiany
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog dodawania grupy */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-quicksand">Dodaj nową grupę</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="group-name" className="text-sm font-medium">
                Nazwa grupy
              </label>
              <Input id="group-name" placeholder="Wprowadź nazwę grupy" />
            </div>
            <div className="space-y-2">
              <label htmlFor="group-description" className="text-sm font-medium">
                Opis
              </label>
              <Input id="group-description" placeholder="Wprowadź opis grupy" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
              Anuluj
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
              onClick={() => {
                setShowSuccessMessage(true)
                setIsGroupDialogOpen(false)
                setTimeout(() => setShowSuccessMessage(false), 5000)
              }}
            >
              Dodaj grupę
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog dodawania profilu */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-quicksand">Dodaj nowy profil</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="profile-name" className="text-sm font-medium">
                Nazwa profilu
              </label>
              <Input id="profile-name" placeholder="Wprowadź nazwę profilu" />
            </div>
            <div className="space-y-2">
              <label htmlFor="profile-description" className="text-sm font-medium">
                Opis
              </label>
              <Input id="profile-description" placeholder="Wprowadź opis profilu" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
              Anuluj
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
              onClick={() => {
                setShowSuccessMessage(true)
                setIsProfileDialogOpen(false)
                setTimeout(() => setShowSuccessMessage(false), 5000)
              }}
            >
              Dodaj profil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
