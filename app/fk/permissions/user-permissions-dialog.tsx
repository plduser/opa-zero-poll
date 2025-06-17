"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, Building, Database } from "lucide-react"
import { Input } from "@/components/ui/input"

interface User {
  id: number
  name: string
  email: string
  role: string
  profile: string | null
  lastLogin: string
}

interface Permission {
  id: string
  name: string
  description: string
  module: string
  granted: boolean
  source: "direct" | "profile" | null
}

interface Company {
  id: string
  name: string
  nip: string
  granted: boolean
}

interface Dictionary {
  id: string
  name: string
  granted: boolean
  permissions: {
    id: string
    name: string
    granted: boolean
  }[]
}

interface UserPermissionsDialogProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function UserPermissionsDialog({ user, isOpen, onClose, onSuccess }: UserPermissionsDialogProps) {
  const [activeTab, setActiveTab] = useState("permissions")
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string | null>(user.profile)
  const [historyEntries, setHistoryEntries] = useState<
    {
      date: string
      user: string
      action: string
      details: string
    }[]
  >([])

  // Symulacja pobierania danych
  useEffect(() => {
    // Przykładowe uprawnienia
    const samplePermissions: Permission[] = [
      {
        id: "view_documents",
        name: "Przeglądanie dokumentów",
        description: "Możliwość przeglądania dokumentów księgowych",
        module: "Dokumenty księgowe",
        granted: true,
        source: "profile",
      },
      {
        id: "create_documents",
        name: "Tworzenie dokumentów",
        description: "Możliwość tworzenia nowych dokumentów księgowych",
        module: "Dokumenty księgowe",
        granted: true,
        source: "direct",
      },
      {
        id: "edit_documents",
        name: "Edycja dokumentów",
        description: "Możliwość edycji istniejących dokumentów księgowych",
        module: "Dokumenty księgowe",
        granted: false,
        source: null,
      },
      {
        id: "approve_documents",
        name: "Zatwierdzanie dokumentów",
        description: "Możliwość zatwierdzania dokumentów księgowych",
        module: "Dokumenty księgowe",
        granted: true,
        source: "profile",
      },
      {
        id: "post_documents",
        name: "Księgowanie dokumentów",
        description: "Możliwość księgowania dokumentów",
        module: "Dokumenty księgowe",
        granted: false,
        source: null,
      },
      {
        id: "view_reports",
        name: "Przeglądanie raportów",
        description: "Możliwość przeglądania raportów finansowych",
        module: "Raporty",
        granted: true,
        source: "profile",
      },
      {
        id: "create_reports",
        name: "Tworzenie raportów",
        description: "Możliwość tworzenia nowych raportów",
        module: "Raporty",
        granted: true,
        source: "direct",
      },
      {
        id: "export_reports",
        name: "Eksport raportów",
        description: "Możliwość eksportowania raportów do różnych formatów",
        module: "Raporty",
        granted: true,
        source: "profile",
      },
      {
        id: "view_payments",
        name: "Przeglądanie rozrachunków",
        description: "Możliwość przeglądania rozrachunków",
        module: "Rozrachunki",
        granted: true,
        source: "profile",
      },
      {
        id: "create_payments",
        name: "Tworzenie płatności",
        description: "Możliwość tworzenia nowych płatności",
        module: "Rozrachunki",
        granted: false,
        source: null,
      },
    ]

    // Przykładowe firmy
    const sampleCompanies: Company[] = [
      {
        id: "company1",
        name: "CD Projekt Red S.A.",
        nip: "1234567890",
        granted: true,
      },
      {
        id: "company2",
        name: "Platige Image S.A.",
        nip: "0987654321",
        granted: true,
      },
      {
        id: "company3",
        name: "Techland Sp. z o.o.",
        nip: "1122334455",
        granted: false,
      },
      {
        id: "company4",
        name: "11 bit studios S.A.",
        nip: "5566778899",
        granted: true,
      },
      {
        id: "company5",
        name: "Bloober Team S.A.",
        nip: "9988776655",
        granted: false,
      },
    ]

    // Przykładowe słowniki
    const sampleDictionaries: Dictionary[] = [
      {
        id: "dict1",
        name: "Kontrahenci",
        granted: true,
        permissions: [
          { id: "view", name: "Przeglądanie", granted: true },
          { id: "edit", name: "Edycja", granted: true },
          { id: "delete", name: "Usuwanie", granted: false },
        ],
      },
      {
        id: "dict2",
        name: "Plan kont",
        granted: true,
        permissions: [
          { id: "view", name: "Przeglądanie", granted: true },
          { id: "edit", name: "Edycja", granted: false },
          { id: "delete", name: "Usuwanie", granted: false },
        ],
      },
      {
        id: "dict3",
        name: "Waluty",
        granted: true,
        permissions: [
          { id: "view", name: "Przeglądanie", granted: true },
          { id: "edit", name: "Edycja", granted: true },
          { id: "delete", name: "Usuwanie", granted: true },
        ],
      },
      {
        id: "dict4",
        name: "Stawki VAT",
        granted: false,
        permissions: [
          { id: "view", name: "Przeglądanie", granted: false },
          { id: "edit", name: "Edycja", granted: false },
          { id: "delete", name: "Usuwanie", granted: false },
        ],
      },
    ]

    // Przykładowa historia zmian
    const sampleHistory = [
      {
        date: "2023-05-15 14:30",
        user: "Administrator",
        action: "Nadanie uprawnienia",
        details: "Tworzenie dokumentów",
      },
      {
        date: "2023-05-14 10:15",
        user: "Administrator",
        action: "Zmiana profilu",
        details: "Z 'Podstawowy' na 'Księgowość'",
      },
      {
        date: "2023-05-10 09:45",
        user: "Administrator",
        action: "Nadanie dostępu do firmy",
        details: "CD Projekt Red S.A.",
      },
      {
        date: "2023-05-05 11:20",
        user: "Administrator",
        action: "Utworzenie konta",
        details: "Utworzenie konta użytkownika",
      },
    ]

    setPermissions(samplePermissions)
    setCompanies(sampleCompanies)
    setDictionaries(sampleDictionaries)
    setHistoryEntries(sampleHistory)
  }, [user.id])

