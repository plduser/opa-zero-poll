"use client"

import { useState } from "react"
import {
  ChevronDown,
  Settings,
  FileText,
  Users,
  Briefcase,
  Database,
  Plus,
  Search,
  Lock,
  UserCog,
  UserPlus,
  Shield,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Header } from "@/app/components/header"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { UsersTab } from "./tabs/users-tab"
import { GroupsTab } from "./tabs/groups-tab"
import { ProfilesTab } from "./tabs/profiles-tab"
import { PermissionDefinitionsTab } from "./tabs/permission-definitions-tab"

export default function EdokumentyPage() {
  const [selectedTab, setSelectedTab] = useState("documents")
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState("users")
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(true)

  const [accessDialogTitle, setAccessDialogTitle] = useState("")
  const [accessDialogItems, setAccessDialogItems] = useState<any[]>([])

  const users = [
    { id: 1, name: "Jan Kowalski", email: "jan.kowalski@example.com" },
    { id: 2, name: "Anna Nowak", email: "anna.nowak@example.com" },
    { id: 3, name: "Piotr Wiśniewski", email: "piotr.wisniewski@example.com" },
    { id: 4, name: "Magdalena Dąbrowska", email: "magdalena.dabrowska@example.com" },
    { id: 5, name: "Tomasz Lewandowski", email: "tomasz.lewandowski@example.com" },
  ]

  const groups = [
    { id: 1, name: "ADMINISTRATOR", description: "Pełny dostęp do systemu" },
    { id: 2, name: "DOSTĘP DO KLIENTÓW", description: "Dostęp do modułu klientów" },
    { id: 3, name: "DOSTĘP DO SPRAW", description: "Dostęp do modułu spraw" },
    { id: 4, name: "SEKRETARIAT", description: "Uprawnienia dla sekretariatu" },
    { id: 5, name: "EDYCJA DOKUMENTÓW", description: "Możliwość edycji dokumentów" },
  ]

  const documents = [
    { id: 1, name: "Faktura VAT 2023/05/123", type: "Faktura", date: "2023-05-15", status: "Zatwierdzony" },
    { id: 2, name: "Umowa o współpracy", type: "Umowa", date: "2023-04-28", status: "Projekt" },
    { id: 3, name: "Protokół odbioru", type: "Protokół", date: "2023-05-10", status: "Zatwierdzony" },
    { id: 4, name: "Oferta handlowa", type: "Oferta", date: "2023-05-02", status: "Wysłany" },
    { id: 5, name: "Zamówienie ZAM/2023/42", type: "Zamówienie", date: "2023-05-08", status: "W realizacji" },
  ]

  const clients = [
    { id: 1, name: "Firma ABC Sp. z o.o.", nip: "1234567890", address: "ul. Przykładowa 1, 00-001 Warszawa" },
    { id: 2, name: "XYZ S.A.", nip: "0987654321", address: "ul. Testowa 5, 30-001 Kraków" },
    { id: 3, name: "Przedsiębiorstwo DEF", nip: "5678901234", address: "ul. Próbna 10, 60-001 Poznań" },
    { id: 4, name: "GHI Sp. j.", nip: "4321098765", address: "ul. Wzorcowa 15, 80-001 Gdańsk" },
    { id: 5, name: "JKL Sp. z o.o.", nip: "6789012345", address: "ul. Modelowa 20, 50-001 Wrocław" },
  ]

  const cases = [
    { id: 1, name: "Sprawa klienta ABC", client: "Firma ABC Sp. z o.o.", date: "2023-04-01", status: "W toku" },
    { id: 2, name: "Projekt XYZ", client: "XYZ S.A.", date: "2023-03-15", status: "Zakończony" },
    { id: 3, name: "Obsługa DEF", client: "Przedsiębiorstwo DEF", date: "2023-05-01", status: "W toku" },
    { id: 4, name: "Konsultacja GHI", client: "GHI Sp. j.", date: "2023-04-20", status: "Wstrzymany" },
    { id: 5, name: "Wdrożenie JKL", client: "JKL Sp. z o.o.", date: "2023-05-05", status: "W toku" },
  ]

  const dictionaries = [
    { id: 1, name: "Typy dokumentów", count: 15, lastModified: "2023-05-01" },
    { id: 2, name: "Statusy spraw", count: 8, lastModified: "2023-04-15" },
    { id: 3, name: "Kategorie klientów", count: 6, lastModified: "2023-03-20" },
    { id: 4, name: "Rodzaje umów", count: 12, lastModified: "2023-04-28" },
    { id: 5, name: "Jednostki organizacyjne", count: 10, lastModified: "2023-05-05" },
  ]

  const handleGrantAccess = (resourceType: string) => {
    setAccessDialogTitle(`Nadaj dostęp do ${resourceType}`)
    setAccessDialogItems(groups)
    setIsAccessDialogOpen(true)
  }

  const handleGrantAccessToResource = (resourceType: string, resourceId: number, resourceName: string) => {
    setAccessDialogTitle(`Nadaj dostęp do ${resourceType}: ${resourceName}`)
    setAccessDialogItems(groups)
    setIsAccessDialogOpen(true)
  }

  const toggleSettingsMenu = () => {
    setIsSettingsExpanded(!isSettingsExpanded)
  }

  const renderMainContent = () => {
    // Jeśli wybrana jest zakładka z menu głównego
    if (settingsTab === "users") return <UsersTab />
    if (settingsTab === "groups") return <GroupsTab />
    if (settingsTab === "profiles") return <ProfilesTab />
    if (settingsTab === "permission-definitions") return <PermissionDefinitionsTab />
    if (settingsTab === "configuration") {
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Konfiguracja</h2>
          <p>Panel konfiguracji aplikacji eDokumenty.</p>
        </div>
      )
    }

    // Jeśli wybrana jest zakładka z menu głównego (dokumenty, klienci, sprawy, słowniki)
    if (settingsTab === "documents") {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Dokumenty</h2>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Dodaj dokument
            </Button>
          </div>

          <div className="relative w-full max-w-sm">
            <Input type="text" placeholder="Wyszukaj dokument" className="pl-10" />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>{doc.type}</TableCell>
                    <TableCell>{doc.date}</TableCell>
                    <TableCell>{doc.status}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGrantAccessToResource("dokumentu", doc.id, doc.name)}
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
        </div>
      )
    }

    if (settingsTab === "clients") {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Klienci</h2>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Dodaj klienta
            </Button>
          </div>

          <div className="relative w-full max-w-sm">
            <Input type="text" placeholder="Wyszukaj klienta" className="pl-10" />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>NIP</TableHead>
                  <TableHead>Adres</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.nip}</TableCell>
                    <TableCell>{client.address}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGrantAccessToResource("klienta", client.id, client.name)}
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
        </div>
      )
    }

    if (settingsTab === "cases") {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Sprawy</h2>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Dodaj sprawę
            </Button>
          </div>

          <div className="relative w-full max-w-sm">
            <Input type="text" placeholder="Wyszukaj sprawę" className="pl-10" />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Klient</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((case_) => (
                  <TableRow key={case_.id}>
                    <TableCell className="font-medium">{case_.name}</TableCell>
                    <TableCell>{case_.client}</TableCell>
                    <TableCell>{case_.date}</TableCell>
                    <TableCell>{case_.status}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGrantAccessToResource("sprawy", case_.id, case_.name)}
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
        </div>
      )
    }

    if (settingsTab === "dictionaries") {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Słowniki</h2>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="mr-2 h-4 w-4" /> Dodaj słownik
            </Button>
          </div>

          <div className="relative w-full max-w-sm">
            <Input type="text" placeholder="Wyszukaj słownik" className="pl-10" />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Liczba elementów</TableHead>
                  <TableHead>Ostatnia modyfikacja</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dictionaries.map((dict) => (
                  <TableRow key={dict.id}>
                    <TableCell className="font-medium">{dict.name}</TableCell>
                    <TableCell>{dict.count}</TableCell>
                    <TableCell>{dict.lastModified}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGrantAccessToResource("słownika", dict.id, dict.name)}
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
        </div>
      )
    }

    return null
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Używamy komponentu Header zamiast bezpośredniego kodu nagłówka */}
      <Header title="eDokumenty" />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - powiększony font */}
        <div className="w-64 bg-white border-r border-gray-200">
          <ul className="space-y-1 py-4">
            <li>
              <a
                href="#"
                className={`flex items-center gap-3 px-4 py-2.5 ${settingsTab === "documents" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                onClick={() => setSettingsTab("documents")}
              >
                <FileText className={`h-5 w-5 ${settingsTab === "documents" ? "text-green-600" : "text-gray-500"}`} />
                <span className="text-base font-medium font-quicksand">Dokumenty</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`flex items-center gap-3 px-4 py-2.5 ${settingsTab === "clients" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                onClick={() => setSettingsTab("clients")}
              >
                <Users className={`h-5 w-5 ${settingsTab === "clients" ? "text-green-600" : "text-gray-500"}`} />
                <span className="text-base font-medium font-quicksand">Klienci</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`flex items-center gap-3 px-4 py-2.5 ${settingsTab === "cases" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                onClick={() => setSettingsTab("cases")}
              >
                <Briefcase className={`h-5 w-5 ${settingsTab === "cases" ? "text-green-600" : "text-gray-500"}`} />
                <span className="text-base font-medium font-quicksand">Sprawy</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`flex items-center gap-3 px-4 py-2.5 ${settingsTab === "dictionaries" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                onClick={() => setSettingsTab("dictionaries")}
              >
                <Database
                  className={`h-5 w-5 ${settingsTab === "dictionaries" ? "text-green-600" : "text-gray-500"}`}
                />
                <span className="text-base font-medium font-quicksand">Słowniki</span>
              </a>
            </li>
            <li>
              <button
                onClick={toggleSettingsMenu}
                className="flex items-center justify-between w-full px-4 py-2.5 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-gray-500" />
                  <span className="text-base font-medium font-quicksand text-gray-800">Ustawienia</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-500 transition-transform ${isSettingsExpanded ? "rotate-180" : ""}`}
                />
              </button>
              {isSettingsExpanded && (
                <ul className="pl-4 border-l-2 border-green-600 ml-4 mt-1">
                  <li>
                    <a
                      href="#"
                      className={`flex items-center gap-3 px-4 py-2.5 ${settingsTab === "users" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                      onClick={() => setSettingsTab("users")}
                    >
                      <UserCog className={`h-5 w-5 ${settingsTab === "users" ? "text-green-600" : "text-gray-500"}`} />
                      <span className="text-base font-medium font-quicksand">Użytkownicy</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className={`flex items-center gap-3 px-4 py-2.5 ${settingsTab === "groups" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                      onClick={() => setSettingsTab("groups")}
                    >
                      <UserPlus
                        className={`h-5 w-5 ${settingsTab === "groups" ? "text-green-600" : "text-gray-500"}`}
                      />
                      <span className="text-base font-medium font-quicksand">Grupy</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className={`flex items-center gap-3 px-4 py-2.5 ${settingsTab === "profiles" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                      onClick={() => setSettingsTab("profiles")}
                    >
                      <Shield
                        className={`h-5 w-5 ${settingsTab === "profiles" ? "text-green-600" : "text-gray-500"}`}
                      />
                      <span className="text-base font-medium font-quicksand">Profile</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className={`flex items-center gap-3 px-4 py-2.5 ${settingsTab === "permission-definitions" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                      onClick={() => setSettingsTab("permission-definitions")}
                    >
                      <BookOpen
                        className={`h-5 w-5 ${settingsTab === "permission-definitions" ? "text-green-600" : "text-gray-500"}`}
                      />
                      <span className="text-base font-medium font-quicksand">Definicje uprawnień</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className={`flex items-center gap-3 px-4 py-2.5 ${settingsTab === "configuration" ? "bg-gray-50 text-green-600" : "hover:bg-gray-50 text-gray-800"}`}
                      onClick={() => setSettingsTab("configuration")}
                    >
                      <Settings
                        className={`h-5 w-5 ${settingsTab === "configuration" ? "text-green-600" : "text-gray-500"}`}
                      />
                      <span className="text-base font-medium font-quicksand">Konfiguracja</span>
                    </a>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content */}
          <main className="flex-1 p-6 overflow-auto">{renderMainContent()}</main>
        </div>
      </div>

      <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-quicksand">{accessDialogTitle}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Grupy</h3>
              <div className="relative mb-4">
                <Input type="text" placeholder="Wyszukaj grupę" className="pl-10 border-gray-300" />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
              </div>
              <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox />
                      </TableHead>
                      <TableHead>Grupa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell>
                          <Checkbox />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{group.name}</div>
                            <div className="text-sm text-gray-500">{group.description}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Poziomy dostępu</h3>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox />
                      </TableHead>
                      <TableHead>Uprawnienie</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">Odczyt</div>
                          <div className="text-sm text-gray-500">Możliwość przeglądania zasobu</div>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">Edycja</div>
                          <div className="text-sm text-gray-500">Możliwość modyfikacji zasobu</div>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">Zarządzanie</div>
                          <div className="text-sm text-gray-500">
                            Pełna kontrola nad zasobem, w tym usuwanie i nadawanie uprawnień
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button variant="outline" className="mr-2" onClick={() => setIsAccessDialogOpen(false)}>
              Anuluj
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">Nadaj dostęp</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
