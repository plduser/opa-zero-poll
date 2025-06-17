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
import { Shield, Building, Database, Users, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Group {
  id: number
  name: string
  description: string
  membersCount: number
}

interface Permission {
  id: string
  name: string
  description: string
  module: string
  granted: boolean
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

interface GroupPermissionsDialogProps {
  group: Group
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function GroupPermissionsDialog({ group, isOpen, onClose, onSuccess }: GroupPermissionsDialogProps) {
  const [activeTab, setActiveTab] = useState("info")
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([])
  const [groupName, setGroupName] = useState(group.name)
  const [groupDescription, setGroupDescription] = useState(group.description || "")
  const [historyEntries, setHistoryEntries] = useState<
    {
      date: string
      user: string
      action: string
      details: string
    }[]
  >([])

  // Aktualizacja danych grupy przy zmianie props
  useEffect(() => {
    setGroupName(group.name)
    setGroupDescription(group.description || "")
  }, [group])

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
      },
      {
        id: "create_documents",
        name: "Tworzenie dokumentów",
        description: "Możliwość tworzenia nowych dokumentów księgowych",
        module: "Dokumenty księgowe",
        granted: true,
      },
      {
        id: "edit_documents",
        name: "Edycja dokumentów",
        description: "Możliwość edycji istniejących dokumentów księgowych",
        module: "Dokumenty księgowe",
        granted: false,
      },
      {
        id: "approve_documents",
        name: "Zatwierdzanie dokumentów",
        description: "Możliwość zatwierdzania dokumentów księgowych",
        module: "Dokumenty księgowe",
        granted: true,
      },
      {
        id: "post_documents",
        name: "Księgowanie dokumentów",
        description: "Możliwość księgowania dokumentów",
        module: "Dokumenty księgowe",
        granted: false,
      },
      {
        id: "view_reports",
        name: "Przeglądanie raportów",
        description: "Możliwość przeglądania raportów finansowych",
        module: "Raporty",
        granted: true,
      },
      {
        id: "create_reports",
        name: "Tworzenie raportów",
        description: "Możliwość tworzenia nowych raportów",
        module: "Raporty",
        granted: true,
      },
      {
        id: "export_reports",
        name: "Eksport raportów",
        description: "Możliwość eksportowania raportów do różnych formatów",
        module: "Raporty",
        granted: true,
      },
      {
        id: "view_payments",
        name: "Przeglądanie rozrachunków",
        description: "Możliwość przeglądania rozrachunków",
        module: "Rozrachunki",
        granted: true,
      },
      {
        id: "create_payments",
        name: "Tworzenie płatności",
        description: "Możliwość tworzenia nowych płatności",
        module: "Rozrachunki",
        granted: false,
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

    // Przykładowe słowniki z rozbudowanym zestawem uprawnień
    const sampleDictionaries: Dictionary[] = [
      {
        id: "dict1",
        name: "Kontrahenci",
        granted: true,
        permissions: [
          { id: "view", name: "Przeglądanie", granted: true },
          { id: "edit", name: "Edycja", granted: true },
          { id: "delete", name: "Usuwanie", granted: false },
          { id: "import", name: "Import", granted: true },
          { id: "export", name: "Eksport", granted: true },
          { id: "manage_access", name: "Zarządzanie dostępem", granted: false },
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
          { id: "import", name: "Import", granted: false },
          { id: "export", name: "Eksport", granted: true },
          { id: "manage_access", name: "Zarządzanie dostępem", granted: false },
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
          { id: "import", name: "Import", granted: true },
          { id: "export", name: "Eksport", granted: true },
          { id: "manage_access", name: "Zarządzanie dostępem", granted: false },
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
          { id: "import", name: "Import", granted: false },
          { id: "export", name: "Eksport", granted: false },
          { id: "manage_access", name: "Zarządzanie dostępem", granted: false },
        ],
      },
      {
        id: "dict5",
        name: "Typy dokumentów",
        granted: true,
        permissions: [
          { id: "view", name: "Przeglądanie", granted: true },
          { id: "edit", name: "Edycja", granted: true },
          { id: "delete", name: "Usuwanie", granted: false },
          { id: "import", name: "Import", granted: true },
          { id: "export", name: "Eksport", granted: true },
          { id: "manage_access", name: "Zarządzanie dostępem", granted: false },
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
        action: "Zmiana nazwy grupy",
        details: "Z 'Księgowi' na 'Księgowi główni'",
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
        action: "Utworzenie grupy",
        details: "Utworzenie grupy",
      },
    ]

    setPermissions(samplePermissions)
    setCompanies(sampleCompanies)
    setDictionaries(sampleDictionaries)
    setHistoryEntries(sampleHistory)
  }, [group.id])

  const handleSave = () => {
    // Tutaj logika zapisywania zmian
    onSuccess()
    onClose()
  }

  const handleTogglePermission = (permissionId: string) => {
    setPermissions((prev) => prev.map((p) => (p.id === permissionId ? { ...p, granted: !p.granted } : p)))
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Uprawnienia grupy: {group.name}
          </DialogTitle>
          <DialogDescription>
            {group.description} | Liczba członków: {group.membersCount}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-[calc(100%-20px)]">
            <TabsList className="mb-4">
              <TabsTrigger value="info" className="font-quicksand">
                <Info className="h-4 w-4 mr-2" />
                Informacje
              </TabsTrigger>
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
              <TabsContent value="info" className="mt-0 h-full space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Nazwa grupy</Label>
                    <Input id="group-name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group-description">Opis</Label>
                    <Textarea
                      id="group-description"
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </TabsContent>

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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <Checkbox
                              checked={permission.granted}
                              onCheckedChange={() => handleTogglePermission(permission.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{permission.name}</div>
                              <div className="text-sm text-gray-500">{permission.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>{permission.module}</TableCell>
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
                        <TableHead>Import</TableHead>
                        <TableHead>Eksport</TableHead>
                        <TableHead>Zarządzanie dostępem</TableHead>
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
