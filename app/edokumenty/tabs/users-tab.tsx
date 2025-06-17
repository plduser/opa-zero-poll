"use client"

import { useState } from "react"
import { Search, Edit, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Dane użytkowników (te same co w Portalu)
const usersData = [
  { id: 1, name: "Jan Kowalski", email: "jan.kowalski@example.com", role: "Administrator", status: "Aktywny" },
  { id: 2, name: "Anna Nowak", email: "anna.nowak@example.com", role: "Księgowy", status: "Aktywny" },
  { id: 3, name: "Piotr Wiśniewski", email: "piotr.wisniewski@example.com", role: "Handlowiec", status: "Aktywny" },
  {
    id: 4,
    name: "Magdalena Dąbrowska",
    email: "magdalena.dabrowska@example.com",
    role: "Sekretariat",
    status: "Nieaktywny",
  },
  { id: 5, name: "Tomasz Lewandowski", email: "tomasz.lewandowski@example.com", role: "Kierownik", status: "Aktywny" },
  { id: 6, name: "Karolina Zielińska", email: "karolina.zielinska@example.com", role: "Pracownik", status: "Aktywny" },
  { id: 7, name: "Michał Szymański", email: "michal.szymanski@example.com", role: "Handlowiec", status: "Aktywny" },
  {
    id: 8,
    name: "Aleksandra Woźniak",
    email: "aleksandra.wozniak@example.com",
    role: "Księgowy",
    status: "Nieaktywny",
  },
]

// Grupy uprawnień
const userGroups = [
  { id: 1, name: "ADMINISTRATOR", description: "Pełny dostęp do systemu" },
  { id: 2, name: "DOSTĘP DO KLIENTÓW", description: "Dostęp do modułu klientów" },
  { id: 3, name: "DOSTĘP DO SPRAW", description: "Dostęp do modułu spraw" },
  { id: 4, name: "SEKRETARIAT", description: "Uprawnienia dla sekretariatu" },
  { id: 5, name: "EDYCJA DOKUMENTÓW", description: "Możliwość edycji dokumentów" },
  { id: 6, name: "PODGLĄD DOKUMENTÓW", description: "Możliwość przeglądania dokumentów" },
  { id: 7, name: "ZARZĄDZANIE SŁOWNIKAMI", description: "Zarządzanie słownikami systemowymi" },
  { id: 8, name: "KONFIGURACJA SYSTEMU", description: "Dostęp do ustawień konfiguracyjnych" },
]

// Profile użytkowników
const userProfiles = [
  { id: 1, name: "Administrator" },
  { id: 2, name: "Księgowy" },
  { id: 3, name: "Handlowiec" },
  { id: 4, name: "Sekretariat" },
  { id: 5, name: "Kierownik" },
  { id: 6, name: "Pracownik" },
]

export function UsersTab() {
  const [users, setUsers] = useState(usersData)
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [selectedGroups, setSelectedGroups] = useState<number[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string>("")

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEditUser = (user: any) => {
    setCurrentUser(user)
    // Symulacja pobrania grup użytkownika
    if (user.role === "Administrator") {
      setSelectedGroups([1, 2, 3, 7, 8])
    } else if (user.role === "Księgowy") {
      setSelectedGroups([5, 6])
    } else if (user.role === "Handlowiec") {
      setSelectedGroups([2, 6])
    } else if (user.role === "Sekretariat") {
      setSelectedGroups([4, 6])
    } else {
      setSelectedGroups([6])
    }

    // Ustawienie profilu
    const profileId = userProfiles.find((p) => p.name === user.role)?.id.toString() || "6"
    setSelectedProfile(profileId)

    setIsEditDialogOpen(true)
  }

  const handleToggleGroup = (groupId: number) => {
    setSelectedGroups((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]))
  }

  const handleSaveUser = () => {
    // Tutaj byłaby logika zapisywania zmian użytkownika
    setIsEditDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Użytkownicy</h2>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Dodaj użytkownika
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Input
          type="text"
          placeholder="Wyszukaj użytkownika"
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imię i nazwisko</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Profil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.status === "Aktywny" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)} className="text-green-600">
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog edycji użytkownika */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edycja użytkownika: {currentUser?.name}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="groups">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Informacje</TabsTrigger>
              <TabsTrigger value="groups">Grupy</TabsTrigger>
              <TabsTrigger value="profile">Profil</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Imię i nazwisko</Label>
                  <Input id="name" defaultValue={currentUser?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={currentUser?.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue={currentUser?.status === "Aktywny" ? "active" : "inactive"}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Aktywny</SelectItem>
                      <SelectItem value="inactive">Nieaktywny</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="groups" className="space-y-4">
              <div className="relative w-full max-w-sm mb-4">
                <Input type="text" placeholder="Wyszukaj grupę" className="pl-10" />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {userGroups.map((group) => (
                    <div key={group.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={selectedGroups.includes(group.id)}
                        onCheckedChange={() => handleToggleGroup(group.id)}
                      />
                      <div>
                        <Label htmlFor={`group-${group.id}`} className="font-medium cursor-pointer">
                          {group.name}
                        </Label>
                        <p className="text-sm text-gray-500">{group.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile">Profil użytkownika</Label>
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Wybierz profil" />
                  </SelectTrigger>
                  <SelectContent>
                    {userProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-2">
                  Profil określa podstawowy zestaw uprawnień użytkownika. Dodatkowe uprawnienia można przydzielić
                  poprzez grupy.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Anuluj
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSaveUser}>
              Zapisz zmiany
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
