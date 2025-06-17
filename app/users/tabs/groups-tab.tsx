"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

type GroupType = {
  id: number
  name: string
  description: string
  usersCount: number
}

export function GroupsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null)

  // Przykładowe dane grup
  const groups: GroupType[] = [
    {
      id: 1,
      name: "Administrator",
      description: "Pełne uprawnienia do zarządzania portalem",
      usersCount: 2,
    },
    {
      id: 2,
      name: "Użytkownik",
      description: "Podstawowe uprawnienia do korzystania z portalu",
      usersCount: 15,
    },
  ]

  const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleEditGroup = (group: GroupType) => {
    setSelectedGroup(group)
    setIsEditGroupDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Wyszukaj grupę"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
          onClick={() => {
            setSelectedGroup(null)
            setIsEditGroupDialogOpen(true)
          }}
        >
          <Plus className="h-5 w-5 mr-2" /> Dodaj grupę
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa grupy</TableHead>
              <TableHead>Opis</TableHead>
              <TableHead>Liczba użytkowników</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell>{group.description}</TableCell>
                <TableCell>{group.usersCount}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditGroup(group)} title="Edytuj grupę">
                      <Edit className="h-5 w-5 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Usuń grupę">
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredGroups.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                  Brak wyników wyszukiwania
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditGroupDialogOpen} onOpenChange={setIsEditGroupDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-quicksand">
              {selectedGroup ? "Edycja grupy" : "Dodaj nową grupę"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general" className="font-quicksand">
                Dane ogólne
              </TabsTrigger>
              <TabsTrigger value="permissions" className="font-quicksand">
                Uprawnienia
              </TabsTrigger>
              <TabsTrigger value="users" className="font-quicksand">
                Użytkownicy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="group-name">Nazwa grupy</Label>
                  <Input id="group-name" defaultValue={selectedGroup?.name || ""} placeholder="Wprowadź nazwę grupy" />
                </div>
                <div>
                  <Label htmlFor="group-description">Opis</Label>
                  <Input
                    id="group-description"
                    defaultValue={selectedGroup?.description || ""}
                    placeholder="Wprowadź opis grupy"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions">
              <div className="space-y-4">
                <h3 className="font-medium">Uprawnienia portalu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 border p-4 rounded-lg">
                    <div className="font-medium">Zarządzanie użytkownikami</div>
                    <div className="space-y-2 ml-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-users-view" defaultChecked={true} />
                        <Label htmlFor="perm-users-view">Przeglądanie użytkowników</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-users-add" defaultChecked={selectedGroup?.name === "Administrator"} />
                        <Label htmlFor="perm-users-add">Dodawanie użytkowników</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-users-edit" defaultChecked={selectedGroup?.name === "Administrator"} />
                        <Label htmlFor="perm-users-edit">Edycja użytkowników</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-users-delete" defaultChecked={selectedGroup?.name === "Administrator"} />
                        <Label htmlFor="perm-users-delete">Usuwanie użytkowników</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border p-4 rounded-lg">
                    <div className="font-medium">Zarządzanie grupami</div>
                    <div className="space-y-2 ml-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-groups-view" defaultChecked={true} />
                        <Label htmlFor="perm-groups-view">Przeglądanie grup</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-groups-add" defaultChecked={selectedGroup?.name === "Administrator"} />
                        <Label htmlFor="perm-groups-add">Dodawanie grup</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-groups-edit" defaultChecked={selectedGroup?.name === "Administrator"} />
                        <Label htmlFor="perm-groups-edit">Edycja grup</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-groups-delete" defaultChecked={selectedGroup?.name === "Administrator"} />
                        <Label htmlFor="perm-groups-delete">Usuwanie grup</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border p-4 rounded-lg">
                    <div className="font-medium">Zarządzanie aplikacjami</div>
                    <div className="space-y-2 ml-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-apps-view" defaultChecked={true} />
                        <Label htmlFor="perm-apps-view">Przeglądanie aplikacji</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-apps-manage" defaultChecked={selectedGroup?.name === "Administrator"} />
                        <Label htmlFor="perm-apps-manage">Zarządzanie aplikacjami</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border p-4 rounded-lg">
                    <div className="font-medium">Zarządzanie firmami</div>
                    <div className="space-y-2 ml-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-companies-view" defaultChecked={true} />
                        <Label htmlFor="perm-companies-view">Przeglądanie firm</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-companies-add" defaultChecked={selectedGroup?.name === "Administrator"} />
                        <Label htmlFor="perm-companies-add">Dodawanie firm</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-companies-edit" defaultChecked={selectedGroup?.name === "Administrator"} />
                        <Label htmlFor="perm-companies-edit">Edycja firm</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="perm-companies-delete" defaultChecked={selectedGroup?.name === "Administrator"} />
                        <Label htmlFor="perm-companies-delete">Usuwanie firm</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="space-y-4">
                <div className="relative">
                  <Input type="text" placeholder="Wyszukaj użytkownika" className="pl-10 border-gray-300" />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                </div>

                <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
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
                          <Checkbox defaultChecked={true} />
                        </TableCell>
                        <TableCell className="font-medium">Jan Kowalski</TableCell>
                        <TableCell>jan.kowalski@nazwafirmy.pl</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Checkbox defaultChecked={selectedGroup?.name === "Użytkownik"} />
                        </TableCell>
                        <TableCell className="font-medium">Adam Nowak</TableCell>
                        <TableCell>adam.nowak@nazwafirmy.pl</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Checkbox defaultChecked={selectedGroup?.name === "Użytkownik"} />
                        </TableCell>
                        <TableCell className="font-medium">Anna Wiśniewska</TableCell>
                        <TableCell>anna.wisniewska@nazwafirmy.pl</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Checkbox defaultChecked={true} />
                        </TableCell>
                        <TableCell className="font-medium">Piotr Zieliński</TableCell>
                        <TableCell>piotr.zielinski@nazwafirmy.pl</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-green-600 text-green-600 font-quicksand"
              onClick={() => setIsEditGroupDialogOpen(false)}
            >
              Anuluj
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
              onClick={() => setIsEditGroupDialogOpen(false)}
            >
              Zapisz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
