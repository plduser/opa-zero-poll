"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, UserPlus, Users, Shield, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  items: any[]
  onSave: () => void
}

export function AccessDialog({ open, onOpenChange, title, items, onSave }: AccessDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [selectedProfile, setSelectedProfile] = useState<string>("")
  const [activeTab, setActiveTab] = useState("profile")
  const [selectedGroups, setSelectedGroups] = useState<number[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])

  // Profile dla aplikacji KSEF zgodnie z matrycą uprawnień
  const profiles = [
    { id: 1, name: "Księgowa", description: "Dostęp do pełnej funkcjonalności faktur, bez zarządzania użytkownikami" },
    { id: 2, name: "Handlowiec", description: "Dostęp do faktur sprzedażowych i podstawowych funkcji" },
    { id: 3, name: "Zakupowiec", description: "Dostęp do faktur zakupowych i podstawowych funkcji" },
    { id: 4, name: "Administrator", description: "Pełne uprawnienia administracyjne do systemu KSEF" },
    { id: 5, name: "Właściciel", description: "Pełny dostęp do wszystkich funkcji systemu KSEF" },
  ]

  // Przykładowe grupy
  const groups = [
    {
      id: 1,
      name: "Administrator KSEF",
      description: "Pełne uprawnienia do zarządzania systemem KSEF",
    },
    {
      id: 2,
      name: "Wystawiający faktury",
      description: "Uprawnienia do wystawiania faktur w systemie KSEF",
    },
    {
      id: 3,
      name: "Odbierający faktury",
      description: "Uprawnienia do odbierania faktur z systemu KSEF",
    },
    {
      id: 4,
      name: "Przeglądający",
      description: "Uprawnienia tylko do przeglądania danych w systemie KSEF",
    },
  ]

  // Przykładowe uprawnienia
  const permissions = [
    { id: 1, name: "Zarządzanie uprawnieniami", description: "Możliwość zarządzania uprawnieniami użytkowników" },
    { id: 2, name: "Odczyt uprawnień", description: "Możliwość przeglądania uprawnień użytkowników" },
    { id: 3, name: "Wystawianie faktur", description: "Możliwość wystawiania faktur w systemie KSEF" },
    { id: 4, name: "Odbieranie faktur", description: "Możliwość odbierania faktur z systemu KSEF" },
  ]

  const filteredUsers = items.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleToggleGroup = (id: number) => {
    if (selectedGroups.includes(id)) {
      setSelectedGroups(selectedGroups.filter((groupId) => groupId !== id))
    } else {
      setSelectedGroups([...selectedGroups, id])
    }
  }

  const handleTogglePermission = (id: number) => {
    if (selectedPermissions.includes(id)) {
      setSelectedPermissions(selectedPermissions.filter((permId) => permId !== id))
    } else {
      setSelectedPermissions([...selectedPermissions, id])
    }
  }

  const handleSave = () => {
    onSave()
    onOpenChange(false)
  }

  const canSave = () => {
    if (!selectedUser) return false

    // Sprawdź, czy wybrano jakąkolwiek opcję nadawania uprawnień
    switch (activeTab) {
      case "profile":
        return !!selectedProfile
      case "groups":
        return selectedGroups.length > 0
      case "permissions":
        return selectedPermissions.length > 0
      default:
        return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-quicksand">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sekcja wyboru użytkownika */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Wybierz użytkownika</h3>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Wyszukaj użytkownika..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-300"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
              </div>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Wybierz użytkownika" />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Alert className="bg-blue-50 border-blue-100">
            <AlertDescription className="text-blue-800">
              Wybierz jedną z poniższych opcji, aby nadać uprawnienia użytkownikowi. Wystarczy wybrać tylko jedną
              metodę.
            </AlertDescription>
          </Alert>

          {/* Zakładki dla różnych metod nadawania uprawnień */}
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 grid grid-cols-3">
              <TabsTrigger value="profile" className="font-quicksand">
                <User className="h-4 w-4 mr-2" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="groups" className="font-quicksand">
                <Users className="h-4 w-4 mr-2" />
                Grupy
              </TabsTrigger>
              <TabsTrigger value="permissions" className="font-quicksand">
                <Shield className="h-4 w-4 mr-2" />
                Bezpośrednie uprawnienia
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  Przypisanie profilu to najszybszy sposób nadania zestawu uprawnień. Profile zawierają predefiniowane
                  zestawy uprawnień odpowiednie dla różnych ról w systemie.
                </p>
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Wybierz profil" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id.toString()}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProfile && (
                  <div className="mt-4 p-3 bg-white rounded border">
                    <h4 className="font-medium">Opis profilu:</h4>
                    <p className="text-sm text-gray-600">
                      {profiles.find((p) => p.id.toString() === selectedProfile)?.description}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="groups" className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  Przypisanie do grup pozwala na nadanie uprawnień związanych z konkretnymi obszarami funkcjonalnymi.
                  Możesz wybrać jedną lub więcej grup.
                </p>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Wybierz</TableHead>
                        <TableHead>Nazwa grupy</TableHead>
                        <TableHead>Opis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groups.map((group) => (
                        <TableRow key={group.id} className={selectedGroups.includes(group.id) ? "bg-green-50" : ""}>
                          <TableCell>
                            <Checkbox
                              checked={selectedGroups.includes(group.id)}
                              onCheckedChange={() => handleToggleGroup(group.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{group.name}</TableCell>
                          <TableCell>{group.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  Nadawanie bezpośrednich uprawnień pozwala na precyzyjne określenie, do jakich funkcji systemu
                  użytkownik będzie miał dostęp. Ta metoda daje największą kontrolę.
                </p>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Wybierz</TableHead>
                        <TableHead>Uprawnienie</TableHead>
                        <TableHead>Opis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission) => (
                        <TableRow
                          key={permission.id}
                          className={selectedPermissions.includes(permission.id) ? "bg-green-50" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedPermissions.includes(permission.id)}
                              onCheckedChange={() => handleTogglePermission(permission.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{permission.name}</TableCell>
                          <TableCell>{permission.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
            onClick={handleSave}
            disabled={!canSave()}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Nadaj dostęp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
