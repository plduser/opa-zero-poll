"use client"

import { useState } from "react"
import { Menu, ChevronDown, Settings, Home, Database, FileText, BarChart3, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AppSwitcher } from "@/app/components/app-switcher"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Users } from "lucide-react"
import { Search } from "lucide-react"

// Import module components
import { Dashboard } from "./modules/dashboard"
import { Documents } from "./modules/documents"
import { Reports } from "./modules/reports"
import { Payments } from "./modules/payments"
import { Dictionaries } from "./modules/dictionaries"

export default function FkPage() {
  const [selectedModule, setSelectedModule] = useState("dashboard")
  const [selectedDictionary, setSelectedDictionary] = useState<string | null>(null)
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false)

  // Przykładowe grupy dla dialogu nadawania dostępu
  const groups = [
    { id: 1, name: "ADMINISTRATORZY FK", description: "Grupa administratorów systemu FK" },
    { id: 2, name: "KSIĘGOWI", description: "Grupa księgowych" },
    { id: 3, name: "KADRY I PŁACE", description: "Grupa pracowników kadr i płac" },
    { id: 4, name: "ROZRACHUNKI", description: "Grupa zajmująca się rozrachunkami" },
    { id: 5, name: "RAPORTY FINANSOWE", description: "Grupa zajmująca się raportami finansowymi" },
  ]

  const users = [
    { id: 1, name: "Jan Kowalski", email: "jan.kowalski@example.com" },
    { id: 2, name: "Anna Nowak", email: "anna.nowak@example.com" },
    { id: 3, name: "Piotr Wiśniewski", email: "piotr.wisniewski@example.com" },
    { id: 4, name: "Magdalena Dąbrowska", email: "magdalena.dabrowska@example.com" },
    { id: 5, name: "Tomasz Lewandowski", email: "tomasz.lewandowski@example.com" },
  ]

  const permissions = [
    {
      id: "edit_dictionary",
      name: "Edycja słownika",
      description:
        "Umożliwia modyfikację nazwy i skrótu słownika oraz edycję ustawień domyślnego, proponowanego i pustego elementu",
    },
    {
      id: "delete_dictionary",
      name: "Usuwanie słownika",
      description: "Umożliwia usunięcie słownika z całą jego zawartością",
    },
    {
      id: "edit_attributes",
      name: "Edycja atrybutów",
      description:
        "Umożliwia dodawanie, edycję oraz usuwanie atrybutów dodatkowych Słownika, jak i atrybutów dodatkowych elementów tego słownika",
    },
    {
      id: "change_activity",
      name: "Zmiana aktywności",
      description: "Daje możliwość zmiany aktywności słownika i elementów tego słownika",
    },
    {
      id: "edit_elements",
      name: "Edycja elementów",
      description: "Umożliwia edycję nazw i skrótów elementów wybranego słownika",
    },
    {
      id: "add_elements",
      name: "Dodawanie elementów",
      description: "Umożliwia dodawanie nowych elementów do słownika",
    },
    { id: "delete_elements", name: "Usuwanie elementów", description: "Umożliwia usuwanie elementów ze słownika" },
    {
      id: "share_dictionary",
      name: "Udostępnianie słownika",
      description: "Daje możliwość udostępniania słownika innym użytkownikom",
    },
  ]

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleGrantAccess = (dictionaryId: string) => {
    setSelectedDictionary(dictionaryId)
    setIsAccessDialogOpen(true)
  }

  // Formatowanie kwoty
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Formatowanie daty
  const formatDate = (dateString: string) => {
    if (dateString === "-") return "-"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pl-PL").format(date)
  }

  // Renderowanie statusu dokumentu
  const renderDocumentStatus = (status: string) => {
    switch (status) {
      case "Zaksięgowana":
      case "Zaksięgowany":
      case "Zatwierdzona":
      case "Zatwierdzony":
        return <Badge className="bg-green-100 text-green-800 border-green-200">{status}</Badge>
      case "Do zatwierdzenia":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{status}</Badge>
      case "Wystawiona":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{status}</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  // Renderowanie statusu płatności
  const renderPaymentStatus = (status: string, daysOverdue: number) => {
    switch (status) {
      case "Zapłacona":
        return <Badge className="bg-green-100 text-green-800 border-green-200">{status}</Badge>
      case "Niezapłacona":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{status}</Badge>
      case "Przeterminowana":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            {status} ({daysOverdue} dni)
          </Badge>
        )
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nagłówek - teraz rozciąga się na całą szerokość */}
      <header className="flex justify-between items-center px-6 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-4">
          <button className="p-1">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <img src="/symfonia-logo.png" alt="Symfonia" className="h-10 relative top-[5px]" />
            <span className="text-lg font-medium font-quicksand ml-4">Finanse i Księgowość</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <select className="flex items-center gap-2 px-4 py-2 border rounded-md font-quicksand appearance-none cursor-pointer pr-10">
              <option>CD Projekt Red S.A.</option>
              <option>Platige Image S.A.</option>
              <option>Techland Sp. z o.o.</option>
              <option>11 bit studios S.A.</option>
              <option>Bloober Team S.A.</option>
            </select>
            <ChevronDown className="h-5 w-5 text-green-600 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          <button className="p-1">
            <Settings className="h-6 w-6" />
          </button>
          <AppSwitcher />
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-800">
            JP
          </div>
        </div>
      </header>

      {/* Menu boczne i zawartość - teraz sidebar zaczyna się pod nagłówkiem */}
      <div className="flex">
        <aside className="w-64 min-h-[calc(100vh-64px)] border-r border-gray-200 bg-white">
          <nav className="py-4">
            <ul className="space-y-1">
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-3 px-6 py-3 ${
                    selectedModule === "dashboard" ? "bg-gray-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedModule("dashboard")}
                >
                  <Home className={`h-5 w-5 ${selectedModule === "dashboard" ? "text-green-600" : "text-gray-500"}`} />
                  <span
                    className={`text-base font-medium font-quicksand ${
                      selectedModule === "dashboard" ? "text-green-600" : "text-gray-800"
                    }`}
                  >
                    Pulpit
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-3 px-6 py-3 ${
                    selectedModule === "documents" ? "bg-gray-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedModule("documents")}
                >
                  <FileText
                    className={`h-5 w-5 ${selectedModule === "documents" ? "text-green-600" : "text-gray-500"}`}
                  />
                  <span
                    className={`text-base font-medium font-quicksand ${
                      selectedModule === "documents" ? "text-green-600" : "text-gray-800"
                    }`}
                  >
                    Dokumenty księgowe
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-3 px-6 py-3 ${
                    selectedModule === "reports" ? "bg-gray-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedModule("reports")}
                >
                  <BarChart3
                    className={`h-5 w-5 ${selectedModule === "reports" ? "text-green-600" : "text-gray-500"}`}
                  />
                  <span
                    className={`text-base font-medium font-quicksand ${
                      selectedModule === "reports" ? "text-green-600" : "text-gray-800"
                    }`}
                  >
                    Raporty
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-3 px-6 py-3 ${
                    selectedModule === "payments" ? "bg-gray-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedModule("payments")}
                >
                  <DollarSign
                    className={`h-5 w-5 ${selectedModule === "payments" ? "text-green-600" : "text-gray-500"}`}
                  />
                  <span
                    className={`text-base font-medium font-quicksand ${
                      selectedModule === "payments" ? "text-green-600" : "text-gray-800"
                    }`}
                  >
                    Rozrachunki
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center gap-3 px-6 py-3 ${
                    selectedModule === "dictionaries" ? "bg-gray-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedModule("dictionaries")}
                >
                  <Database
                    className={`h-5 w-5 ${selectedModule === "dictionaries" ? "text-green-600" : "text-gray-500"}`}
                  />
                  <span
                    className={`text-base font-medium font-quicksand ${
                      selectedModule === "dictionaries" ? "text-green-600" : "text-gray-800"
                    }`}
                  >
                    Słowniki
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className={`flex items-center justify-between px-6 py-3 ${
                    selectedModule === "settings" || isSettingsMenuOpen ? "bg-gray-50" : "hover:bg-gray-50"
                  }`}
                  onClick={(e) => {
                    e.preventDefault()
                    setIsSettingsMenuOpen(!isSettingsMenuOpen)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Settings
                      className={`h-5 w-5 ${selectedModule === "settings" || isSettingsMenuOpen ? "text-green-600" : "text-gray-500"}`}
                    />
                    <span
                      className={`text-base font-medium font-quicksand ${
                        selectedModule === "settings" || isSettingsMenuOpen ? "text-green-600" : "text-gray-800"
                      }`}
                    >
                      Ustawienia
                    </span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 ${isSettingsMenuOpen ? "transform rotate-180 text-green-600" : "text-gray-500"}`}
                  />
                </a>
                <ul className={`pl-6 border-l-2 border-gray-200 ml-6 ${isSettingsMenuOpen ? "block" : "hidden"}`}>
                  <li>
                    <Link href="/fk/permissions" className="flex items-center gap-3 px-6 py-2 hover:bg-gray-50">
                      <span className="text-base font-medium text-gray-800 font-quicksand">Uprawnienia</span>
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="flex items-center gap-3 px-6 py-2 hover:bg-gray-50">
                      <span className="text-base font-medium font-quicksand text-gray-800">Konfiguracja</span>
                    </a>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Zawartość główna */}
        <main className="flex-1 p-8 bg-gray-50">
          {selectedModule === "dashboard" && (
            <Dashboard
              setSelectedModule={setSelectedModule}
              formatAmount={formatAmount}
              formatDate={formatDate}
              renderDocumentStatus={renderDocumentStatus}
            />
          )}

          {selectedModule === "documents" && (
            <Documents
              formatAmount={formatAmount}
              formatDate={formatDate}
              renderDocumentStatus={renderDocumentStatus}
            />
          )}

          {selectedModule === "reports" && (
            <Reports formatDate={formatDate} renderDocumentStatus={renderDocumentStatus} />
          )}

          {selectedModule === "payments" && (
            <Payments formatAmount={formatAmount} formatDate={formatDate} renderPaymentStatus={renderPaymentStatus} />
          )}

          {selectedModule === "dictionaries" && <Dictionaries handleGrantAccess={handleGrantAccess} />}
        </main>
      </div>

      {/* Dialog nadawania dostępu */}
      <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Nadaj dostęp do słownika {selectedDictionary}</DialogTitle>
            <DialogDescription>Wybierz użytkowników, grupy i uprawnienia, które chcesz im nadać.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="users">
            <TabsList className="mb-4">
              <TabsTrigger value="users" className="font-quicksand">
                <User className="h-4 w-4 mr-2" />
                Użytkownicy
              </TabsTrigger>
              <TabsTrigger value="groups" className="font-quicksand">
                <Users className="h-4 w-4 mr-2" />
                Grupy
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Użytkownicy</h3>
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
                          <TableHead className="w-12">
                            <Checkbox />
                          </TableHead>
                          <TableHead>Użytkownik</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <Checkbox />
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

                <div>
                  <h3 className="text-lg font-medium mb-2">Uprawnienia</h3>
                  <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
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
                        {permissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{permission.name}</div>
                                <div className="text-sm text-gray-500">{permission.description}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="groups">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Grupy</h3>
                  <div className="relative mb-4">
                    <Input
                      type="text"
                      placeholder="Wyszukaj grupę"
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
                          <TableHead className="w-12">
                            <Checkbox />
                          </TableHead>
                          <TableHead>Grupa</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGroups.map((group) => (
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
                  <h3 className="text-lg font-medium mb-2">Uprawnienia</h3>
                  <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
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
                        {permissions.map((permission) => (
                          <TableRow key={permission.id}>
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{permission.name}</div>
                                <div className="text-sm text-gray-500">{permission.description}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAccessDialogOpen(false)}>
              Anuluj
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">Nadaj dostęp</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