  // Obsługa zmiany profilu
  useEffect(() => {
    setSelectedProfile(user.profile)
  }, [user.profile])

  const handleSave = () => {
    // Tutaj logika zapisywania zmian
    onSuccess()
    onClose()
  }

  const handleTogglePermission = (permissionId: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === permissionId ? { ...p, granted: !p.granted, source: "direct" } : p)),
    )
  }

  const handleToggleCompany = (companyId: string) => {
    setCompanies((prev) => prev.map((c) => (c.id === companyId ? { ...c, granted: !c.granted } : c)))
  }

  const handleToggleDictionary = (dictionaryId: string) => {
    setDictionaries((prev) =>
      prev.map((d) =>
        d.id === dictionaryId
          ? {
              ...d,
              granted: !d.granted,
              permissions: d.permissions.map((p) => ({ ...p, granted: !d.granted })),
            }
          : d,
      ),
    )
  }

  const handleToggleDictionaryPermission = (dictionaryId: string, permissionId: string) => {
    setDictionaries((prev) =>
      prev.map((d) =>
        d.id === dictionaryId
          ? {
              ...d,
              permissions: d.permissions.map((p) => (p.id === permissionId ? { ...p, granted: !p.granted } : p)),
            }
          : d,
      ),
    )
  }

  const handleProfileChange = (profile: string) => {
    setSelectedProfile(profile)
    // Tutaj logika aktualizacji uprawnień na podstawie profilu
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Uprawnienia użytkownika: {user.name}</DialogTitle>
          <DialogDescription>
            {user.email} | Rola: {user.role}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Profil</label>
            <div className="flex gap-2">
              <select
                className="flex-1 h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={selectedProfile || ""}
                onChange={(e) => handleProfileChange(e.target.value)}
              >
                <option value="">Brak profilu</option>
                <option value="Pełny dostęp">Pełny dostęp</option>
                <option value="Księgowość">Księgowość</option>
                <option value="Kontroling">Kontroling</option>
                <option value="Raportowanie">Raportowanie</option>
                <option value="Zarządzanie">Zarządzanie</option>
                <option value="Podatki">Podatki</option>
                <option value="Płace">Płace</option>
              </select>
              <Button variant="outline">Zarządzaj profilami</Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[calc(100%-60px)]">
            <TabsList className="mb-4">
              <TabsTrigger value="permissions" className="font-quicksand">
                <Shield className="h-4 w-4 mr-2" />
                Uprawnienia
              </TabsTrigger>
              <TabsTrigger value="companies" className="font-quicksand">
                <Building className="h-4 w-4 mr-2" />
                Firmy
              </TabsTrigger>
              <TabsTrigger value="dictionaries" className="font-quicksand">
                <Database className="h-4 w-4 mr-2" />
                Słowniki
              </TabsTrigger>
              <TabsTrigger value="history" className="font-quicksand">
                Historia zmian
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto">
              <TabsContent value="permissions" className="mt-0 h-full">
                <div className="mb-4">
                  <Input type="text" placeholder="Wyszukaj uprawnienie" className="max-w-md" />
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Uprawnienie</TableHead>
                        <TableHead>Moduł</TableHead>
                        <TableHead>Źródło</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <Checkbox
                              checked={permission.granted}
                              onCheckedChange={() => handleTogglePermission(permission.id)}
                              disabled={permission.source === "profile"}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{permission.name}</div>
                              <div className="text-sm text-gray-500">{permission.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>{permission.module}</TableCell>
                          <TableCell>
                            {permission.source === "profile"
                              ? "Z profilu"
                              : permission.source === "direct"
                                ? "Bezpośrednie"
                                : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="companies" className="mt-0 h-full">
                <div className="mb-4">
                  <Input type="text" placeholder="Wyszukaj firmę" className="max-w-md" />
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Firma</TableHead>
                        <TableHead>NIP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell>
                            <Checkbox
                              checked={company.granted}
                              onCheckedChange={() => handleToggleCompany(company.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{company.name}</TableCell>
                          <TableCell>{company.nip}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="dictionaries" className="mt-0 h-full">
                <div className="mb-4">
                  <Input type="text" placeholder="Wyszukaj słownik" className="max-w-md" />
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Słownik</TableHead>
                        <TableHead>Przeglądanie</TableHead>
                        <TableHead>Edycja</TableHead>
                        <TableHead>Usuwanie</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dictionaries.map((dictionary) => (
                        <TableRow key={dictionary.id}>
                          <TableCell>
                            <Checkbox
                              checked={dictionary.granted}
                              onCheckedChange={() => handleToggleDictionary(dictionary.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{dictionary.name}</TableCell>
                          {dictionary.permissions.map((permission) => (
                            <TableCell key={permission.id}>
                              <Checkbox
                                checked={permission.granted}
                                onCheckedChange={() => handleToggleDictionaryPermission(dictionary.id, permission.id)}
                                disabled={!dictionary.granted}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0 h-full">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Użytkownik</TableHead>
                        <TableHead>Akcja</TableHead>
                        <TableHead>Szczegóły</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyEntries.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell>{entry.user}</TableCell>
                          <TableCell>{entry.action}</TableCell>
                          <TableCell>{entry.details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
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
