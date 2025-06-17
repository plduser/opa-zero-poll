"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Lock, Edit, Trash2 } from "lucide-react"
import { EditUserDialog } from "../edit-user-dialog"
import { AccessDialog } from "../access-dialog"

type UserType = {
  id: number
  name: string
  email: string
  phone: string
  role: string
  status: boolean
  lastLogin?: string
}

export function UsersTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)

  // Przykładowe dane użytkowników
  const users: UserType[] = [
    {
      id: 1,
      name: "Jan Kowalski",
      email: "jan.kowalski@nazwafirmy.pl",
      phone: "+48 500 500 500",
      role: "Administrator",
      status: true,
      lastLogin: "2023-05-10 14:32",
    },
    {
      id: 2,
      name: "Adam Nowak",
      email: "adam.nowak@nazwafirmy.pl",
      phone: "-",
      role: "Użytkownik",
      status: false,
      lastLogin: "2023-05-01 09:15",
    },
    {
      id: 3,
      name: "Anna Wiśniewska",
      email: "anna.wisniewska@nazwafirmy.pl",
      phone: "+48 600 600 600",
      role: "Użytkownik",
      status: true,
      lastLogin: "2023-04-15 11:20",
    },
    {
      id: 4,
      name: "Piotr Zieliński",
      email: "piotr.zielinski@nazwafirmy.pl",
      phone: "+48 700 700 700",
      role: "Administrator",
      status: true,
      lastLogin: "2023-04-01 10:00",
    },
  ]

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user)
    setIsEditUserDialogOpen(true)
  }

  const handleManagePermissions = (user: UserType) => {
    setSelectedUser(user)
    setIsPermissionsDialogOpen(true)
  }

  const handleSaveUser = (user: UserType) => {
    console.log("Zapisano użytkownika:", user)
    setIsEditUserDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Wyszukaj użytkownika"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
          <Plus className="h-5 w-5 mr-2" /> Dodaj użytkownika
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Użytkownik</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Rola</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ostatnie logowanie</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user.status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.status ? "Aktywny" : "Nieaktywny"}
                  </span>
                </TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleManagePermissions(user)}
                      title="Zarządzaj uprawnieniami"
                    >
                      <Lock className="h-5 w-5 text-green-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} title="Edytuj użytkownika">
                      <Edit className="h-5 w-5 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Usuń użytkownika">
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  Brak wyników wyszukiwania
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <EditUserDialog
          open={isEditUserDialogOpen}
          onOpenChange={setIsEditUserDialogOpen}
          user={selectedUser}
          onSave={handleSaveUser}
        />
      )}

      {selectedUser && (
        <AccessDialog
          open={isPermissionsDialogOpen}
          onOpenChange={setIsPermissionsDialogOpen}
          title={`Zarządzanie uprawnieniami: ${selectedUser.name}`}
          items={[]}
          onSave={() => console.log("Zapisano uprawnienia")}
        />
      )}
    </div>
  )
}
