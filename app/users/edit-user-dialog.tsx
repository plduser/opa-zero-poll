"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface UserType {
  id: number
  user_id?: string // API ID for backend operations
  name: string
  email: string
  phone: string
  companies: number
  permissions: string
  profiles: { app: string; name: string }[]
  status: boolean
}

interface UserCompanyAccess {
  company_id: string
  company_name: string
  assigned_date: string
  nip?: string
}

interface UserApplicationAccess {
  user_id: string
  app_id: string  
  app_name: string
  profile_id: string
  profile_name: string
  assigned_at: string
  assigned_by?: string
}

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserType | null
  onSave: (user: UserType) => void
  // Company access props
  userCompanyAccess: UserCompanyAccess[]
  loadingCompanyAccess: boolean
  onAddCompanyAccess: () => void
  onDeleteCompanyAccess: (access: UserCompanyAccess) => void
  // Application access props 
  userApplicationAccess: UserApplicationAccess[]
  loadingApplicationAccess: boolean
  onAddAppAccess: () => void
  onDeleteApplicationAccess: (access: UserApplicationAccess) => void
}

export function EditUserDialog({ 
  open, 
  onOpenChange, 
  user, 
  onSave,
  userCompanyAccess,
  loadingCompanyAccess,
  onAddCompanyAccess,
  onDeleteCompanyAccess,
  userApplicationAccess,
  loadingApplicationAccess,
  onAddAppAccess,
  onDeleteApplicationAccess
}: EditUserDialogProps) {
  const [editedUser, setEditedUser] = useState<UserType | null>(user)
  const [activeTab, setActiveTab] = useState("general")
  const [portalProfile, setPortalProfile] = useState("user")
  const [edokumentyProfile, setEdokumentyProfile] = useState("sekretariat")
  const [fkProfile, setFkProfile] = useState("ksiegowy")

  if (!user) return null

  const handleSave = () => {
    if (editedUser) {
      onSave(editedUser)
      onOpenChange(false)
    }
  }

  const handleChange = (field: keyof UserType, value: string | boolean) => {
    if (editedUser) {
      setEditedUser({ ...editedUser, [field]: value })
    }
  }

  // Przykładowe poziomy dostępu
  const accessLevels = [
    { id: 1, name: "Edycja", description: "Możliwość modyfikacji zasobu" },
    { id: 2, name: "Usuwanie", description: "Możliwość usuwania zasobu" },
    { id: 3, name: "Edycja atrybutów", description: "Możliwość modyfikacji atrybutów zasobu" },
    { id: 4, name: "Zmiana aktywności", description: "Możliwość zmiany stanu aktywności zasobu" },
    { id: 5, name: "Edycja elementów", description: "Możliwość modyfikacji elementów zasobu" },
    { id: 6, name: "Dodawanie", description: "Możliwość dodawania nowych elementów" },
    { id: 7, name: "Usuwanie", description: "Możliwość usuwania elementów" },
    { id: 8, name: "Udostępnianie", description: "Możliwość udostępniania zasobu innym użytkownikom" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-quicksand">Edycja użytkownika</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="general" className="font-quicksand">
              Dane ogólne
            </TabsTrigger>
            <TabsTrigger value="permissions" className="font-quicksand">
              Uprawnienia
            </TabsTrigger>
            <TabsTrigger value="companies" className="font-quicksand">
              Firmy
            </TabsTrigger>
            <TabsTrigger value="history" className="font-quicksand">
              Historia zmian
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Imię i nazwisko</Label>
                  <Input
                    id="name"
                    value={editedUser?.name || ""}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Adres e-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedUser?.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Rola</Label>
                  <div className="relative">
                    <select
                      id="role"
                      className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                      value={editedUser?.role || ""}
                      onChange={(e) => handleChange("role", e.target.value)}
                    >
                      <option value="admin">Administrator</option>
                      <option value="user">Użytkownik</option>
                      <option value="manager">Manager</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <div className="relative">
                    <select
                      id="status"
                      className="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                      value={editedUser?.status || ""}
                      onChange={(e) => handleChange("status", e.target.value)}
                    >
                      <option value="active">Aktywny</option>
                      <option value="inactive">Nieaktywny</option>
                      <option value="pending">Oczekujący</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox id="send-notification" />
                  <Label htmlFor="send-notification">Wyślij powiadomienie o zmianie</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="reset-password" />
                  <Label htmlFor="reset-password">Wymuś zmianę hasła przy następnym logowaniu</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Udostępnione aplikacje</h3>
                <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
                  Nadaj dostęp do aplikacji
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aplikacja</TableHead>
                      <TableHead>Profil</TableHead>
                      <TableHead>Data nadania</TableHead>
                      <TableHead>Akcje</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <img src="/app-icons/portal-icon.png" alt="Portal" className="w-6 h-6" />
                          <span>Portal użytkownika</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <select
                          className="w-full h-9 px-3 py-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                          value={portalProfile}
                          onChange={(e) => setPortalProfile(e.target.value)}
                        >
                          <option value="administrator">Administrator</option>
                          <option value="user">Użytkownik</option>
                        </select>
                      </TableCell>
                      <TableCell>2023-05-10</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                          Usuń
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <img src="/app-icons/edokumenty-icon.png" alt="eDokumenty" className="w-6 h-6" />
                          <span>eDokumenty</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <select
                          className="w-full h-9 px-3 py-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                          value={edokumentyProfile}
                          onChange={(e) => setEdokumentyProfile(e.target.value)}
                        >
                          <option value="administrator">Administrator</option>
                          <option value="sekretariat">Sekretariat</option>
                          <option value="pracownik">Pracownik</option>
                          <option value="przegladajacy">Przeglądający</option>
                        </select>
                      </TableCell>
                      <TableCell>2023-04-15</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                          Usuń
                        </Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <img src="/app-icons/fk-icon.png" alt="FK" className="w-6 h-6" />
                          <span>Finanse i Księgowość</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <select
                          className="w-full h-9 px-3 py-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                          value={fkProfile}
                          onChange={(e) => setFkProfile(e.target.value)}
                        >
                          <option value="administrator">Administrator</option>
                          <option value="ksiegowy">Księgowy</option>
                          <option value="glowny-ksiegowy">Główny Księgowy</option>
                          <option value="przegladajacy">Przeglądający</option>
                        </select>
                      </TableCell>
                      <TableCell>2023-03-20</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                          Usuń
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="companies">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Przypisane firmy</h3>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
                  onClick={onAddCompanyAccess}
                >
                  Nadaj dostęp do firm
                </Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nazwa firmy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NIP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data nadania
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Akcje
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadingCompanyAccess ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center">
                          Ładowanie dostępów do firm...
                        </td>
                      </tr>
                    ) : userCompanyAccess.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          Brak przypisanych dostępów do firm
                        </td>
                      </tr>
                    ) : (
                      userCompanyAccess.map((access) => (
                        <tr key={access.company_id}>
                          <td className="px-6 py-4 whitespace-nowrap">{access.company_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{access.nip || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{access.assigned_date}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-800"
                              onClick={() => onDeleteCompanyAccess(access)}
                            >
                              Usuń
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-4">
              <h3 className="font-medium">Historia zmian</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Użytkownik
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Zmiana
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">2023-05-10 14:32</td>
                      <td className="px-6 py-4 whitespace-nowrap">Administrator</td>
                      <td className="px-6 py-4">Zmiana roli z "Użytkownik" na "Manager"</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">2023-05-01 09:15</td>
                      <td className="px-6 py-4 whitespace-nowrap">Administrator</td>
                      <td className="px-6 py-4">Nadanie dostępu do firmy "CD Projekt Red S.A."</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">2023-04-15 11:20</td>
                      <td className="px-6 py-4 whitespace-nowrap">Administrator</td>
                      <td className="px-6 py-4">Nadanie dostępu do firmy "Techland Sp. z o.o."</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">2023-04-01 10:00</td>
                      <td className="px-6 py-4 whitespace-nowrap">System</td>
                      <td className="px-6 py-4">Utworzenie konta</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
