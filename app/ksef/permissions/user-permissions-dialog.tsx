"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Users, Shield } from "lucide-react"

// Poprawmy interfejs, aby był spójny
interface UserPermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: any // Zmieniam nazwę z userData na user, aby była spójna z przekazywaniem w page.tsx
  userData?: any // Zostawiam dla kompatybilności wstecznej
  permissions?: any[]
  groups?: any[]
  profiles?: any[]
  onSave?: () => void
}

export function UserPermissionsDialog({
  open,
  onOpenChange,
  user,
  userData, // Obsługujemy oba propsy dla kompatybilności
  permissions: propPermissions,
  groups: propGroups,
  profiles: propProfiles,
  onSave,
}: UserPermissionsDialogProps) {
  // Używamy user lub userData, cokolwiek jest dostępne
  const userInfo = user || userData

  const [activeTab, setActiveTab] = useState("profile")
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  // Dodajemy flagę, aby zapobiec nieskończonej pętli aktualizacji
  const [initialSetupDone, setInitialSetupDone] = useState(false)

  // Stan dla danych załadowanych z API
  const [loading, setLoading] = useState(true)
  const [apiProfiles, setApiProfiles] = useState<any[]>([])
  const [apiGroups, setApiGroups] = useState<any[]>([]) 
  const [apiPermissions, setApiPermissions] = useState<any[]>([])

  // Funkcja do ładowania danych z API
  const loadApiData = async () => {
    try {
      setLoading(true)
      
      // Załaduj profile z API
      const profilesResponse = await fetch('http://localhost:8110/api/profiles')
      const profilesData = await profilesResponse.json()
      const ksefProfiles = profilesData.profiles.filter((p: any) => 
        p.applications.includes('ksef')
      ).map((p: any) => ({
        id: p.profile_id,
        name: p.profile_name,
        description: p.description
      }))
      setApiProfiles(ksefProfiles)
      
      // Profile = Grupy w KSEF
      setApiGroups(ksefProfiles)
      
      // Załaduj uprawnienia z userInfo (z API call dla użytkownika)
      if (userInfo?.rolePermissions && userInfo.rolePermissions.length > 0) {
        const allPermissions = userInfo.rolePermissions[0]?.permissions || []
        const formattedPermissions = allPermissions.map((perm: any) => ({
          id: perm.permission_id,
          name: perm.description,
          description: perm.description
        }))
        setApiPermissions(formattedPermissions)
      }
      
    } catch (error) {
      console.error('Błąd ładowania danych z API:', error)
    } finally {
      setLoading(false)
    }
  }

  // Załaduj dane z API gdy dialog się otwiera
  useEffect(() => {
    if (open && userInfo) {
      loadApiData()
    }
  }, [open, userInfo])

  // Używamy przekazanych danych lub danych z API
  const profiles = propProfiles || apiProfiles
  const groups = propGroups || apiGroups
  const permissions = propPermissions || apiPermissions

  // Funkcja do normalizacji nazw - usuwa polskie znaki dla porównania
  const normalizeProfileName = (name: string): string => {
    return name
      .replace(/ą/g, 'a')
      .replace(/ć/g, 'c')
      .replace(/ę/g, 'e')
      .replace(/ł/g, 'l')
      .replace(/ń/g, 'n')
      .replace(/ó/g, 'o')
      .replace(/ś/g, 's')
      .replace(/ź/g, 'z')
      .replace(/ż/g, 'z')
      .replace(/Ą/g, 'A')
      .replace(/Ć/g, 'C')
      .replace(/Ę/g, 'E')
      .replace(/Ł/g, 'L')
      .replace(/Ń/g, 'N')
      .replace(/Ó/g, 'O')
      .replace(/Ś/g, 'S')
      .replace(/Ź/g, 'Z')
      .replace(/Ż/g, 'Z')
  }

  // Resetuj stan przy otwarciu/zamknięciu dialogu
  useEffect(() => {
    if (open) {
      setInitialSetupDone(false)
    }
  }, [open])

  // Aktualizuj wybrane wartości, gdy zmienia się userInfo - tylko raz przy otwarciu dialogu
  useEffect(() => {
    if (userInfo && open && !initialSetupDone && !loading) {
      console.log("Inicjalizacja danych użytkownika:", userInfo)

      // Znajdź profil użytkownika używając UUID
      if (userInfo.profile_id) {
        const userProfile = profiles.find((p) => p.id === userInfo.profile_id)
        if (userProfile) {
          setSelectedProfile(userProfile.id)
        }
      }

      // Ustaw grupy na podstawie profilu użytkownika (grupa = profil w KSEF)
      if (userInfo.profile_id) {
        const profileGroup = groups.find((g) => g.id === userInfo.profile_id)
        if (profileGroup) {
          setSelectedGroups([profileGroup.id])
        }
      }

      // Ustaw uprawnienia na podstawie rzeczywistych role_mappings z bazy danych
      if (userInfo.rolePermissions && Array.isArray(userInfo.rolePermissions)) {
        console.log("Role mappings z bazy:", userInfo.rolePermissions)
        
        // Mapuj uprawnienia z bazy na ID z interfejsu - używaj prawdziwych UUID
        const permissionIds: string[] = []
        userInfo.rolePermissions.forEach((roleMapping: any) => {
          if (roleMapping.permissions && Array.isArray(roleMapping.permissions)) {
            roleMapping.permissions.forEach((perm: any) => {
              if (perm.permission_id) {
                permissionIds.push(perm.permission_id)
              }
            })
          }
        })
        setSelectedPermissions(permissionIds)
      } else {
        // Brak role_mappings - pusta lista uprawnień
        setSelectedPermissions([])
      }

      // Oznacz, że początkowa konfiguracja została zakończona
      setInitialSetupDone(true)
    }
  }, [userInfo, apiProfiles, apiGroups, apiPermissions, open, initialSetupDone, loading])

  // Obsługa zmiany profilu
  const handleProfileChange = (profileId: string) => {
    setSelectedProfile(profileId)

    const selectedProfileObj = profiles.find((p) => p.id === profileId)
    if (selectedProfileObj) {
      // Znajdź odpowiednią grupę (grupa = profil w KSEF)
      const profileGroup = groups.find((g) => g.id === profileId)
      if (profileGroup) {
        setSelectedGroups([profileGroup.id])
      } else {
        setSelectedGroups([])
      }

      // Dla nowego profilu - trzeba by załadować uprawnienia z API
      // Na razie zostawiamy puste - to będzie zależało od implementacji
      setSelectedPermissions([])
    }
  }

  const handleToggleGroup = (id: string) => {
    // Sprawdź, czy grupa jest już wybrana
    const isSelected = selectedGroups.includes(id)

    // Aktualizuj wybrane grupy
    if (isSelected) {
      setSelectedGroups(selectedGroups.filter((groupId) => groupId !== id))
    } else {
      setSelectedGroups([...selectedGroups, id])
      // W przyszłości tu będziemy ładować uprawnienia dla tej grupy
    }
  }

  const handleTogglePermission = (id: string) => {
    if (selectedPermissions.includes(id)) {
      setSelectedPermissions(selectedPermissions.filter((permId) => permId !== id))
    } else {
      setSelectedPermissions([...selectedPermissions, id])
    }
  }

  const handleSave = () => {
    if (onSave) {
      onSave()
    }
    onOpenChange(false)
  }

  // Jeśli userInfo jest undefined, użyj domyślnych wartości
  const userName = userInfo?.name || "Użytkownik"
  const userEmail = userInfo?.email || "brak@email.com"
  const userStatus = userInfo?.status || "Nieaktywny"
  const userProfile = userInfo?.profile || "Brak profilu"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-quicksand">
            Zarządzanie uprawnieniami użytkownika: {userName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informacje o użytkowniku - usunięto pole Rola */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Email:</p>
                <p className="font-medium">{userEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status:</p>
                <Badge
                  className={
                    userStatus === "Aktywny"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-gray-100 text-gray-800 border-gray-200"
                  }
                >
                  {userStatus}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Profil:</p>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">{userProfile}</Badge>
              </div>
            </div>
          </div>

          {/* Zakładki dla różnych metod nadawania uprawnień */}
          <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 grid grid-cols-3">
              <TabsTrigger value="profile" className="font-quicksand">
                <User className="h-4 w-4 mr-2" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="groups" className="font-quicksand">
                <Users className="h-4 w-4 mr-2" />
                Role
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
                <Select value={selectedProfile || ""} onValueChange={handleProfileChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Wybierz profil" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProfile && (
                  <div className="mt-4 p-3 bg-white rounded border">
                    <h4 className="font-medium">Opis profilu:</h4>
                    <p className="text-sm text-gray-600">
                      {profiles.find((p) => p.id === selectedProfile)?.description}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="groups" className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  Przypisanie do ról pozwala na nadanie uprawnień związanych z konkretnymi obszarami funkcjonalnymi.
                  Możesz wybrać jedną lub więcej ról.
                </p>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Wybierz</TableHead>
                        <TableHead>Nazwa roli</TableHead>
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
                  Bezpośrednie uprawnienia pozwalają na precyzyjne określenie, do jakich funkcji systemu użytkownik
                  będzie miał dostęp. Ta metoda daje największą kontrolę.
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
          <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand" onClick={handleSave}>
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
