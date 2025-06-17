"use client"

import { useState } from "react"
import { Search, Edit, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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

export function PermissionDefinitionsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const [isNewPermission, setIsNewPermission] = useState(false)
  const [currentPermission, setCurrentPermission] = useState<any>(null)
  const [permissionName, setPermissionName] = useState("")
  const [permissionDescription, setPermissionDescription] = useState("")
  const [permissionCategory, setPermissionCategory] = useState("")

  // Spłaszczona lista wszystkich uprawnień
  const allPermissions = Object.entries(functionPermissions).flatMap(([category, permissions]) =>
    permissions.map((permission) => ({ ...permission, category })),
  )

  const filteredPermissions = allPermissions.filter(
    (permission) =>
      (selectedCategory === null || permission.category === selectedCategory) &&
      (permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleAddPermission = () => {
    setIsNewPermission(true)
    setCurrentPermission(null)
    setPermissionName("")
    setPermissionDescription("")
    setPermissionCategory(selectedCategory || "Dokumenty")
    setIsPermissionDialogOpen(true)
  }

  const handleEditPermission = (permission: any) => {
    setIsNewPermission(false)
    setCurrentPermission(permission)
    setPermissionName(permission.name)
    setPermissionDescription(permission.description)
    setPermissionCategory(permission.category)
    setIsPermissionDialogOpen(true)
  }

  const handleSavePermission = () => {
    // Tutaj byłaby logika zapisywania uprawnienia
    setIsPermissionDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Definicje uprawnień</h2>
        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleAddPermission}>
          <Plus className="mr-2 h-4 w-4" /> Dodaj uprawnienie
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative w-full max-w-sm">
          <Input
            type="text"
            placeholder="Wyszukaj uprawnienie"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>

        <div>
          <Tabs
            value={selectedCategory || "all"}
            onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
          >
            <TabsList>
              <TabsTrigger value="all">Wszystkie</TabsTrigger>
              {Object.keys(functionPermissions).map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa uprawnienia</TableHead>
              <TableHead>Kategoria</TableHead>
              <TableHead>Opis</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPermissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className="font-medium">{permission.name}</TableCell>
                <TableCell>{permission.category}</TableCell>
                <TableCell>{permission.description}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPermission(permission)}
                      className="text-green-600"
                    >
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

      {/* Dialog dodawania/edycji uprawnienia */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {isNewPermission ? "Dodaj nowe uprawnienie" : `Edycja uprawnienia: ${currentPermission?.name}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="permission-name">Nazwa uprawnienia</Label>
              <Input id="permission-name" value={permissionName} onChange={(e) => setPermissionName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permission-category">Kategoria</Label>
              <select
                id="permission-category"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={permissionCategory}
                onChange={(e) => setPermissionCategory(e.target.value)}
              >
                {Object.keys(functionPermissions).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="permission-description">Opis</Label>
              <Textarea
                id="permission-description"
                value={permissionDescription}
                onChange={(e) => setPermissionDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>
              Anuluj
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSavePermission}>
              {isNewPermission ? "Utwórz uprawnienie" : "Zapisz zmiany"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
