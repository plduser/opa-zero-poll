"use client"

import { useState } from "react"
import { Search, Plus, Trash2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GroupPermissionsDialog } from "../group-permissions-dialog"

interface GroupsTabProps {
  onSuccess: () => void
}

// Grupy uprawnień (specyficzne dla FK)
const groupsData = [
  { id: 1, name: "ADMINISTRATOR FK", description: "Grupa dla administratorów systemu FK", membersCount: 2 },
  { id: 2, name: "KSIĘGOWI", description: "Grupa dla pracowników działu księgowości", membersCount: 8 },
  { id: 3, name: "ANALITYCY", description: "Grupa dla analityków finansowych", membersCount: 6 },
  { id: 4, name: "KONTROLERZY", description: "Grupa dla kontrolerów finansowych", membersCount: 3 },
  { id: 5, name: "KADRA ZARZĄDZAJĄCA", description: "Grupa dla kadry zarządzającej", membersCount: 4 },
  { id: 6, name: "DZIAŁ PODATKOWY", description: "Grupa dla specjalistów ds. podatków", membersCount: 5 },
  { id: 7, name: "AUDYTORZY", description: "Grupa dla audytorów wewnętrznych", membersCount: 2 },
  { id: 8, name: "DZIAŁ PŁAC", description: "Grupa dla specjalistów ds. płac", membersCount: 3 },
]

export function GroupsTab({ onSuccess }: GroupsTabProps) {
  const [groups, setGroups] = useState(groupsData)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddGroup = () => {
    // Otwieramy dialog uprawnień z nową grupą
    const newGroup = {
      id: Math.max(...groups.map((g) => g.id)) + 1,
      name: "NOWA GRUPA",
      description: "",
      membersCount: 0,
    }
    setSelectedGroup(newGroup)
    setIsPermissionsDialogOpen(true)
  }

  const handleOpenPermissionsDialog = (group: any) => {
    setSelectedGroup(group)
    setIsPermissionsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-[320px]">
          <Input
            type="text"
            placeholder="Wyszukaj grupę"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand" onClick={handleAddGroup}>
          <Plus className="mr-2 h-4 w-4" /> Dodaj grupę
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
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
                <TableCell>{group.membersCount}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenPermissionsDialog(group)}
                      className="text-green-600"
                    >
                      <Lock className="h-4 w-4" />
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

      {/* Dialog uprawnień grupy */}
      {selectedGroup && (
        <GroupPermissionsDialog
          group={selectedGroup}
          isOpen={isPermissionsDialogOpen}
          onClose={() => setIsPermissionsDialogOpen(false)}
          onSuccess={onSuccess}
        />
      )}
    </div>
  )
}
