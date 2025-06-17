"use client"

import { useState } from "react"
import { Search, Edit, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Grupy uprawnień
const groupsData = [
  { id: 1, name: "ADMINISTRATOR", category: "Administracja", usersCount: 2 },
  { id: 2, name: "DOSTĘP DO KLIENTÓW", category: "Klienci", usersCount: 8 },
  { id: 3, name: "DOSTĘP DO SPRAW", category: "Sprawy", usersCount: 6 },
  { id: 4, name: "SEKRETARIAT", category: "Dokumenty", usersCount: 3 },
  { id: 5, name: "EDYCJA DOKUMENTÓW", category: "Dokumenty", usersCount: 7 },
  { id: 6, name: "PODGLĄD DOKUMENTÓW", category: "Dokumenty", usersCount: 15 },
  { id: 7, name: "ZARZĄDZANIE SŁOWNIKAMI", category: "Słowniki", usersCount: 4 },
  { id: 8, name: "KONFIGURACJA SYSTEMU", category: "Administracja", usersCount: 2 },
]

// Uprawnienia do funkcji
const functionPermissions = {
  Dokumenty: [
    { id: 1, name: "Tworzenie dokumentów", description: "Możliwość tworzenia nowych dokumentów" },
    { id: 2, name: "Edycja dokumentów", description: "Możliwość edycji istniejących dokumentów" },
    { id: 3, name: "Usuwanie dokumentów", description: "Możliwość usuwania dokumentów" },
    { id: 4, name: "Zatwierdzanie dokumentów", description: "Możliwość zatwierdzania dokumentów" },
    { id: 5, name: "Anulowanie dokumentów", description: "Możliwość anulowania dokumentów" },
    { id: 6, name: "Drukowanie dokumentów", description: "Możliwość drukowania dokumentów" },
    { id: 7, name: "Eksport dokumentów", description: "Możliwość eksportu dokumentów do plików" },
  ],
  Klienci: [
    { id: 8, name: "Tworzenie klientów", description: "Możliwość dodawania nowych klientów" },
    { id: 9, name: "Edycja klientów", description: "Możliwość edycji danych klientów" },
    { id: 10, name: "Usuwanie klientów", description: "Możliwość usuwania klientów" },
    { id: 11, name: "Podgląd danych finansowych", description: "Dostęp do danych finansowych klientów" },
  ],
  Sprawy: [
    { id: 12, name: "Tworzenie spraw", description: "Możliwość zakładania nowych spraw" },
    { id: 13, name: "Edycja spraw", description: "Możliwość edycji spraw" },
    { id: 14, name: "Zamykanie spraw", description: "Możliwość zamykania spraw" },
    { id: 15, name: "Przydzielanie spraw", description: "Możliwość przydzielania spraw użytkownikom" },
  ],
  Słowniki: [
    { id: 16, name: "Edycja słowników", description: "Możliwość edycji wartości w słownikach" },
    { id: 17, name: "Dodawanie słowników", description: "Możliwość dodawania nowych słowników" },
  ],
  System: [
    { id: 18, name: "Konfiguracja systemu", description: "Dostęp do ustawień konfiguracyjnych" },
    { id: 19, name: "Zarządzanie użytkownikami", description: "Możliwość zarządzania kontami użytkowników" },
    { id: 20, name: "Zarządzanie uprawnieniami", description: "Możliwość zarządzania uprawnieniami" },
    { id: 21, name: "Podgląd logów", description: "Dostęp do logów systemowych" },
    { id: 22, name: "Kopie zapasowe", description: "Zarządzanie kopiami zapasowymi" },
  ],
}

export function GroupsTab() {
  const [groups, setGroups] = useState(groupsData)
  const [searchQuery, setSearchQuery] = useState("")
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
  const [isNewGroup, setIsNewGroup] = useState(false)
  const [currentGroup, setCurrentGroup] = useState<any>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddGroup = () => {
    setIsNewGroup(true)
    setCurrentGroup(null)
    setGroupName("")
    setGroupDescription("")
    setSelectedPermissions([])
    setIsGroupDialogOpen(true)
  }

  const handleEditGroup = (group: any) => {
    setIsNewGroup(false)
    setCurrentGroup(group)
    setGroupName(group.name)
    setGroupDescription("")

    // Symulacja pobrania uprawnień grupy
    if (group.name === "ADMINISTRATOR") {
      setSelectedPermissions([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22])
    } else if (group.name === "DOSTĘP DO KLIENTÓW") {
      setSelectedPermissions([8, 9, 11])
    } else if (group.name === "DOSTĘP DO SPRAW") {
      setSelectedPermissions([12, 13, 15])
    } else if (group.name === "SEKRETARIAT") {
      setSelectedPermissions([1, 6, 7])
    } else if (group.name === "EDYCJA DOKUMENTÓW") {
      setSelectedPermissions([1, 2, 4, 6, 7])
    } else if (group.name === "PODGLĄD DOKUMENTÓW") {
      setSelectedPermissions([6, 7])
    } else if (group.name === "ZARZĄDZANIE SŁOWNIKAMI") {
      setSelectedPermissions([16, 17])
    } else if (group.name === "KONFIGURACJA SYSTEMU") {
      setSelectedPermissions([18, 21, 22])
    }

    setIsGroupDialogOpen(true)
  }

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId) ? prev.filter((id) => id !== permissionId) : [...prev, permissionId],
    )
  }

  const handleSaveGroup = () => {
    // Tutaj byłaby logika zapisywania grupy
    setIsGroupDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Grupy uprawnień</h2>
        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleAddGroup}>
          <Plus className="mr-2 h-4 w-4" /> Dodaj grupę
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Input
          type="text"
          placeholder="Wyszukaj grupę"
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
              <TableHead>Nazwa grupy</TableHead>
              <TableHead>Kategoria</TableHead>
              <TableHead>Liczba użytkowników</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell>{group.category}</TableCell>
                <TableCell>{group.usersCount}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditGroup(group)} className="text-green-600">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog dodawania/edycji grupy */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {isNewGroup ? "Dodaj nową grupę" : `Edycja grupy: ${currentGroup?.name}`}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Informacje</TabsTrigger>
              <TabsTrigger value="permissions">Uprawnienia</TabsTrigger>
              <TabsTrigger value="users">Użytkownicy</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="group-name">Nazwa grupy</Label>
                  <Input id="group-name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-description">Opis</Label>
                  <Textarea
                    id="group-description"
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="relative w-full max-w-sm mb-4">
                <Input type="text" placeholder="Wyszukaj uprawnienie" className="pl-10" />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                {Object.entries(functionPermissions).map(([section, permissions]) => (
                  <div key={section} className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{section}</h3>
                    <div className="space-y-3">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-3">
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => handleTogglePermission(permission.id)}
                          />
                          <div>
                            <Label htmlFor={`permission-${permission.id}`} className="font-medium cursor-pointer">
                              {permission.name}
                            </Label>
                            <p className="text-sm text-gray-500">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              {!isNewGroup && (
                <>
                  <div className="relative w-full max-w-sm mb-4">
                    <Input type="text" placeholder="Wyszukaj użytkownika" className="pl-10" />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox />
                          </TableHead>
                          <TableHead>Użytkownik</TableHead>
                          <TableHead>Email</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Checkbox checked />
                          </TableCell>
                          <TableCell>Jan Kowalski</TableCell>
                          <TableCell>jan.kowalski@example.com</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Checkbox checked />
                          </TableCell>
                          <TableCell>Anna Nowak</TableCell>
                          <TableCell>anna.nowak@example.com</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>
                            <Checkbox checked />
                          </TableCell>
                          <TableCell>Piotr Wiśniewski</TableCell>
                          <TableCell>piotr.wisniewski@example.com</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
              {isNewGroup && (
                <div className="text-center py-8 text-gray-500">
                  <p>Użytkowników można dodać po utworzeniu grupy.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
              Anuluj
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSaveGroup}>
              {isNewGroup ? "Utwórz grupę" : "Zapisz zmiany"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
