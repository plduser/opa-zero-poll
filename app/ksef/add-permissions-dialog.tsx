"use client"

import { useState } from "react"
import { Search, UserPlus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AddPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (entries: any[]) => void
}

export function AddPermissionsDialog({ open, onOpenChange, onAdd }: AddPermissionsDialogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTab, setSelectedTab] = useState("users")
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  // Przykładowe dane użytkowników
  const users = [
    {
      id: 101,
      name: "Anna Kowalska",
      position: "Księgowa",
      avatar: "/diverse-user-avatars.png",
    },
    {
      id: 102,
      name: "Tomasz Nowak",
      position: "Dyrektor Finansowy",
      avatar: "/diverse-user-avatars.png",
    },
    {
      id: 103,
      name: "Katarzyna Wiśniewska",
      position: "Specjalista ds. Podatków",
      avatar: "/diverse-user-avatars.png",
    },
    {
      id: 104,
      name: "Piotr Zieliński",
      position: "Kontroler Finansowy",
      avatar: "/diverse-user-avatars.png",
    },
  ]

  // Przykładowe dane grup
  const groups = [
    {
      id: 201,
      name: "KSIĘGOWOŚĆ",
      position: "Grupa",
      members: 8,
    },
    {
      id: 202,
      name: "ZARZĄD",
      position: "Grupa",
      members: 5,
    },
    {
      id: 203,
      name: "DZIAŁ_FINANSOWY",
      position: "Grupa",
      members: 12,
    },
    {
      id: 204,
      name: "AUDYTORZY",
      position: "Grupa",
      members: 4,
    },
  ]

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.position.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleToggleSelect = (id: number) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  const handleSelectAll = (items: any[]) => {
    if (items.every((item) => selectedItems.includes(item.id))) {
      // Deselect all if all are selected
      setSelectedItems(selectedItems.filter((id) => !items.some((item) => item.id === id)))
    } else {
      // Select all that aren't already selected
      const newIds = items.filter((item) => !selectedItems.includes(item.id)).map((item) => item.id)
      setSelectedItems([...selectedItems, ...newIds])
    }
  }

  const handleAdd = () => {
    const selectedUsers = users
      .filter((user) => selectedItems.includes(user.id))
      .map((user) => ({
        id: user.id,
        type: "user",
        name: user.name,
        position: user.position,
        avatar: user.avatar,
        read: true,
        write: false,
        manage: false,
      }))

    const selectedGroups = groups
      .filter((group) => selectedItems.includes(group.id))
      .map((group) => ({
        id: group.id,
        type: "group",
        name: group.name,
        position: "Grupa",
        avatar: "",
        read: true,
        write: false,
        manage: false,
      }))

    onAdd([...selectedUsers, ...selectedGroups])
    setSelectedItems([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Dodaj uprawnienia</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Wyszukaj użytkowników lub grupy..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Tabs defaultValue="users" onValueChange={setSelectedTab}>
            <TabsList className="grid grid-cols-2 w-[400px] mx-auto">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Użytkownicy
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Grupy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-4">
              <div className="border rounded-md">
                <div className="flex items-center p-3 border-b bg-gray-50">
                  <Checkbox
                    id="select-all-users"
                    checked={filteredUsers.length > 0 && filteredUsers.every((user) => selectedItems.includes(user.id))}
                    onCheckedChange={() => handleSelectAll(filteredUsers)}
                    className="border-gray-400"
                  />
                  <label htmlFor="select-all-users" className="ml-2 font-medium">
                    Zaznacz wszystkich
                  </label>
                </div>

                <div className="divide-y">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center p-3 hover:bg-gray-50">
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedItems.includes(user.id)}
                        onCheckedChange={() => handleToggleSelect(user.id)}
                        className="border-gray-400"
                      />
                      <label htmlFor={`user-${user.id}`} className="ml-2 flex items-center gap-3 flex-1 cursor-pointer">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || "/diverse-user-avatars.png"} alt={user.name} />
                          <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.position}</p>
                        </div>
                      </label>
                    </div>
                  ))}

                  {filteredUsers.length === 0 && (
                    <div className="p-4 text-center text-gray-500">Nie znaleziono użytkowników</div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="groups" className="mt-4">
              <div className="border rounded-md">
                <div className="flex items-center p-3 border-b bg-gray-50">
                  <Checkbox
                    id="select-all-groups"
                    checked={
                      filteredGroups.length > 0 && filteredGroups.every((group) => selectedItems.includes(group.id))
                    }
                    onCheckedChange={() => handleSelectAll(filteredGroups)}
                    className="border-gray-400"
                  />
                  <label htmlFor="select-all-groups" className="ml-2 font-medium">
                    Zaznacz wszystkie
                  </label>
                </div>

                <div className="divide-y">
                  {filteredGroups.map((group) => (
                    <div key={group.id} className="flex items-center p-3 hover:bg-gray-50">
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={selectedItems.includes(group.id)}
                        onCheckedChange={() => handleToggleSelect(group.id)}
                        className="border-gray-400"
                      />
                      <label
                        htmlFor={`group-${group.id}`}
                        className="ml-2 flex items-center gap-3 flex-1 cursor-pointer"
                      >
                        <Avatar className="h-10 w-10 bg-gray-200">
                          <AvatarFallback className="text-gray-600">{group.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{group.name}</p>
                          <p className="text-sm text-gray-500">
                            {group.position} • {group.members} członków
                          </p>
                        </div>
                      </label>
                    </div>
                  ))}

                  {filteredGroups.length === 0 && (
                    <div className="p-4 text-center text-gray-500">Nie znaleziono grup</div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div className="text-sm text-gray-500">
              Wybrano: {selectedItems.length} {selectedTab === "users" ? "użytkowników" : "grup"}
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Anuluj
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleAdd}
                disabled={selectedItems.length === 0}
              >
                Dodaj
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
