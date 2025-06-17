"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Lock, UserPlus } from "lucide-react"
import { GroupPermissionsDialog } from "../group-permissions-dialog"

export function GroupsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)

  // Zaktualizowane grupy zgodnie z matrycą uprawnień
  const groups = [
    {
      id: 1,
      name: "Księgowa",
      description: "Dostęp do pełnej funkcjonalności faktur, bez zarządzania użytkownikami",
      usersCount: 12,
    },
    {
      id: 2,
      name: "Handlowiec",
      description: "Dostęp do faktur sprzedażowych i podstawowych funkcji",
      usersCount: 8,
    },
    {
      id: 3,
      name: "Zakupowiec",
      description: "Dostęp do faktur zakupowych i podstawowych funkcji",
      usersCount: 5,
    },
    {
      id: 4,
      name: "Administrator",
      description: "Pełne uprawnienia administracyjne do systemu KSEF",
      usersCount: 3,
    },
    {
      id: 5,
      name: "Właściciel",
      description: "Pełny dostęp do wszystkich funkcji systemu KSEF",
      usersCount: 2,
    },
  ]

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleOpenPermissionsDialog = (group: any) => {
    console.log("Otwieranie dialogu uprawnień dla grupy:", group)
    setSelectedGroup(group)
    setPermissionsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-[280px]">
          <Input
            type="text"
            placeholder="Wyszukaj grupę..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
          <UserPlus className="h-4 w-4 mr-2" />
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
              <TableHead className="w-[100px] text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell>{group.description}</TableCell>
                <TableCell>{group.usersCount}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenPermissionsDialog(group)}
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

      <GroupPermissionsDialog
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
        group={selectedGroup}
      />
    </div>
  )
}
