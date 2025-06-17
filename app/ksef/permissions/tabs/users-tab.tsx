"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Lock, UserPlus } from "lucide-react"
import { AccessDialog } from "@/app/users/access-dialog"
import { UserPermissionsDialog } from "../user-permissions-dialog"

export function UsersTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [accessDialogOpen, setAccessDialogOpen] = useState(false)
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)

  // Zaktualizowani użytkownicy z nowymi profilami
  const users = [
    {
      id: 1,
      name: "Jan Kowalski",
      email: "jan.kowalski@example.com",
      role: "Administrator",
      status: "Aktywny",
      lastLogin: "2023-05-10 14:30",
      profile: "Administrator",
    },
    {
      id: 2,
      name: "Anna Nowak",
      email: "anna.nowak@example.com",
      role: "Księgowy",
      status: "Aktywny",
      lastLogin: "2023-05-09 09:15",
      profile: "Księgowa",
    },
    {
      id: 3,
      name: "Piotr Wiśniewski",
      email: "piotr.wisniewski@example.com",
      role: "Handlowiec",
      status: "Nieaktywny",
      lastLogin: "2023-04-28 11:45",
      profile: "Handlowiec",
    },
    {
      id: 4,
      name: "Magdalena Dąbrowska",
      email: "magdalena.dabrowska@example.com",
      role: "Zakupowiec",
      status: "Aktywny",
      lastLogin: "2023-05-08 16:20",
      profile: "Zakupowiec",
    },
    {
      id: 5,
      name: "Tomasz Zieliński",
      email: "tomasz.zielinski@example.com",
      role: "Właściciel",
      status: "Aktywny",
      lastLogin: "2023-05-11 10:45",
      profile: "Właściciel",
    },
  ]

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleOpenPermissionsDialog = (user: any) => {
    console.log("Otwieranie dialogu uprawnień dla użytkownika:", user)
    setSelectedUser(user)
    setPermissionsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-[280px]">
          <Input
            type="text"
            placeholder="Wyszukaj użytkownika..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
          onClick={() => setAccessDialogOpen(true)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Nadaj dostęp
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Użytkownik</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rola</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ostatnie logowanie</TableHead>
              <TableHead className="w-[100px] text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      user.status === "Aktywny"
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.lastLogin}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenPermissionsDialog(user)}
                    className="text-green-600"
                  >
                    <Lock className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AccessDialog
        open={accessDialogOpen}
        onOpenChange={setAccessDialogOpen}
        title="Nadaj dostęp do aplikacji KSEF"
        items={users}
        onSave={() => console.log("Zapisano zmiany")}
      />

      <UserPermissionsDialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen} user={selectedUser} />
    </div>
  )
}
