"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

type ProfileType = {
  id: number
  name: string
  description: string
  usersCount: number
}

export function ProfilesTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<ProfileType | null>(null)

  // Przykładowe dane profili
  const profiles: ProfileType[] = [
    {
      id: 1,
      name: "Administrator",
      description: "Profil administratora portalu",
      usersCount: 2,
    },
    {
      id: 2,
      name: "Użytkownik",
      description: "Profil standardowego użytkownika portalu",
      usersCount: 15,
    },
  ]

  const filteredProfiles = profiles.filter((profile) => profile.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleEditProfile = (profile: ProfileType) => {
    setSelectedProfile(profile)
    setIsEditProfileDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Wyszukaj profil"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
          onClick={() => {
            setSelectedProfile(null)
            setIsEditProfileDialogOpen(true)
          }}
        >
          <Plus className="h-5 w-5 mr-2" /> Dodaj profil
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa profilu</TableHead>
              <TableHead>Opis</TableHead>
              <TableHead>Liczba użytkowników</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">{profile.name}</TableCell>
                <TableCell>{profile.description}</TableCell>
                <TableCell>{profile.usersCount}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditProfile(profile)}
                      title="Edytuj profil"
                    >
                      <Edit className="h-5 w-5 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Usuń profil">
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredProfiles.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                  Brak wyników wyszukiwania
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditProfileDialogOpen} onOpenChange={setIsEditProfileDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-quicksand">
              {selectedProfile ? "Edycja profilu" : "Dodaj nowy profil"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="profile-name">Nazwa profilu</Label>
              <Input
                id="profile-name"
                defaultValue={selectedProfile?.name || ""}
                placeholder="Wprowadź nazwę profilu"
              />
            </div>
            <div>
              <Label htmlFor="profile-description">Opis</Label>
              <Input
                id="profile-description"
                defaultValue={selectedProfile?.description || ""}
                placeholder="Wprowadź opis profilu"
              />
            </div>

            <div className="space-y-2">
              <Label>Przypisane grupy</Label>
              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="group-admin" defaultChecked={selectedProfile?.name === "Administrator"} />
                  <Label htmlFor="group-admin">Administrator</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="group-user" defaultChecked={selectedProfile?.name === "Użytkownik"} />
                  <Label htmlFor="group-user">Użytkownik</Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-green-600 text-green-600 font-quicksand"
              onClick={() => setIsEditProfileDialogOpen(false)}
            >
              Anuluj
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
              onClick={() => setIsEditProfileDialogOpen(false)}
            >
              Zapisz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
