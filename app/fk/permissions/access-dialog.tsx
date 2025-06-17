"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface AccessDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AccessDialog({ isOpen, onClose, onSuccess }: AccessDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)

  const users = [
    { id: 1, name: "Jan Kowalski", email: "jan.kowalski@example.com" },
    { id: 2, name: "Anna Nowak", email: "anna.nowak@example.com" },
    { id: 3, name: "Piotr Wiśniewski", email: "piotr.wisniewski@example.com" },
    { id: 4, name: "Magdalena Dąbrowska", email: "magdalena.dabrowska@example.com" },
    { id: 5, name: "Tomasz Lewandowski", email: "tomasz.lewandowski@example.com" },
    { id: 6, name: "Karolina Zielińska", email: "karolina.zielinska@example.com" },
    { id: 7, name: "Michał Szymański", email: "michal.szymanski@example.com" },
  ]

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleToggleUser = (userId: number) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleToggleAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    }
  }

  const handleSave = () => {
    // Tutaj logika nadawania dostępu
    onSuccess()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nadaj dostęp</DialogTitle>
          <DialogDescription>Wybierz użytkowników i profil, który chcesz im nadać.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profil</label>
            <select
              className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={selectedProfile || ""}
              onChange={(e) => setSelectedProfile(e.target.value || null)}
            >
              <option value="">Wybierz profil</option>
              <option value="Pełny dostęp">Pełny dostęp</option>
              <option value="Księgowość">Księgowość</option>
              <option value="Kontroling">Kontroling</option>
              <option value="Raportowanie">Raportowanie</option>
              <option value="Zarządzanie">Zarządzanie</option>
              <option value="Podatki">Podatki</option>
              <option value="Płace">Płace</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Użytkownicy</label>
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Wyszukaj użytkownika"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
            </div>
            <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={handleToggleAll}
                      />
                    </TableHead>
                    <TableHead>Użytkownik</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleToggleUser(user.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
            onClick={handleSave}
            disabled={selectedUsers.length === 0 || !selectedProfile}
          >
            Nadaj dostęp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
