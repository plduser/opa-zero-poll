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

interface ProfilesTabProps {
  onSuccess: () => void
}

// Profile użytkowników (specyficzne dla FK)
const profilesData = [
  { id: 1, name: "Administrator FK", description: "Pełny dostęp do systemu FK", groupsCount: 3 },
  { id: 2, name: "Księgowy", description: "Dostęp do funkcji księgowych", groupsCount: 2 },
  { id: 3, name: "Analityk finansowy", description: "Dostęp do funkcji analitycznych", groupsCount: 1 },
  { id: 4, name: "Kontroler finansowy", description: "Dostęp do funkcji kontrolingowych", groupsCount: 2 },
  { id: 5, name: "Dyrektor finansowy", description: "Dostęp zarządczy", groupsCount: 3 },
  { id: 6, name: "Specjalista ds. podatków", description: "Dostęp do funkcji podatkowych", groupsCount: 1 },
]

// Grupy uprawnień (specyficzne dla FK)
const groupsData = [
  { id: 1, name: "ADMINISTRATOR FK", category: "Administracja", usersCount: 2 },
  { id: 2, name: "KSIĘGOWI", category: "Księgowość", usersCount: 8 },
  { id: 3, name: "ANALITYCY", category: "Raportowanie", usersCount: 6 },
  { id: 4, name: "KONTROLERZY", category: "Kontroling", usersCount: 3 },
  { id: 5, name: "KADRA ZARZĄDZAJĄCA", category: "Zarządzanie", usersCount: 4 },
  { id: 6, name: "DZIAŁ PODATKOWY", category: "Podatki", usersCount: 5 },
  { id: 7, name: "AUDYTORZY", category: "Audyt", usersCount: 2 },
  { id: 8, name: "DZIAŁ PŁAC", category: "Płace", usersCount: 3 },
]

export function ProfilesTab({ onSuccess }: ProfilesTabProps) {
  const [profiles, setProfiles] = useState(profilesData)
  const [searchQuery, setSearchQuery] = useState("")
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isNewProfile, setIsNewProfile] = useState(false)
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [selectedGroups, setSelectedGroups] = useState<number[]>([])
  const [profileName, setProfileName] = useState("")
  const [profileDescription, setProfileDescription] = useState("")

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddProfile = () => {
    setIsNewProfile(true)
    setCurrentProfile(null)
    setProfileName("")
    setProfileDescription("")
    setSelectedGroups([])
    setIsProfileDialogOpen(true)
  }

  const handleEditProfile = (profile: any) => {
    setIsNewProfile(false)
    setCurrentProfile(profile)
    setProfileName(profile.name)
    setProfileDescription(profile.description)

    // Symulacja pobrania grup przypisanych do profilu
    if (profile.name === "Administrator FK") {
      setSelectedGroups([1, 7, 8])
    } else if (profile.name === "Księgowy") {
      setSelectedGroups([2])
    } else if (profile.name === "Analityk finansowy") {
      setSelectedGroups([3])
    } else if (profile.name === "Kontroler finansowy") {
      setSelectedGroups([4])
    } else if (profile.name === "Dyrektor finansowy") {
      setSelectedGroups([5])
    } else if (profile.name === "Specjalista ds. podatków") {
      setSelectedGroups([6])
    } else {
      setSelectedGroups([])
    }

    setIsProfileDialogOpen(true)
  }

  const handleToggleGroup = (groupId: number) => {
    setSelectedGroups((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]))
  }

  const handleSaveProfile = () => {
    // Tutaj byłaby logika zapisywania profilu
    setIsProfileDialogOpen(false)
    onSuccess()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative w-[320px]">
          <Input
            type="text"
            placeholder="Wyszukaj profil"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-300"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
        </div>
        <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand" onClick={handleAddProfile}>
          <Plus className="mr-2 h-4 w-4" /> Dodaj profil
        </Button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa profilu</TableHead>
              <TableHead>Opis</TableHead>
              <TableHead>Liczba grup</TableHead>
              <TableHead className="text-right">Akcje</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProfiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell className="font-medium">{profile.name}</TableCell>
                <TableCell>{profile.description}</TableCell>
                <TableCell>{profile.groupsCount}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditProfile(profile)}
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

      {/* Dialog dodawania/edycji profilu */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {isNewProfile ? "Dodaj nowy profil" : `Edycja profilu: ${currentProfile?.name}`}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Informacje</TabsTrigger>
              <TabsTrigger value="groups">Grupy</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Nazwa profilu</Label>
                  <Input id="profile-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-description">Opis</Label>
                  <Textarea
                    id="profile-description"
                    value={profileDescription}
                    onChange={(e) => setProfileDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="groups" className="space-y-4">
              <div className="relative w-full max-w-sm mb-4">
                <Input type="text" placeholder="Wyszukaj grupę" className="pl-10" />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {groupsData.map((group) => (
                    <div key={group.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={selectedGroups.includes(group.id)}
                        onCheckedChange={() => handleToggleGroup(group.id)}
                      />
                      <div>
                        <Label htmlFor={`group-${group.id}`} className="font-medium cursor-pointer">
                          {group.name}
                        </Label>
                        <p className="text-sm text-gray-500">{group.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
              Anuluj
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSaveProfile}>
              {isNewProfile ? "Utwórz profil" : "Zapisz zmiany"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
